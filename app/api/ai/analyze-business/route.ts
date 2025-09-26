import { NextRequest, NextResponse } from 'next/server';
import { analyzeBusinessSuperEnhanced, isAIEnabled } from '@/lib/ai/super-enhanced-openai';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserWithRole, hasFeatureAccess } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if AI features are enabled
    if (!isAIEnabled()) {
      return NextResponse.json(
        {
          error: 'AI features are not enabled',
          debug: {
            AI_FEATURES_ENABLED: process.env.AI_FEATURES_ENABLED,
            OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
            OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length
          }
        },
        { status: 503 }
      );
    }

    // Authenticate user and get role
    const authUser = await getUserWithRole();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access (admin users bypass all restrictions)
    if (!hasFeatureAccess(authUser.plan, authUser.role)) {
      return NextResponse.json(
        { error: 'Subscription required for AI features' },
        { status: 403 }
      );
    }

    // Use service client for development bypass or when user exists
    const useServiceClient = process.env.DEV_BYPASS_AUTH === 'true' || authUser?.role === 'admin';
    const supabase = useServiceClient ? createServiceClient() : createClient();

    const body = await request.json();
    const {
      listingId,
      analysisOptions = {},
      followUpQuery = null,
      forceRefresh = false
    } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Fetch the listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Handle follow-up queries
    if (followUpQuery) {
      try {
        // Get the original analysis
        const serviceSupabase = createServiceClient();
        const { data: originalAnalysisData, error: analysisError } = await (serviceSupabase as any)
          .from('ai_analyses')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('listing_id', listingId)
          .eq('analysis_type', 'business_analysis')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysisError || !originalAnalysisData) {
          return NextResponse.json(
            { error: 'Original analysis not found for follow-up' },
            { status: 404 }
          );
        }

        // TODO: Implement SuperEnhanced follow-up analysis
        const followUpResponse = { error: "Follow-up analysis not yet implemented with SuperEnhanced AI" };

        // Save follow-up to database
        await (serviceSupabase as any)
          .from('ai_analyses')
          .insert({
            user_id: authUser.id,
            listing_id: listingId,
            analysis_type: 'follow_up_analysis',
            analysis_data: {
              originalAnalysisId: originalAnalysisData.id,
              query: followUpQuery,
              response: followUpResponse
            },
          });

        return NextResponse.json({
          success: true,
          type: 'follow_up',
          response: followUpResponse,
          query: followUpQuery
        });

      } catch (error) {
        console.error('Error in follow-up analysis:', error);
        return NextResponse.json(
          { error: 'Failed to generate follow-up analysis' },
          { status: 500 }
        );
      }
    }

    // Check for existing analysis first (caching enabled)
    let analysis;
    let existingAnalysis = null;

    if (!forceRefresh) {
      try {
        const serviceSupabase = createServiceClient();
        const { data: cached, error: cacheError } = await (serviceSupabase as any)
          .from('ai_analyses')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('listing_id', listingId)
          .eq('analysis_type', 'business_analysis')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cacheError && cached) {
          // Check if cached analysis matches current options
          const cachedOptions = cached.analysis_data?.analysisOptions || {};
          const optionsMatch = JSON.stringify(cachedOptions) === JSON.stringify(analysisOptions);

          if (optionsMatch) {
            existingAnalysis = cached;
            analysis = cached.analysis_data;
            console.log('Using cached enhanced business analysis from', cached.created_at);
          }
        }
      } catch (error) {
        console.log('No cached enhanced business analysis found, generating fresh analysis');
      }
    }

    // Generate fresh enhanced analysis if no cached version exists or forced refresh
    if (!existingAnalysis || forceRefresh) {
      // Get user preferences from database or create defaults
      let userPreferences = {
        experienceLevel: 'intermediate' as const,
        riskTolerance: 'medium' as const,
        industries: []
      };

      try {
        const { data: preferences } = await supabase
          .from('preferences')
          .select('*')
          .eq('userId', authUser.id)
          .single();

        if (preferences) {
          userPreferences = {
            experienceLevel: (preferences as any).experienceLevel || 'intermediate',
            riskTolerance: (preferences as any).riskTolerance || 'medium',
            industries: (preferences as any).industries || []
          };
        }
      } catch (error) {
        console.log('Using default user preferences');
      }

      // Merge analysis options with user preferences
      const enhancedOptions = {
        perspective: 'general' as const,
        focusAreas: [],
        userProfile: userPreferences,
        ...analysisOptions
      };

      analysis = await analyzeBusinessSuperEnhanced(listing, enhancedOptions);

      // Add analysis options to the saved data for cache matching
      analysis.analysisOptions = enhancedOptions;

      // Save enhanced analysis to database
      try {
        const serviceSupabase = createServiceClient();
        const { error: insertError } = await (serviceSupabase as any)
          .from('ai_analyses')
          .insert({
            user_id: authUser.id,
            listing_id: listingId,
            analysis_type: 'business_analysis',
            analysis_data: analysis,
          });

        if (!insertError) {
          console.log('✅ Super Enhanced business analysis saved to database');
        } else {
          console.error('Failed to save super enhanced business analysis:', insertError);
        }
      } catch (error) {
        console.error('Error saving enhanced business analysis:', error);
      }

      // Track user behavior for personalization
      try {
        const serviceSupabase = createServiceClient();
        await (serviceSupabase as any)
          .from('user_analysis_behavior')
          .upsert({
            user_id: authUser.id,
            analysis_type: 'enhanced_business_analysis',
            perspective_used: enhancedOptions.perspective,
            focus_areas: enhancedOptions.focusAreas,
            listing_industry: (listing as any).industry,
            listing_price: (listing as any).price,
            analysis_score: analysis.overallScore,
            recommendation: analysis.recommendation,
            timestamp: new Date().toISOString()
          }, {
            onConflict: 'user_id,analysis_type,timestamp'
          });
      } catch (error) {
        console.log('User behavior tracking not available:', error);
      }
    }

    return NextResponse.json({
      success: true,
      type: 'super_enhanced_analysis',
      analysis,
      cached: !!existingAnalysis,
      analysisDate: existingAnalysis ? existingAnalysis.created_at : new Date().toISOString(),
      listingTitle: (listing as any).title,
      superEnhancedFeatures: {
        advancedConfidenceScoring: true,
        comprehensiveRiskMatrix: true,
        marketDynamicsAnalysis: true,
        financialProjections: true,
        strategicFitAssessment: true,
        personalizedInsights: true,
        followUpCapability: true,
        aiVersion: '2.0'
      }
    });

  } catch (error) {
    console.error('Error in AI business analysis:', error);

    return NextResponse.json(
      {
        error: 'Failed to analyze business',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
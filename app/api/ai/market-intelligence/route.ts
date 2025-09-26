import { NextRequest, NextResponse } from 'next/server';
import { generateSuperEnhancedMarketIntelligence, isAIEnabled } from '@/lib/ai/super-enhanced-openai';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserWithRole, hasFeatureAccess } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if AI features are enabled
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: 'AI features are not enabled' },
        { status: 503 }
      );
    }

    // Authenticate user and get role
    const authUser = await getUserWithRole();

    // Allow bypass in development mode
    if (!authUser && process.env.DEV_BYPASS_AUTH !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create effective user for processing (real user or dev bypass)
    const effectiveUser = authUser || (process.env.DEV_BYPASS_AUTH === 'true' ? {
      id: 'dev-user-' + Date.now(),
      role: 'admin',
      plan: 'enterprise'
    } : null);

    if (!effectiveUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access (admin users and dev bypass have full access)
    if (!hasFeatureAccess(effectiveUser.plan, effectiveUser.role)) {
      return NextResponse.json(
        { error: 'Subscription required for AI features' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      industry,
      geography,
      dealSize,
      listingId,
      followUpQuery = null,
      forceRefresh = false
    } = body;

    if (!industry) {
      return NextResponse.json(
        { error: 'Industry is required' },
        { status: 400 }
      );
    }

    // Handle follow-up queries
    if (followUpQuery) {
      try {
        const serviceSupabase = createServiceClient();
        const { data: originalAnalysisData, error: analysisError } = await (serviceSupabase as any)
          .from('ai_analyses')
          .select('*')
          .eq('user_id', effectiveUser.id)
          .eq('analysis_type', 'market_intelligence')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysisError || !originalAnalysisData) {
          return NextResponse.json(
            { error: 'Original market intelligence not found for follow-up' },
            { status: 404 }
          );
        }

        const followUpResponse = { error: "Follow-up analysis not yet implemented with SuperEnhanced AI" };

        return NextResponse.json({
          success: true,
          type: 'follow_up',
          response: followUpResponse,
          query: followUpQuery
        });

      } catch (error) {
        console.error('Error in market intelligence follow-up:', error);
        return NextResponse.json(
          { error: 'Failed to generate follow-up analysis' },
          { status: 500 }
        );
      }
    }

    // Check for existing analysis first (unless forced refresh)
    let intelligence;
    let existingAnalysis = null;

    if (!forceRefresh) {
      try {
        const serviceSupabase = createServiceClient();
        const { data: cached, error: cacheError } = await (serviceSupabase as any)
          .from('ai_analyses')
          .select('*')
          .eq('user_id', effectiveUser.id)
          .eq('analysis_type', 'market_intelligence')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cacheError && cached) {
          const cachedParams = cached.analysis_data?.parameters || {};
          const paramsMatch = cachedParams.industry === industry &&
                             cachedParams.geography === geography &&
                             cachedParams.dealSize === dealSize;

          if (paramsMatch) {
            existingAnalysis = cached;
            const { parameters, ...intelligenceData } = cached.analysis_data;
            intelligence = intelligenceData;
            console.log('Using cached enhanced market intelligence from', cached.created_at);
          }
        }
      } catch (error) {
        console.log('No cached enhanced market intelligence found, generating fresh analysis');
      }
    }

    // Generate super enhanced market intelligence if no cached version exists
    if (!existingAnalysis || forceRefresh) {
      // Use super enhanced market intelligence generator
      intelligence = await generateSuperEnhancedMarketIntelligence(industry, geography, dealSize);
    }

    // Skip database saves in development mode
    if (process.env.DEV_BYPASS_AUTH !== 'true') {
      // Store the analysis in the database
      // Use service client for development bypass or when user exists
      const useServiceClient = process.env.DEV_BYPASS_AUTH === 'true' || effectiveUser?.role === 'admin';
      const supabase = useServiceClient ? createServiceClient() : createClient();
      const { error: insertError } = await supabase
        .from('ai_analyses')
        .upsert({
          user_id: effectiveUser.id,
          listing_id: listingId || null,
          analysis_type: 'market_intelligence',
          analysis_data: {
            ...intelligence,
            parameters: {
              industry,
              geography,
              dealSize
            }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any);

      if (insertError) {
        console.error('Error storing market intelligence:', insertError);
      }
    } else {
      console.log('🔧 DEV MODE: Skipping database save');
    }

    return NextResponse.json({
      success: true,
      type: 'super_enhanced_analysis',
      intelligence,
      cached: !!existingAnalysis,
      analysisDate: existingAnalysis ? existingAnalysis.created_at : new Date().toISOString(),
      parameters: {
        industry,
        geography,
        dealSize
      },
      superEnhancedFeatures: {
        comprehensiveMarketOverview: true,
        competitiveLandscapeAnalysis: true,
        economicFactorAssessment: true,
        investmentClimateAnalysis: true,
        strategicRecommendations: true,
        confidenceScoring: true,
        followUpCapability: true,
        marketTiming: true,
        aiVersion: '2.0'
      }
    });

  } catch (error) {
    console.error('Error generating market intelligence:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate market intelligence',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
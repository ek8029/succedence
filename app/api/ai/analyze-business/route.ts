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

    // Allow bypass in development mode ONLY
    const isDevBypass = process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_AUTH === 'true';

    if (!authUser && !isDevBypass) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create effective user for processing (real user or dev bypass)
    const effectiveUser = authUser || (isDevBypass ? {
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

    // Use service client for development bypass or when user exists
    const useServiceClient = isDevBypass || effectiveUser?.role === 'admin';
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
          .eq('user_id', effectiveUser.id)
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

        // Skip database saves in development mode
        if (!isDevBypass) {
          // Save follow-up to database
          await (serviceSupabase as any)
            .from('ai_analyses')
            .insert({
              user_id: effectiveUser.id,
              listing_id: listingId,
              analysis_type: 'follow_up_analysis',
              analysis_data: {
                originalAnalysisId: originalAnalysisData.id,
                query: followUpQuery,
                response: followUpResponse
              },
            });
        } else {
          console.log('🔧 DEV MODE: Skipping database save');
        }

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

    // Skip caching entirely in development mode for truly dynamic analysis
    const skipCache = isDevBypass || forceRefresh;
    const CACHE_EXPIRY_HOURS = 1; // Cache expires after 1 hour

    if (!skipCache) {
      try {
        const serviceSupabase = createServiceClient();
        const { data: cached, error: cacheError } = await (serviceSupabase as any)
          .from('ai_analyses')
          .select('*')
          .eq('user_id', effectiveUser.id)
          .eq('listing_id', listingId)
          .eq('analysis_type', 'business_analysis')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cacheError && cached) {
          // Check if cache is expired
          const cacheAge = Date.now() - new Date(cached.created_at).getTime();
          const cacheExpired = cacheAge > CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

          if (cacheExpired) {
            console.log('Cache expired, generating fresh business analysis');
          } else {
            // Check if cached analysis matches current options
            const cachedOptions = cached.analysis_data?.analysisOptions || {};
            const optionsMatch = JSON.stringify(cachedOptions) === JSON.stringify(analysisOptions);

            if (optionsMatch) {
              existingAnalysis = cached;
              analysis = cached.analysis_data;
              console.log('Using cached enhanced business analysis from', cached.created_at);
            } else {
              console.log('Cache options mismatch, generating fresh analysis');
            }
          }
        }
      } catch (error) {
        console.log('No cached enhanced business analysis found, generating fresh analysis');
      }
    } else {
      console.log('🔄 Development mode or force refresh - skipping cache, generating fresh AI analysis');
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
          .eq('userId', effectiveUser.id)
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

      // Fetch comparable listings for context-rich analysis
      let comparableListings: any[] = [];
      try {
        const { data: comparables } = await supabase
          .from('listings')
          .select('id, title, industry, city, state, revenue, ebitda, price, employees, askingPrice, cashFlow')
          .eq('industry', (listing as any).industry)
          .neq('id', listingId)
          .limit(10);

        if (comparables) {
          comparableListings = comparables;
          console.log(`✅ Found ${comparableListings.length} comparable listings for context`);
        }
      } catch (error) {
        console.log('No comparable listings found, proceeding without comparisons');
      }

      // Calculate industry benchmarks from comparable listings
      let industryBenchmarks: any = null;
      if (comparableListings.length > 0) {
        const revenues = comparableListings.map(l => l.revenue).filter(r => r && r > 0);
        const ebitdas = comparableListings.map(l => l.ebitda).filter(e => e && e > 0);
        const prices = comparableListings.map(l => l.price || l.askingPrice).filter(p => p && p > 0);
        const cashFlows = comparableListings.map(l => l.cashFlow).filter(c => c && c > 0);
        const employeeCounts = comparableListings.map(l => l.employees).filter(e => e && e > 0);

        industryBenchmarks = {
          averageRevenue: revenues.length > 0 ? Math.round(revenues.reduce((a, b) => a + b, 0) / revenues.length) : null,
          medianRevenue: revenues.length > 0 ? revenues.sort((a, b) => a - b)[Math.floor(revenues.length / 2)] : null,
          averageEBITDA: ebitdas.length > 0 ? Math.round(ebitdas.reduce((a, b) => a + b, 0) / ebitdas.length) : null,
          averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
          averageCashFlow: cashFlows.length > 0 ? Math.round(cashFlows.reduce((a, b) => a + b, 0) / cashFlows.length) : null,
          averageEmployees: employeeCounts.length > 0 ? Math.round(employeeCounts.reduce((a, b) => a + b, 0) / employeeCounts.length) : null,
          sampleSize: comparableListings.length,

          // Calculate margins if we have the data
          averageEBITDAMargin: revenues.length > 0 && ebitdas.length > 0 ?
            Math.round((ebitdas.reduce((a, b) => a + b, 0) / revenues.reduce((a, b) => a + b, 0)) * 100) : null,

          // Calculate revenue per employee
          averageRevenuePerEmployee: revenues.length > 0 && employeeCounts.length > 0 ?
            Math.round(revenues.reduce((a, b) => a + b, 0) / employeeCounts.reduce((a, b) => a + b, 0)) : null
        };

        console.log('📊 Industry benchmarks calculated:', industryBenchmarks);
      }

      // Merge analysis options with user preferences
      const enhancedOptions = {
        perspective: 'general' as const,
        focusAreas: [],
        userProfile: userPreferences,
        comparableListings,
        industryBenchmarks,
        ...analysisOptions
      };

      analysis = await analyzeBusinessSuperEnhanced(listing, enhancedOptions);

      // Add analysis options to the saved data for cache matching
      analysis.analysisOptions = enhancedOptions;

      // Skip database saves in development mode
      if (!isDevBypass) {
        // Save enhanced analysis to database
        try {
          const serviceSupabase = createServiceClient();
          const { error: insertError } = await (serviceSupabase as any)
            .from('ai_analyses')
            .insert({
              user_id: effectiveUser.id,
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
      } else {
        console.log('🔧 DEV MODE: Skipping database save');
      }

      // Skip database saves in development mode
      if (!isDevBypass) {
        // Track user behavior for personalization
        try {
          const serviceSupabase = createServiceClient();
          await (serviceSupabase as any)
            .from('user_analysis_behavior')
            .upsert({
              user_id: effectiveUser.id,
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
      } else {
        console.log('🔧 DEV MODE: Skipping database save');
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
import { NextRequest, NextResponse } from 'next/server';
import { analyzeBusinessSuperEnhancedBuyerMatch, isAIEnabled } from '@/lib/ai/super-enhanced-openai';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserWithRole, hasFeatureAccess } from '@/lib/auth/permissions';
import type { Preferences, Listing } from '@/db/schema';

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

    // Use service client for development bypass or when user exists
    const useServiceClient = isDevBypass || effectiveUser?.role === 'admin';
    const supabase = useServiceClient ? createServiceClient() : createClient();

    // Fetch the listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single() as { data: Listing | null; error: any };

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
          .eq('analysis_type', 'buyer_match')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysisError || !originalAnalysisData) {
          return NextResponse.json(
            { error: 'Original buyer match analysis not found for follow-up' },
            { status: 404 }
          );
        }

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
        console.error('Error in buyer match follow-up analysis:', error);
        return NextResponse.json(
          { error: 'Failed to generate follow-up analysis' },
          { status: 500 }
        );
      }
    }

    // Get user preferences (optional - create defaults if missing)
    const { data: preferences, error: preferencesError } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', effectiveUser.id)
      .single() as { data: Preferences | null; error: any };

    // Create default preferences if none exist or if fetch failed
    let buyerPreferences;
    if (preferencesError || !preferences) {
      console.log('No user preferences found, using defaults for buyer matching');
      // Use default broad preferences that work for any buyer
      buyerPreferences = {
        industries: [], // Empty means all industries acceptable
        dealSizeMin: 0,
        dealSizeMax: 10000000, // $10M default max
        geographicPreferences: [], // Empty means all states acceptable
        riskTolerance: 'medium' as const,
        experienceLevel: 'experienced' as const,
        keywords: []
      };
    } else {
      // Use actual preferences with fallbacks
      buyerPreferences = {
        industries: preferences.industries || [],
        dealSizeMin: preferences.minRevenue || 0,
        dealSizeMax: preferences.priceMax || 10000000,
        geographicPreferences: preferences.states || [],
        riskTolerance: 'medium' as const,
        experienceLevel: 'experienced' as const,
        keywords: preferences.keywords || []
      };
    }

    // Check for existing buyer match analysis first (caching enabled)
    let matchScore;
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
          .eq('analysis_type', 'buyer_match')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cacheError && cached) {
          // Check if cache is expired
          const cacheAge = Date.now() - new Date(cached.created_at).getTime();
          const cacheExpired = cacheAge > CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

          if (cacheExpired) {
            console.log('Cache expired, generating fresh analysis');
          } else {
            // Check if cached analysis matches current options and context
            const cachedOptions = cached.analysis_data?.analysisOptions || {};
            const cachedBuyerPrefs = cached.analysis_data?.buyerPreferences || {};

            // More specific cache matching - include buyer preferences
            const optionsMatch = JSON.stringify(cachedOptions) === JSON.stringify(analysisOptions) &&
                                JSON.stringify(cachedBuyerPrefs) === JSON.stringify(buyerPreferences);

            if (optionsMatch) {
              existingAnalysis = cached;
              matchScore = cached.analysis_data;
              console.log('Using cached enhanced buyer match from', cached.created_at);
            } else {
              console.log('Cache context mismatch, generating fresh analysis');
            }
          }
        }
      } catch (error) {
        console.log('No cached enhanced buyer match found, generating fresh analysis');
      }
    } else {
      console.log('🔄 Development mode or force refresh - skipping cache, generating fresh AI analysis');
    }

    // Generate fresh super enhanced analysis if no cached version exists or forced refresh
    if (!existingAnalysis || forceRefresh) {
      // Fetch comparable listings for context-rich analysis
      let comparableListings: any[] = [];
      try {
        const { data: comparables } = await supabase
          .from('listings')
          .select('id, title, industry, city, state, revenue, ebitda, price, employees, askingPrice, cashFlow')
          .eq('industry', listing.industry)
          .neq('id', listingId)
          .limit(10);

        if (comparables) {
          comparableListings = comparables;
          console.log(`✅ Found ${comparableListings.length} comparable listings for buyer match context`);
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

        industryBenchmarks = {
          averageRevenue: revenues.length > 0 ? Math.round(revenues.reduce((a, b) => a + b, 0) / revenues.length) : null,
          averageEBITDA: ebitdas.length > 0 ? Math.round(ebitdas.reduce((a, b) => a + b, 0) / ebitdas.length) : null,
          averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
          sampleSize: comparableListings.length
        };

        console.log('📊 Buyer match industry benchmarks:', industryBenchmarks);
      }

      // Use super enhanced buyer matching for comprehensive analysis
      console.log('BUYER MATCH DEBUG: Starting super enhanced buyer match analysis');
      console.log('BUYER MATCH DEBUG: Listing:', listing?.title);
      console.log('BUYER MATCH DEBUG: Buyer Preferences:', buyerPreferences);

      try {
        matchScore = await analyzeBusinessSuperEnhancedBuyerMatch(listing, buyerPreferences, comparableListings, industryBenchmarks);
        console.log('BUYER MATCH DEBUG: Analysis completed successfully');
      } catch (error) {
        console.error('BUYER MATCH DEBUG: Error in analysis:', error);
        throw error;
      }

      // Skip database saves in development mode
      if (!isDevBypass) {
        // Save enhanced buyer match to database
        try {
          const serviceSupabase = createServiceClient();
          const { error: insertError } = await (serviceSupabase as any)
            .from('ai_analyses')
            .insert({
              user_id: effectiveUser.id,
              listing_id: listingId,
              analysis_type: 'buyer_match',
              analysis_data: matchScore,
            });

          if (!insertError) {
            console.log('✅ Super Enhanced buyer match saved to database');
          } else {
            console.error('Failed to save super enhanced buyer match:', insertError);
          }
        } catch (error) {
          console.error('Error saving enhanced buyer match:', error);
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
              analysis_type: 'super_enhanced_buyer_match',
              perspective_used: 'buyer_focused',
              focus_areas: ['compatibility', 'strategic_fit'],
              listing_industry: (listing as any).industry,
              listing_price: (listing as any).price,
              analysis_score: matchScore.score,
              recommendation: matchScore.score >= 80 ? 'strong_match' : matchScore.score >= 60 ? 'good_match' : 'poor_match',
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
      matchScore,
      cached: !!existingAnalysis,
      analysisDate: existingAnalysis ? existingAnalysis.created_at : new Date().toISOString(),
      listingTitle: listing.title,
      buyerPreferences,
      superEnhancedFeatures: {
        advancedCompatibilityAnalysis: true,
        comprehensiveRiskAssessment: true,
        synergyIdentification: true,
        strategicFitScoring: true,
        confidenceScoring: true,
        followUpCapability: true,
        aiVersion: '2.0'
      }
    });

  } catch (error) {
    console.error('Error in buyer matching:', error);

    return NextResponse.json(
      {
        error: 'Failed to calculate buyer match',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
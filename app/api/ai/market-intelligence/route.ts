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

    // Fetch listing if listingId is provided to get title and description
    let listingTitle = '';
    let listingDescription = '';
    if (listingId) {
      try {
        const useServiceClient = isDevBypass || effectiveUser?.role === 'admin';
        const supabase = useServiceClient ? createServiceClient() : createClient();
        const { data: listing } = await supabase
          .from('listings')
          .select('title, description')
          .eq('id', listingId)
          .single() as { data: any | null, error: any };
        if (listing) {
          listingTitle = listing.title || '';
          listingDescription = listing.description || '';
        }
      } catch (error) {
        console.log('Could not fetch listing details, proceeding with generic analysis');
      }
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
          .eq('analysis_type', 'market_intelligence')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cacheError && cached) {
          // Check if cache is expired
          const cacheAge = Date.now() - new Date(cached.created_at).getTime();
          const cacheExpired = cacheAge > CACHE_EXPIRY_HOURS * 60 * 60 * 1000;

          if (cacheExpired) {
            console.log('Cache expired, generating fresh market intelligence');
          } else {
            const cachedParams = cached.analysis_data?.parameters || {};
            const paramsMatch = cachedParams.industry === industry &&
                               cachedParams.geography === geography &&
                               cachedParams.dealSize === dealSize;

            if (paramsMatch) {
              existingAnalysis = cached;
              const { parameters, ...intelligenceData } = cached.analysis_data;
              intelligence = intelligenceData;
              console.log('Using cached enhanced market intelligence from', cached.created_at);
            } else {
              console.log('Cache parameters mismatch, generating fresh analysis');
            }
          }
        }
      } catch (error) {
        console.log('No cached enhanced market intelligence found, generating fresh analysis');
      }
    } else {
      console.log('🔄 Development mode or force refresh - skipping cache, generating fresh AI analysis');
    }

    // Generate super enhanced market intelligence if no cached version exists
    if (!existingAnalysis || forceRefresh) {
      // Fetch real market data from the database for this industry
      let marketData: any = null;
      try {
        const useServiceClient = isDevBypass || effectiveUser?.role === 'admin';
        const supabase = useServiceClient ? createServiceClient() : createClient();

        // Fetch all listings in this industry
        const { data: industryListings } = await supabase
          .from('listings')
          .select('id, title, industry, city, state, revenue, ebitda, price, askingPrice, employees, cashFlow')
          .eq('industry', industry) as { data: any[] | null; error: any };

        if (industryListings && industryListings.length > 0) {
          // Calculate real market statistics
          const revenues = industryListings.map(l => l.revenue).filter(r => r && r > 0);
          const ebitdas = industryListings.map(l => l.ebitda).filter(e => e && e > 0);
          const prices = industryListings.map(l => l.price || l.askingPrice).filter(p => p && p > 0);
          const employeeCounts = industryListings.map(l => l.employees).filter(e => e && e > 0);

          // Filter by geography if specified
          const geoListings = geography ? industryListings.filter(l =>
            l.state?.toLowerCase().includes(geography.toLowerCase()) ||
            l.city?.toLowerCase().includes(geography.toLowerCase())
          ) : industryListings;

          // Filter by deal size if specified
          const dealSizeListings = dealSize ? industryListings.filter(l =>
            (l.price || l.askingPrice) && Math.abs((l.price || l.askingPrice) - dealSize) < dealSize * 0.5
          ) : industryListings;

          marketData = {
            totalListings: industryListings.length,
            geoListings: geography ? geoListings.length : null,
            dealSizeListings: dealSize ? dealSizeListings.length : null,

            // Overall market statistics
            averageRevenue: revenues.length > 0 ? Math.round(revenues.reduce((a, b) => a + b, 0) / revenues.length) : null,
            medianRevenue: revenues.length > 0 ? revenues.sort((a, b) => a - b)[Math.floor(revenues.length / 2)] : null,
            averageEBITDA: ebitdas.length > 0 ? Math.round(ebitdas.reduce((a, b) => a + b, 0) / ebitdas.length) : null,
            medianEBITDA: ebitdas.length > 0 ? ebitdas.sort((a, b) => a - b)[Math.floor(ebitdas.length / 2)] : null,
            averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null,
            medianPrice: prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : null,
            averageEmployees: employeeCounts.length > 0 ? Math.round(employeeCounts.reduce((a, b) => a + b, 0) / employeeCounts.length) : null,

            // Market concentration by geography
            topStates: geography ? null : Object.entries(
              industryListings.reduce((acc: any, l) => {
                if (l.state) acc[l.state] = (acc[l.state] || 0) + 1;
                return acc;
              }, {})
            ).sort(([, a]: any, [, b]: any) => b - a).slice(0, 5),

            // Price range distribution
            priceRanges: {
              under500k: prices.filter(p => p < 500000).length,
              range500kTo1m: prices.filter(p => p >= 500000 && p < 1000000).length,
              range1mTo2m: prices.filter(p => p >= 1000000 && p < 2000000).length,
              range2mTo5m: prices.filter(p => p >= 2000000 && p < 5000000).length,
              over5m: prices.filter(p => p >= 5000000).length,
            },

            // Sample listings for context
            sampleListings: industryListings.slice(0, 10).map(l => ({
              title: l.title,
              city: l.city,
              state: l.state,
              revenue: l.revenue,
              ebitda: l.ebitda,
              price: l.price || l.askingPrice
            }))
          };

          console.log('📊 Real market data fetched:', {
            totalListings: marketData.totalListings,
            averagePrice: marketData.averagePrice
          });
        }
      } catch (error) {
        console.log('No market data found, proceeding with general analysis');
      }

      // Use super enhanced market intelligence generator with real market data
      intelligence = await generateSuperEnhancedMarketIntelligence(
        listingTitle,
        listingDescription,
        industry,
        geography,
        dealSize,
        marketData
      );
    }

    // Skip database saves in development mode
    if (!isDevBypass) {
      // Store the analysis in the database
      // Use service client for development bypass or when user exists
      const useServiceClient = isDevBypass || effectiveUser?.role === 'admin';
      const supabase = useServiceClient ? createServiceClient() : createClient();
      const { error: insertError } = await (supabase as any)
        .from('ai_analyses')
        .insert({
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
          }
        });

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
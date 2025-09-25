import { NextRequest, NextResponse } from 'next/server';
import { calculateBuyerBusinessMatch, isAIEnabled } from '@/lib/ai/openai';
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

    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

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

    // Get user preferences (optional - create defaults if missing)
    const { data: preferences, error: preferencesError } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', authUser.id)
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

    try {
      const serviceSupabase = createServiceClient();
      const { data: cached, error: cacheError } = await serviceSupabase
        .from('ai_analyses')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('listing_id', listingId)
        .eq('analysis_type', 'buyer_match')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cacheError && cached) {
        existingAnalysis = cached;
        matchScore = (cached as any).analysis_data;
        console.log('Using cached buyer match from', (cached as any).created_at);
      }
    } catch (error) {
      console.log('No cached buyer match found, generating fresh analysis');
    }

    // Generate fresh analysis if no cached version exists
    if (!existingAnalysis) {
      matchScore = await calculateBuyerBusinessMatch(listing, buyerPreferences);

      // Save buyer match to database
      try {
        const serviceSupabase = createServiceClient();
        const { error: insertError } = await serviceSupabase
          .from('ai_analyses')
          .insert([{
            user_id: authUser.id,
            listing_id: listingId,
            analysis_type: 'buyer_match',
            analysis_data: matchScore,
          }]);

        if (!insertError) {
          console.log('✅ Buyer match saved to database');
        } else {
          console.error('Failed to save buyer match:', insertError);
        }
      } catch (error) {
        console.error('Error saving buyer match:', error);
      }
    }

    return NextResponse.json({
      success: true,
      matchScore,
      listingTitle: listing.title,
      buyerPreferences
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
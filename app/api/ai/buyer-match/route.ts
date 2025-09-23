import { NextRequest, NextResponse } from 'next/server';
import { calculateBuyerBusinessMatch, isAIEnabled } from '@/lib/ai/openai';
import { createClient } from '@/lib/supabase/server';
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

    // Authenticate user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('preferences')
      .select('*')
      .eq('userId', user.id)
      .single() as { data: Preferences | null; error: any };

    // Handle case where no preferences exist
    if (preferencesError || !preferences) {
      return NextResponse.json(
        { error: 'User preferences not found. Please set up your investment preferences first.' },
        { status: 400 }
      );
    }

    // Build buyer preferences object
    const buyerPreferences = {
      industries: preferences.industries || [],
      dealSizeMin: preferences.minRevenue || undefined,
      dealSizeMax: preferences.priceMax || undefined,
      geographicPreferences: preferences.states || [],
      riskTolerance: 'medium' as const,
      experienceLevel: 'experienced' as const
    };

    // Calculate match score
    const matchScore = await calculateBuyerBusinessMatch(listing, buyerPreferences);

    // TODO: Store the match analysis (temporarily disabled due to type issues)
    // const { error: insertError } = await supabase
    //   .from('ai_analyses')
    //   .upsert({
    //     listingId: listingId,
    //     userId: user.id,
    //     analysisType: 'buyer_match',
    //     analysisData: matchScore,
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString()
    //   });

    // if (insertError) {
    //   console.error('Error storing match analysis:', insertError);
    // }

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
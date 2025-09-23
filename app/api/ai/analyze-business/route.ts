import { NextRequest, NextResponse } from 'next/server';
import { analyzeBusinessForAcquisition, isAIEnabled } from '@/lib/ai/openai';
import { createClient } from '@/lib/supabase/server';

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
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Generate AI analysis
    const analysis = await analyzeBusinessForAcquisition(listing);

    // TODO: Store analysis for caching (temporarily disabled due to type issues)
    // const { error: insertError } = await supabase
    //   .from('ai_analyses')
    //   .upsert({
    //     listingId: listingId,
    //     userId: user.id,
    //     analysisType: 'business_analysis',
    //     analysisData: analysis,
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString()
    //   });

    // if (insertError) {
    //   console.error('Error storing AI analysis:', insertError);
    //   // Continue anyway - don't fail the request
    // }

    return NextResponse.json({
      success: true,
      analysis,
      listingTitle: (listing as any).title
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
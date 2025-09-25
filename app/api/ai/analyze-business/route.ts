import { NextRequest, NextResponse } from 'next/server';
import { analyzeBusinessForAcquisition, isAIEnabled } from '@/lib/ai/openai';
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

    const supabase = createClient();

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

    // Always generate fresh analysis (caching disabled until table is created)
    const analysis = await analyzeBusinessForAcquisition(listing);
    const existingAnalysis = null; // Caching disabled

    return NextResponse.json({
      success: true,
      analysis,
      cached: !!existingAnalysis,
      analysisDate: existingAnalysis ? (existingAnalysis as any).created_at : new Date().toISOString(),
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
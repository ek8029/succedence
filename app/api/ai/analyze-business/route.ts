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

    // Check for existing analysis first (caching enabled)
    let analysis;
    let existingAnalysis = null;

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
        existingAnalysis = cached;
        analysis = (cached as any).analysis_data;
        console.log('Using cached business analysis from', (cached as any).created_at);
      }
    } catch (error) {
      console.log('No cached analysis found or table does not exist, generating fresh analysis');
    }

    // Generate fresh analysis if no cached version exists
    if (!existingAnalysis) {
      analysis = await analyzeBusinessForAcquisition(listing);

      // Save analysis to database
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
          console.log('✅ Business analysis saved to database');
        } else {
          console.error('Failed to save business analysis:', insertError);
        }
      } catch (error) {
        console.error('Error saving business analysis:', error);
      }
    }

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
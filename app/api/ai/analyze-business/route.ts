import { NextRequest, NextResponse } from 'next/server';
import { analyzeBusinessForAcquisition, isAIEnabled } from '@/lib/ai/openai';
import { createClient } from '@/lib/supabase/server';
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

    // Check if we have a recent analysis cached
    const { data: existingAnalysis } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', authUser.id)
      .eq('listing_id', listingId)
      .eq('analysis_type', 'business_analysis')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24 hours
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let analysis;

    if (existingAnalysis && existingAnalysis.analysis_data) {
      // Use cached analysis
      analysis = existingAnalysis.analysis_data;
    } else {
      // Generate new AI analysis
      analysis = await analyzeBusinessForAcquisition(listing);

      // Store analysis for caching
      const { error: insertError } = await supabase
        .from('ai_analyses')
        .insert({
          user_id: authUser.id,
          listing_id: listingId,
          analysis_type: 'business_analysis',
          analysis_data: analysis,
        });

      if (insertError) {
        console.error('Error storing AI analysis:', insertError);
        // Continue anyway - don't fail the request
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      cached: !!existingAnalysis,
      analysisDate: existingAnalysis ? existingAnalysis.created_at : new Date().toISOString(),
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
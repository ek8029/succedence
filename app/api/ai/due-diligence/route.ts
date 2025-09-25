import { NextRequest, NextResponse } from 'next/server';
import { generateDueDiligenceChecklist, isAIEnabled } from '@/lib/ai/openai';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRole, hasFeatureAccess } from '@/lib/auth/permissions';
import type { Listing } from '@/db/schema';

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
      .single() as { data: Listing | null; error: any };

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Generate due diligence checklist
    const checklist = await generateDueDiligenceChecklist(listing);

    // Store the analysis in the database
    const { error: insertError } = await supabase
      .from('ai_analyses')
      .upsert({
        listing_id: listingId,
        user_id: authUser.id,
        analysis_type: 'due_diligence',
        analysis_data: checklist,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any);

    if (insertError) {
      console.error('Error storing due diligence analysis:', insertError);
    }

    return NextResponse.json({
      success: true,
      checklist,
      listingTitle: listing.title,
      industry: listing.industry
    });

  } catch (error) {
    console.error('Error generating due diligence checklist:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate due diligence checklist',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
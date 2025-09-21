import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findTempNDA, updateTempNDA } from '@/lib/temp-storage';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action } = body; // 'approve' or 'deny'

    if (!action || (action !== 'approve' && action !== 'deny')) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "deny"' }, { status: 400 });
    }

    // Get the NDA from temporary storage
    const nda = findTempNDA(id);

    if (!nda) {
      return NextResponse.json({ error: 'NDA not found' }, { status: 404 });
    }

    // Get the listing to check ownership
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('owner_user_id')
      .eq('id', nda.listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listingData = listing as any;

    // Check if user is the listing owner
    if (listingData?.owner_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only update NDAs for your own listings' }, { status: 403 });
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // Update the NDA status
    const updatedNDA = updateTempNDA(id, { status });

    if (!updatedNDA) {
      return NextResponse.json({ error: 'Failed to update NDA status' }, { status: 500 });
    }

    return NextResponse.json(updatedNDA);
  } catch (error) {
    console.error('Error in PATCH NDA:', error);
    return NextResponse.json({ error: 'Failed to update NDA status' }, { status: 500 });
  }
}

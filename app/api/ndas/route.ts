import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTempNDAs, createTempNDA, findTempNDAByUser } from '@/lib/temp-storage';

interface CreateNDARequest {
  listingId: string;
  buyerName: string;
  buyerEmail?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    const ndas = getTempNDAs(listingId || undefined);
    return NextResponse.json(ndas);
  } catch (error) {
    console.error('Error in GET NDAs:', error);
    return NextResponse.json({ error: 'Failed to fetch NDAs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateNDARequest = await request.json();

    // Validate required fields
    if (!body.listingId || !body.buyerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate buyer name is not empty
    if (body.buyerName.trim().length === 0) {
      return NextResponse.json({ error: 'Buyer name cannot be empty' }, { status: 400 });
    }

    // Check if listing exists
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', body.listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check if user already has an NDA request for this listing
    const existingNDA = findTempNDAByUser(body.listingId, user.id);

    if (existingNDA) {
      return NextResponse.json({ error: 'NDA request already exists for this listing' }, { status: 409 });
    }

    // Create the NDA request
    const newNDA = createTempNDA({
      listingId: body.listingId,
      buyerUserId: user.id,
      buyerName: body.buyerName.trim()
    });

    return NextResponse.json(newNDA, { status: 201 });
  } catch (error) {
    console.error('Error in POST NDAs:', error);
    return NextResponse.json({ error: 'Failed to create NDA request' }, { status: 500 });
  }
}

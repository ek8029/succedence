import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CreateMessageRequest {
  listingId: string;
  from: string;
  body: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    const supabase = createClient();

    let query = supabase
      .from('messages')
      .select(`
        id,
        body,
        created_at,
        listing_id,
        from_user:from_user(name),
        to_user:to_user(name)
      `)
      .order('created_at', { ascending: true });

    if (listingId) {
      query = query.eq('listing_id', listingId);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Transform to match expected format
    const transformedMessages = messages?.map(msg => ({
      id: msg.id,
      listingId: msg.listing_id,
      from: msg.from_user?.name || 'Unknown',
      body: msg.body,
      timestamp: msg.created_at
    })) || [];

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error('Error in GET messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
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

    const body: CreateMessageRequest = await request.json();

    // Validate required fields
    if (!body.listingId || !body.body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate message body is not empty
    if (body.body.trim().length === 0) {
      return NextResponse.json({ error: 'Message body cannot be empty' }, { status: 400 });
    }

    // Get listing owner to set as recipient
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('owner_user_id')
      .eq('id', body.listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Determine recipient (if sender is owner, message goes to last buyer who messaged, otherwise goes to owner)
    let toUserId = listing.owner_user_id;
    if (user.id === listing.owner_user_id) {
      // If owner is sending, we'll set to_user to the same as from_user for now
      // In a real system, you'd track conversation participants
      toUserId = user.id;
    }

    // Create the message
    const { data: newMessage, error: createError } = await supabase
      .from('messages')
      .insert({
        from_user: user.id,
        to_user: toUserId,
        listing_id: body.listingId,
        body: body.body.trim(),
      })
      .select(`
        id,
        body,
        created_at,
        listing_id,
        from_user:from_user(name)
      `)
      .single();

    if (createError) {
      console.error('Error creating message:', createError);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // Transform to match expected format
    const transformedMessage = {
      id: newMessage.id,
      listingId: newMessage.listing_id,
      from: newMessage.from_user?.name || 'Unknown',
      body: newMessage.body,
      timestamp: newMessage.created_at
    };

    return NextResponse.json(transformedMessage, { status: 201 });
  } catch (error) {
    console.error('Error in POST messages:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

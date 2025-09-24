import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRole } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getUserWithRole();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get saved listings with listing details and AI analysis info
    const { data: savedListings, error } = await supabase
      .from('saved_listings')
      .select(`
        *,
        listings!inner (
          id,
          title,
          industry,
          city,
          state,
          price,
          revenue,
          ebitda,
          description,
          status,
          created_at
        )
      `)
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching saved listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved listings' },
        { status: 500 }
      );
    }

    // Get AI analysis counts for each listing
    const listingIds = savedListings?.map(sl => sl.listing_id) || [];
    const { data: aiAnalysesCounts } = await supabase
      .from('ai_analyses')
      .select('listing_id, analysis_type')
      .eq('user_id', authUser.id)
      .in('listing_id', listingIds);

    // Enhance saved listings with AI analysis info
    const enhancedSavedListings = savedListings?.map(savedListing => ({
      ...savedListing,
      ai_analysis_count: aiAnalysesCounts?.filter(a => a.listing_id === savedListing.listing_id).length || 0,
      analysis_types: aiAnalysesCounts?.filter(a => a.listing_id === savedListing.listing_id).map(a => a.analysis_type) || []
    }));

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('saved_listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id);

    if (countError) {
      console.error('Error counting saved listings:', countError);
    }

    return NextResponse.json({
      success: true,
      savedListings: enhancedSavedListings || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in saved listings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getUserWithRole();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { listingId, notes } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if listing exists
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Save the listing
    const { data: savedListing, error: saveError } = await supabase
      .from('saved_listings')
      .upsert({
        user_id: authUser.id,
        listing_id: listingId,
        notes: notes || null,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving listing:', saveError);
      return NextResponse.json(
        { error: 'Failed to save listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      savedListing
    });

  } catch (error) {
    console.error('Error in save listing API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await getUserWithRole();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Remove the saved listing
    const { error: deleteError } = await supabase
      .from('saved_listings')
      .delete()
      .eq('user_id', authUser.id)
      .eq('listing_id', listingId);

    if (deleteError) {
      console.error('Error removing saved listing:', deleteError);
      return NextResponse.json(
        { error: 'Failed to remove saved listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Listing removed from saved list'
    });

  } catch (error) {
    console.error('Error in remove saved listing API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
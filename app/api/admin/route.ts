import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats, updateListingLane } from '@/lib/db';

export async function GET() {
  try {
    const stats = getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, newLane } = body;
    
    if (!listingId || !newLane) {
      return NextResponse.json({ error: 'Missing listingId or newLane' }, { status: 400 });
    }
    
    if (newLane !== 'MAIN' && newLane !== 'STARTER') {
      return NextResponse.json({ error: 'Invalid lane. Must be "MAIN" or "STARTER"' }, { status: 400 });
    }
    
    const updatedListing = updateListingLane(listingId, newLane);
    
    if (!updatedListing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedListing);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update listing lane' }, { status: 500 });
  }
}

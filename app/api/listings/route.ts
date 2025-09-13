import { NextRequest, NextResponse } from 'next/server';
import { getListings, saveListing } from '@/lib/db';
import { CreateListingRequest, ListingFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const filters: ListingFilters = {};
    
    const industry = searchParams.get('industry');
    if (industry) filters.industry = industry;
    
    const lane = searchParams.get('lane') as "MAIN" | "STARTER";
    if (lane && (lane === 'MAIN' || lane === 'STARTER')) {
      filters.lane = lane;
    }
    
    const minRevenue = searchParams.get('minRevenue');
    if (minRevenue) {
      const revenue = parseInt(minRevenue, 10);
      if (!isNaN(revenue)) {
        filters.minRevenue = revenue;
      }
    }
    
    const listings = getListings(filters);
    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateListingRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.owner || !body.revenue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate revenue is a positive number
    if (typeof body.revenue !== 'number' || body.revenue < 0) {
      return NextResponse.json({ error: 'Revenue must be a positive number' }, { status: 400 });
    }
    
    const newListing = saveListing(body);
    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

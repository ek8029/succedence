import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testListings = [
  {
    title: "Profitable E-commerce Platform - Electronics Niche",
    industry: "E-commerce",
    description: "Established online electronics retailer with 5+ years of operation, strong supplier relationships, and growing customer base. Automated fulfillment processes and established brand recognition in consumer electronics market.",
    city: "Austin",
    state: "TX",
    price: 850000,
    revenue: 2400000,
    ebitda: 420000,
    employees: 12,
    status: "active"
  },
  {
    title: "Regional HVAC Service Company",
    industry: "Home Services",
    description: "Well-established HVAC installation and repair company serving residential and commercial clients across three counties. Strong recurring maintenance contracts, experienced technicians, and excellent reputation.",
    city: "Phoenix",
    state: "AZ",
    price: 1200000,
    revenue: 1800000,
    ebitda: 350000,
    employees: 18,
    status: "active"
  },
  {
    title: "Specialty Food Manufacturing - Organic Snacks",
    industry: "Food & Beverage",
    description: "Premium organic snack food manufacturer with nationwide distribution through major retailers. Strong brand presence, certified organic facility, and growing health-conscious consumer demand.",
    city: "Denver",
    state: "CO",
    price: 2200000,
    revenue: 3500000,
    ebitda: 650000,
    employees: 25,
    status: "active"
  },
  {
    title: "Digital Marketing Agency - SaaS Focus",
    industry: "Marketing Services",
    description: "Specialized digital marketing agency focused on SaaS and tech companies. Strong client retention, proven growth strategies, and experienced team of marketing professionals with deep industry expertise.",
    city: "Seattle",
    state: "WA",
    price: 950000,
    revenue: 1600000,
    ebitda: 480000,
    employees: 15,
    status: "active"
  },
  {
    title: "Medical Device Distribution Company",
    industry: "Healthcare",
    description: "Established medical device distributor serving hospitals and clinics in the Southwest region. Long-term contracts with major suppliers, experienced sales team, and strong relationships with healthcare providers.",
    city: "Dallas",
    state: "TX",
    price: 1800000,
    revenue: 2800000,
    ebitda: 520000,
    employees: 22,
    status: "active"
  }
];

export async function POST(request: NextRequest) {
  try {
    // Always create test listings (clear any existing ones first)
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('Note: Could not clear existing listings (might be empty):', deleteError);
    }

    // Add proper timestamps to test listings (skip owner_user_id for now)
    const testListingsWithMeta = testListings.map(listing => ({
      ...listing,
      source: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Create test listings
    const { data, error } = await supabase
      .from('listings')
      .insert(testListingsWithMeta)
      .select();

    if (error) {
      console.error('Error creating test listings:', error);
      return NextResponse.json({
        error: 'Failed to create test listings',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${data.length} test listings`,
      listings: data
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
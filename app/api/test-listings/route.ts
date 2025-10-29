import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service client to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get all active listings using service client (bypasses RLS)
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching test listings:', error);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      listings: listings || [],
      count: listings?.length || 0
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
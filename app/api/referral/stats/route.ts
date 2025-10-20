import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Mark as dynamic to prevent static optimization issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate or get user's referral code
    // Use first 8 characters of user ID as referral code
    const referralCode = user.id.substring(0, 8).toUpperCase();

    // Count referrals (users who signed up with this user's referral code)
    // For now, return mock data since we need to add referral tracking to the database
    const mockStats = {
      referralCode,
      totalReferrals: 0,
      pendingReferrals: 0,
      completedReferrals: 0,
    };

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

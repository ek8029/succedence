import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FREE_LIMIT = 1;

export async function GET(request: NextRequest) {
  try {
    const anonymousId = request.headers.get('x-anonymous-id');

    // Check if user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Authenticated users have unlimited access (based on their plan)
    if (user) {
      return NextResponse.json({
        authenticated: true,
        canUse: true,
        remaining: -1, // Unlimited for authenticated users
        requiresSignup: false,
      });
    }

    // For anonymous users, check tracking
    if (!anonymousId) {
      return NextResponse.json({
        authenticated: false,
        canUse: true,
        remaining: FREE_LIMIT,
        requiresSignup: false,
      });
    }

    // Check database for usage (type cast needed for new tables)
    const { data, error } = await (supabase
      .from('free_valuation_tracking') as ReturnType<typeof supabase.from>)
      .select('valuations_used')
      .eq('anonymous_id', anonymousId)
      .single();

    if (error || !data) {
      // No record = first time user
      return NextResponse.json({
        authenticated: false,
        canUse: true,
        remaining: FREE_LIMIT,
        requiresSignup: false,
      });
    }

    const trackingData = data as { valuations_used: number };
    const used = trackingData.valuations_used || 0;
    const remaining = Math.max(0, FREE_LIMIT - used);
    const canUse = remaining > 0;

    return NextResponse.json({
      authenticated: false,
      canUse,
      remaining,
      requiresSignup: !canUse,
    });
  } catch (error) {
    console.error('Free tier check error:', error);
    // Default to allowing on error
    return NextResponse.json({
      authenticated: false,
      canUse: true,
      remaining: FREE_LIMIT,
      requiresSignup: false,
    });
  }
}

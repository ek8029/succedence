import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PlanType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    // Validate plan type
    const validPlans: PlanType[] = ['free', 'starter', 'professional', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Update user's plan in the database
    const { error: updateError } = await (supabase as any)
      .from('users')
      .update({ plan })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user plan:', updateError);
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 500 }
      );
    }

    // For paid plans, here you would typically:
    // 1. Create a Stripe customer if they don't exist
    // 2. Create a subscription in Stripe
    // 3. Store the subscription ID in your database
    // 4. Set up webhooks to handle payment events

    // For now, we'll just update the plan in the database
    return NextResponse.json({
      success: true,
      plan,
      message: 'Plan updated successfully'
    });

  } catch (error) {
    console.error('Error in update-plan API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
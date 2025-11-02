import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';

export const dynamic = 'force-dynamic';

/**
 * Cron endpoint to check for expired free trials and automatically upgrade users to starter plan
 * This should be called daily via a cron job or scheduler (e.g., Vercel Cron, Upstash QStash)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    const now = new Date().toISOString();

    // Find all users with expired trials who are still on the free plan
    const { data: expiredTrialUsers, error: fetchError } = await (supabase
      .from('users') as any)
      .select('id, email, name, trial_ends_at')
      .eq('plan', 'free')
      .not('trial_ends_at', 'is', null)
      .lt('trial_ends_at', now);

    if (fetchError) {
      console.error('Error fetching expired trial users:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch expired trials' },
        { status: 500 }
      );
    }

    if (!expiredTrialUsers || expiredTrialUsers.length === 0) {
      console.log('No expired trials to process');
      return NextResponse.json({
        success: true,
        message: 'No expired trials to process',
        processed: 0
      });
    }

    console.log(`Found ${expiredTrialUsers.length} expired trials to upgrade`);

    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[]
    };

    // Process each expired trial user
    for (const user of expiredTrialUsers) {
      try {
        // Create Stripe customer if they don't have one
        let customerId = null;

        // Check if user already has a Stripe customer ID
        const { data: existingUser } = await (supabase
          .from('users') as any)
          .select('stripe_customer_id')
          .eq('id', user.id)
          .single();

        if (existingUser?.stripe_customer_id) {
          customerId = existingUser.stripe_customer_id;
        } else {
          // Create new Stripe customer
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
              userId: user.id,
              source: 'trial_upgrade'
            }
          });
          customerId = customer.id;
        }

        // Create Stripe subscription for starter plan
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: STRIPE_CONFIG.prices.starter,
            },
          ],
          metadata: {
            userId: user.id,
            planType: 'starter',
            source: 'trial_upgrade'
          },
          // Trial period is already over, so start billing immediately
          billing_cycle_anchor: 'now' as any,
        });

        // Update user record in database
        const { error: updateError } = await (supabase
          .from('users') as any)
          .update({
            plan: 'starter',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            trial_ends_at: null, // Clear trial end date
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        console.log(`✅ Successfully upgraded user ${user.email} to starter plan`);
        results.success.push(user.email);

        // TODO: Send email notification to user about their upgrade
        // You can add email notification logic here using Resend or your email service

      } catch (error: any) {
        console.error(`❌ Failed to upgrade user ${user.email}:`, error);
        results.failed.push({
          email: user.email,
          error: error.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredTrialUsers.length} expired trials`,
      processed: expiredTrialUsers.length,
      upgraded: results.success.length,
      failed: results.failed.length,
      details: results
    });

  } catch (error: any) {
    console.error('Error in upgrade-expired-trials cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for testing purposes (remove in production or require auth)
export async function GET(request: NextRequest) {
  // Check if in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'GET method only allowed in development' },
      { status: 405 }
    );
  }

  // In development, allow GET to test the endpoint
  return POST(request);
}

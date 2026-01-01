import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';
import { getUserWithRole } from '@/lib/auth/permissions';
import { PlanType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserWithRole();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { planType, billingCycle }: {
      planType: PlanType;
      billingCycle?: 'monthly' | 'annual';
    } = await request.json();

    if (!planType || planType === 'free' || planType === 'beta') {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Default to monthly if not specified
    const cycle = billingCycle || 'monthly';

    // Get the price ID for the selected plan and billing cycle
    const planPrices = STRIPE_CONFIG.prices[planType as keyof typeof STRIPE_CONFIG.prices];
    const priceId = typeof planPrices === 'object' ? planPrices[cycle] : planPrices;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan type or billing cycle' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const sessionConfig: any = {
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/subscribe/cancel`,
      metadata: {
        userId: user.id,
        planType: planType,
        billingCycle: cycle,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planType: planType,
          billingCycle: cycle,
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
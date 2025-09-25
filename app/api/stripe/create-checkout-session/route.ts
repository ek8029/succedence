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

    const { planType }: { planType: PlanType } = await request.json();

    if (!planType || planType === 'free' || planType === 'beta') {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Get the price ID for the selected plan
    const priceId = STRIPE_CONFIG.prices[planType as keyof typeof STRIPE_CONFIG.prices];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
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
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planType: planType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
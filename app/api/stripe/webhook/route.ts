import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription') {
          const userId = session.metadata?.userId;
          const planType = session.metadata?.planType;
          const subscriptionId = session.subscription as string;

          if (userId && planType) {
            // Update user's plan in database
            const { error } = await (supabase as any)
              .from('users')
              .update({
                plan: planType,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionId,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);

            if (error) {
              console.error('Error updating user plan:', error);
            } else {
              console.log(`Successfully upgraded user ${userId} to ${planType} plan`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by Stripe customer ID
        const { data: user, error: userError } = await (supabase as any)
          .from('users')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userError || !user) {
          console.error('Error finding user by customer ID:', userError);
          break;
        }

        // Update subscription status
        const updateData: any = {
          stripe_subscription_id: subscription.id,
          updated_at: new Date().toISOString(),
        };

        // If subscription is cancelled, update plan
        if (subscription.status === 'canceled') {
          updateData.plan = 'free';
          updateData.stripe_customer_id = null;
          updateData.stripe_subscription_id = null;
        }

        const { error } = await (supabase as any)
          .from('users')
          .update(updateData)
          .eq('id', user.id);

        if (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Downgrade user to free plan
        const { error } = await (supabase as any)
          .from('users')
          .update({
            plan: 'free',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error downgrading user:', error);
        } else {
          console.log(`Successfully downgraded user to free plan`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // You might want to send an email notification here
        console.log(`Payment failed for customer: ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
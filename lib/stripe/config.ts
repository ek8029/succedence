import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  // Product price IDs - update these with your actual Stripe price IDs
  prices: {
    starter: {
      monthly: process.env.STRIPE_STARTER_PRICE_ID_MONTHLY || 'price_starter_monthly',
      annual: process.env.STRIPE_STARTER_PRICE_ID_ANNUAL || 'price_starter_annual',
    },
    professional: {
      monthly: process.env.STRIPE_PROFESSIONAL_PRICE_ID_MONTHLY || 'price_professional_monthly',
      annual: process.env.STRIPE_PROFESSIONAL_PRICE_ID_ANNUAL || 'price_professional_annual',
    },
    enterprise: {
      monthly: process.env.STRIPE_ENTERPRISE_PRICE_ID_MONTHLY || 'price_enterprise_monthly',
      annual: process.env.STRIPE_ENTERPRISE_PRICE_ID_ANNUAL || 'price_enterprise_annual',
    },
  }
} as const;
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
    starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_1234567890abcdef',
    professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_abcdef1234567890',
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_fedcba0987654321',
  }
} as const;
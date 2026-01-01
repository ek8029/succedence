# Stripe Configuration Guide

## Updated Pricing
- **Starter**: $19.99/month, $15.99/month annual (20% off = $191.88/year)
- **Professional**: $49.99/month, $39.99/month annual (20% off = $479.88/year)

## Step 1: Create Products in Stripe Dashboard

Go to https://dashboard.stripe.com/products and create the following **recurring** prices:

### Starter Plan
1. **Monthly**: $19.99/month - Copy the price ID (starts with `price_`)
2. **Annual**: $191.88/year - Copy the price ID

### Professional Plan
1. **Monthly**: $49.99/month - Copy the price ID
2. **Annual**: $479.88/year - Copy the price ID

### Enterprise Plan (if needed)
1. **Monthly**: Custom pricing - Copy the price ID
2. **Annual**: Custom pricing - Copy the price ID

## Step 2: Add Environment Variables

Add these to your `.env.local` file with the actual price IDs from Stripe:

```bash
# Stripe Starter Plan Price IDs
STRIPE_STARTER_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_STARTER_PRICE_ID_ANNUAL=price_xxxxxxxxxxxxx

# Stripe Professional Plan Price IDs
STRIPE_PROFESSIONAL_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PROFESSIONAL_PRICE_ID_ANNUAL=price_xxxxxxxxxxxxx

# Stripe Enterprise Plan Price IDs (optional)
STRIPE_ENTERPRISE_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID_ANNUAL=price_xxxxxxxxxxxxx
```

## Step 3: Restart Your Dev Server

After adding the environment variables, restart your development server for the changes to take effect:

```bash
npm run dev
```

## Files Updated
- ✅ `app/pricing/page.tsx` - Updated pricing display
- ✅ `lib/types.ts` - Updated plan prices
- ✅ `lib/stripe/config.ts` - Added monthly/annual price structure
- ✅ `app/api/stripe/create-checkout-session/route.ts` - Added billing cycle support
- ✅ `app/subscribe/page.tsx` - Defaults to monthly billing

## Testing
After setting up:
1. Visit `/pricing` to see the updated prices
2. Test checkout flow with a Stripe test card
3. Verify correct price is charged based on billing cycle selection

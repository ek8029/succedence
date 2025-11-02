# Free Trial Feature Documentation

## Overview

The platform now includes a **3-day free trial** feature that automatically subscribes users to the **Starter Plan** ($49.99/month) after the trial period expires.

## How It Works

### 1. User Sign-Up
When a new user creates an account:
- Their `plan` is set to `'free'`
- Their `trial_ends_at` is set to 3 days from signup
- They get immediate access to the platform

### 2. Trial Period
During the 3-day trial:
- Users have full access to the platform
- A trial status banner shows how much time remains
- Users can subscribe early to avoid automatic billing

### 3. Trial Expiration
After 3 days:
- The cron job `/api/cron/upgrade-expired-trials` runs daily at 6 AM UTC
- Expired trial users are automatically upgraded to the Starter Plan
- A Stripe subscription is created with the first billing on the 4th day
- Users receive access to Starter Plan features

## Technical Implementation

### Database Changes

**Migration File:** `sql/007_add_trial_field.sql`

```sql
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_users_trial_ends_at ON users(trial_ends_at)
WHERE trial_ends_at IS NOT NULL AND plan = 'free';
```

**Schema Update:** `db/schema.ts`
- Added `trialEndsAt` field to the `users` table

### API Endpoints

#### `/api/auth/create-profile` (POST)
- Modified to set `trial_ends_at` to 3 days from signup
- Creates new users with an active trial

#### `/api/cron/upgrade-expired-trials` (POST)
- Runs daily via Vercel Cron (6 AM UTC)
- Finds all users with `plan='free'` and `trial_ends_at < NOW()`
- Creates Stripe customer and subscription
- Updates user to `plan='starter'`
- Clears `trial_ends_at` field

**Authentication:**
- Protected by `CRON_SECRET` environment variable
- Add `Authorization: Bearer YOUR_CRON_SECRET` header when calling manually

### Middleware Updates

**File:** `middleware.ts`

The middleware now checks:
1. If user is on the `'free'` plan
2. If they have a valid trial (`trial_ends_at` is in the future)
3. Redirects to `/subscription` if trial expired and no paid plan

**Exempt Routes** (no trial check):
- `/onboarding`
- `/subscription`
- `/subscribe`
- `/profile`
- `/preferences`

### Components

#### `TrialStatusBanner.tsx`
- Displays countdown of remaining trial time
- Shows urgency indicators (normal → warning → critical)
- Includes "Subscribe Now" CTA
- Auto-updates every minute

**Usage:**
```tsx
import TrialStatusBanner from '@/components/TrialStatusBanner';

// In your layout or dashboard page
<TrialStatusBanner />
```

### Type Updates

**File:** `lib/types.ts`

```typescript
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  plan: PlanType
  status: UserStatus
  trialEndsAt?: Date | null  // ← Added
}
```

### Context Updates

**File:** `contexts/AuthContext.tsx`

The `AuthContext` now:
- Fetches `trial_ends_at` from the database
- Parses it as a `Date` object
- Includes it in the `user` state

## Environment Variables

Add the following to your `.env.local` or Vercel environment:

```bash
# Stripe Configuration (existing)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cron Job Security (new)
CRON_SECRET=your-random-secret-string-here
```

## Vercel Cron Configuration

**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/upgrade-expired-trials",
      "schedule": "0 6 * * *"
    }
  ]
}
```

The cron runs every day at 6:00 AM UTC.

## Testing

### 1. Test Trial Creation
```bash
# Create a new user account
# Check the database for trial_ends_at field
```

### 2. Test Trial Countdown
- Sign up for a new account
- Check that the TrialStatusBanner appears
- Verify countdown updates

### 3. Test Manual Trial Upgrade (Development)
```bash
# In development mode, you can test the cron endpoint with GET
curl http://localhost:3000/api/cron/upgrade-expired-trials

# In production, use POST with authentication
curl -X POST https://yourapp.vercel.app/api/cron/upgrade-expired-trials \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 4. Test Expired Trial Redirect
- Manually set a user's `trial_ends_at` to a past date
- Try to access the platform
- Should redirect to `/subscription`

## Migration Steps

### For Existing Users

If you have existing users on the `'free'` plan without a trial:

```sql
-- Option 1: Give all existing free users a 3-day trial
UPDATE users
SET trial_ends_at = NOW() + INTERVAL '3 days'
WHERE plan = 'free' AND trial_ends_at IS NULL;

-- Option 2: Keep existing users as-is (require immediate subscription)
-- Do nothing - they won't have trial_ends_at and will be redirected to /subscription
```

### Running the Migration

```bash
# If using Supabase
psql "your-database-url" -f sql/007_add_trial_field.sql

# If using Drizzle
npm run db:push
```

## Stripe Subscription Flow

1. **Cron job finds expired trial user**
2. **Creates/retrieves Stripe customer**
   - Uses existing `stripe_customer_id` if available
   - Creates new customer if needed
3. **Creates Stripe subscription**
   - Uses `STRIPE_STARTER_PRICE_ID`
   - Billing starts immediately (trial already expired)
   - Metadata includes `userId` and `source: 'trial_upgrade'`
4. **Updates database**
   - Sets `plan = 'starter'`
   - Sets `stripe_subscription_id`
   - Clears `trial_ends_at`
5. **Stripe webhook handles payment**
   - On successful payment: keeps user active
   - On failed payment: handled by existing webhook logic

## Future Enhancements

- [ ] Email notification before trial expires (1 day warning)
- [ ] Email notification after successful trial upgrade
- [ ] Allow users to cancel trial (stay on free plan without auto-upgrade)
- [ ] Analytics dashboard for trial conversion rates
- [ ] A/B test different trial lengths (3 vs 7 vs 14 days)

## Troubleshooting

### Users not getting upgraded
- Check Vercel Cron logs
- Verify `CRON_SECRET` is set correctly
- Manually trigger the endpoint to test
- Check Stripe dashboard for errors

### Trial banner not showing
- Verify user has `trial_ends_at` in database
- Check that user `plan === 'free'`
- Ensure `trialEndsAt` is being parsed correctly in AuthContext

### Middleware blocking trial users
- Check middleware logs for subscription check
- Verify `trial_ends_at > NOW()`
- Add debug logging to middleware

## Support

For questions or issues, contact the development team or create an issue in the repository.

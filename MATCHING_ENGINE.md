# Matching Engine Implementation Guide

## Overview

This document provides complete setup instructions for the nightly matching and alerts engine that scores active listings against user preferences and creates personalized match recommendations.

## 🗄️ Database Setup

### 1. Run the SQL Migration

Execute the SQL migration file in your Supabase SQL Editor:

```bash
# Copy the contents of sql/001_matches_alerts_migration.sql
# and paste into your Supabase SQL Editor, then execute
```

This creates:
- `matches` table with user-listing scoring
- `alerts` table for digest preparation
- Proper RLS policies and indexes
- Triggers for updated_at timestamps

### 2. Verify Tables Created

Check that these tables exist in your Supabase dashboard:
- `public.matches`
- `public.alerts`

## 🔧 Environment Setup

### 1. Add Required Environment Variables

Add to your `.env.local` file:

```bash
# Existing Supabase vars (should already be set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# New: Cron job protection
CRON_SECRET=your_secure_random_string_here
```

### 2. Generate CRON_SECRET

Generate a secure random string:

```bash
# Option 1: Use OpenSSL
openssl rand -hex 32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Use online generator
# Visit: https://www.uuidgenerator.net/
```

## 🏃 Local Development

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test the Matching Engine

Manual test the matching API:

```bash
# Test matching job (requires CRON_SECRET)
curl -X POST http://localhost:3000/api/match/run \
  -H "x-cron-key: your_cron_secret_here" \
  -H "Content-Type: application/json"

# Test user matches API (requires authentication)
curl http://localhost:3000/api/matches?limit=5
```

### 3. Check Matches in Profile

1. Sign in to your application
2. Navigate to `/profile`
3. Look for the "My Matches" section
4. Should show top 10 matches with scores and reasons

## 🎯 Scoring Algorithm

The matching engine uses these weighted criteria:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Industry Match | +40 | Listing industry in user's preferred industries |
| State Match | +15 | Listing state in user's preferred states |
| Revenue Gate | +15 | Listing revenue ≥ user's minimum revenue |
| Metric Gate | +10 | Listing EBITDA/SDE ≥ user's minimum metric |
| Owner Hours | +10 | Listing owner hours ≤ user's maximum |
| Price Ceiling | +10 | Listing price ≤ user's maximum price |
| Keywords | +5 each | Keywords found in title/description (max +20) |
| Freshness | +10 | Listing updated within last 14 days |

**Match Threshold**: Only matches with score ≥ 40 are stored.

## 🔄 Production Deployment (Vercel)

### 1. Deploy to Vercel

```bash
# Deploy your Next.js app
vercel --prod
```

### 2. Set Production Environment Variables

In your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Make sure `CRON_SECRET` is set securely

### 3. Set Up Vercel Cron Jobs

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/match/run",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/alerts/digest",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Schedule Explanation**:
- `0 2 * * *` = Daily at 2:00 AM UTC (matching job)
- `0 3 * * *` = Daily at 3:00 AM UTC (digest preparation)

### 4. Configure Cron Headers

Vercel automatically adds the `x-cron-key` header matching your `CRON_SECRET` environment variable.

## 📊 Monitoring & Logs

### 1. Check Vercel Function Logs

In Vercel dashboard:
1. Go to Functions tab
2. Click on cron function executions
3. View logs for success/failure

### 2. Monitor Database

In Supabase dashboard:
1. Check `matches` table for new entries
2. Check `alerts` table for digest creation
3. Monitor table size and performance

### 3. Sample Log Output

Successful matching job:
```
Starting matching job with since: 2024-01-15T02:00:00.000Z
User abc-123: processed 25 listings, upserted 3 matches
User def-456: processed 25 listings, upserted 1 matches
Matching job completed: {
  usersProcessed: 15,
  matchesUpserted: 12,
  duration: 2341
}
```

## 🐛 Troubleshooting

### Common Issues

**1. "Unauthorized" on cron endpoints**
- Check `CRON_SECRET` is set correctly
- Verify the header `x-cron-key` matches your secret

**2. "Column listings.updatedAt does not exist"**
- Database uses snake_case (`updated_at`), not camelCase
- Check your database column naming

**3. No matches appearing**
- Check users have preferences set in `preferences` table
- Verify listings are marked as `status = 'active'`
- Lower the `MATCH_THRESHOLD` temporarily for testing

**4. RLS blocking access**
- Service role should bypass RLS for cron jobs
- User-facing API should use anon client with RLS

### Manual Testing

Test the matching function directly:

```typescript
// In your development console or API route
import { matchUserToListings } from '@/lib/matchEngine'

const result = await matchUserToListings('user-id-here')
console.log('Matches created:', result)
```

## 🚀 Next Steps

### Email Integration
- Implement email sending in digest preparation
- Use services like SendGrid, Resend, or Supabase Edge Functions
- Send daily/weekly digest emails based on `alerts` table

### Advanced Scoring
- Add machine learning factors
- Include user behavior (clicks, views)
- Implement collaborative filtering

### Analytics
- Track match quality (user clicks on matches)
- A/B test different scoring weights
- Create admin dashboard for monitoring

## 📁 File Structure

```
lib/
├── matchEngine.ts          # Core matching logic
└── supabase/
    ├── client.ts          # Browser client
    └── server.ts          # Server client with service role

app/api/
├── match/run/route.ts     # Nightly matching job
├── matches/route.ts       # User matches API
└── alerts/digest/route.ts # Digest preparation

components/
├── MyMatches.tsx          # Display user matches
└── AlertsStatus.tsx       # Show alerts status

sql/
└── 001_matches_alerts_migration.sql # Database setup
```

---

✅ **Implementation Complete!** Your matching engine is ready for production use.
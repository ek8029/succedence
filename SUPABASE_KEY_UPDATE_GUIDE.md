# Fix Loading Button Issue - Supabase Key Update Required

## Problem
The authentication buttons get stuck in loading state due to legacy Supabase API keys being disabled.

## Root Cause
Your Supabase project is using legacy JWT-format API keys (`eyJhbG...`) which were disabled on 2025-09-20.

## Solution: Update to New API Keys

### Step 1: Get New Keys from Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `gizyuepvykxkgzjgenvw`
3. Navigate to **Settings** → **API**
4. Look for the new format keys:
   - **Publishable Key** (starts with `sb_publishable_`)
   - **Secret Key** (starts with `sb_secret_`)

### Step 2: Update Environment Variables
Update your `.env.local` file with the new keys:

```bash
# Replace with NEW publishable key (starts with sb_publishable_)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_new_key_here

# Replace with NEW secret key (starts with sb_secret_)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_your_new_key_here

# Keep the same URL
NEXT_PUBLIC_SUPABASE_URL=https://gizyuepvykxkgzjgenvw.supabase.co
```

### Step 3: Update Vercel Environment Variables
If deployed on Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update both keys with the new values
5. Redeploy the project

### Step 4: Test
1. Restart your development server: `npm run dev`
2. Hard refresh the signin page (Ctrl+Shift+R)
3. Try signing in - buttons should no longer get stuck

## Verification
The signin page now includes automatic detection of legacy keys and will show a clear error message if old keys are still in use.

## Alternative: Re-enable Legacy Keys (Temporary)
If you need a quick fix while updating keys:
1. Go to Supabase Dashboard → Settings → API
2. Click "Re-enable legacy keys"
3. This is temporary - Supabase will disable them again

The recommended solution is updating to the new key format.
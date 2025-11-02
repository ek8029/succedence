# Fix Supabase Auth Issues

## Problem 1: Test Accounts Not Showing in Supabase

### Why This Happens

Test accounts might not appear in **Authentication → Users** because:

1. ❌ **Email confirmation is required** (but not completed)
2. ❌ **Supabase Auth signup failed** (but your app created a user record anyway)
3. ❌ **Emails aren't being sent** (so users can't confirm)

---

## Solution: Check Email Confirmation Settings

### Step 1: Check Supabase Email Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `gizyuepvykxkgzjgenvw`
3. Go to **Authentication** → **Settings** (or **Email Templates**)
4. Scroll to **Email Settings**
5. Check if **"Enable email confirmations"** is ON

**If it's ON:** Users MUST click the email confirmation link before appearing in Auth Users.

**Recommended for Development:** **Turn it OFF**

```
✅ Disable "Enable email confirmations"
```

This allows test accounts to sign up without email verification.

---

### Step 2: Check Current Auth vs Database Users

**Run this in Supabase SQL Editor:**

```sql
-- See all SQL queries in debug-auth-users.sql
-- Query 3 shows orphaned records (in database but not in auth)
SELECT
  u.id,
  u.email,
  u.name,
  'ORPHANED - No Auth Record' as issue
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;
```

This shows users in your `users` table that **don't have auth records**.

---

### Step 3: Fix Orphaned User Records

If you have users in the database but not in auth, they're "orphaned" and can't log in.

**Option 1: Delete Orphaned Records** (Recommended for test accounts)

```sql
-- Delete orphaned user records
DELETE FROM users
WHERE id NOT IN (SELECT id FROM auth.users);
```

**Option 2: Keep and Let Them Re-signup**

Just leave them. When they try to signup again with the same email, it will fail with "User already exists" error. You'll need to delete the old record first.

---

## Problem 2: Password Reset Emails Not Sending

### Why This Happens

1. ❌ **Supabase default email provider is limited**
2. ❌ **Emails go to spam**
3. ❌ **Rate limiting** (Supabase free tier: 3 emails/hour in development)
4. ❌ **Email provider not configured**

---

## Solution: Configure Email Provider

### Option 1: Enable Supabase's Built-in Email (Quick)

**Supabase automatically sends emails BUT:**
- Limited to 3-4 per hour in development
- Often goes to spam
- Only for testing

**To check if it's working:**

1. Supabase Dashboard → **Authentication** → **Settings**
2. Scroll to **Email Templates**
3. Make sure templates are enabled
4. Check **Confirm signup** and **Reset password** templates exist

---

### Option 2: Use Custom SMTP (Recommended for Production)

**Configure a real email provider:**

1. Go to Supabase → **Project Settings** → **Auth** → **SMTP Settings**

2. Choose an email provider:
   - **SendGrid** (Free: 100 emails/day)
   - **Resend** (Free: 3000 emails/month)
   - **Mailgun** (Free: 5000 emails/month)
   - **AWS SES** (Cheap but complex)

3. Example for **Resend** (Easiest):

```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP Username: resend
SMTP Password: re_your_api_key_here
Sender Email: noreply@yourdomain.com
Sender Name: Your App Name
```

4. **Test the connection** with the "Send test email" button

---

### Option 3: Temporarily Disable Email Confirmation (Development Only)

**For testing, disable email confirmation entirely:**

1. Supabase Dashboard → **Authentication** → **Settings**
2. Find **Email Settings**
3. **Disable:** "Enable email confirmations"
4. **Disable:** "Enable email change confirmations"

Now users can:
- ✅ Sign up without confirming email
- ✅ Reset password without email
- ✅ Appear in Auth Users immediately

**⚠️ WARNING:** Only do this in development! Re-enable for production.

---

## Quick Test: Verify Email is Working

### Test 1: Check Supabase Email Logs

1. Supabase Dashboard → **Authentication** → **Logs**
2. Look for email-related events:
   - `user.signup`
   - `email.sent`
   - `email.failed`

### Test 2: Manually Trigger Password Reset

```sql
-- In Supabase SQL Editor
-- This shows if password reset emails were sent
SELECT
  id,
  email,
  recovery_sent_at,
  NOW() - recovery_sent_at as time_since_reset
FROM auth.users
WHERE recovery_sent_at IS NOT NULL
ORDER BY recovery_sent_at DESC
LIMIT 10;
```

---

## Recommended Settings for Development

**In Supabase Dashboard → Authentication → Settings:**

```
✅ Disable email confirmations
✅ Disable email change confirmations
✅ Enable manual password reset (so you can reset via dashboard)
✅ Set password reset expiry to 24 hours (longer for testing)
```

**This allows you to:**
- Create test accounts instantly
- No email confirmation needed
- Reset passwords manually via dashboard

---

## Recommended Settings for Production

```
✅ Enable email confirmations
✅ Enable email change confirmations
✅ Configure custom SMTP provider (Resend, SendGrid, etc.)
✅ Set up custom email templates
✅ Test email delivery before launch
```

---

## How to Reset a Test Account Password (Workaround)

### Method 1: Via Supabase Dashboard (Easiest)

1. Supabase → **Authentication** → **Users**
2. Find your test user
3. Click **three dots (...)** → **Send Password Recovery**
4. Check spam folder for email
5. If no email, use Method 2

### Method 2: Manually Update Password (SQL)

```sql
-- WARNING: This bypasses normal password hashing
-- Only for testing!

-- First, delete the user entirely
DELETE FROM auth.users WHERE email = 'test@example.com';
DELETE FROM users WHERE email = 'test@example.com';

-- Then recreate via your signup form with a new password
```

### Method 3: Use Supabase Studio Password Reset

1. Supabase Dashboard → **Authentication** → **Users**
2. Click on the user
3. Click **"Reset Password"** button
4. It generates a one-time link you can copy
5. Open the link in browser
6. Set new password

---

## Step-by-Step: Fix Everything Now

### 1. Disable Email Confirmation (Development)

```
Supabase → Authentication → Settings
→ Disable "Enable email confirmations"
→ Save
```

### 2. Clean Up Orphaned Records

```sql
-- In Supabase SQL Editor
DELETE FROM users
WHERE id NOT IN (SELECT id FROM auth.users);
```

### 3. Test Signup Flow

```
1. Open http://localhost:3000/auth
2. Create a new test account
3. Check immediately in Supabase → Authentication → Users
4. User should appear instantly (no email confirmation needed)
```

### 4. Test Password Reset

```
1. Click "Forgot password?" on login
2. Enter test email
3. Check browser console for errors
4. Check Supabase logs for email events
```

### 5. If Still Not Working

Check browser console for errors:

```
1. Open DevTools (F12)
2. Go to Console tab
3. Try signup/reset password
4. Look for red errors
5. Share errors with me
```

---

## Expected Behavior After Fix

### Signup Flow
```
1. User fills out form → Submit
2. Supabase creates auth.users record (instant)
3. Your API creates public.users record (instant)
4. User appears in Authentication → Users (instant)
5. User can log in immediately (no email needed)
```

### Password Reset Flow
```
1. User clicks "Forgot password?"
2. Enters email → Submit
3. Supabase sends email (if configured)
4. User clicks link in email
5. User sets new password
6. User can log in
```

---

## Still Having Issues?

### Check These:

1. **Browser Console Errors** (F12 → Console)
2. **Network Tab** (F12 → Network → Filter: Fetch/XHR)
3. **Supabase Logs** (Dashboard → Logs)
4. **Email Settings** (Dashboard → Authentication → Settings)

### Common Error Messages:

| Error | Cause | Fix |
|-------|-------|-----|
| "User already exists" | Email in database but not in auth | Delete from database |
| "Invalid email" | Email validation failed | Check email format |
| "Email not confirmed" | Confirmation required | Disable email confirmation |
| "Rate limit exceeded" | Too many signups/resets | Wait 1 hour or use custom SMTP |

---

## Need More Help?

Run these commands and share the output:

```bash
# Check environment
node debug-supabase-auth.js

# Check browser console errors when signing up
# Check Supabase logs: Dashboard → Logs

# Run SQL diagnostics
# Copy all queries from debug-auth-users.sql
# Run in Supabase SQL Editor
# Share results
```

---

**TL;DR - Quick Fix:**

1. ✅ Supabase → Authentication → Settings → **Disable email confirmations**
2. ✅ Delete orphaned users: `DELETE FROM users WHERE id NOT IN (SELECT id FROM auth.users);`
3. ✅ Create new test account at `/auth`
4. ✅ User should appear instantly in Auth → Users

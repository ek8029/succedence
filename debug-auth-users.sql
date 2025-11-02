-- Debug Auth Users vs Public Users
-- Run these queries in Supabase SQL Editor

-- 1. Check users in auth.users (Supabase Auth)
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE
    WHEN email_confirmed_at IS NULL THEN '❌ Not Confirmed'
    ELSE '✅ Confirmed'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check users in public.users (Your app database)
SELECT
  id,
  email,
  name,
  role,
  plan,
  trial_ends_at,
  created_at
FROM users
ORDER BY created_at DESC;

-- 3. Find users in public.users but NOT in auth.users (orphaned records)
SELECT
  u.id,
  u.email,
  u.name,
  u.created_at as user_created,
  'ORPHANED - No Auth Record' as issue
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL
ORDER BY u.created_at DESC;

-- 4. Find users in auth.users but NOT in public.users (incomplete signup)
SELECT
  au.id,
  au.email,
  au.created_at as auth_created,
  au.email_confirmed_at,
  'INCOMPLETE - No User Profile' as issue
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- 5. Check email confirmation settings
SELECT
  id,
  email,
  email_confirmed_at,
  confirmation_sent_at,
  CASE
    WHEN email_confirmed_at IS NULL AND confirmation_sent_at IS NOT NULL
      THEN '⚠️ Waiting for Confirmation'
    WHEN email_confirmed_at IS NULL AND confirmation_sent_at IS NULL
      THEN '❌ No Confirmation Sent'
    ELSE '✅ Confirmed'
  END as confirmation_status
FROM auth.users
ORDER BY created_at DESC;

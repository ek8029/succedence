-- ====================================================================
-- Fix Users Table RLS Policies
-- ====================================================================
-- The users table needs proper RLS policies to allow:
-- 1. Users to read their own record
-- 2. Admins to read all records (for admin panel)
-- 3. Service role to manage everything
-- ====================================================================

BEGIN;

-- First, let's drop ALL existing policies on users table to start fresh
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;

-- ====================================================================
-- Policy 1: Service role has full access (for API operations)
-- ====================================================================
CREATE POLICY "Service role full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ====================================================================
-- Policy 2: Authenticated users can read their own record
-- ====================================================================
CREATE POLICY "Users can read own record"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ====================================================================
-- Policy 3: Users with admin role can read all records
-- ====================================================================
-- This checks the user_metadata from auth.users() instead of the users table
-- to avoid circular dependency
CREATE POLICY "Admins can read all records"
ON public.users
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    OR
    -- Fallback: check the users table for role
    (id = auth.uid() AND role = 'admin')
);

COMMIT;

-- ====================================================================
-- Verification Query
-- ====================================================================
-- Run this to see all policies on users table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

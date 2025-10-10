-- ====================================================================
-- Fix Users Table RLS Infinite Recursion
-- ====================================================================
-- The issue: Policy was checking users.role to grant admin access,
-- which creates circular dependency since the policy protects users table
-- ====================================================================

BEGIN;

-- Drop existing policies that might have circular dependencies
DROP POLICY IF EXISTS "Admins can read all records" ON public.users;
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Users can read own record" ON public.users;

-- ====================================================================
-- Policy 1: Service role has full access (bypasses RLS completely)
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
-- Policy 3: Known admin emails can read all records
-- ====================================================================
-- Instead of checking the users table, check against hardcoded admin emails
-- This prevents circular dependency
CREATE POLICY "Known admins can read all records"
ON public.users
FOR SELECT
TO authenticated
USING (
    -- Get email from auth.users() - no circular dependency
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN (
        'evank8029@gmail.com',
        'succedence@gmail.com',
        'founder@succedence.com',
        'clydek627@gmail.com'
    )
);

COMMIT;

-- ====================================================================
-- Verification
-- ====================================================================
SELECT
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

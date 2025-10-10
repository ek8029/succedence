-- ====================================================================
-- Ensure RLS is enabled and service role has proper access
-- ====================================================================

BEGIN;

-- First, ensure RLS is enabled on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Service role full access" ON public.users;
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Known admins can read all records" ON public.users;

-- ====================================================================
-- Grant necessary table permissions to service_role
-- ====================================================================
GRANT ALL ON public.users TO service_role;

-- ====================================================================
-- Policy 1: Service role bypasses RLS completely
-- ====================================================================
-- Service role should bypass RLS by default, but let's be explicit
CREATE POLICY "Service role bypass"
ON public.users
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ====================================================================
-- Policy 2: Authenticated users can read their own record
-- ====================================================================
CREATE POLICY "Users can read own record"
ON public.users
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ====================================================================
-- Policy 3: Known admin emails can read all records
-- ====================================================================
CREATE POLICY "Known admins can read all records"
ON public.users
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN (
        'evank8029@gmail.com',
        'succedence@gmail.com',
        'founder@succedence.com',
        'clydek627@gmail.com'
    )
);

COMMIT;

-- ====================================================================
-- Verify the setup
-- ====================================================================
SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

SELECT
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

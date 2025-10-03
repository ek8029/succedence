-- ====================================================================
-- Fix User Deletion - RLS Policies for Service Role
-- ====================================================================
-- This script adds DELETE policies for service role on all user-related tables
-- Run this in your Supabase SQL Editor AFTER running fix-user-deletion-constraints.sql
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. PROFILES TABLE
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
        DROP POLICY IF EXISTS "Service role can delete profiles" ON public.profiles;

        CREATE POLICY "Service role can manage all profiles"
        ON public.profiles
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 2. PREFERENCES TABLE
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'preferences') THEN
        DROP POLICY IF EXISTS "Service role can manage all preferences" ON public.preferences;
        DROP POLICY IF EXISTS "Service role can delete preferences" ON public.preferences;

        CREATE POLICY "Service role can manage all preferences"
        ON public.preferences
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 3. MATCHES TABLE
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') THEN
        DROP POLICY IF EXISTS "Service role can manage all matches" ON public.matches;
        DROP POLICY IF EXISTS "Service role can delete matches" ON public.matches;

        CREATE POLICY "Service role can manage all matches"
        ON public.matches
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 4. ALERTS TABLE
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alerts') THEN
        DROP POLICY IF EXISTS "Service role can manage all alerts" ON public.alerts;
        DROP POLICY IF EXISTS "Service role can delete alerts" ON public.alerts;

        CREATE POLICY "Service role can manage all alerts"
        ON public.alerts
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 5. SAVED_LISTINGS TABLE
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_listings') THEN
        DROP POLICY IF EXISTS "Service role can manage all saved_listings" ON public.saved_listings;
        DROP POLICY IF EXISTS "Service role can delete saved_listings" ON public.saved_listings;

        CREATE POLICY "Service role can manage all saved_listings"
        ON public.saved_listings
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 6. AI_ANALYSES TABLE
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_analyses') THEN
        DROP POLICY IF EXISTS "Service role can manage all ai_analyses" ON public.ai_analyses;
        DROP POLICY IF EXISTS "Service role can delete ai_analyses" ON public.ai_analyses;

        CREATE POLICY "Service role can manage all ai_analyses"
        ON public.ai_analyses
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 7. MESSAGES TABLE
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
        DROP POLICY IF EXISTS "Service role can manage all messages" ON public.messages;
        DROP POLICY IF EXISTS "Service role can delete messages" ON public.messages;

        CREATE POLICY "Service role can manage all messages"
        ON public.messages
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 8. LISTINGS TABLE
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings') THEN
        DROP POLICY IF EXISTS "Service role can manage all listings" ON public.listings;
        DROP POLICY IF EXISTS "Service role can delete listings" ON public.listings;

        CREATE POLICY "Service role can manage all listings"
        ON public.listings
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 9. BROKER_PROFILES TABLE (if exists)
-- ====================================================================
DROP POLICY IF EXISTS "Service role can manage all broker_profiles" ON public.broker_profiles;
DROP POLICY IF EXISTS "Service role can delete broker_profiles" ON public.broker_profiles;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'broker_profiles') THEN
        EXECUTE 'CREATE POLICY "Service role can manage all broker_profiles"
        ON public.broker_profiles
        FOR ALL
        USING (auth.jwt() ->> ''role'' = ''service_role'')';
    END IF;
END $$;

-- ====================================================================
-- 10. AUDIT_LOGS TABLE (if exists)
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        -- Enable RLS if not already enabled
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role can manage all audit_logs" ON public.audit_logs;
        DROP POLICY IF EXISTS "Service role can delete audit_logs" ON public.audit_logs;

        CREATE POLICY "Service role can manage all audit_logs"
        ON public.audit_logs
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 11. BILLING_EVENTS TABLE (if exists)
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_events') THEN
        -- Enable RLS if not already enabled
        ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role can manage all billing_events" ON public.billing_events;
        DROP POLICY IF EXISTS "Service role can delete billing_events" ON public.billing_events;

        CREATE POLICY "Service role can manage all billing_events"
        ON public.billing_events
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 12. USER_ANALYSIS_BEHAVIOR TABLE (if exists)
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_analysis_behavior') THEN
        DROP POLICY IF EXISTS "Service role can manage user_analysis_behavior" ON public.user_analysis_behavior;

        CREATE POLICY "Service role can manage user_analysis_behavior"
        ON public.user_analysis_behavior
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 13. USER_PREFERENCES_ENHANCED TABLE (if exists)
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences_enhanced') THEN
        DROP POLICY IF EXISTS "Service role can manage user_preferences_enhanced" ON public.user_preferences_enhanced;

        CREATE POLICY "Service role can manage user_preferences_enhanced"
        ON public.user_preferences_enhanced
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 14. EMAIL_EVENTS TABLE (if exists)
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_events') THEN
        DROP POLICY IF EXISTS "Service role can manage email_events" ON public.email_events;

        CREATE POLICY "Service role can manage email_events"
        ON public.email_events
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;

-- ====================================================================
-- 15. USERS TABLE - Allow service role to delete
-- ====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Enable RLS on users table if not already enabled
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

        CREATE POLICY "Service role can manage all users"
        ON public.users
        FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');

        -- Also allow admins to view all users (for the admin panel)
        DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

        CREATE POLICY "Admins can view all users"
        ON public.users
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.users
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
    END IF;
END $$;

COMMIT;

-- ====================================================================
-- Verification Query
-- ====================================================================
-- Run this to verify all RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

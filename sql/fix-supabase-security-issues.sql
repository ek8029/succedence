-- ================================================================
-- Fix Supabase Security Issues
-- ================================================================
-- This migration fixes all ERROR and WARN level security issues
-- identified by the Supabase database linter
-- ================================================================

-- ================================================================
-- 1. Enable RLS on broker_profiles table
-- ================================================================
ALTER TABLE public.broker_profiles ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 2. Fix RLS Policy that references user_metadata (CRITICAL)
-- ================================================================
-- Drop the insecure policy that references user_metadata
DROP POLICY IF EXISTS "Admins can read all records" ON public.users;

-- Recreate the admin policy using only the users table role column
-- This is secure because it only checks the database, not user-editable metadata
CREATE POLICY "Admins can read all records"
ON public.users
FOR SELECT
TO authenticated
USING (
    -- Check if the requesting user has admin role in the users table
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- ================================================================
-- 3. Fix Security Definer Views
-- ================================================================
-- These views use SECURITY DEFINER to bypass RLS for specific use cases
-- We'll recreate them with SECURITY INVOKER instead where possible

-- Drop and recreate user_saved_listings view
DROP VIEW IF EXISTS public.user_saved_listings CASCADE;
CREATE VIEW public.user_saved_listings
WITH (security_invoker=true)
AS
SELECT
    sl.user_id,
    sl.listing_id,
    sl.created_at as saved_created_at,
    sl.notes,
    l.id as listing_id_full,
    l.source,
    l.title,
    l.description,
    l.industry,
    l.city,
    l.state,
    l.revenue,
    l.ebitda,
    l.metric_type,
    l.owner_hours,
    l.employees,
    l.price,
    l.contact_phone,
    l.contact_email,
    l.contact_other,
    l.status,
    l.created_at as listing_created_at,
    l.updated_at as listing_updated_at,
    l.owner_user_id,
    l.broker_profile_id
FROM saved_listings sl
JOIN listings l ON sl.listing_id = l.id;

-- Drop and recreate user_saved_listings_with_ai view
DROP VIEW IF EXISTS public.user_saved_listings_with_ai CASCADE;
CREATE VIEW public.user_saved_listings_with_ai
WITH (security_invoker=true)
AS
SELECT
    sl.user_id,
    sl.listing_id,
    sl.created_at as saved_created_at,
    sl.notes,
    l.id as listing_id_full,
    l.source,
    l.title,
    l.description,
    l.industry,
    l.city,
    l.state,
    l.revenue,
    l.ebitda,
    l.metric_type,
    l.owner_hours,
    l.employees,
    l.price,
    l.contact_phone,
    l.contact_email,
    l.contact_other,
    l.status,
    l.created_at as listing_created_at,
    l.updated_at as listing_updated_at,
    l.owner_user_id,
    l.broker_profile_id,
    aa.analysis_data,
    aa.created_at as analysis_created_at
FROM saved_listings sl
JOIN listings l ON sl.listing_id = l.id
LEFT JOIN ai_analyses aa ON aa.listing_id = l.id AND aa.user_id = sl.user_id;

-- Drop and recreate user_ai_analysis_history view
DROP VIEW IF EXISTS public.user_ai_analysis_history CASCADE;
CREATE VIEW public.user_ai_analysis_history
WITH (security_invoker=true)
AS
SELECT
    aa.user_id,
    aa.listing_id,
    aa.analysis_data,
    aa.created_at,
    l.title,
    l.industry,
    l.state
FROM ai_analyses aa
JOIN listings l ON aa.listing_id = l.id;

-- ================================================================
-- 4. Fix Function Search Paths (Security)
-- ================================================================
-- Set search_path on all functions to prevent search path injection attacks

-- update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- get_user_current_usage
DROP FUNCTION IF EXISTS public.get_user_current_usage(uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_current_usage(p_user_id uuid)
RETURNS TABLE (
    ai_analyses_count bigint,
    saved_listings_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT aa.id)::bigint,
        COUNT(DISTINCT sl.listing_id)::bigint
    FROM users u
    LEFT JOIN ai_analyses aa ON aa.user_id = u.id
        AND aa.created_at >= date_trunc('month', CURRENT_TIMESTAMP)
    LEFT JOIN saved_listings sl ON sl.user_id = u.id
    WHERE u.id = p_user_id;
END;
$$;

-- increment_usage
DROP FUNCTION IF EXISTS public.increment_usage(uuid, text) CASCADE;
CREATE OR REPLACE FUNCTION public.increment_usage(
    p_user_id uuid,
    p_feature_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO user_usage_tracking (user_id, feature_type, used_at)
    VALUES (p_user_id, p_feature_type, NOW());
END;
$$;

-- log_usage_violation
DROP FUNCTION IF EXISTS public.log_usage_violation(uuid, text, text) CASCADE;
CREATE OR REPLACE FUNCTION public.log_usage_violation(
    p_user_id uuid,
    p_feature_type text,
    p_violation_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO usage_violations (user_id, feature_type, violation_reason, occurred_at)
    VALUES (p_user_id, p_feature_type, p_violation_reason, NOW());
END;
$$;

-- cleanup_old_usage_data
DROP FUNCTION IF EXISTS public.cleanup_old_usage_data() CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_old_usage_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM user_usage_tracking
    WHERE used_at < NOW() - INTERVAL '90 days';

    DELETE FROM usage_violations
    WHERE occurred_at < NOW() - INTERVAL '90 days';
END;
$$;

-- handle_updated_at
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- update_analysis_jobs_updated_at
DROP FUNCTION IF EXISTS public.update_analysis_jobs_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_analysis_jobs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ================================================================
-- Summary of Changes
-- ================================================================
-- 1. ✅ Enabled RLS on broker_profiles table
-- 2. ✅ Fixed "Admins can read all records" policy to not use user_metadata
-- 3. ✅ Changed SECURITY DEFINER views to SECURITY INVOKER
-- 4. ✅ Added SET search_path to all functions
--
-- MANUAL ACTION REQUIRED:
-- 5. ⚠️  Enable leaked password protection in Supabase Dashboard:
--     Go to: Authentication → Settings → Password Protection
--     Enable: "Check passwords against HaveIBeenPwned"

-- ================================================================
-- Check and Fix Function Search Path Issues
-- ================================================================

-- First, let's see ALL versions of these functions
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.oid,
    CASE
        WHEN p.proconfig IS NOT NULL THEN
            array_to_string(p.proconfig, ', ')
        ELSE
            'No search_path set'
    END as config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('increment_usage', 'log_usage_violation')
ORDER BY p.proname, p.oid;

-- Now drop ALL versions of these functions
DROP FUNCTION IF EXISTS public.increment_usage(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.log_usage_violation(uuid, text, text) CASCADE;

-- Recreate them with proper search_path
CREATE FUNCTION public.increment_usage(
    p_user_id uuid,
    p_feature_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
BEGIN
    INSERT INTO user_usage_tracking (user_id, feature_type, used_at)
    VALUES (p_user_id, p_feature_type, NOW());
END;
$$;

CREATE FUNCTION public.log_usage_violation(
    p_user_id uuid,
    p_feature_type text,
    p_violation_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $$
BEGIN
    INSERT INTO usage_violations (user_id, feature_type, violation_reason, occurred_at)
    VALUES (p_user_id, p_feature_type, p_violation_reason, NOW());
END;
$$;

-- Verify the fix
SELECT
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE
        WHEN p.proconfig IS NOT NULL THEN
            array_to_string(p.proconfig, ', ')
        ELSE
            'No search_path set'
    END as config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('increment_usage', 'log_usage_violation')
ORDER BY p.proname;

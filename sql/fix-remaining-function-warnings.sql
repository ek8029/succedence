-- ================================================================
-- Fix Remaining Function Search Path Warnings
-- ================================================================
-- Specifically fix increment_usage and log_usage_violation functions
-- ================================================================

-- Fix increment_usage function
CREATE OR REPLACE FUNCTION public.increment_usage(
    p_user_id uuid,
    p_feature_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO user_usage_tracking (user_id, feature_type, used_at)
    VALUES (p_user_id, p_feature_type, NOW());
END;
$$;

-- Fix log_usage_violation function
CREATE OR REPLACE FUNCTION public.log_usage_violation(
    p_user_id uuid,
    p_feature_type text,
    p_violation_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO usage_violations (user_id, feature_type, violation_reason, occurred_at)
    VALUES (p_user_id, p_feature_type, p_violation_reason, NOW());
END;
$$;

-- Verify the changes
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

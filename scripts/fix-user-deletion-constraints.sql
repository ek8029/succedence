-- ====================================================================
-- Fix User Deletion - Foreign Key Constraints
-- ====================================================================
-- This script updates all foreign key constraints to use CASCADE deletion
-- Run this in your Supabase SQL Editor
-- ====================================================================

-- IMPORTANT: This will drop and recreate foreign key constraints
-- Make sure to backup your database before running this script!

BEGIN;

-- 1. ALERTS TABLE
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alerts') THEN
        ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_user_id_users_id_fk;
        ALTER TABLE public.alerts
          ADD CONSTRAINT alerts_user_id_users_id_fk
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. AUDIT_LOGS TABLE
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
        ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_id_users_id_fk;
        ALTER TABLE public.audit_logs
          ADD CONSTRAINT audit_logs_actor_id_users_id_fk
          FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. BILLING_EVENTS TABLE
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_events') THEN
        ALTER TABLE public.billing_events DROP CONSTRAINT IF EXISTS billing_events_user_id_users_id_fk;
        ALTER TABLE public.billing_events
          ADD CONSTRAINT billing_events_user_id_users_id_fk
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. MESSAGES TABLE (from_user)
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'messages'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'from_user'
    ) THEN
        ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_from_user_users_id_fk;
        ALTER TABLE public.messages
          ADD CONSTRAINT messages_from_user_users_id_fk
          FOREIGN KEY (from_user) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. MESSAGES TABLE (to_user)
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'messages'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'to_user'
    ) THEN
        ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_to_user_users_id_fk;
        ALTER TABLE public.messages
          ADD CONSTRAINT messages_to_user_users_id_fk
          FOREIGN KEY (to_user) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. PREFERENCES TABLE
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'preferences') THEN
        ALTER TABLE public.preferences DROP CONSTRAINT IF EXISTS preferences_user_id_users_id_fk;
        ALTER TABLE public.preferences
          ADD CONSTRAINT preferences_user_id_users_id_fk
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 7. PROFILES TABLE
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_users_id_fk;
        ALTER TABLE public.profiles
          ADD CONSTRAINT profiles_user_id_users_id_fk
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 8. LISTINGS TABLE (owner_user_id)
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings') THEN
        ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_owner_user_id_users_id_fk;
        ALTER TABLE public.listings
          ADD CONSTRAINT listings_owner_user_id_users_id_fk
          FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 9. BROKER_PROFILES TABLE (if exists)
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'broker_profiles') THEN
        ALTER TABLE public.broker_profiles DROP CONSTRAINT IF EXISTS broker_profiles_user_id_users_id_fk;
        ALTER TABLE public.broker_profiles
          ADD CONSTRAINT broker_profiles_user_id_users_id_fk
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 10. MATCHES TABLE
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') THEN
        ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_user_id_users_id_fk;
        ALTER TABLE public.matches
          ADD CONSTRAINT matches_user_id_users_id_fk
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 11. SAVED_LISTINGS TABLE
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_listings') THEN
        ALTER TABLE public.saved_listings DROP CONSTRAINT IF EXISTS saved_listings_user_id_fkey;
        ALTER TABLE public.saved_listings
          ADD CONSTRAINT saved_listings_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 12. AI_ANALYSES TABLE
-- Drop existing constraint and recreate with CASCADE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_analyses') THEN
        ALTER TABLE public.ai_analyses DROP CONSTRAINT IF EXISTS ai_analyses_user_id_fkey;
        ALTER TABLE public.ai_analyses
          ADD CONSTRAINT ai_analyses_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 13. USAGE TRACKING TABLES
-- Note: These tables reference auth.users, not public.users
-- They might already have CASCADE, but let's ensure consistency

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_usage_tracking') THEN
        ALTER TABLE public.user_usage_tracking DROP CONSTRAINT IF EXISTS user_usage_tracking_user_id_fkey;
        ALTER TABLE public.user_usage_tracking
          ADD CONSTRAINT user_usage_tracking_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_monthly_usage') THEN
        ALTER TABLE public.user_monthly_usage DROP CONSTRAINT IF EXISTS user_monthly_usage_user_id_fkey;
        ALTER TABLE public.user_monthly_usage
          ADD CONSTRAINT user_monthly_usage_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_violations') THEN
        ALTER TABLE public.usage_violations DROP CONSTRAINT IF EXISTS usage_violations_user_id_fkey;
        ALTER TABLE public.usage_violations
          ADD CONSTRAINT usage_violations_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usage_cache') THEN
        ALTER TABLE public.usage_cache DROP CONSTRAINT IF EXISTS usage_cache_user_id_fkey;
        ALTER TABLE public.usage_cache
          ADD CONSTRAINT usage_cache_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 14. USER_ANALYSIS_BEHAVIOR TABLE (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_analysis_behavior') THEN
        ALTER TABLE public.user_analysis_behavior DROP CONSTRAINT IF EXISTS user_analysis_behavior_user_id_fkey;
        ALTER TABLE public.user_analysis_behavior
          ADD CONSTRAINT user_analysis_behavior_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 15. USER_PREFERENCES_ENHANCED TABLE (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences_enhanced') THEN
        ALTER TABLE public.user_preferences_enhanced DROP CONSTRAINT IF EXISTS user_preferences_enhanced_user_id_fkey;
        ALTER TABLE public.user_preferences_enhanced
          ADD CONSTRAINT user_preferences_enhanced_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 16. EMAIL_EVENTS TABLE (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_events') THEN
        ALTER TABLE public.email_events DROP CONSTRAINT IF EXISTS email_events_user_id_fkey;
        ALTER TABLE public.email_events
          ADD CONSTRAINT email_events_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

COMMIT;

-- ====================================================================
-- Verification Query
-- ====================================================================
-- Run this to verify all constraints are now CASCADE
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (ccu.table_name = 'users' OR ccu.table_name = 'users')
ORDER BY tc.table_name, kcu.column_name;

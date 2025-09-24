-- SQL Script to fix enum values in Supabase
-- Copy and paste this entire script into your Supabase SQL Editor

-- 1. First, let's check what enum values currently exist
SELECT 'Current plan_type enum values:' as info;
SELECT enumlabel as plan_types FROM pg_enum WHERE enumtypid = 'plan_type'::regtype ORDER BY enumlabel;

-- 2. Add missing enum values for plan_type
-- PostgreSQL requires us to add enum values one by one
DO $$
BEGIN
    -- Add 'starter' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'plan_type'::regtype
        AND enumlabel = 'starter'
    ) THEN
        ALTER TYPE plan_type ADD VALUE 'starter';
        RAISE NOTICE 'Added starter to plan_type enum';
    ELSE
        RAISE NOTICE 'starter already exists in plan_type enum';
    END IF;

    -- Add 'professional' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'plan_type'::regtype
        AND enumlabel = 'professional'
    ) THEN
        ALTER TYPE plan_type ADD VALUE 'professional';
        RAISE NOTICE 'Added professional to plan_type enum';
    ELSE
        RAISE NOTICE 'professional already exists in plan_type enum';
    END IF;
END$$;

-- 3. Verify the enum values after update
SELECT 'Updated plan_type enum values:' as info;
SELECT enumlabel as plan_types FROM pg_enum WHERE enumtypid = 'plan_type'::regtype ORDER BY enumlabel;

-- 4. Check if we need to add any missing values to user_role enum
SELECT 'Current user_role enum values:' as info;
SELECT enumlabel as user_roles FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumlabel;

-- 5. Add missing user_role enum values if needed
DO $$
BEGIN
    -- Add 'buyer' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_role'::regtype
        AND enumlabel = 'buyer'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'buyer';
        RAISE NOTICE 'Added buyer to user_role enum';
    ELSE
        RAISE NOTICE 'buyer already exists in user_role enum';
    END IF;

    -- Add 'seller' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_role'::regtype
        AND enumlabel = 'seller'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'seller';
        RAISE NOTICE 'Added seller to user_role enum';
    ELSE
        RAISE NOTICE 'seller already exists in user_role enum';
    END IF;

    -- Add 'admin' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_role'::regtype
        AND enumlabel = 'admin'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'admin';
        RAISE NOTICE 'Added admin to user_role enum';
    ELSE
        RAISE NOTICE 'admin already exists in user_role enum';
    END IF;
END$$;

-- 6. Verify user_role enum values
SELECT 'Updated user_role enum values:' as info;
SELECT enumlabel as user_roles FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumlabel;

-- 7. Final verification - show all enum types and their values
SELECT 'All enum types and values:' as info;
SELECT
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('plan_type', 'user_role', 'user_status', 'listing_status')
ORDER BY t.typname, e.enumlabel;
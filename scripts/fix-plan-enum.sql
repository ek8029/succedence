-- This script updates the plan_type enum to include all values
-- Run this in your Supabase SQL editor

-- First, check current enum values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'plan_type'::regtype;

-- Add missing enum values if they don't exist
-- Note: PostgreSQL doesn't allow direct modification of enums
-- We need to add new values

DO $$
BEGIN
    -- Check if 'starter' exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'plan_type'::regtype
        AND enumlabel = 'starter'
    ) THEN
        ALTER TYPE plan_type ADD VALUE 'starter';
    END IF;

    -- Check if 'professional' exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'plan_type'::regtype
        AND enumlabel = 'professional'
    ) THEN
        ALTER TYPE plan_type ADD VALUE 'professional';
    END IF;
END$$;

-- Verify the enum values after update
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'plan_type'::regtype;
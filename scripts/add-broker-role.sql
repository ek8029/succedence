-- SQL Script to add broker role and broker profiles table
-- Copy and paste this entire script into your Supabase SQL Editor

-- 1. Add 'broker' to user_role enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_role'::regtype
        AND enumlabel = 'broker'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'broker';
        RAISE NOTICE 'Added broker to user_role enum';
    ELSE
        RAISE NOTICE 'broker already exists in user_role enum';
    END IF;
END$$;

-- 2. Create broker_profiles table
CREATE TABLE IF NOT EXISTS broker_profiles (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NOT NULL UNIQUE REFERENCES users(id),
	display_name text NOT NULL,
	headshot_url text,
	bio text,
	phone text,
	email text,
	company text,
	license_number text,
	work_areas text[],
	specialties text[],
	years_experience integer,
	website_url text,
	linkedin_url text,
	is_public text DEFAULT 'true' NOT NULL,
	custom_sections jsonb,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Add broker_profile_id to listings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'listings'
        AND column_name = 'broker_profile_id'
    ) THEN
        ALTER TABLE listings ADD COLUMN broker_profile_id uuid REFERENCES broker_profiles(id);
        RAISE NOTICE 'Added broker_profile_id column to listings table';
    ELSE
        RAISE NOTICE 'broker_profile_id column already exists in listings table';
    END IF;
END$$;

-- 4. Verify the changes
SELECT 'Current user_role enum values:' as info;
SELECT enumlabel as user_roles FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumlabel;

SELECT 'Broker profiles table created:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'broker_profiles' ORDER BY ordinal_position;

SELECT 'Listings table updated:' as info;
SELECT column_name FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'broker_profile_id';

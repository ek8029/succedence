-- ====================================================================
-- Fix Admin User Metadata
-- ====================================================================
-- This ensures the admin user has the correct role in auth.users metadata
-- Run this in Supabase SQL Editor
-- ====================================================================

-- Update the admin user's metadata to include role
-- Replace with your actual admin user ID if different
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
)
WHERE email = 'evank8029@gmail.com';

-- Verify the update
SELECT
    id,
    email,
    raw_user_meta_data->>'role' as role_in_metadata,
    raw_user_meta_data->>'name' as name_in_metadata
FROM auth.users
WHERE email = 'evank8029@gmail.com';

-- SQL commands to run in Supabase SQL Editor to fix admin account
-- This ensures the admin account has correct data in all tables

-- Fix the users table
UPDATE users
SET
  name = 'Evan Kim',
  email = 'evank8029@gmail.com',
  role = 'admin',
  plan = 'enterprise',
  status = 'active'
WHERE id = 'a041dff2-d833-49e3-bdf3-1a5c02523ce1';

-- Verify the update worked
SELECT id, email, name, role, plan, status, created_at
FROM users
WHERE id = 'a041dff2-d833-49e3-bdf3-1a5c02523ce1';

-- Also check if there are any duplicate or conflicting user records
SELECT id, email, name, role, plan, status
FROM users
WHERE email = 'evank8029@gmail.com';

-- Optional: Clean up any duplicate profiles if they exist
-- DELETE FROM profiles WHERE user_id = 'a041dff2-d833-49e3-bdf3-1a5c02523ce1';

-- The auth.users metadata was already updated via the Node.js script
-- But you can also verify it here:
-- SELECT id, email, raw_user_meta_data, raw_app_meta_data
-- FROM auth.users
-- WHERE id = 'a041dff2-d833-49e3-bdf3-1a5c02523ce1';
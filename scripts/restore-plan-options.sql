-- Run this AFTER running the supabase-enum-fix.sql script
-- This script restores the full plan options in your frontend

-- After running this SQL in Supabase, you can restore the profile page plan options
-- by replacing the limited options with the full set:

/*
Update this section in app/profile/page.tsx:

FROM:
<option value="free">Free</option>
<option value="enterprise">Enterprise</option>

TO:
<option value="free">Free</option>
<option value="starter">Starter</option>
<option value="professional">Professional</option>
<option value="enterprise">Enterprise</option>

Also update the API validation in app/api/user/update-basic/route.ts:

FROM:
plan: z.enum(['free', 'starter', 'professional', 'enterprise']).optional(),

TO: (should already be correct)
plan: z.enum(['free', 'starter', 'professional', 'enterprise']).optional(),
*/

-- Verify that all enum values are now available
SELECT 'Final verification of plan_type enum:' as status;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'plan_type'::regtype ORDER BY enumlabel;

-- Test that we can update a user with each plan type (replace user_id with actual ID)
-- Uncomment these lines to test after replacing 'YOUR_USER_ID_HERE' with actual user ID

-- UPDATE users SET plan = 'free' WHERE id = 'YOUR_USER_ID_HERE';
-- UPDATE users SET plan = 'starter' WHERE id = 'YOUR_USER_ID_HERE';
-- UPDATE users SET plan = 'professional' WHERE id = 'YOUR_USER_ID_HERE';
-- UPDATE users SET plan = 'enterprise' WHERE id = 'YOUR_USER_ID_HERE';

SELECT 'Enum fix complete! You can now restore full plan options in the frontend.' as status;
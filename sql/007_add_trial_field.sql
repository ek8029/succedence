-- Add trial_ends_at field to users table for 3-day free trial support
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient trial expiration queries
CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON users(trial_ends_at)
WHERE trial_ends_at IS NOT NULL AND plan = 'free';

-- Add comment to document the field
COMMENT ON COLUMN users.trial_ends_at IS 'Timestamp when the user''s free trial expires. After this time, they will be automatically upgraded to the starter plan.';

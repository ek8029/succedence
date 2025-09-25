-- Add Stripe fields to users table
ALTER TABLE users
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for Stripe customer lookup
CREATE INDEX users_stripe_customer_id_idx ON users(stripe_customer_id);
CREATE INDEX users_stripe_subscription_id_idx ON users(stripe_subscription_id);

-- Update existing users to have updated_at timestamp
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;
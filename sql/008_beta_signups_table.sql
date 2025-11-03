-- Create beta_signups table to track beta access interest
CREATE TABLE IF NOT EXISTS beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller', 'broker')),
  interests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  notes TEXT
);

-- Add index for efficient email lookups
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON beta_signups(email);

-- Add index for filtering notified/unnotified users
CREATE INDEX IF NOT EXISTS idx_beta_signups_notified ON beta_signups(notified);

-- Add index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_beta_signups_created_at ON beta_signups(created_at DESC);

-- Add RLS policies
ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their own signup
CREATE POLICY "Anyone can sign up for beta"
  ON beta_signups
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view/update beta signups
CREATE POLICY "Only admins can view beta signups"
  ON beta_signups
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update beta signups"
  ON beta_signups
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM users WHERE role = 'admin'
    )
  );

-- Add comment to document the table
COMMENT ON TABLE beta_signups IS 'Stores beta access signup requests from potential users';

-- ===================================================================
-- Email Events Table Migration
-- Idempotent migration for tracking email delivery events
-- ===================================================================

-- Create email_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  type text NOT NULL DEFAULT 'digest',
  digest_date date NOT NULL,
  provider_id text, -- Store the email provider's ID (e.g., Resend ID)
  status text DEFAULT 'sent', -- sent, delivered, bounced, failed, etc.
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint to prevent duplicate emails
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_events_user_digest_type_unique'
  ) THEN
    ALTER TABLE public.email_events
    ADD CONSTRAINT email_events_user_digest_type_unique
    UNIQUE (user_id, digest_date, type);
  END IF;
END $$;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_email_events_user_created
ON public.email_events (user_id, created_at DESC);

-- Create index for digest date queries
CREATE INDEX IF NOT EXISTS idx_email_events_digest_date
ON public.email_events (digest_date);

-- Enable Row Level Security
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to read their own email events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_events'
    AND policyname = 'Users can view their own email events'
  ) THEN
    CREATE POLICY "Users can view their own email events"
      ON public.email_events
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create RLS policy for service role to insert/update email events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'email_events'
    AND policyname = 'Service role can manage all email events'
  ) THEN
    CREATE POLICY "Service role can manage all email events"
      ON public.email_events
      FOR ALL
      USING (true);
  END IF;
END $$;

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_email_events_updated_at'
  ) THEN
    CREATE TRIGGER update_email_events_updated_at
      BEFORE UPDATE ON public.email_events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT ON public.email_events TO authenticated;
GRANT ALL ON public.email_events TO service_role;
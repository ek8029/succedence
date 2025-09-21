-- ===================================================================
-- Matches and Alerts Tables Migration (Idempotent)
-- Run this once in your Supabase SQL Editor or via CLI
-- ===================================================================

-- Create matches table if not exists
CREATE TABLE IF NOT EXISTS public.matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    score integer NOT NULL,
    reasons_json jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique constraint on (user_id, listing_id) for upserts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'matches_user_listing_unique'
    ) THEN
        ALTER TABLE public.matches
        ADD CONSTRAINT matches_user_listing_unique
        UNIQUE (user_id, listing_id);
    END IF;
END $$;

-- Create indexes on matches table
CREATE INDEX IF NOT EXISTS matches_user_created_at_idx
ON public.matches (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS matches_listing_id_idx
ON public.matches (listing_id);

CREATE INDEX IF NOT EXISTS matches_score_idx
ON public.matches (score DESC);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to make this idempotent
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;

-- Create RLS policy: users can select rows where user_id = auth.uid()
CREATE POLICY "Users can view their own matches"
ON public.matches FOR SELECT
USING (auth.uid() = user_id);

-- Create alerts table if not exists
CREATE TABLE IF NOT EXISTS public.alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    digest_date date NOT NULL,
    listing_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
    type text NOT NULL DEFAULT 'digest',
    opened_at timestamptz NULL,
    clicked_ids uuid[] NULL DEFAULT '{}'::uuid[],
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create unique constraint on (user_id, digest_date, type)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'alerts_user_date_type_unique'
    ) THEN
        ALTER TABLE public.alerts
        ADD CONSTRAINT alerts_user_date_type_unique
        UNIQUE (user_id, digest_date, type);
    END IF;
END $$;

-- Create index on alerts table
CREATE INDEX IF NOT EXISTS alerts_user_digest_date_idx
ON public.alerts (user_id, digest_date);

-- Enable RLS on alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to make this idempotent
DROP POLICY IF EXISTS "Users can view their own alerts" ON public.alerts;

-- Create RLS policy: users can select rows where user_id = auth.uid()
CREATE POLICY "Users can view their own alerts"
ON public.alerts FOR SELECT
USING (auth.uid() = user_id);

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS matches_updated_at_trigger ON public.matches;
CREATE TRIGGER matches_updated_at_trigger
    BEFORE UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS alerts_updated_at_trigger ON public.alerts;
CREATE TRIGGER alerts_updated_at_trigger
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT SELECT ON public.matches TO anon, authenticated;
GRANT SELECT ON public.alerts TO anon, authenticated;

-- Service role will handle inserts/updates via server-side code
GRANT ALL ON public.matches TO service_role;
GRANT ALL ON public.alerts TO service_role;

-- ===================================================================
-- Migration Complete
-- ===================================================================
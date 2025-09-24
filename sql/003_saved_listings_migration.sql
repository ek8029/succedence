-- Migration for saved listings functionality
-- Run this in Supabase SQL Editor

-- Create saved_listings table for users to save listings they're interested in
CREATE TABLE IF NOT EXISTS saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, listing_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS saved_listings_user_id_idx ON saved_listings(user_id);
CREATE INDEX IF NOT EXISTS saved_listings_created_at_idx ON saved_listings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own saved listings
CREATE POLICY "Users can view their own saved listings" ON saved_listings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved listings" ON saved_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved listings" ON saved_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved listings" ON saved_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Update the existing ai_analyses table to ensure it has proper indexes
CREATE INDEX IF NOT EXISTS ai_analyses_user_created_at_idx ON ai_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_analyses_listing_user_idx ON ai_analyses(listing_id, user_id);

-- Enable RLS on ai_analyses if not already enabled
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_analyses if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ai_analyses' AND policyname = 'Users can view their own AI analyses'
  ) THEN
    CREATE POLICY "Users can view their own AI analyses" ON ai_analyses
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ai_analyses' AND policyname = 'Users can insert their own AI analyses'
  ) THEN
    CREATE POLICY "Users can insert their own AI analyses" ON ai_analyses
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create a view for easier querying of user's AI analysis history
CREATE OR REPLACE VIEW user_ai_analysis_history AS
SELECT
  a.id,
  a.user_id,
  a.listing_id,
  a.analysis_type,
  a.analysis_data,
  a.created_at,
  a.updated_at,
  l.title as listing_title,
  l.industry as listing_industry,
  l.city as listing_city,
  l.state as listing_state,
  l.price as listing_price
FROM ai_analyses a
JOIN listings l ON a.listing_id = l.id
ORDER BY a.created_at DESC;

-- Create a view for user's saved listings with AI analysis info
CREATE OR REPLACE VIEW user_saved_listings_with_ai AS
SELECT
  sl.id as saved_listing_id,
  sl.user_id,
  sl.listing_id,
  sl.notes,
  sl.created_at as saved_at,
  sl.updated_at,
  l.title,
  l.industry,
  l.city,
  l.state,
  l.price,
  l.revenue,
  l.ebitda,
  l.description,
  l.status,
  COUNT(DISTINCT a.id) as ai_analysis_count,
  MAX(a.created_at) as last_ai_analysis_at,
  ARRAY_AGG(DISTINCT a.analysis_type) FILTER (WHERE a.analysis_type IS NOT NULL) as analysis_types
FROM saved_listings sl
JOIN listings l ON sl.listing_id = l.id
LEFT JOIN ai_analyses a ON l.id = a.listing_id AND sl.user_id = a.user_id
GROUP BY sl.id, sl.user_id, sl.listing_id, sl.notes, sl.created_at, sl.updated_at,
         l.title, l.industry, l.city, l.state, l.price, l.revenue, l.ebitda, l.description, l.status
ORDER BY sl.created_at DESC;
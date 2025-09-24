-- Migration for saved listings functionality only
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

-- Create a view for user's saved listings (without AI analysis info for now)
CREATE OR REPLACE VIEW user_saved_listings AS
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
  l.status
FROM saved_listings sl
JOIN listings l ON sl.listing_id = l.id
ORDER BY sl.created_at DESC;
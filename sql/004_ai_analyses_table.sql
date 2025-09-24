-- Migration for AI analyses functionality
-- Run this in Supabase SQL Editor AFTER the saved listings migration

-- Create ai_analyses table for storing AI analysis results
CREATE TABLE IF NOT EXISTS ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  analysis_type text NOT NULL, -- 'business_analysis', 'buyer_match', 'due_diligence', 'market_intelligence', 'smart_buybox'
  analysis_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS ai_analyses_user_listing_type_idx ON ai_analyses(user_id, listing_id, analysis_type);
CREATE INDEX IF NOT EXISTS ai_analyses_created_at_idx ON ai_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_analyses_user_created_at_idx ON ai_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_analyses_listing_user_idx ON ai_analyses(listing_id, user_id);

-- Enable Row Level Security
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_analyses
CREATE POLICY "Users can view their own AI analyses" ON ai_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI analyses" ON ai_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- Update the saved listings view to include AI analysis info
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
-- Complete setup for AI analyses functionality
-- Run this in your Supabase SQL Editor to enable AI analysis saving

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

-- Grant permissions on the view
GRANT SELECT ON user_ai_analysis_history TO authenticated;

-- Verify setup
SELECT 'AI analyses table created successfully' as status;
SELECT 'Example query - should return 0 rows initially:' as info;
SELECT COUNT(*) as analysis_count FROM ai_analyses;
-- Migration for user analysis behavior tracking
-- Run this in Supabase SQL Editor AFTER the stripe fields migration

-- Create user_analysis_behavior table for tracking user preferences and patterns
CREATE TABLE IF NOT EXISTS user_analysis_behavior (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  analysis_type text NOT NULL,
  perspective_used text,
  focus_areas text[],
  listing_industry text,
  listing_price numeric,
  analysis_score integer,
  recommendation text,
  timestamp timestamptz DEFAULT now() NOT NULL,
  session_id text, -- To group related analysis sessions
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS user_analysis_behavior_user_id_idx ON user_analysis_behavior(user_id);
CREATE INDEX IF NOT EXISTS user_analysis_behavior_timestamp_idx ON user_analysis_behavior(timestamp DESC);
CREATE INDEX IF NOT EXISTS user_analysis_behavior_analysis_type_idx ON user_analysis_behavior(analysis_type);
CREATE INDEX IF NOT EXISTS user_analysis_behavior_user_timestamp_idx ON user_analysis_behavior(user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE user_analysis_behavior ENABLE ROW LEVEL SECURITY;

-- Create policies for user_analysis_behavior
CREATE POLICY "Users can view their own analysis behavior" ON user_analysis_behavior
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis behavior" ON user_analysis_behavior
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_preferences_enhanced table for storing AI analysis preferences
CREATE TABLE IF NOT EXISTS user_preferences_enhanced (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_perspective text DEFAULT 'general',
  default_focus_areas text[] DEFAULT '{}',
  risk_tolerance text DEFAULT 'medium',
  experience_level text DEFAULT 'intermediate',
  industry_expertise text[] DEFAULT '{}',
  analysis_depth_preference text DEFAULT 'standard',
  personalization_enabled boolean DEFAULT true,
  last_updated timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_preferences_enhanced ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences_enhanced
CREATE POLICY "Users can view their own enhanced preferences" ON user_preferences_enhanced
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enhanced preferences" ON user_preferences_enhanced
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhanced preferences" ON user_preferences_enhanced
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create a view for user analysis insights (aggregated behavior patterns)
CREATE OR REPLACE VIEW user_analysis_insights AS
SELECT
  user_id,
  COUNT(*) as total_analyses,
  COUNT(DISTINCT analysis_type) as analysis_types_used,
  MODE() WITHIN GROUP (ORDER BY perspective_used) as most_used_perspective,
  MODE() WITHIN GROUP (ORDER BY listing_industry) as most_analyzed_industry,
  AVG(analysis_score) as avg_analysis_score,
  MODE() WITHIN GROUP (ORDER BY recommendation) as most_common_recommendation,
  MAX(timestamp) as last_analysis_date,
  EXTRACT(DAYS FROM (NOW() - MIN(timestamp))) as days_since_first_analysis,
  COUNT(*) / GREATEST(EXTRACT(DAYS FROM (NOW() - MIN(timestamp))), 1) as analyses_per_day
FROM user_analysis_behavior
GROUP BY user_id;

-- Create a function to get personalized recommendations
CREATE OR REPLACE FUNCTION get_personalized_analysis_recommendations(target_user_id uuid)
RETURNS TABLE(
  recommended_perspective text,
  recommended_focus_areas text[],
  insights text[],
  confidence_score numeric
) AS $$
BEGIN
  -- This is a simplified version - in a real implementation, this would use more sophisticated ML
  RETURN QUERY
  WITH user_patterns AS (
    SELECT
      perspective_used,
      focus_areas,
      AVG(analysis_score) as avg_score,
      COUNT(*) as usage_count
    FROM user_analysis_behavior
    WHERE user_id = target_user_id
      AND timestamp > NOW() - INTERVAL '30 days'
    GROUP BY perspective_used, focus_areas
    ORDER BY avg_score DESC, usage_count DESC
    LIMIT 1
  )
  SELECT
    COALESCE(up.perspective_used, 'general') as recommended_perspective,
    COALESCE(up.focus_areas, '{}') as recommended_focus_areas,
    ARRAY['Based on your analysis history', 'Optimized for your preferences'] as insights,
    0.75 as confidence_score
  FROM user_patterns up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically update user preferences based on behavior
CREATE OR REPLACE FUNCTION update_user_preferences_from_behavior()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user preferences based on recent behavior patterns
  INSERT INTO user_preferences_enhanced (
    user_id,
    preferred_perspective,
    default_focus_areas,
    last_updated
  )
  VALUES (
    NEW.user_id,
    NEW.perspective_used,
    NEW.focus_areas,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    preferred_perspective = CASE
      WHEN user_preferences_enhanced.last_updated < NOW() - INTERVAL '7 days'
      THEN NEW.perspective_used
      ELSE user_preferences_enhanced.preferred_perspective
    END,
    default_focus_areas = CASE
      WHEN user_preferences_enhanced.last_updated < NOW() - INTERVAL '7 days'
      THEN NEW.focus_areas
      ELSE user_preferences_enhanced.default_focus_areas
    END,
    last_updated = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_preferences_on_behavior_insert
  AFTER INSERT ON user_analysis_behavior
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_from_behavior();

-- Add some sample data for testing (optional - remove in production)
-- This shows the expected data structure
/*
INSERT INTO user_analysis_behavior (
  user_id,
  analysis_type,
  perspective_used,
  focus_areas,
  listing_industry,
  listing_price,
  analysis_score,
  recommendation
) VALUES (
  'a041dff2-d833-49e3-bdf3-1a5c02523ce1', -- Sample admin user ID
  'enhanced_business_analysis',
  'strategic_buyer',
  '{"Financial Performance", "Growth Potential"}',
  'Technology',
  500000,
  85,
  'buy'
);
*/
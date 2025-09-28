-- Supabase Usage Tracking Schema
-- Run this SQL in your Supabase SQL editor

-- 1. User usage tracking table
CREATE TABLE IF NOT EXISTS user_usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- AI Analysis usage
  business_analysis_count INTEGER DEFAULT 0,
  market_intelligence_count INTEGER DEFAULT 0,
  due_diligence_count INTEGER DEFAULT 0,
  buyer_match_count INTEGER DEFAULT 0,
  total_analyses INTEGER DEFAULT 0,

  -- Follow-up questions usage
  followup_business_analysis INTEGER DEFAULT 0,
  followup_market_intelligence INTEGER DEFAULT 0,
  followup_due_diligence INTEGER DEFAULT 0,
  followup_buyer_match INTEGER DEFAULT 0,
  total_followups INTEGER DEFAULT 0,

  -- Rate limiting tracking
  hourly_questions JSONB DEFAULT '{}',
  daily_cost DECIMAL(10,4) DEFAULT 0.00,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, date)
);

-- 2. Monthly usage aggregations
CREATE TABLE IF NOT EXISTS user_monthly_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,

  -- Monthly totals
  total_analyses INTEGER DEFAULT 0,
  total_followups INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0.00,

  -- By analysis type
  business_analysis_count INTEGER DEFAULT 0,
  market_intelligence_count INTEGER DEFAULT 0,
  due_diligence_count INTEGER DEFAULT 0,
  buyer_match_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, year, month)
);

-- 3. Usage limits violations log
CREATE TABLE IF NOT EXISTS usage_violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL, -- 'daily_limit', 'monthly_limit', 'rate_limit', 'cost_limit'
  attempted_action VARCHAR(50) NOT NULL, -- 'analysis', 'followup'
  current_usage INTEGER NOT NULL,
  limit_value INTEGER NOT NULL,
  user_plan VARCHAR(20) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Real-time usage cache (for fast lookups)
CREATE TABLE IF NOT EXISTS usage_cache (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Current day counters
  analyses_today INTEGER DEFAULT 0,
  followups_today INTEGER DEFAULT 0,
  cost_today DECIMAL(10,4) DEFAULT 0.00,

  -- Current hour counter (resets every hour)
  current_hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW()),
  questions_this_hour INTEGER DEFAULT 0,

  -- Last activity
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  last_followup_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_usage_tracking_user_date ON user_usage_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_monthly_usage_user_period ON user_monthly_usage(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_usage_violations_user_created ON usage_violations(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_cache_user_date ON usage_cache(user_id, date);

-- 6. Update triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_usage_tracking_updated_at
  BEFORE UPDATE ON user_usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_monthly_usage_updated_at
  BEFORE UPDATE ON user_monthly_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_cache_updated_at
  BEFORE UPDATE ON usage_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS (Row Level Security) Policies
ALTER TABLE user_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_monthly_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_cache ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage data
CREATE POLICY "Users can view own usage tracking" ON user_usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own monthly usage" ON user_monthly_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own violations" ON usage_violations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage cache" ON usage_cache
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all usage data (for API operations)
CREATE POLICY "Service role can manage usage tracking" ON user_usage_tracking
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage monthly usage" ON user_monthly_usage
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage violations" ON usage_violations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage usage cache" ON usage_cache
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 8. Functions for usage management
CREATE OR REPLACE FUNCTION get_user_current_usage(p_user_id UUID)
RETURNS TABLE(
  date DATE,
  analyses_today INTEGER,
  followups_today INTEGER,
  cost_today DECIMAL,
  questions_this_hour INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.date,
    uc.analyses_today,
    uc.followups_today,
    uc.cost_today,
    CASE
      WHEN uc.current_hour = EXTRACT(HOUR FROM NOW())
      THEN uc.questions_this_hour
      ELSE 0
    END as questions_this_hour
  FROM usage_cache uc
  WHERE uc.user_id = p_user_id
    AND uc.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_usage_type VARCHAR(20), -- 'analysis' or 'followup'
  p_analysis_type VARCHAR(30), -- 'business_analysis', etc.
  p_cost DECIMAL(10,4) DEFAULT 0.00
)
RETURNS VOID AS $$
DECLARE
  current_hour INTEGER := EXTRACT(HOUR FROM NOW());
BEGIN
  -- Insert or update usage cache
  INSERT INTO usage_cache (user_id, date, current_hour)
  VALUES (p_user_id, CURRENT_DATE, current_hour)
  ON CONFLICT (user_id) DO UPDATE SET
    date = CURRENT_DATE,
    updated_at = NOW();

  -- Update counters based on usage type
  IF p_usage_type = 'analysis' THEN
    UPDATE usage_cache SET
      analyses_today = analyses_today + 1,
      cost_today = cost_today + p_cost,
      questions_this_hour = CASE
        WHEN current_hour = usage_cache.current_hour THEN questions_this_hour + 1
        ELSE 1
      END,
      current_hour = current_hour,
      last_analysis_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF p_usage_type = 'followup' THEN
    UPDATE usage_cache SET
      followups_today = followups_today + 1,
      cost_today = cost_today + p_cost,
      questions_this_hour = CASE
        WHEN current_hour = usage_cache.current_hour THEN questions_this_hour + 1
        ELSE 1
      END,
      current_hour = current_hour,
      last_followup_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Update detailed tracking table
  INSERT INTO user_usage_tracking (user_id, date)
  VALUES (p_user_id, CURRENT_DATE)
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_analyses = CASE WHEN p_usage_type = 'analysis' THEN user_usage_tracking.total_analyses + 1 ELSE user_usage_tracking.total_analyses END,
    total_followups = CASE WHEN p_usage_type = 'followup' THEN user_usage_tracking.total_followups + 1 ELSE user_usage_tracking.total_followups END,
    daily_cost = user_usage_tracking.daily_cost + p_cost,
    updated_at = NOW();

  -- Update specific analysis type counter
  IF p_usage_type = 'analysis' THEN
    UPDATE user_usage_tracking SET
      business_analysis_count = CASE WHEN p_analysis_type = 'business_analysis' THEN business_analysis_count + 1 ELSE business_analysis_count END,
      market_intelligence_count = CASE WHEN p_analysis_type = 'market_intelligence' THEN market_intelligence_count + 1 ELSE market_intelligence_count END,
      due_diligence_count = CASE WHEN p_analysis_type = 'due_diligence' THEN due_diligence_count + 1 ELSE due_diligence_count END,
      buyer_match_count = CASE WHEN p_analysis_type = 'buyer_match' THEN buyer_match_count + 1 ELSE buyer_match_count END
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  ELSIF p_usage_type = 'followup' THEN
    UPDATE user_usage_tracking SET
      followup_business_analysis = CASE WHEN p_analysis_type = 'business_analysis' THEN followup_business_analysis + 1 ELSE followup_business_analysis END,
      followup_market_intelligence = CASE WHEN p_analysis_type = 'market_intelligence' THEN followup_market_intelligence + 1 ELSE followup_market_intelligence END,
      followup_due_diligence = CASE WHEN p_analysis_type = 'due_diligence' THEN followup_due_diligence + 1 ELSE followup_due_diligence END,
      followup_buyer_match = CASE WHEN p_analysis_type = 'buyer_match' THEN followup_buyer_match + 1 ELSE followup_buyer_match END
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to log violations
CREATE OR REPLACE FUNCTION log_usage_violation(
  p_user_id UUID,
  p_violation_type VARCHAR(50),
  p_attempted_action VARCHAR(50),
  p_current_usage INTEGER,
  p_limit_value INTEGER,
  p_user_plan VARCHAR(20),
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_violations (
    user_id, violation_type, attempted_action, current_usage,
    limit_value, user_plan, ip_address, user_agent
  ) VALUES (
    p_user_id, p_violation_type, p_attempted_action, p_current_usage,
    p_limit_value, p_user_plan, p_ip_address, p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Cleanup function for old data (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_old_usage_data()
RETURNS VOID AS $$
BEGIN
  -- Keep 90 days of daily usage data
  DELETE FROM user_usage_tracking
  WHERE date < CURRENT_DATE - INTERVAL '90 days';

  -- Keep 2 years of monthly data
  DELETE FROM user_monthly_usage
  WHERE (year * 12 + month) < (EXTRACT(YEAR FROM NOW()) * 12 + EXTRACT(MONTH FROM NOW()) - 24);

  -- Keep 30 days of violation logs
  DELETE FROM usage_violations
  WHERE created_at < NOW() - INTERVAL '30 days';

  -- Clean usage cache for users who haven't been active in 7 days
  DELETE FROM usage_cache
  WHERE date < CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
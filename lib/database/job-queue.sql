-- Database schema for persistent job queue
-- Run this in your Supabase SQL editor

-- Create job queue table for persistent background processing
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('business_analysis', 'market_intelligence', 'due_diligence', 'buyer_match')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  parameters JSONB DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_listing ON analysis_jobs(listing_id, analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user ON analysis_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created ON analysis_jobs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_analysis_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_analysis_jobs_updated_at ON analysis_jobs;
CREATE TRIGGER trigger_analysis_jobs_updated_at
  BEFORE UPDATE ON analysis_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_jobs_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own jobs" ON analysis_jobs;
CREATE POLICY "Users can view their own jobs" ON analysis_jobs
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can create their own jobs" ON analysis_jobs;
CREATE POLICY "Users can create their own jobs" ON analysis_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Service can update all jobs" ON analysis_jobs;
CREATE POLICY "Service can update all jobs" ON analysis_jobs
  FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT ALL ON analysis_jobs TO authenticated;
GRANT ALL ON analysis_jobs TO anon;
GRANT ALL ON analysis_jobs TO service_role;
-- Consolidated migration: Add all CSV import fields to listings table
-- Run this ONCE in Supabase SQL Editor before importing CSVs

BEGIN;

-- Financial fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cash_flow NUMERIC;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reason_for_selling TEXT;

-- Business details
ALTER TABLE listings ADD COLUMN IF NOT EXISTS year_established INTEGER;

-- Source/aggregation fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_website TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_id TEXT;

-- Broker/agent contact fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_name TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_company TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_phone TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_email TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_listings_source ON listings(source_website, source_id)
  WHERE source_website IS NOT NULL AND source_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_source_url ON listings(source_url)
  WHERE source_url IS NOT NULL;

-- Verify columns added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'listings'
  AND column_name IN (
    'cash_flow',
    'reason_for_selling',
    'year_established',
    'source_url',
    'source_website',
    'source_id',
    'broker_name',
    'broker_company',
    'broker_phone',
    'broker_email'
  )
ORDER BY column_name;

COMMIT;

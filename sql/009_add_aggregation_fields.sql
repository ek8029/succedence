-- Add aggregation fields to listings table for tracking source information and broker contacts

-- Source information fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_website TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_id TEXT;

-- Broker/contact information fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_name TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_company TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_phone TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS broker_email TEXT;

-- Add index on source_website and source_id for faster duplicate checking
CREATE INDEX IF NOT EXISTS idx_listings_source ON listings(source_website, source_id) WHERE source_website IS NOT NULL AND source_id IS NOT NULL;

-- Add index on source_url for faster lookups
CREATE INDEX IF NOT EXISTS idx_listings_source_url ON listings(source_url) WHERE source_url IS NOT NULL;

-- Add contact information fields to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS contact_other TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_contact_email ON listings(contact_email);

-- Add comments
COMMENT ON COLUMN listings.contact_phone IS 'Contact phone number for the listing owner/broker';
COMMENT ON COLUMN listings.contact_email IS 'Contact email address for the listing owner/broker';
COMMENT ON COLUMN listings.contact_other IS 'Other contact information (LinkedIn, website, etc.)';
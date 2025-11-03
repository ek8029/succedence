-- Add missing financial and business fields to listings table

-- Financial fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS cash_flow NUMERIC;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reason_for_selling TEXT;

-- Add any other missing fields that might be needed
ALTER TABLE listings ADD COLUMN IF NOT EXISTS year_established INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS employees INTEGER;

-- Add comments for clarity
COMMENT ON COLUMN listings.cash_flow IS 'Annual cash flow in dollars';
COMMENT ON COLUMN listings.reason_for_selling IS 'Reason why the business is being sold';
COMMENT ON COLUMN listings.year_established IS 'Year the business was established';
COMMENT ON COLUMN listings.employees IS 'Number of employees';

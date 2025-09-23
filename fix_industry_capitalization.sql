-- Fix industry capitalization in existing database records
-- This script updates lowercase industry names to proper capitalization

-- Update lowercase "technology" to "Technology Services"
UPDATE listings SET industry = 'Technology Services' WHERE industry = 'technology';
UPDATE listings SET industry = 'Technology Services' WHERE industry = 'Technology';

-- Update common variations to standardized names
UPDATE listings SET industry = 'SaaS (Software as a Service)' WHERE industry = 'saas' OR industry = 'SaaS' OR industry = 'software as a service';
UPDATE listings SET industry = 'E-commerce' WHERE industry = 'ecommerce' OR industry = 'e-commerce' OR industry = 'E-Commerce';
UPDATE listings SET industry = 'Food & Beverage' WHERE industry = 'food & beverage' OR industry = 'restaurant' OR industry = 'restaurants';
UPDATE listings SET industry = 'Manufacturing' WHERE industry = 'manufacturing' OR industry = 'Manufacturing (Small-Scale)';
UPDATE listings SET industry = 'Professional Services' WHERE industry = 'professional services';
UPDATE listings SET industry = 'Real Estate Services' WHERE industry = 'real estate' OR industry = 'Real Estate';
UPDATE listings SET industry = 'Healthcare Services' WHERE industry = 'healthcare' OR industry = 'Healthcare';
UPDATE listings SET industry = 'Education & Training' WHERE industry = 'education' OR industry = 'Education';
UPDATE listings SET industry = 'Transportation & Logistics' WHERE industry = 'transportation' OR industry = 'logistics';
UPDATE listings SET industry = 'Retail (Local/Traditional)' WHERE industry = 'retail' OR industry = 'Retail';
UPDATE listings SET industry = 'Digital Marketing' WHERE industry = 'digital marketing' OR industry = 'marketing';
UPDATE listings SET industry = 'Software Development' WHERE industry = 'software development' OR industry = 'software';

-- Update specific service industries
UPDATE listings SET industry = 'HVAC Services' WHERE industry = 'hvac' OR industry = 'HVAC';
UPDATE listings SET industry = 'Plumbing Services' WHERE industry = 'plumbing';
UPDATE listings SET industry = 'Electrical Services' WHERE industry = 'electrical';
UPDATE listings SET industry = 'Auto Repair & Service' WHERE industry = 'auto repair' OR industry = 'automotive';
UPDATE listings SET industry = 'Construction & Contracting' WHERE industry = 'construction';
UPDATE listings SET industry = 'Cleaning Services' WHERE industry = 'cleaning';
UPDATE listings SET industry = 'Property Management' WHERE industry = 'property management';
UPDATE listings SET industry = 'Medical & Dental Practices' WHERE industry = 'medical' OR industry = 'dental';
UPDATE listings SET industry = 'Accounting & Tax Services' WHERE industry = 'accounting' OR industry = 'tax services';
UPDATE listings SET industry = 'Insurance Services' WHERE industry = 'insurance';
UPDATE listings SET industry = 'Legal Services' WHERE industry = 'legal';
UPDATE listings SET industry = 'Beauty & Personal Care' WHERE industry = 'beauty' OR industry = 'personal care';
UPDATE listings SET industry = 'Pet Services' WHERE industry = 'pet services' OR industry = 'pets';
UPDATE listings SET industry = 'Fitness & Wellness' WHERE industry = 'fitness' OR industry = 'wellness';

-- Add any other common lowercase variations you might have
UPDATE listings SET industry = 'FinTech' WHERE industry = 'fintech' OR industry = 'financial technology';
UPDATE listings SET industry = 'HealthTech' WHERE industry = 'healthtech' OR industry = 'health technology';
UPDATE listings SET industry = 'EdTech' WHERE industry = 'edtech' OR industry = 'educational technology';
UPDATE listings SET industry = 'Media & Entertainment' WHERE industry = 'media' OR industry = 'entertainment';

-- Check results
SELECT industry, COUNT(*) as count
FROM listings
GROUP BY industry
ORDER BY industry;
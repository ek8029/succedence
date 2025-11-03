-- Clean up all test/mock data from the database
-- This will remove all listings, matches, saved listings, AI analyses, and related data
-- User accounts and structure will be preserved

-- Start a transaction for safety
BEGIN;

-- Delete AI analyses (references listings)
DELETE FROM ai_analyses;

-- Delete saved listings (references listings)
DELETE FROM saved_listings;

-- Delete matches (references listings)
DELETE FROM matches;

-- Delete listing media (references listings)
DELETE FROM listing_media;

-- Delete all listings
DELETE FROM listings;

-- Optional: Clear beta signups if they're test data
-- Uncomment the line below if you want to clear beta signups too
-- DELETE FROM beta_signups;

-- Reset sequences/auto-increment counters (if any exist)
-- This ensures new data starts with clean IDs

-- Show counts to verify cleanup
SELECT 'Remaining listings:' as table_name, COUNT(*) as count FROM listings
UNION ALL
SELECT 'Remaining matches:', COUNT(*) FROM matches
UNION ALL
SELECT 'Remaining saved_listings:', COUNT(*) FROM saved_listings
UNION ALL
SELECT 'Remaining ai_analyses:', COUNT(*) FROM ai_analyses
UNION ALL
SELECT 'Remaining listing_media:', COUNT(*) FROM listing_media
UNION ALL
SELECT 'Total users (preserved):', COUNT(*) FROM users;

-- Commit the transaction
COMMIT;

-- Success message
SELECT 'Test data cleanup completed successfully!' as status;

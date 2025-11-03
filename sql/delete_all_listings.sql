-- Delete all listings and related data
-- Run this to clean out existing listings before reimporting with new CSV fields

BEGIN;

-- Delete related data first (foreign key constraints)
DELETE FROM ai_analyses WHERE listing_id IN (SELECT id FROM listings);
DELETE FROM saved_listings WHERE listing_id IN (SELECT id FROM listings);
DELETE FROM matches WHERE listing_id IN (SELECT id FROM listings);
DELETE FROM listing_media WHERE listing_id IN (SELECT id FROM listings);
DELETE FROM messages WHERE listing_id IN (SELECT id FROM listings);

-- Now delete all listings
DELETE FROM listings;

-- Verify deletion
SELECT 'Listings remaining:' as info, COUNT(*) as count FROM listings;

COMMIT;

#!/bin/bash

# Test script for trial and pricing endpoints
# Usage: ./test-endpoints.sh [production_url]

echo "================================"
echo "Testing Trial & Pricing Endpoints"
echo "================================"
echo ""

# Use localhost if no URL provided
BASE_URL="${1:-http://localhost:3000}"
echo "Testing against: $BASE_URL"
echo ""

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/api/health" | jq '.' || echo "✗ Health check failed"
echo ""

# Test 2: Test environment (shows pricing IDs)
echo "2. Testing environment configuration..."
curl -s "$BASE_URL/api/test-env" | jq '.stripe' || echo "✗ Environment test failed"
echo ""

# Test 3: Combined cron endpoint (GET only works in development)
if [ "$BASE_URL" = "http://localhost:3000" ]; then
  echo "3. Testing combined cron endpoint..."
  curl -s "$BASE_URL/api/cron/daily-tasks" | jq '.tasks | keys' || echo "✗ Cron test failed"
  echo ""
else
  echo "3. Skipping cron test (requires POST with auth in production)"
  echo ""
fi

# Test 4: Check subscription plans display
echo "4. Testing subscription page loads..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/subscribe"
echo ""

# Test 5: Check auth page loads
echo "5. Testing auth/signup page loads..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/auth"
echo ""

echo "================================"
echo "Test Complete!"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. Visit $BASE_URL/subscribe to verify pricing displays correctly"
echo "2. Create a test account to verify trial initialization"
echo "3. Check database for trial_ends_at field after signup"
echo ""

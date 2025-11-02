@echo off
REM Test script for trial and pricing endpoints
REM Usage: test-endpoints.bat [production_url]

echo ================================
echo Testing Trial ^& Pricing Endpoints
echo ================================
echo.

REM Use localhost if no URL provided
if "%1"=="" (
    set BASE_URL=http://localhost:3000
) else (
    set BASE_URL=%1
)

echo Testing against: %BASE_URL%
echo.

REM Test 1: Health check
echo 1. Testing health endpoint...
curl -s "%BASE_URL%/api/health"
echo.
echo.

REM Test 2: Test subscription page
echo 2. Testing subscription page loads...
curl -s -o nul -w "Status: %%{http_code}" "%BASE_URL%/subscribe"
echo.
echo.

REM Test 3: Test auth page
echo 3. Testing auth/signup page loads...
curl -s -o nul -w "Status: %%{http_code}" "%BASE_URL%/auth"
echo.
echo.

REM Test 4: Combined cron endpoint (only in development)
if "%BASE_URL%"=="http://localhost:3000" (
    echo 4. Testing combined cron endpoint...
    curl -s "%BASE_URL%/api/cron/daily-tasks"
    echo.
) else (
    echo 4. Skipping cron test ^(requires POST with auth in production^)
)
echo.

echo ================================
echo Test Complete!
echo ================================
echo.
echo Next Steps:
echo 1. Visit %BASE_URL%/subscribe to verify pricing displays correctly
echo 2. Create a test account to verify trial initialization
echo 3. Check database for trial_ends_at field after signup
echo.

pause

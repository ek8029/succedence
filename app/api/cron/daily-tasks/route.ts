import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Combined cron endpoint that runs all daily scheduled tasks
 * This consolidates multiple cron jobs into one to avoid Vercel's 2-job limit
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = {
      timestamp: new Date().toISOString(),
      tasks: {} as Record<string, any>
    };

    // Task 1: Run match engine (4 AM task)
    try {
      console.log('Running match engine...');
      const matchResponse = await fetch(`${request.nextUrl.origin}/api/match/run`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json'
        }
      });
      results.tasks.matchEngine = {
        success: matchResponse.ok,
        status: matchResponse.status,
        data: matchResponse.ok ? await matchResponse.json() : await matchResponse.text()
      };
    } catch (error: any) {
      console.error('Match engine failed:', error);
      results.tasks.matchEngine = {
        success: false,
        error: error.message
      };
    }

    // Task 2: Send alert digests (5 AM task)
    try {
      console.log('Sending alert digests...');
      const alertResponse = await fetch(`${request.nextUrl.origin}/api/alerts/digest`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json'
        }
      });
      results.tasks.alertDigest = {
        success: alertResponse.ok,
        status: alertResponse.status,
        data: alertResponse.ok ? await alertResponse.json() : await alertResponse.text()
      };
    } catch (error: any) {
      console.error('Alert digest failed:', error);
      results.tasks.alertDigest = {
        success: false,
        error: error.message
      };
    }

    // Task 3: Upgrade expired trials (6 AM task)
    try {
      console.log('Upgrading expired trials...');
      const trialResponse = await fetch(`${request.nextUrl.origin}/api/cron/upgrade-expired-trials`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json'
        }
      });
      results.tasks.trialUpgrade = {
        success: trialResponse.ok,
        status: trialResponse.status,
        data: trialResponse.ok ? await trialResponse.json() : await trialResponse.text()
      };
    } catch (error: any) {
      console.error('Trial upgrade failed:', error);
      results.tasks.trialUpgrade = {
        success: false,
        error: error.message
      };
    }

    // Determine overall success
    const allSuccessful = Object.values(results.tasks).every((task: any) => task.success);

    return NextResponse.json({
      success: allSuccessful,
      message: `Completed ${Object.keys(results.tasks).length} tasks`,
      results
    });

  } catch (error: any) {
    console.error('Error in daily-tasks cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Allow GET for testing in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'GET method only allowed in development' },
      { status: 405 }
    );
  }
  return POST(request);
}

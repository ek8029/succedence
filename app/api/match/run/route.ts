// ===================================================================
// Nightly Matching Job API Route
// POST /api/match/run
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { matchUserToListings } from '@/lib/matchEngine'

// Request schema
const runMatchJobSchema = z.object({
  since: z.string().optional()
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check authentication via cron secret
    const cronKey = request.headers.get('x-cron-key')
    if (!cronKey || cronKey !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = {
      since: url.searchParams.get('since') || undefined
    }

    // Validate input
    const { since } = runMatchJobSchema.parse(queryParams)

    // Default to yesterday if no since parameter provided
    const sinceDate = since || (() => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString()
    })()

    console.log(`Starting matching job with since: ${sinceDate}`)

    // Get all users with preferences
    const supabase = createServiceClient()
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('status', 'active')
      .returns<{id: string}[]>()

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    if (!users?.length) {
      return NextResponse.json({
        message: 'No active users found',
        usersProcessed: 0,
        matchesUpserted: 0,
        duration: Date.now() - startTime
      })
    }

    // Process users in batches to avoid overwhelming the database
    const batchSize = 10
    let totalMatchesUpserted = 0
    let usersProcessed = 0

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)

      const batchPromises = batch.map(async (user) => {
        const matchesUpserted = await matchUserToListings(user.id, sinceDate)
        return matchesUpserted
      })

      const batchResults = await Promise.all(batchPromises)
      totalMatchesUpserted += batchResults.reduce((sum, count) => sum + count, 0)
      usersProcessed += batch.length

      // Small delay between batches to be nice to the database
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    const duration = Date.now() - startTime
    const result = {
      message: 'Matching job completed successfully',
      usersProcessed,
      matchesUpserted: totalMatchesUpserted,
      duration,
      since: sinceDate
    }

    console.log('Matching job completed:', result)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in matching job:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
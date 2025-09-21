// ===================================================================
// Alerts Digest Preparation API Route
// POST /api/alerts/digest
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prepareDigests } from '@/lib/matchEngine'
import { sendDigestEmails } from '@/lib/email/digest-sender'

// Request schema
const digestJobSchema = z.object({
  date: z.string().optional()
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
      date: url.searchParams.get('date') || undefined
    }

    // Validate input
    const { date } = digestJobSchema.parse(queryParams)

    // Default to today if no date parameter provided
    const targetDate = date || new Date().toISOString().split('T')[0]

    console.log(`Starting digest preparation and email sending for date: ${targetDate}`)

    // Step 1: Prepare digests (create digest rows in alerts table)
    const digestResult = await prepareDigests(targetDate)
    console.log('Digest preparation completed:', digestResult)

    // Step 2: Send emails based on prepared digests
    const emailResult = await sendDigestEmails(targetDate)
    console.log('Email sending completed:', emailResult)

    const duration = Date.now() - startTime
    const response = {
      message: 'Digest preparation and email sending completed successfully',
      date: targetDate,
      digest: digestResult,
      email: emailResult,
      duration
    }

    console.log('Full digest job completed:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in digest preparation job:', error)

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
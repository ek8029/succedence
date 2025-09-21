// ===================================================================
// Digest Preview API Route - Dev/Testing Only
// GET /api/alerts/preview?userId=...
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { renderDigestEmail } from '@/lib/email/templates/digest'
import { computeListingScore } from '@/lib/matchEngine'

// Request schema
const previewSchema = z.object({
  userId: z.string().uuid()
})

export async function GET(request: NextRequest) {
  try {
    // Check authentication via cron secret OR development environment
    const cronKey = request.headers.get('x-cron-key')
    const isDevEnv = process.env.NODE_ENV !== 'production'

    if (!cronKey || cronKey !== process.env.CRON_SECRET) {
      if (!isDevEnv) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = {
      userId: url.searchParams.get('userId')
    }

    // Validate input
    const { userId } = previewSchema.parse(queryParams)

    const supabase = createServiceClient()

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .single() as { data: {id: string; email: string; first_name?: string; last_name?: string} | null; error: any }

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the most recent digest for this user
    const { data: recentDigest, error: digestError } = await supabase
      .from('alerts')
      .select('listing_ids, digest_date')
      .eq('user_id', userId)
      .eq('type', 'digest')
      .order('digest_date', { ascending: false })
      .limit(1)
      .single() as { data: {listing_ids: string[]; digest_date: string} | null; error: any }

    if (digestError || !recentDigest) {
      return NextResponse.json(
        { error: 'No digest found for user' },
        { status: 404 }
      )
    }

    // Get the actual listing details (limit to 20 for email)
    const listingIds = recentDigest.listing_ids.slice(0, 20)
    if (listingIds.length === 0) {
      return NextResponse.json(
        { error: 'No listings in digest' },
        { status: 404 }
      )
    }

    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .in('id', listingIds)
      .eq('status', 'active')
      .returns<{
        id: string;
        title: string;
        description: string;
        industry: string;
        state: string;
        revenue?: number;
        price?: number;
        updated_at: string;
        ebitda?: number;
        metric_type?: string;
        owner_hours?: number;
      }[]>()

    if (listingsError || !listings?.length) {
      return NextResponse.json(
        { error: 'No active listings found' },
        { status: 404 }
      )
    }

    // Get user preferences for scoring reasons
    const { data: userPrefs } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Generate match reasons for each listing
    const reasons: { [listingId: string]: string[] } = {}
    if (userPrefs) {
      listings.forEach(listing => {
        const { reasons: listingReasons } = computeListingScore(userPrefs, listing)
        reasons[listing.id] = listingReasons
      })
    }

    // Render the email
    const { html, text } = renderDigestEmail({
      user,
      listings,
      reasons
    })

    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      },
      digest: {
        date: recentDigest.digest_date,
        listingCount: listings.length
      },
      preview: {
        html,
        text
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in digest preview:', error)

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

// Only allow GET requests
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
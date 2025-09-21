// ===================================================================
// User Matches API Route
// GET /api/matches
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// Query parameters schema
const matchesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  order: z.enum(['score', 'created_at']).default('score')
})

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = {
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      order: searchParams.get('order')
    }

    // Validate parameters
    const { limit, offset, order } = matchesQuerySchema.parse(queryParams)

    // Create authenticated client (uses RLS to enforce user access)
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Query matches with related listing data
    // RLS will automatically filter to only this user's matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        score,
        reasons_json,
        created_at,
        listing:listings (
          id,
          title,
          description,
          industry,
          city,
          state,
          revenue,
          price,
          source,
          updated_at
        )
      `)
      .order(order === 'score' ? 'score' : 'created_at', { ascending: false })
      .range(offset, offset + limit - 1)
      .returns<{
        id: string;
        score: number;
        reasons_json: string[];
        created_at: string;
        listing: {
          id: string;
          title: string;
          description: string;
          industry: string;
          city: string;
          state: string;
          revenue: number;
          price: number;
          source: string;
          updated_at: string;
        };
      }[]>()

    if (matchesError) {
      console.error('Error fetching matches:', matchesError)
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting matches:', countError)
      return NextResponse.json(
        { error: 'Failed to count matches' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedMatches = matches?.map(match => ({
      id: match.id,
      score: match.score,
      reasons: match.reasons_json || [],
      createdAt: match.created_at,
      listing: match.listing
    })) || []

    return NextResponse.json({
      matches: formattedMatches,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      }
    })

  } catch (error) {
    console.error('Error in matches API:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
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
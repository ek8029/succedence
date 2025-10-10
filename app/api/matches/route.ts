// ===================================================================
// User Matches API Route
// GET /api/matches
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      order: searchParams.get('order') || undefined
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

      // Check if the error is due to missing table
      if (matchesError.message?.includes('relation') && matchesError.message?.includes('does not exist')) {
        console.log('Matches table does not exist, returning empty matches')
        return NextResponse.json({
          matches: [],
          pagination: {
            limit,
            offset,
            total: 0,
            hasMore: false
          }
        })
      }

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

      // Handle missing table for count as well
      if (countError.message?.includes('relation') && countError.message?.includes('does not exist')) {
        console.log('Matches table does not exist for count, using 0')
        const formattedMatches = matches?.map(match => ({
          id: match.id,
          score: Math.min(match.score, 100), // Cap at 100% to handle legacy data
          reasons: match.reasons_json || [],
          createdAt: match.created_at,
          listing: match.listing
        })) || []

        return NextResponse.json({
          matches: formattedMatches,
          pagination: {
            limit,
            offset,
            total: 0,
            hasMore: false
          }
        })
      }

      return NextResponse.json(
        { error: 'Failed to count matches' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedMatches = matches?.map(match => ({
      id: match.id,
      score: Math.min(match.score, 100), // Cap at 100% to handle legacy data
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
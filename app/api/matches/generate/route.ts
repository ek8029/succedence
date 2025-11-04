// ===================================================================
// Generate Matches API Route
// POST /api/matches/generate
// Generates matches for the current user
// ===================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { matchUserToListings } from '@/lib/matchEngine'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Create authenticated client
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`Generating matches for user: ${user.id}`)

    // Generate matches
    const matchCount = await matchUserToListings(user.id)

    return NextResponse.json({
      success: true,
      matchesGenerated: matchCount,
      message: `Generated ${matchCount} match${matchCount !== 1 ? 'es' : ''}`
    })

  } catch (error) {
    console.error('Error in generate matches API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate matches.' },
    { status: 405 }
  )
}

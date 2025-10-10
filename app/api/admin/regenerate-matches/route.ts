import { NextRequest, NextResponse } from 'next/server'
import { createClient, createBackgroundServiceClient } from '@/lib/supabase/server'
import { matchUserToListings } from '@/lib/matchEngine'
import { requireAdminSync } from '@/lib/admin-check'

export const dynamic = 'force-dynamic'

// POST - Regenerate matches for all users or specific user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (sync check for known admins)
    const adminError = requireAdminSync(user.email)
    if (adminError) {
      return NextResponse.json({ error: adminError.error }, { status: adminError.status })
    }

    // Get optional user_id from request body
    const body = await request.json().catch(() => ({}))
    const specificUserId = body.userId

    let usersProcessed = 0
    let totalMatches = 0

    if (specificUserId) {
      // Regenerate matches for specific user
      console.log(`Regenerating matches for user: ${specificUserId}`)
      const matchCount = await matchUserToListings(specificUserId)
      usersProcessed = 1
      totalMatches = matchCount
    } else {
      // Regenerate matches for all users
      console.log('Regenerating matches for all users')

      // Use background service client (bypasses RLS completely)
      const serviceSupabase = createBackgroundServiceClient()

      // Get all user IDs
      const { data: users, error: usersError } = await serviceSupabase
        .from('users')
        .select('id')
        .returns<{ id: string }[]>()

      if (usersError || !users) {
        console.error('Error fetching users:', usersError)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
      }

      // Process each user
      for (const userRecord of users) {
        const matchCount = await matchUserToListings(userRecord.id)
        usersProcessed++
        totalMatches += matchCount
        console.log(`User ${userRecord.id}: ${matchCount} matches`)
      }
    }

    return NextResponse.json({
      success: true,
      usersProcessed,
      totalMatches,
      message: `Regenerated ${totalMatches} matches for ${usersProcessed} user(s)`
    })

  } catch (error) {
    console.error('Error in regenerate-matches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

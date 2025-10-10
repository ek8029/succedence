import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { requireAdminSync } from '@/lib/admin-check'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (sync check for known admins)
    const adminError = requireAdminSync(user.email)
    if (adminError) {
      return NextResponse.json({ error: adminError.error }, { status: adminError.status })
    }

    // Get dashboard stats
    const [
      { count: totalListings },
      { count: activeListings },
      { count: draftListings },
      { count: rejectedListings },
      { count: archivedListings },
      { count: totalMessages },
      { data: industriesData }
    ] = await Promise.all([
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'archived'),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('industry').neq('industry', null)
    ])

    const industries = Array.from(new Set(industriesData?.map((item: any) => item.industry))).sort()

    return NextResponse.json({
      totalListings: totalListings || 0,
      activeListings: activeListings || 0,
      draftListings: draftListings || 0,
      rejectedListings: rejectedListings || 0,
      archivedListings: archivedListings || 0,
      totalMessages: totalMessages || 0,
      industries
    })

  } catch (error) {
    console.error('Error in admin GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const updateStatusSchema = z.object({
  listingId: z.string().uuid(),
  newStatus: z.enum(['active', 'draft', 'rejected', 'archived'])
})

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (sync check for known admins)
    const adminError = requireAdminSync(user.email)
    if (adminError) {
      return NextResponse.json({ error: adminError.error }, { status: adminError.status })
    }

    const body = await request.json()
    const { listingId, newStatus } = updateStatusSchema.parse(body)

    // Update listing status
    const { error: updateError } = await (supabase
      .from('listings') as any)
      .update({ status: newStatus })
      .eq('id', listingId)

    if (updateError) {
      console.error('Error updating listing status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update listing status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Listing status updated successfully'
    })

  } catch (error) {
    console.error('Error in admin PATCH:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

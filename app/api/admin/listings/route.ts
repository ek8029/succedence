import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user and verify admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service client to check admin role (bypasses RLS)
    const serviceSupabase = createServiceClient()
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || (userData as any)?.role !== 'admin') {
      console.error('Admin check failed:', { userError, role: (userData as any)?.role, userId: user.id })
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all listings for admin (not just active ones)
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching admin listings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      )
    }

    return NextResponse.json(listings || [])
  } catch (error) {
    console.error('Error in admin listings GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
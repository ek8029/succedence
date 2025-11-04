// Debug endpoint to check AI analyses in database
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getUserWithRole } from '@/lib/auth/permissions'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getUserWithRole()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    // Get ALL ai_analyses for this user
    const { data: analyses, error } = await (serviceSupabase as any)
      .from('ai_analyses')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching analyses:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: analyses?.length || 0,
      analyses: analyses || [],
      user_id: authUser.id
    })

  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  getUserCurrentUsage,
  getMonthlyUsage,
  getUsageHistory
} from '@/lib/utils/database-usage-tracking'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user information
    const supabase = createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get current usage data
    const currentUsage = await getUserCurrentUsage(user.id)
    if (!currentUsage) {
      return NextResponse.json(
        { error: 'Failed to retrieve usage data' },
        { status: 500 }
      )
    }

    // Get monthly usage
    const monthlyUsage = await getMonthlyUsage(user.id)

    // Get usage history for the last 30 days
    const usageHistory = await getUsageHistory(user.id, 30)

    // Get user plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const userPlan = (profile && (profile as any).plan) ? (profile as any).plan : 'free'

    return NextResponse.json({
      current: {
        ...currentUsage,
        monthly_analyses: monthlyUsage?.total_analyses || 0,
        monthly_followups: monthlyUsage?.total_followups || 0,
        monthly_cost: monthlyUsage?.total_cost || 0
      },
      history: usageHistory,
      plan: userPlan,
      userId: user.id
    })

  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
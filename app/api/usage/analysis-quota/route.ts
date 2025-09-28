import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile to determine plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const userPlan = ((profile as any)?.plan as string) || 'free'

    // Define plan limits
    const planLimits = {
      free: 2,
      starter: 10,
      professional: 50,
      enterprise: 200
    }

    const totalAllowed = planLimits[userPlan as keyof typeof planLimits] || 2

    // Calculate current month start and end
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    try {
      // Try to get usage from database tracking
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_type', 'analysis')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

      if (!usageError && usageData) {
        const usedCount = usageData.length
        const remaining = Math.max(0, totalAllowed - usedCount)

        return NextResponse.json({
          remaining,
          total: totalAllowed,
          used: usedCount,
          resetDate: resetDate.toISOString(),
          plan: userPlan
        })
      }
    } catch (dbError) {
      console.warn('Database usage tracking unavailable, using fallback')
    }

    // Fallback: count analysis jobs from this month
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('analysis_jobs')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

      if (!jobsError && jobsData) {
        const usedCount = jobsData.length
        const remaining = Math.max(0, totalAllowed - usedCount)

        return NextResponse.json({
          remaining,
          total: totalAllowed,
          used: usedCount,
          resetDate: resetDate.toISOString(),
          plan: userPlan
        })
      }
    } catch (jobError) {
      console.warn('Analysis jobs table unavailable, using default values')
    }

    // Final fallback: assume no usage
    return NextResponse.json({
      remaining: totalAllowed,
      total: totalAllowed,
      used: 0,
      resetDate: resetDate.toISOString(),
      plan: userPlan
    })

  } catch (error) {
    console.error('Error fetching usage quota:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
}
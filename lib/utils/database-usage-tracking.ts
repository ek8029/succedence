/**
 * Database-based Usage Tracking for AI Features
 * Replaces in-memory tracking with Supabase database storage
 */

import { createServiceClient } from '@/lib/supabase/server'
import { PlanType } from '@/lib/types'
import { PLAN_LIMITATIONS, PlanLimitations } from './plan-limitations'

export interface UsageData {
  analyses_today: number
  followups_today: number
  cost_today: number
  questions_this_hour: number
  business_analysis_count: number
  market_intelligence_count: number
  due_diligence_count: number
  buyer_match_count: number
  followup_business_analysis: number
  followup_market_intelligence: number
  followup_due_diligence: number
  followup_buyer_match: number
}

export interface UsageCheckResult {
  allowed: boolean
  remaining?: number
  message?: string
  retryAfter?: number
}

/**
 * Get current usage data for a user
 */
export async function getUserCurrentUsage(userId: string): Promise<UsageData | null> {
  const supabase = createServiceClient()

  try {
    const { data, error } = await supabase
      .rpc('get_user_current_usage', { p_user_id: userId })

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        analyses_today: 0,
        followups_today: 0,
        cost_today: 0,
        questions_this_hour: 0,
        business_analysis_count: 0,
        market_intelligence_count: 0,
        due_diligence_count: 0,
        buyer_match_count: 0,
        followup_business_analysis: 0,
        followup_market_intelligence: 0,
        followup_due_diligence: 0,
        followup_buyer_match: 0
      }
    }

    // Get detailed tracking data
    const { data: trackingData } = await supabase
      .from('user_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single()

    return {
      analyses_today: data[0].analyses_today || 0,
      followups_today: data[0].followups_today || 0,
      cost_today: parseFloat(data[0].cost_today) || 0,
      questions_this_hour: data[0].questions_this_hour || 0,
      business_analysis_count: trackingData?.business_analysis_count || 0,
      market_intelligence_count: trackingData?.market_intelligence_count || 0,
      due_diligence_count: trackingData?.due_diligence_count || 0,
      buyer_match_count: trackingData?.buyer_match_count || 0,
      followup_business_analysis: trackingData?.followup_business_analysis || 0,
      followup_market_intelligence: trackingData?.followup_market_intelligence || 0,
      followup_due_diligence: trackingData?.followup_due_diligence || 0,
      followup_buyer_match: trackingData?.followup_buyer_match || 0
    }
  } catch (error) {
    console.error('Error getting user usage:', error)
    return null
  }
}

/**
 * Check if user can use follow-up questions
 */
export async function canUseFollowUp(
  userId: string,
  analysisType: keyof PlanLimitations['followUpQuestions'],
  userPlan: PlanType
): Promise<UsageCheckResult> {
  const limitations = PLAN_LIMITATIONS[userPlan]
  const limit = limitations.followUpQuestions[analysisType]

  // Unlimited for enterprise
  if (limit === -1) {
    return { allowed: true, remaining: -1 }
  }

  // No access for this analysis type
  if (limit === 0) {
    return {
      allowed: false,
      remaining: 0,
      message: `Follow-up questions for ${analysisType} require a higher plan`
    }
  }

  const usage = await getUserCurrentUsage(userId)
  if (!usage) {
    // If we can't get usage data, err on the side of caution
    return {
      allowed: false,
      remaining: 0,
      message: 'Unable to verify usage limits'
    }
  }

  const usedKey = `followup_${analysisType}` as keyof UsageData
  const used = usage[usedKey] as number || 0

  if (used >= limit) {
    return {
      allowed: false,
      remaining: 0,
      message: `Daily limit of ${limit} follow-up questions reached for ${analysisType}`
    }
  }

  return {
    allowed: true,
    remaining: limit - used
  }
}

/**
 * Check if user can run analysis
 */
export async function canRunAnalysis(
  userId: string,
  userPlan: PlanType
): Promise<UsageCheckResult & { dailyRemaining: number; monthlyRemaining: number }> {
  const limitations = PLAN_LIMITATIONS[userPlan]
  const usage = await getUserCurrentUsage(userId)

  if (!usage) {
    return {
      allowed: false,
      dailyRemaining: 0,
      monthlyRemaining: 0,
      message: 'Unable to verify usage limits'
    }
  }

  // Check daily limit
  const dailyLimit = limitations.analysisFrequency.dailyLimit
  if (dailyLimit !== -1 && usage.analyses_today >= dailyLimit) {
    return {
      allowed: false,
      dailyRemaining: 0,
      monthlyRemaining: 0,
      message: `Daily analysis limit of ${dailyLimit} reached`
    }
  }

  // Check monthly limit (query monthly data)
  const monthlyLimit = limitations.analysisFrequency.monthlyLimit
  if (monthlyLimit !== -1) {
    const supabase = createServiceClient()
    const now = new Date()
    const { data: monthlyData } = await supabase
      .from('user_monthly_usage')
      .select('total_analyses')
      .eq('user_id', userId)
      .eq('year', now.getFullYear())
      .eq('month', now.getMonth() + 1)
      .single()

    const monthlyUsage = monthlyData?.total_analyses || 0
    if (monthlyUsage >= monthlyLimit) {
      return {
        allowed: false,
        dailyRemaining: dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - usage.analyses_today),
        monthlyRemaining: 0,
        message: `Monthly analysis limit of ${monthlyLimit} reached`
      }
    }
  }

  return {
    allowed: true,
    dailyRemaining: dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - usage.analyses_today),
    monthlyRemaining: monthlyLimit === -1 ? -1 : Math.max(0, monthlyLimit - (usage.analyses_today || 0))
  }
}

/**
 * Check rate limits
 */
export async function checkRateLimit(
  userId: string,
  userPlan: PlanType,
  ipAddress?: string,
  userAgent?: string
): Promise<UsageCheckResult> {
  const limitations = PLAN_LIMITATIONS[userPlan]
  const usage = await getUserCurrentUsage(userId)

  if (!usage) {
    return {
      allowed: false,
      message: 'Unable to verify rate limits'
    }
  }

  // Check hourly rate limit
  if (usage.questions_this_hour >= limitations.rateLimiting.questionsPerHour) {
    const now = new Date()
    const nextHour = new Date(now)
    nextHour.setHours(now.getHours() + 1, 0, 0, 0)
    const retryAfter = Math.ceil((nextHour.getTime() - now.getTime()) / 1000)

    // Log violation
    await logUsageViolation(userId, 'rate_limit', 'hourly', usage.questions_this_hour,
      limitations.rateLimiting.questionsPerHour, userPlan, ipAddress, userAgent)

    return {
      allowed: false,
      message: `Hourly rate limit exceeded (${limitations.rateLimiting.questionsPerHour} questions/hour)`,
      retryAfter
    }
  }

  // Check daily rate limit
  const dailyQuestions = usage.followups_today + usage.analyses_today
  if (dailyQuestions >= limitations.rateLimiting.questionsPerDay) {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const retryAfter = Math.ceil((tomorrow.getTime() - now.getTime()) / 1000)

    // Log violation
    await logUsageViolation(userId, 'rate_limit', 'daily', dailyQuestions,
      limitations.rateLimiting.questionsPerDay, userPlan, ipAddress, userAgent)

    return {
      allowed: false,
      message: `Daily rate limit exceeded (${limitations.rateLimiting.questionsPerDay} questions/day)`,
      retryAfter
    }
  }

  // Check cost threshold
  if (usage.cost_today >= limitations.rateLimiting.costAlertThreshold) {
    console.warn(`Cost alert: User ${userId} has reached $${usage.cost_today.toFixed(2)} in daily costs`)

    // For enterprise users, allow but log warning
    if (userPlan !== 'enterprise') {
      // Log violation
      await logUsageViolation(userId, 'cost_limit', 'daily', Math.round(usage.cost_today * 100),
        Math.round(limitations.rateLimiting.costAlertThreshold * 100), userPlan, ipAddress, userAgent)

      return {
        allowed: false,
        message: `Daily cost limit reached ($${limitations.rateLimiting.costAlertThreshold}). Please contact support.`
      }
    }
  }

  return { allowed: true, remaining: limitations.rateLimiting.questionsPerHour - usage.questions_this_hour }
}

/**
 * Increment usage tracking
 */
export async function incrementUsage(
  userId: string,
  usageType: 'analysis' | 'followup',
  analysisType: string,
  cost: number = 0.06
): Promise<void> {
  const supabase = createServiceClient()

  try {
    const { error } = await supabase
      .rpc('increment_usage', {
        p_user_id: userId,
        p_usage_type: usageType,
        p_analysis_type: analysisType,
        p_cost: cost
      })

    if (error) throw error
  } catch (error) {
    console.error('Error incrementing usage:', error)
    throw error
  }
}

/**
 * Log usage violations
 */
export async function logUsageViolation(
  userId: string,
  violationType: string,
  attemptedAction: string,
  currentUsage: number,
  limitValue: number,
  userPlan: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const supabase = createServiceClient()

  try {
    const { error } = await supabase
      .rpc('log_usage_violation', {
        p_user_id: userId,
        p_violation_type: violationType,
        p_attempted_action: attemptedAction,
        p_current_usage: currentUsage,
        p_limit_value: limitValue,
        p_user_plan: userPlan,
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      })

    if (error) throw error
  } catch (error) {
    console.error('Error logging usage violation:', error)
  }
}

/**
 * Get monthly usage statistics
 */
export async function getMonthlyUsage(userId: string, year?: number, month?: number): Promise<any> {
  const supabase = createServiceClient()
  const now = new Date()
  const targetYear = year || now.getFullYear()
  const targetMonth = month || (now.getMonth() + 1)

  try {
    const { data, error } = await supabase
      .from('user_monthly_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('year', targetYear)
      .eq('month', targetMonth)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"

    return data || {
      total_analyses: 0,
      total_followups: 0,
      total_cost: 0,
      business_analysis_count: 0,
      market_intelligence_count: 0,
      due_diligence_count: 0,
      buyer_match_count: 0
    }
  } catch (error) {
    console.error('Error getting monthly usage:', error)
    return null
  }
}

/**
 * Get usage history for charts/analytics
 */
export async function getUsageHistory(userId: string, days: number = 30): Promise<any[]> {
  const supabase = createServiceClient()
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    const { data, error } = await supabase
      .from('user_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting usage history:', error)
    return []
  }
}
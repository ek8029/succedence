/**
 * Security Middleware for Usage Validation
 * Prevents bypass of usage limits and ensures proper tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { checkRateLimit, canRunAnalysis, canUseFollowUp, logUsageViolation } from '@/lib/utils/database-usage-tracking'
import { PlanType } from '@/lib/types'

export interface SecurityCheckOptions {
  checkType: 'analysis' | 'followup' | 'rate_limit'
  analysisType?: string
  bypassDevMode?: boolean
}

export interface SecurityCheckResult {
  allowed: boolean
  user: any
  userId: string
  userPlan: PlanType
  error?: string
  retryAfter?: number
  remaining?: number
}

/**
 * Comprehensive security check for usage limits
 * This middleware ensures no bypassing of limitations
 */
export async function performSecurityCheck(
  request: NextRequest,
  options: SecurityCheckOptions
): Promise<SecurityCheckResult> {
  const { checkType, analysisType, bypassDevMode = false } = options

  try {
    // Get client IP and user agent for security logging
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create Supabase client with service role for security checks
    const supabase = createServiceClient()

    // Get authenticated user (CRITICAL: Always verify authentication)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Log potential bypass attempt
      console.warn('Unauthenticated usage attempt:', {
        ip: clientIP,
        userAgent,
        checkType,
        analysisType,
        timestamp: new Date().toISOString()
      })

      return {
        allowed: false,
        user: null,
        userId: '',
        userPlan: 'free',
        error: 'Authentication required'
      }
    }

    // Get user profile and plan (CRITICAL: Always verify from database)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan, created_at, updated_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile lookup failed for security check:', profileError)
      return {
        allowed: false,
        user,
        userId: user.id,
        userPlan: 'free',
        error: 'Unable to verify user plan'
      }
    }

    const userPlan = profile.plan as PlanType || 'free'

    // DEV BYPASS MODE (only for development)
    if (bypassDevMode && process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_AUTH === 'true') {
      console.warn('DEV BYPASS MODE ACTIVE - Security checks disabled')
      return {
        allowed: true,
        user,
        userId: user.id,
        userPlan,
        remaining: -1
      }
    }

    // Perform specific security checks based on type
    switch (checkType) {
      case 'rate_limit': {
        const rateLimitCheck = await checkRateLimit(user.id, userPlan, clientIP, userAgent)

        if (!rateLimitCheck.allowed) {
          // Additional security: Log repeated violations
          await logSecurityViolation(user.id, 'rate_limit_exceeded', {
            ip: clientIP,
            userAgent,
            currentUsage: 'unknown',
            limit: 'rate_limit',
            userPlan
          })
        }

        return {
          allowed: rateLimitCheck.allowed,
          user,
          userId: user.id,
          userPlan,
          error: rateLimitCheck.message,
          retryAfter: rateLimitCheck.retryAfter,
          remaining: rateLimitCheck.remaining
        }
      }

      case 'analysis': {
        const analysisCheck = await canRunAnalysis(user.id, userPlan)

        if (!analysisCheck.allowed) {
          await logSecurityViolation(user.id, 'analysis_limit_exceeded', {
            ip: clientIP,
            userAgent,
            currentUsage: 'unknown',
            limit: 'analysis',
            userPlan
          })
        }

        return {
          allowed: analysisCheck.allowed,
          user,
          userId: user.id,
          userPlan,
          error: analysisCheck.message,
          remaining: analysisCheck.dailyRemaining
        }
      }

      case 'followup': {
        if (!analysisType) {
          return {
            allowed: false,
            user,
            userId: user.id,
            userPlan,
            error: 'Analysis type required for follow-up check'
          }
        }

        const followupCheck = await canUseFollowUp(user.id, analysisType as any, userPlan)

        if (!followupCheck.allowed) {
          await logSecurityViolation(user.id, 'followup_limit_exceeded', {
            ip: clientIP,
            userAgent,
            currentUsage: 'unknown',
            limit: `followup_${analysisType}`,
            userPlan
          })
        }

        return {
          allowed: followupCheck.allowed,
          user,
          userId: user.id,
          userPlan,
          error: followupCheck.message,
          remaining: followupCheck.remaining
        }
      }

      default:
        return {
          allowed: false,
          user,
          userId: user.id,
          userPlan,
          error: 'Invalid security check type'
        }
    }

  } catch (error) {
    console.error('Security check failed:', error)
    return {
      allowed: false,
      user: null,
      userId: '',
      userPlan: 'free',
      error: 'Security check failed'
    }
  }
}

/**
 * Log security violations for monitoring and analysis
 */
async function logSecurityViolation(
  userId: string,
  violationType: string,
  details: {
    ip: string
    userAgent: string
    currentUsage: string
    limit: string
    userPlan: string
  }
): Promise<void> {
  try {
    const supabase = createServiceClient()

    // Log to database
    await supabase.from('usage_violations').insert({
      user_id: userId,
      violation_type: violationType,
      attempted_action: 'api_call',
      current_usage: 0, // Will be updated by the actual tracking
      limit_value: 0,
      user_plan: details.userPlan,
      ip_address: details.ip,
      user_agent: details.userAgent
    })

    // Also log to console for immediate monitoring
    console.warn('SECURITY VIOLATION:', {
      userId,
      violationType,
      ...details,
      timestamp: new Date().toISOString()
    })

    // In production, you might want to send alerts to monitoring services
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with monitoring service (e.g., Sentry, DataDog)
      // await sendSecurityAlert(violationType, userId, details)
    }

  } catch (error) {
    console.error('Failed to log security violation:', error)
  }
}

/**
 * Middleware wrapper for easy integration into API routes
 */
export function withUsageSecurity(
  handler: (req: NextRequest, securityResult: SecurityCheckResult) => Promise<NextResponse>,
  options: SecurityCheckOptions
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const securityResult = await performSecurityCheck(request, options)

    if (!securityResult.allowed) {
      return NextResponse.json(
        {
          error: securityResult.error || 'Access denied',
          retryAfter: securityResult.retryAfter,
          remaining: securityResult.remaining
        },
        {
          status: securityResult.error?.includes('Authentication') ? 401 : 429,
          headers: securityResult.retryAfter ? {
            'Retry-After': securityResult.retryAfter.toString()
          } : {}
        }
      )
    }

    return handler(request, securityResult)
  }
}

/**
 * Double-check security for critical operations
 * This provides an additional layer of validation
 */
export async function doubleCheckSecurity(
  userId: string,
  checkType: SecurityCheckOptions['checkType'],
  analysisType?: string
): Promise<boolean> {
  try {
    const supabase = createServiceClient()

    // Verify user still exists and is active
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !user) {
      console.error('Double-check: User not found or error:', userError)
      return false
    }

    // Re-verify plan limitations
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single()

    if (!profile) {
      console.error('Double-check: Profile not found')
      return false
    }

    const userPlan = profile.plan as PlanType || 'free'

    // Re-run the specific check
    switch (checkType) {
      case 'rate_limit':
        const rateLimitCheck = await checkRateLimit(userId, userPlan)
        return rateLimitCheck.allowed

      case 'analysis':
        const analysisCheck = await canRunAnalysis(userId, userPlan)
        return analysisCheck.allowed

      case 'followup':
        if (!analysisType) return false
        const followupCheck = await canUseFollowUp(userId, analysisType as any, userPlan)
        return followupCheck.allowed

      default:
        return false
    }

  } catch (error) {
    console.error('Double-check security failed:', error)
    return false
  }
}

/**
 * Security headers for API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}
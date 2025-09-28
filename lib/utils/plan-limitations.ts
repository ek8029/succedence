/**
 * Plan-Based Limitations for AI Features
 * Manages usage limits, follow-up questions, and feature access
 */

import { PlanType } from '@/lib/types'

export interface PlanLimitations {
  followUpQuestions: {
    businessAnalysis: number
    marketIntelligence: number
    dueDiligence: number
    buyerMatch: number
  }
  analysisFrequency: {
    dailyLimit: number
    monthlyLimit: number
  }
  rateLimiting: {
    questionsPerHour: number
    questionsPerDay: number
    costAlertThreshold: number // daily cost in USD
  }
  features: {
    customParameters: boolean
    exportReports: boolean
    prioritySupport: boolean
    advancedMetrics: boolean
    conversationalHistory: boolean
  }
}

export const PLAN_LIMITATIONS: Record<PlanType, PlanLimitations> = {
  beta: {
    followUpQuestions: {
      businessAnalysis: 5,
      marketIntelligence: 5,
      dueDiligence: 5,
      buyerMatch: 5
    },
    analysisFrequency: {
      dailyLimit: 20,
      monthlyLimit: 100
    },
    rateLimiting: {
      questionsPerHour: 10,
      questionsPerDay: 20,
      costAlertThreshold: 5.00
    },
    features: {
      customParameters: true,
      exportReports: true,
      prioritySupport: false,
      advancedMetrics: true,
      conversationalHistory: true
    }
  },
  free: {
    followUpQuestions: {
      businessAnalysis: 2,
      marketIntelligence: 0,
      dueDiligence: 0,
      buyerMatch: 0
    },
    analysisFrequency: {
      dailyLimit: 2,
      monthlyLimit: 10
    },
    rateLimiting: {
      questionsPerHour: 2,
      questionsPerDay: 2,
      costAlertThreshold: 0.50
    },
    features: {
      customParameters: false,
      exportReports: false,
      prioritySupport: false,
      advancedMetrics: false,
      conversationalHistory: false
    }
  },
  starter: {
    followUpQuestions: {
      businessAnalysis: 10,
      marketIntelligence: 10,
      dueDiligence: 10,
      buyerMatch: 10
    },
    analysisFrequency: {
      dailyLimit: 10,
      monthlyLimit: 50
    },
    rateLimiting: {
      questionsPerHour: 5,
      questionsPerDay: 10,
      costAlertThreshold: 2.00
    },
    features: {
      customParameters: true,
      exportReports: true,
      prioritySupport: false,
      advancedMetrics: false,
      conversationalHistory: true
    }
  },
  professional: {
    followUpQuestions: {
      businessAnalysis: 50,
      marketIntelligence: 50,
      dueDiligence: 50,
      buyerMatch: 50
    },
    analysisFrequency: {
      dailyLimit: 50,
      monthlyLimit: 500
    },
    rateLimiting: {
      questionsPerHour: 20,
      questionsPerDay: 50,
      costAlertThreshold: 10.00
    },
    features: {
      customParameters: true,
      exportReports: true,
      prioritySupport: true,
      advancedMetrics: true,
      conversationalHistory: true
    }
  },
  enterprise: {
    followUpQuestions: {
      businessAnalysis: -1, // unlimited
      marketIntelligence: -1,
      dueDiligence: -1,
      buyerMatch: -1
    },
    analysisFrequency: {
      dailyLimit: -1, // unlimited
      monthlyLimit: -1
    },
    rateLimiting: {
      questionsPerHour: 50, // still rate limited for cost control
      questionsPerDay: 200,
      costAlertThreshold: 50.00
    },
    features: {
      customParameters: true,
      exportReports: true,
      prioritySupport: true,
      advancedMetrics: true,
      conversationalHistory: true
    }
  }
}

interface UsageTracking {
  userId: string
  date: string
  followUpQuestions: {
    businessAnalysis: number
    marketIntelligence: number
    dueDiligence: number
    buyerMatch: number
  }
  analysisCount: number
  hourlyQuestions: Record<string, number> // hour:count
  dailyCost: number
}

// In-memory usage tracking (in production, this should use database)
const usageStore = new Map<string, UsageTracking>()

function getUserUsageKey(userId: string, date?: Date): string {
  const targetDate = date || new Date()
  return `${userId}:${targetDate.toISOString().split('T')[0]}`
}

function getMonthUsageKey(userId: string, date?: Date): string {
  const targetDate = date || new Date()
  return `${userId}:${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`
}

export function getUserUsage(userId: string, date?: Date): UsageTracking {
  const key = getUserUsageKey(userId, date)
  const existing = usageStore.get(key)

  if (existing) {
    return existing
  }

  const newUsage: UsageTracking = {
    userId,
    date: key.split(':')[1],
    followUpQuestions: {
      businessAnalysis: 0,
      marketIntelligence: 0,
      dueDiligence: 0,
      buyerMatch: 0
    },
    analysisCount: 0,
    hourlyQuestions: {},
    dailyCost: 0
  }

  usageStore.set(key, newUsage)
  return newUsage
}

export function canUseFollowUp(
  userId: string,
  analysisType: keyof PlanLimitations['followUpQuestions'],
  userPlan: PlanType
): { allowed: boolean; remaining: number; message?: string } {
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

  const usage = getUserUsage(userId)
  const used = usage.followUpQuestions[analysisType]

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

export function incrementFollowUpUsage(
  userId: string,
  analysisType: keyof PlanLimitations['followUpQuestions']
): void {
  const usage = getUserUsage(userId)
  usage.followUpQuestions[analysisType]++

  // Track hourly usage
  const currentHour = new Date().getHours().toString()
  usage.hourlyQuestions[currentHour] = (usage.hourlyQuestions[currentHour] || 0) + 1

  // Estimate cost (approximately $0.06 per follow-up question)
  usage.dailyCost += 0.06
}

export function canRunAnalysis(
  userId: string,
  userPlan: PlanType
): { allowed: boolean; dailyRemaining: number; monthlyRemaining: number; message?: string } {
  const limitations = PLAN_LIMITATIONS[userPlan]

  // Check daily limit
  const dailyUsage = getUserUsage(userId)
  const dailyLimit = limitations.analysisFrequency.dailyLimit

  if (dailyLimit !== -1 && dailyUsage.analysisCount >= dailyLimit) {
    return {
      allowed: false,
      dailyRemaining: 0,
      monthlyRemaining: 0,
      message: `Daily analysis limit of ${dailyLimit} reached`
    }
  }

  // Check monthly limit
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  let monthlyUsage = 0
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const dayUsage = getUserUsage(userId, d)
    monthlyUsage += dayUsage.analysisCount
  }

  const monthlyLimit = limitations.analysisFrequency.monthlyLimit
  if (monthlyLimit !== -1 && monthlyUsage >= monthlyLimit) {
    return {
      allowed: false,
      dailyRemaining: dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - dailyUsage.analysisCount),
      monthlyRemaining: 0,
      message: `Monthly analysis limit of ${monthlyLimit} reached`
    }
  }

  return {
    allowed: true,
    dailyRemaining: dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - dailyUsage.analysisCount),
    monthlyRemaining: monthlyLimit === -1 ? -1 : Math.max(0, monthlyLimit - monthlyUsage)
  }
}

export function incrementAnalysisUsage(userId: string): void {
  const usage = getUserUsage(userId)
  usage.analysisCount++
}

export function hasFeatureAccess(
  userPlan: PlanType,
  feature: keyof PlanLimitations['features']
): boolean {
  return PLAN_LIMITATIONS[userPlan].features[feature]
}

export function checkRateLimit(
  userId: string,
  userPlan: PlanType
): { allowed: boolean; message?: string; retryAfter?: number } {
  const limitations = PLAN_LIMITATIONS[userPlan]
  const usage = getUserUsage(userId)
  const now = new Date()
  const currentHour = now.getHours().toString()

  // Check hourly rate limit
  const hourlyUsage = usage.hourlyQuestions[currentHour] || 0
  if (hourlyUsage >= limitations.rateLimiting.questionsPerHour) {
    const nextHour = new Date(now)
    nextHour.setHours(now.getHours() + 1, 0, 0, 0)
    const retryAfter = Math.ceil((nextHour.getTime() - now.getTime()) / 1000)

    return {
      allowed: false,
      message: `Hourly rate limit exceeded (${limitations.rateLimiting.questionsPerHour} questions/hour)`,
      retryAfter
    }
  }

  // Check daily rate limit
  const dailyUsage = Object.values(usage.hourlyQuestions).reduce((sum, count) => sum + count, 0)
  if (dailyUsage >= limitations.rateLimiting.questionsPerDay) {
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const retryAfter = Math.ceil((tomorrow.getTime() - now.getTime()) / 1000)

    return {
      allowed: false,
      message: `Daily rate limit exceeded (${limitations.rateLimiting.questionsPerDay} questions/day)`,
      retryAfter
    }
  }

  // Check cost threshold
  if (usage.dailyCost >= limitations.rateLimiting.costAlertThreshold) {
    console.warn(`Cost alert: User ${userId} has reached $${usage.dailyCost.toFixed(2)} in daily costs`)

    // For enterprise users, allow but log warning
    if (userPlan !== 'enterprise') {
      return {
        allowed: false,
        message: `Daily cost limit reached ($${limitations.rateLimiting.costAlertThreshold}). Please contact support.`
      }
    }
  }

  return { allowed: true }
}

export function getPlanUpgradeMessage(
  currentPlan: PlanType,
  feature: string
): string {
  const upgrades = {
    free: 'starter',
    starter: 'professional',
    professional: 'enterprise'
  }

  const nextPlan = upgrades[currentPlan as keyof typeof upgrades]

  return nextPlan
    ? `Upgrade to ${nextPlan} plan to access ${feature}`
    : `This feature requires a higher plan`
}

// Clean up old usage data (keep last 90 days)
setInterval(() => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 90)
  const cutoffString = cutoffDate.toISOString().split('T')[0]

  for (const [key, _] of usageStore.entries()) {
    const [_, dateStr] = key.split(':')
    if (dateStr < cutoffString) {
      usageStore.delete(key)
    }
  }
}, 24 * 60 * 60 * 1000) // Clean daily

export function getUsageStore() {
  return usageStore
}
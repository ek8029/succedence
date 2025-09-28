import { PlanType, SUBSCRIPTION_PLANS, PlanFeatures } from './types'

// Check if user has access to specific AI features
export function hasAIFeatureAccess(
  userPlan: PlanType,
  feature: keyof PlanFeatures['aiFeatures'],
  userRole?: string
): boolean {
  // Admin users have access to everything (including hardcoded admin)
  if (userRole === 'admin' || userPlan === 'enterprise') {
    return true
  }

  const plan = SUBSCRIPTION_PLANS[userPlan]
  if (!plan) return false

  // For boolean features, check directly
  if (typeof plan.aiFeatures[feature] === 'boolean') {
    return plan.aiFeatures[feature] as boolean
  }

  return false
}

// Check if user has remaining AI analyses for the month
export function hasRemainingAnalyses(
  userPlan: PlanType,
  usedThisMonth: number = 0,
  userRole?: string
): boolean {
  // Admin users have unlimited access
  if (userRole === 'admin') return true

  const plan = SUBSCRIPTION_PLANS[userPlan]
  if (!plan) return false

  const maxAllowed = plan.aiFeatures.maxAnalysesPerMonth

  // -1 means unlimited
  if (maxAllowed === -1) return true

  // Check if user has remaining analyses
  return usedThisMonth < maxAllowed
}

// Get the minimum plan required for a feature
export function getMinimumPlanForFeature(
  feature: keyof PlanFeatures['aiFeatures']
): PlanType | null {
  const planTypes: PlanType[] = ['free', 'starter', 'professional', 'enterprise']

  for (const planType of planTypes) {
    const plan = SUBSCRIPTION_PLANS[planType]
    if (plan.aiFeatures[feature]) {
      return planType
    }
  }

  return null
}

// Get plan details
export function getPlanDetails(planType: PlanType): PlanFeatures {
  return SUBSCRIPTION_PLANS[planType]
}

// Get upgrade suggestions
export function getUpgradeSuggestions(
  currentPlan: PlanType,
  requiredFeature: keyof PlanFeatures['aiFeatures']
): PlanType[] {
  const planTypes: PlanType[] = ['starter', 'professional', 'enterprise']
  const currentPlanIndex = planTypes.indexOf(currentPlan)

  return planTypes
    .slice(currentPlanIndex + 1)
    .filter(planType => hasAIFeatureAccess(planType, requiredFeature))
}

// Check if user is admin and should bypass all paywalls
export function isAdminUser(userRole?: string): boolean {
  return userRole === 'admin'
}

// Check if user has access to any feature (admin bypass)
export function hasFeatureAccess(userPlan: PlanType, userRole?: string): boolean {
  // Admin users bypass all restrictions
  if (isAdminUser(userRole)) return true

  // Non-free users have basic access
  return userPlan !== 'free'
}

// Format price for display
export function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return `$${price.toFixed(2)}/month`
}
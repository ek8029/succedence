'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PlanType } from '@/lib/types'
import { PLAN_LIMITATIONS } from '@/lib/utils/plan-limitations'

interface UsageData {
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
  monthly_analyses: number
  monthly_followups: number
  monthly_cost: number
}

interface UsageHistory {
  date: string
  total_analyses: number
  total_followups: number
  daily_cost: number
}

export default function UsageDashboard() {
  const { user } = useAuth()
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userPlan = (user?.plan as PlanType) || 'free'
  const planLimits = PLAN_LIMITATIONS[userPlan]

  useEffect(() => {
    if (user?.id) {
      fetchUsageData()
    }
  }, [user?.id])

  const fetchUsageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/usage/current', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const data = await response.json()
      setUsageData(data.current)
      setUsageHistory(data.history || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data')
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0 // Unlimited
    if (limit === 0) return 100 // No access
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-400 bg-red-900/20 border-red-400/30'
    if (percentage >= 70) return 'text-orange-400 bg-orange-900/20 border-orange-400/30'
    if (percentage >= 50) return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30'
    return 'text-green-400 bg-green-900/20 border-green-400/30'
  }

  const formatLimit = (limit: number): string => {
    if (limit === -1) return 'Unlimited'
    if (limit === 0) return 'Not Available'
    return limit.toString()
  }

  const getPlanColor = (plan: PlanType): string => {
    switch (plan) {
      case 'free': return 'text-gray-400 border-gray-400/20'
      case 'starter': return 'text-blue-400 border-blue-400/20'
      case 'professional': return 'text-purple-400 border-purple-400/20'
      case 'enterprise': return 'text-gold border-gold/20'
      default: return 'text-gray-400 border-gray-400/20'
    }
  }

  if (!user?.id) {
    return (
      <div className="p-6 bg-charcoal/20 rounded-luxury border border-purple-400/20">
        <p className="text-silver">Please sign in to view your usage dashboard.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 bg-charcoal/20 rounded-luxury border border-purple-400/20">
        <div className="animate-pulse">
          <div className="h-4 bg-charcoal/50 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-charcoal/50 rounded"></div>
            <div className="h-20 bg-charcoal/50 rounded"></div>
            <div className="h-20 bg-charcoal/50 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 rounded-luxury border border-red-400/20">
        <p className="text-red-400">Error loading usage data: {error}</p>
        <button
          onClick={fetchUsageData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <div className={`p-6 rounded-luxury border ${getPlanColor(userPlan)} bg-charcoal/10`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-serif capitalize">{userPlan} Plan</h2>
            <p className="text-silver/70 text-sm">Current subscription tier</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-silver/70">Daily Cost</p>
            <p className="text-lg font-bold">${usageData?.cost_today.toFixed(2) || '0.00'}</p>
            <p className="text-xs text-silver/50">
              Limit: ${planLimits.rateLimiting.costAlertThreshold.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Analyses Today */}
        <div className="p-4 bg-charcoal/20 rounded-luxury border border-purple-400/20">
          <h3 className="text-sm font-medium text-purple-400 mb-2">Analyses Today</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-warm-white">
              {usageData?.analyses_today || 0}
            </span>
            <span className="text-sm text-silver/70">
              / {formatLimit(planLimits.analysisFrequency.dailyLimit)}
            </span>
          </div>
          {planLimits.analysisFrequency.dailyLimit > 0 && (
            <div className="mt-2 w-full bg-charcoal/50 rounded-full h-2">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getUsagePercentage(usageData?.analyses_today || 0, planLimits.analysisFrequency.dailyLimit)}%`
                }}
              />
            </div>
          )}
        </div>

        {/* Follow-ups Today */}
        <div className="p-4 bg-charcoal/20 rounded-luxury border border-blue-400/20">
          <h3 className="text-sm font-medium text-blue-400 mb-2">Follow-ups Today</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-warm-white">
              {usageData?.followups_today || 0}
            </span>
            <span className="text-sm text-silver/70">Total</span>
          </div>
        </div>

        {/* Questions This Hour */}
        <div className="p-4 bg-charcoal/20 rounded-luxury border border-green-400/20">
          <h3 className="text-sm font-medium text-green-400 mb-2">Questions This Hour</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-warm-white">
              {usageData?.questions_this_hour || 0}
            </span>
            <span className="text-sm text-silver/70">
              / {planLimits.rateLimiting.questionsPerHour}
            </span>
          </div>
          <div className="mt-2 w-full bg-charcoal/50 rounded-full h-2">
            <div
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${getUsagePercentage(usageData?.questions_this_hour || 0, planLimits.rateLimiting.questionsPerHour)}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Follow-up Questions by Type */}
      <div className="p-6 bg-charcoal/20 rounded-luxury border border-purple-400/20">
        <h3 className="text-lg font-serif text-purple-400 mb-4">Follow-up Questions by Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(planLimits.followUpQuestions).map(([type, limit]) => {
            const used = usageData?.[`followup_${type}` as keyof UsageData] as number || 0
            const percentage = getUsagePercentage(used, limit)
            const colorClass = getUsageColor(percentage)

            return (
              <div key={type} className={`p-3 rounded border ${colorClass}`}>
                <h4 className="text-sm font-medium capitalize mb-1">
                  {type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">{used}</span>
                  <span>/ {formatLimit(limit)}</span>
                </div>
                {limit > 0 && (
                  <div className="mt-2 w-full bg-charcoal/50 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: 'currentColor'
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Analysis Types Usage */}
      <div className="p-6 bg-charcoal/20 rounded-luxury border border-purple-400/20">
        <h3 className="text-lg font-serif text-purple-400 mb-4">Analysis Usage Today</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'business_analysis', label: 'Business Analysis', used: usageData?.business_analysis_count || 0 },
            { type: 'market_intelligence', label: 'Market Intelligence', used: usageData?.market_intelligence_count || 0 },
            { type: 'due_diligence', label: 'Due Diligence', used: usageData?.due_diligence_count || 0 },
            { type: 'buyer_match', label: 'Buyer Match', used: usageData?.buyer_match_count || 0 }
          ].map(({ type, label, used }) => (
            <div key={type} className="p-3 bg-charcoal/30 rounded border border-silver/20">
              <h4 className="text-sm font-medium text-silver mb-1">{label}</h4>
              <span className="text-xl font-bold text-warm-white">{used}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Features */}
      <div className="p-6 bg-charcoal/20 rounded-luxury border border-purple-400/20">
        <h3 className="text-lg font-serif text-purple-400 mb-4">Plan Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(planLimits.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center justify-between p-3 bg-charcoal/30 rounded">
              <span className="text-sm capitalize text-silver">
                {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <span className={`text-sm font-medium ${enabled ? 'text-green-400' : 'text-red-400'}`}>
                {enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage History Chart (simplified) */}
      {usageHistory.length > 0 && (
        <div className="p-6 bg-charcoal/20 rounded-luxury border border-purple-400/20">
          <h3 className="text-lg font-serif text-purple-400 mb-4">Usage History (Last 7 Days)</h3>
          <div className="grid grid-cols-7 gap-2">
            {usageHistory.slice(-7).map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-silver/70 mb-1">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="bg-charcoal/50 rounded p-2">
                  <div className="text-sm font-bold text-warm-white">{day.total_analyses}</div>
                  <div className="text-xs text-silver/70">analyses</div>
                  <div className="text-xs text-purple-400">${day.daily_cost.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {userPlan !== 'enterprise' && (
        <div className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-luxury border border-purple-400/20">
          <h3 className="text-lg font-serif text-purple-400 mb-2">Need More Usage?</h3>
          <p className="text-silver/70 mb-4">
            Upgrade your plan for higher limits, more features, and priority support.
          </p>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-luxury hover:bg-purple-500 transition-colors">
            Upgrade Plan
          </button>
        </div>
      )}
    </div>
  )
}
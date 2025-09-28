'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PlanType } from '@/lib/types'

interface AnalysisVerificationProps {
  onConfirm: () => void
  onCancel: () => void
  analysisType: string
  listingTitle: string
}

interface UsageData {
  remaining: number
  total: number
  resetDate: string
}

export default function AnalysisVerification({
  onConfirm,
  onCancel,
  analysisType,
  listingTitle
}: AnalysisVerificationProps) {
  const { user } = useAuth()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const userPlan = (user?.plan as PlanType) || 'free'

  useEffect(() => {
    fetchUsageData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsageData = async () => {
    try {
      const response = await fetch('/api/usage/analysis-quota')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error)
      // Fallback data based on plan
      const planLimits = {
        free: 2,
        starter: 10,
        professional: 50,
        enterprise: 200
      }
      setUsage({
        remaining: planLimits[userPlan] || 2,
        total: planLimits[userPlan] || 2,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'business_analysis':
        return 'Business Analysis'
      case 'market_intelligence':
        return 'Market Intelligence'
      case 'due_diligence':
        return 'Due Diligence'
      case 'buyer_match':
        return 'Buyer Matching'
      default:
        return 'AI Analysis'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'text-silver'
      case 'starter':
        return 'text-blue-400'
      case 'professional':
        return 'text-purple-400'
      case 'enterprise':
        return 'text-gold'
      default:
        return 'text-silver'
    }
  }

  const formatResetDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass p-6 rounded-luxury-lg border border-gold/20 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin text-gold"></div>
            <span className="ml-3 text-warm-white">Loading usage data...</span>
          </div>
        </div>
      </div>
    )
  }

  const canProceed = usage && usage.remaining > 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass p-6 rounded-luxury-lg border border-gold/20 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-warm-white font-serif mb-2">
            Confirm Analysis
          </h3>
          <p className="text-silver/80 text-sm">
            You&apos;re about to run {getAnalysisTypeLabel(analysisType)} for:
          </p>
          <p className="text-warm-white font-medium mt-1 truncate">
            {listingTitle}
          </p>
        </div>

        {/* Usage Information */}
        <div className="bg-navy/30 rounded-luxury p-4 mb-6 border border-gold/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-silver/70 text-sm">Current Plan:</span>
            <span className={`font-medium capitalize ${getPlanColor(userPlan)}`}>
              {userPlan}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-silver/70 text-sm">Analyses Remaining:</span>
            <span className={`font-bold text-lg ${canProceed ? 'text-green-400' : 'text-red-400'}`}>
              {usage?.remaining || 0} / {usage?.total || 0}
            </span>
          </div>

          {usage && (
            <div className="flex items-center justify-between">
              <span className="text-silver/70 text-sm">Resets:</span>
              <span className="text-silver text-sm">
                {formatResetDate(usage.resetDate)}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {usage && (
            <div className="mt-3">
              <div className="w-full bg-charcoal/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    canProceed
                      ? 'bg-gradient-to-r from-green-500 to-green-400'
                      : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${Math.max((usage.remaining / usage.total) * 100, 5)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Warning for low usage */}
        {usage && usage.remaining <= 1 && usage.remaining > 0 && (
          <div className="bg-amber-900/20 border border-amber-400/30 rounded-luxury p-3 mb-4">
            <div className="flex items-center">
              <span className="text-amber-400 mr-2">⚠️</span>
              <span className="text-amber-300 text-sm">
                This is your last analysis for this month. Consider upgrading for more.
              </span>
            </div>
          </div>
        )}

        {/* No analyses left */}
        {!canProceed && (
          <div className="bg-red-900/20 border border-red-400/30 rounded-luxury p-3 mb-4">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">🚫</span>
              <span className="text-red-300 text-sm">
                You&apos;ve reached your monthly analysis limit. Upgrade your plan to continue.
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-charcoal/50 border border-silver/20 text-silver hover:bg-charcoal/70 hover:border-silver/40 rounded-luxury transition-all duration-300"
          >
            Cancel
          </button>

          {canProceed ? (
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300"
            >
              Start Analysis
            </button>
          ) : (
            <button
              onClick={() => window.open('/pricing', '_blank')}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium rounded-luxury hover:from-purple-700 hover:to-purple-600 transition-all duration-300"
            >
              Upgrade Plan
            </button>
          )}
        </div>

        {/* Analysis Info */}
        <div className="mt-4 pt-4 border-t border-gold/10">
          <p className="text-silver/60 text-xs text-center leading-relaxed">
            <strong className="text-gold">Note:</strong> Analysis runs in the background and continues even if you navigate away or close the tab.
          </p>
        </div>
      </div>
    </div>
  )
}
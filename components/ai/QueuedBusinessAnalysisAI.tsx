'use client'

import React, { useEffect, useState } from 'react'
import { useAnalysis } from '@/hooks/useAnalysis'
import { hasAIFeatureAccess } from '@/lib/subscription'
import { PlanType } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade'
import AnalysisVerification from './AnalysisVerification'

interface QueuedBusinessAnalysisAIProps {
  listingId: string
  listingTitle: string
}

export default function QueuedBusinessAnalysisAI({
  listingId,
  listingTitle
}: QueuedBusinessAnalysisAIProps) {
  const { user } = useAuth()
  const { job, isLoading, error, start, attach, cancel, clear } = useAnalysis()
  const [showVerification, setShowVerification] = useState(false)

  // Check access with fallback for temporary auth loss
  const userPlan = (user?.plan as PlanType) || 'free'
  const hasAccess = hasAIFeatureAccess(userPlan, 'businessAnalysis', user?.role)

  // If there's an active analysis job, allow it to continue even if auth is temporarily lost
  const shouldShowAnalysis = hasAccess || (job && ['running', 'succeeded'].includes(job.status))

  // Auto-attach on mount to resume any in-progress analysis
  useEffect(() => {
    attach(listingId, 'business_analysis')
  }, [listingId, attach])

  // Cleanup on unmount
  useEffect(() => {
    return () => clear()
  }, [clear])

  const handleStartAnalysis = async () => {
    setShowVerification(true)
  }

  const handleConfirmAnalysis = async () => {
    setShowVerification(false)
    await start(listingId, 'business_analysis', {
      perspective: 'business_focused',
      focusAreas: ['financial_metrics', 'operational_efficiency']
    })
  }

  const handleCancelVerification = () => {
    setShowVerification(false)
  }

  const handleCancel = async () => {
    await cancel()
  }

  if (!shouldShowAnalysis) {
    return (
      <SubscriptionUpgrade
        currentPlan={userPlan}
        requiredFeature="businessAnalysis"
        featureName="Business Analysis"
        featureDescription="Get comprehensive AI-powered business analysis with financial metrics, operational insights, and strategic recommendations."
      />
    )
  }

  const analysis = job?.result
  const isProcessing = isLoading || (job && ['queued', 'running'].includes(job.status))

  return (
    <div className="glass p-6 rounded-luxury-lg border border-gold/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-warm-white font-serif">
          Business Analysis
        </h3>

        {!analysis && !isProcessing && hasAccess && (
          <button
            onClick={handleStartAnalysis}
            className="px-4 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-sm"
          >
            Analyze Business
          </button>
        )}

        {!hasAccess && job && (
          <div className="text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded border border-amber-400/30">
            ⚠️ Session refreshing - analysis continuing
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin text-gold"></div>
              <span className="text-gold text-sm">
                {job?.partialOutput || 'Processing...'}
              </span>
            </div>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs border border-red-400/30 text-red-400 hover:bg-red-400/10 rounded transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {job && isProcessing && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-silver/70 mb-1">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <div className="w-full bg-charcoal/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-gold to-amber-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-400/30 rounded-luxury text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Job status info for debugging */}
      {job && process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-charcoal/30 rounded border border-silver/10 text-xs text-silver/70">
          <div>Job ID: {job.id}</div>
          <div>Status: {job.status}</div>
          <div>Progress: {job.progress}%</div>
          {job.partialOutput && <div>Current: {job.partialOutput}</div>}
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <div className="space-y-6">
          {/* Financial Highlights */}
          {analysis.financial && (
            <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3 font-serif">
                Financial Analysis
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {analysis.financial.revenue && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">
                      ${analysis.financial.revenue.amount?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-silver/70">Annual Revenue</div>
                  </div>
                )}
                {analysis.financial.profitability && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">
                      {analysis.financial.profitability.margin || 'N/A'}%
                    </div>
                    <div className="text-xs text-silver/70">Profit Margin</div>
                  </div>
                )}
                {analysis.financial.growth && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300">
                      {analysis.financial.growth.rate || 'N/A'}%
                    </div>
                    <div className="text-xs text-silver/70">Growth Rate</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {analysis.risks && analysis.risks.length > 0 && (
            <div className="p-4 bg-red-900/10 rounded-luxury border border-red-400/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3 font-serif">
                Risk Assessment
              </h4>
              <div className="space-y-2">
                {analysis.risks.slice(0, 3).map((risk: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-silver/90 text-sm">{risk.factor || risk.description}</span>
                    <span className="text-xs px-2 py-1 rounded bg-red-900/30 text-red-300">
                      {risk.likelihood || risk.severity || 'Medium'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          {analysis.insights && analysis.insights.length > 0 && (
            <div className="p-4 bg-blue-900/10 rounded-luxury border border-blue-400/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-3 font-serif">
                Key Insights
              </h4>
              <ul className="space-y-2">
                {analysis.insights.slice(0, 4).map((insight: any, index: number) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {insight.insight || insight.description || insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center pt-4 border-t border-gold/10">
            <button
              onClick={handleStartAnalysis}
              className="px-6 py-2 bg-transparent border-2 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-sm"
            >
              Refresh Analysis
            </button>
          </div>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="mt-6 p-4 bg-navy/20 rounded-luxury border border-gold/10">
        <p className="text-silver/70 text-xs leading-relaxed">
          <strong className="text-gold">AI Disclaimer:</strong> This analysis uses AI-powered
          tools that run in the background. You can safely switch tabs or refresh the page -
          your analysis will continue and resume when you return.
        </p>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <AnalysisVerification
          onConfirm={handleConfirmAnalysis}
          onCancel={handleCancelVerification}
          analysisType="business_analysis"
          listingTitle={listingTitle}
        />
      )}
    </div>
  )
}
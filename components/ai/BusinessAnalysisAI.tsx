'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SuperEnhancedBusinessAnalysis, SuperConfidenceScore, SuperRiskFactor, SuperInsight } from '@/lib/ai/super-enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { useVisibilityProtectedRequest } from '@/lib/utils/page-visibility';
import { useResilientFetch } from '@/lib/utils/resilient-fetch';
import ConversationalChatbox from './ConversationalChatbox';

interface BusinessAnalysisAIProps {
  listingId: string;
  listingTitle: string;
}

export default function BusinessAnalysisAI({ listingId, listingTitle }: BusinessAnalysisAIProps) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<SuperEnhancedBusinessAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedForExisting, setHasCheckedForExisting] = useState(false);
  const analysisInProgressRef = useRef(false);

  // Hook for protecting requests from tab visibility issues
  const { protectRequest } = useVisibilityProtectedRequest();
  const { fetchWithRetry } = useResilientFetch();

  // Check if user has access to business analysis feature
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'businessAnalysis', user?.role);

  // Fetch existing analysis on component mount
  const fetchExistingAnalysis = useCallback(async () => {
    if (!user || hasCheckedForExisting) return;

    try {
      const response = await fetchWithRetry(`/api/ai/history?analysisType=business_analysis&listingId=${listingId}&limit=1&page=1`, {
        maxRetries: 3,
        retryDelay: 1000
      }, `business-analysis-history-${listingId}`);
      const data = await response.json();

      if (data.success && data.aiHistory && data.aiHistory.length > 0) {
        // Since API now filters by listingId, take the first (and only) result
        const existingAnalysis = data.aiHistory[0];
        if (existingAnalysis && existingAnalysis.analysis_data) {
          setAnalysis(existingAnalysis.analysis_data);
        }
      }
    } catch (err) {
      console.error('Error fetching existing business analysis:', err);
    } finally {
      setHasCheckedForExisting(true);
    }
  }, [user, hasCheckedForExisting, listingId, fetchWithRetry]);

  // Removed problematic tab visibility logic that caused infinite loading

  // Check for existing analysis on mount
  useEffect(() => {
    if (user && !analysis && !hasCheckedForExisting) {
      fetchExistingAnalysis();
    }
  }, [user, listingId, analysis, hasCheckedForExisting, fetchExistingAnalysis]);


  const handleAnalyzeClick = async () => {
    setIsLoading(true);
    setError(null);
    analysisInProgressRef.current = true;

    try {
      // Start server-side analysis that continues even if tab is switched
      const startResponse = await fetch('/api/ai/run-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          listingId,
          analysisType: 'business_analysis'
        }),
      });

      const startData = await startResponse.json();

      if (!startResponse.ok) {
        throw new Error(startData.error || 'Failed to start analysis');
      }

      // Poll for completion - this works even if user switches tabs
      const pollForResult = async (): Promise<any> => {
        while (analysisInProgressRef.current) {
          try {
            const statusResponse = await fetch(
              `/api/ai/run-analysis?listingId=${listingId}&analysisType=business_analysis`,
              { credentials: 'include' }
            );
            const statusData = await statusResponse.json();

            if (statusData.status === 'completed' && statusData.result) {
              return statusData.result;
            } else if (statusData.status === 'error') {
              throw new Error(statusData.error || 'Analysis failed');
            }
            // Still processing, wait and try again
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (pollError) {
            console.warn('Poll error, retrying:', pollError);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
        throw new Error('Analysis cancelled');
      };

      const result = await pollForResult();
      setAnalysis(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze business');
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
    }
  };


  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy':
        return 'text-green-400 bg-green-900/20 border-green-400/30';
      case 'buy':
        return 'text-green-300 bg-green-900/10 border-green-400/20';
      case 'hold':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
      case 'avoid':
        return 'text-red-400 bg-red-900/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  const formatRecommendation = (recommendation: string) => {
    return recommendation ? recommendation.replace('_', ' ').toUpperCase() : 'ANALYZING';
  };

  const getConfidenceColor = (confidence: SuperConfidenceScore | undefined | null) => {
    if (!confidence || typeof confidence.score !== 'number') return 'text-gray-400';
    if (confidence.score >= 80) return 'text-green-400';
    if (confidence.score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRiskSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-900/20 border-green-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-400/30';
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  // Show upgrade prompt if user doesn't have access
  if (!hasAccess) {
    return (
      <SubscriptionUpgrade
        currentPlan={userPlan}
        requiredFeature="businessAnalysis"
        featureName="AI Business Analysis"
        featureDescription="Get comprehensive AI-powered analysis of business opportunities including scoring, strengths, weaknesses, risks, and growth opportunities."
      />
    );
  }

  return (
    <div className="glass p-6 rounded-luxury-lg border border-gold/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-warm-white font-serif">
          AI Business Analysis
        </h3>
        {!analysis && (
          <button
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            className="px-4 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              'Analyze Business'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-400/30 rounded-luxury text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Overall Score & Recommendation with Confidence */}
          <div className="flex items-center justify-between p-4 bg-charcoal/50 rounded-luxury border border-gold/10">
            <div>
              <div className="text-3xl font-bold text-gold font-mono mb-1">
                {analysis.overallScore}/100
              </div>
              <div className="text-sm text-silver/80">Overall Score</div>
              {analysis.overallScoreConfidence && (
                <div className={`text-xs mt-1 ${getConfidenceColor(analysis.overallScoreConfidence)}`}>
                  {analysis.overallScoreConfidence.score}% confident • {analysis.overallScoreConfidence.methodology}
                </div>
              )}
            </div>
            <div className={`px-4 py-2 rounded-luxury border-2 font-semibold text-sm ${getRecommendationColor(analysis.recommendation)}`}>
              {formatRecommendation(analysis.recommendation)}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 bg-navy/30 rounded-luxury border border-gold/10">
            <h4 className="text-lg font-semibold text-warm-white mb-2 font-serif">Executive Summary</h4>
            <p className="text-silver/90 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Super Enhanced Insights Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths with Enhanced Confidence */}
            <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Strengths
              </h4>
              <ul className="space-y-3">
                {(analysis.strengths || []).map((strength, index) => (
                  <li key={index} className="text-silver/90 text-sm border-l-2 border-green-400/30 pl-3">
                    <div className="flex items-start justify-between mb-1">
                      <span className="flex-1 font-medium">{strength?.insight || 'Analyzing...'}</span>
                      {strength?.confidence?.score && (
                        <span className={`text-xs ml-2 px-2 py-1 rounded ${getConfidenceColor(strength.confidence)}`}>
                          {strength.confidence.score}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-silver/70 mb-2">{strength?.actionable || ''}</div>
                    <div className="text-xs text-green-300/60">
                      Probability: {strength?.probability || 0}% • Timeframe: {strength?.timeframe || 'TBD'}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Risk Matrix */}
            <div className="p-4 bg-red-900/10 rounded-luxury border border-red-400/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Risk Assessment
              </h4>
              <div className="space-y-3">
                {(analysis.riskMatrix || []).map((risk, index) => (
                  <div key={index} className={`p-3 rounded-luxury border ${risk?.severity ? getRiskSeverityColor(risk.severity) : 'border-gray-400/30'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{risk?.factor || 'Risk factor'}</span>
                      {risk?.severity && (
                        <span className="text-xs uppercase font-bold">{risk.severity}</span>
                      )}
                    </div>
                    {risk?.description && (
                      <div className="text-xs opacity-90 mb-2">{risk.description}</div>
                    )}
                    {(risk?.likelihood || risk?.impact || risk?.riskScore) && (
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <span>Likelihood: {Math.min(Math.max(risk?.likelihood || 0, 0), 10)}/10</span>
                        <span>Impact: {Math.min(Math.max(risk?.impact || 0, 0), 10)}/10</span>
                        <span>Score: {Math.min(Math.max(risk?.riskScore || 0, 0), 100)}</span>
                      </div>
                    )}
                    {risk?.mitigationStrategies && risk.mitigationStrategies.length > 0 && (
                      <div className="text-xs">
                        <span className="font-medium">Mitigation:</span> {risk.mitigationStrategies[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Dynamics Analysis */}
          {analysis.marketDynamics && (
            <div className="p-4 bg-blue-900/10 rounded-luxury border border-blue-400/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Market Dynamics
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-blue-300 mb-2">Market Size & Growth</h5>
                  {analysis.marketDynamics?.marketSize?.insight && (
                    <p className="text-sm text-silver/90 mb-1">{analysis.marketDynamics.marketSize.insight}</p>
                  )}
                  {analysis.marketDynamics?.growthProjections?.insight && (
                    <p className="text-sm text-silver/90">{analysis.marketDynamics.growthProjections.insight}</p>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-blue-300 mb-2">Industry Trends</h5>
                  <ul className="space-y-1">
                    {(analysis.marketDynamics?.industryTrends || []).slice(0, 3).map((trend, index) => (
                      <li key={index} className="text-sm text-silver/90 flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        {trend?.insight || ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Financial Projections */}
          {analysis.financialProjections && (
            <div className="p-4 bg-purple-900/10 rounded-luxury border border-purple-400/20">
              <h4 className="text-lg font-semibold text-purple-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Financial Projections
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-purple-300 mb-2">Revenue & Profitability</h5>
                  {analysis.financialProjections?.revenueGrowth?.insight && (
                    <p className="text-sm text-silver/90 mb-2">{analysis.financialProjections.revenueGrowth.insight}</p>
                  )}
                  {analysis.financialProjections?.profitabilityTrends?.insight && (
                    <p className="text-sm text-silver/90">{analysis.financialProjections.profitabilityTrends.insight}</p>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-purple-300 mb-2">Cash Flow & Valuation</h5>
                  {analysis.financialProjections?.cashFlowAnalysis?.insight && (
                    <p className="text-sm text-silver/90 mb-2">{analysis.financialProjections.cashFlowAnalysis.insight}</p>
                  )}
                  {analysis.financialProjections?.valuationMultiples?.insight && (
                    <p className="text-sm text-silver/90">{analysis.financialProjections.valuationMultiples.insight}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Strategic Fit Assessment */}
          {analysis.strategicFit && (
            <div className="p-4 bg-indigo-900/10 rounded-luxury border border-indigo-400/20">
              <h4 className="text-lg font-semibold text-indigo-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Strategic Fit Assessment
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-indigo-300 mb-2">Buyer Alignment</h5>
                  {analysis.strategicFit?.buyerAlignment?.insight && (
                    <p className="text-sm text-silver/90 mb-3">{analysis.strategicFit.buyerAlignment.insight}</p>
                  )}
                  <h5 className="font-medium text-indigo-300 mb-2">Cultural Fit</h5>
                  {analysis.strategicFit?.culturalFit?.insight && (
                    <p className="text-sm text-silver/90">{analysis.strategicFit.culturalFit.insight}</p>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-indigo-300 mb-2">Synergies</h5>
                  <ul className="space-y-1 mb-3">
                    {(analysis.strategicFit?.synergies || []).slice(0, 3).map((synergy, index) => (
                      <li key={index} className="text-sm text-silver/90 flex items-start">
                        <span className="text-indigo-400 mr-2">→</span>
                        {synergy?.insight || ''}
                      </li>
                    ))}
                  </ul>
                  <h5 className="font-medium text-indigo-300 mb-2">Integration Complexity</h5>
                  {analysis.strategicFit?.integrationComplexity?.insight && (
                    <p className="text-sm text-silver/90">{analysis.strategicFit.integrationComplexity.insight}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="p-4 bg-blue-900/10 rounded-luxury border border-blue-400/20">
            <h4 className="text-lg font-semibold text-blue-400 mb-3 font-serif flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Recommended Next Steps
            </h4>
            <ul className="space-y-2">
              {(analysis.nextSteps || []).map((step, index) => (
                <li key={index} className="text-silver/90 text-sm flex items-start">
                  <span className="text-blue-400 mr-2">{index + 1}.</span>
                  {step || ''}
                </li>
              ))}
            </ul>
          </div>

          {/* Red Flags */}
          {analysis.redFlags && (analysis.redFlags || []).length > 0 && (
            <div className="p-4 bg-red-900/20 rounded-luxury border border-red-400/30">
              <h4 className="text-lg font-semibold text-red-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Critical Red Flags
              </h4>
              <ul className="space-y-2">
                {(analysis.redFlags || []).map((flag, index) => (
                  <li key={index} className="text-red-300 text-sm flex items-start">
                    <span className="text-red-400 mr-2">⚠</span>
                    {flag || ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conversational AI Chatbox */}
          <ConversationalChatbox
            listingId={listingId}
            analysisType="business_analysis"
            previousAnalysis={analysis}
            title="Ask About This Analysis"
            placeholder="Ask about strengths, risks, recommendations, or any specific aspect..."
            icon={
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />

          {/* Actions */}
          <div className="text-center pt-4 border-t border-gold/10">
            <button
              onClick={handleAnalyzeClick}
              disabled={isLoading}
              className="px-6 py-2 bg-transparent border-2 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-sm disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Regenerate Analysis'}
            </button>
          </div>
        </div>
      )}

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
  );
}
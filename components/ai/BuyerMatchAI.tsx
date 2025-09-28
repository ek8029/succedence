'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SuperEnhancedBuyerMatch, SuperConfidenceScore, SuperRiskFactor } from '@/lib/ai/super-enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useAIAnalysis } from '@/contexts/AIAnalysisContext';
import { useVisibilityProtectedRequest } from '@/lib/utils/page-visibility';
import { useResilientFetch } from '@/lib/utils/resilient-fetch';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';

type EnhancedBuyerMatchScore = SuperEnhancedBuyerMatch;

interface BuyerMatchAIProps {
  listingId: string;
  listingTitle: string;
}

export default function BuyerMatchAI({ listingId, listingTitle }: BuyerMatchAIProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { analysisCompletedTrigger, triggerAnalysisRefetch, refreshTrigger } = useAIAnalysis();
  const { protectRequest } = useVisibilityProtectedRequest();
  const { fetchWithRetry } = useResilientFetch();
  const [matchScore, setMatchScore] = useState<SuperEnhancedBuyerMatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedForExisting, setHasCheckedForExisting] = useState(false);
  const analysisInProgressRef = useRef(false);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState<string | null>(null);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);

  // Check if user has access to buyer matching feature
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'buyerMatching', user?.role);

  // Fetch existing analysis on component mount
  const fetchExistingAnalysis = useCallback(async () => {
    if (!user || hasCheckedForExisting) return;

    try {
      const response = await fetchWithRetry(`/api/ai/history?analysisType=buyer_match&listingId=${listingId}&limit=1&page=1`, {
        maxRetries: 3,
        retryDelay: 1000
      }, `buyer-match-history-${listingId}`);
      const data = await response.json();

      if (data.success && data.aiHistory && data.aiHistory.length > 0) {
        // Since API now filters by listingId, take the first (and only) result
        const existingAnalysis = data.aiHistory[0];
        if (existingAnalysis && existingAnalysis.analysis_data) {
          setMatchScore(existingAnalysis.analysis_data);
        }
      }
    } catch (err) {
      console.error('Error fetching existing buyer match analysis:', err);
    } finally {
      setHasCheckedForExisting(true);
    }
  }, [user, hasCheckedForExisting, listingId, fetchWithRetry]);

  // Removed problematic tab visibility logic that caused infinite loading

  // Check for existing analysis on mount
  useEffect(() => {
    if (user && !matchScore && !hasCheckedForExisting) {
      fetchExistingAnalysis();
    }
  }, [user, listingId, matchScore, hasCheckedForExisting, fetchExistingAnalysis]);

  // Listen to analysis completion triggers from other components
  useEffect(() => {
    if (user && (analysisCompletedTrigger > 0 || refreshTrigger > 0)) {
      // Reset and refetch when other analyses complete
      setHasCheckedForExisting(false);
      if (!matchScore) {
        fetchExistingAnalysis();
      }
    }
  }, [user, analysisCompletedTrigger, refreshTrigger, matchScore, fetchExistingAnalysis]);

  // Removed session storage cleanup logic

  const handleAnalyzeMatch = async () => {
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
          analysisType: 'buyer_match'
        }),
      });

      const startData = await startResponse.json();

      if (!startResponse.ok) {
        throw new Error(startData.error || 'Failed to start buyer match analysis');
      }

      // Poll for completion - this works even if user switches tabs
      const pollForResult = async (): Promise<any> => {
        while (analysisInProgressRef.current) {
          try {
            const statusResponse = await fetch(
              `/api/ai/run-analysis?listingId=${listingId}&analysisType=buyer_match`,
              { credentials: 'include' }
            );
            const statusData = await statusResponse.json();

            if (statusData.status === 'completed' && statusData.result) {
              return statusData.result;
            } else if (statusData.status === 'error') {
              throw new Error(statusData.error || 'Buyer match analysis failed');
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
      setMatchScore(result);

      // Notify other components that analysis completed
      triggerAnalysisRefetch();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate buyer match');
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuery.trim() || !matchScore || !user?.id) return;

    setIsFollowUpLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/follow-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          listingId: listingId,
          analysisType: 'buyer_match',
          question: followUpQuery.trim(),
          previousAnalysis: matchScore
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.error || 'Follow-up question limit reached');
        }
        throw new Error(data.error || 'Failed to generate follow-up');
      }

      setFollowUpResponse(data.response);
      setRemainingQuestions(data.remainingQuestions);
      setFollowUpQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate follow-up');
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-900/20 border-green-400/30';
    if (score >= 60) return 'bg-yellow-900/20 border-yellow-400/30';
    if (score >= 40) return 'bg-orange-900/20 border-orange-400/30';
    return 'bg-red-900/20 border-red-400/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  const getConfidenceColor = (confidence?: SuperConfidenceScore) => {
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

  // Show loading while auth is initializing (prevents subscription popup on tab switch)
  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="glass p-6 rounded-luxury-lg border border-gold/20">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-silver">Loading buyer matching...</span>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if user doesn't have access
  if (!hasAccess) {
    return (
      <SubscriptionUpgrade
        currentPlan={userPlan}
        requiredFeature="buyerMatching"
        featureName="Buyer Compatibility Score"
        featureDescription="Get AI-powered compatibility scoring between your investment criteria and business opportunities with detailed reasoning and recommendations."
      />
    );
  }

  return (
    <div className="glass p-6 rounded-luxury-lg border border-gold/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-warm-white font-serif">
          Buyer Compatibility Score
        </h3>
        {!matchScore && (
          <button
            onClick={handleAnalyzeMatch}
            disabled={isLoading}
            className="px-4 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Calculating...</span>
              </div>
            ) : (
              'Calculate Match'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-400/30 rounded-luxury text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {matchScore && (
        <div className="space-y-6">
          {/* SuperEnhanced Match Score Display */}
          <div className={`text-center p-6 rounded-luxury border-2 ${matchScore.score ? getScoreBackground(matchScore.score) : 'bg-gray-900/20 border-gray-400/30'}`}>
            <div className={`text-4xl font-bold font-mono mb-2 ${matchScore.score ? getScoreColor(matchScore.score) : 'text-gray-400'}`}>
              {matchScore.score || 0}%
            </div>
            <div className={`text-lg font-semibold ${matchScore.score ? getScoreColor(matchScore.score) : 'text-gray-400'}`}>
              {matchScore.recommendation ? matchScore.recommendation.replace('_', ' ').toUpperCase() : 'ANALYZING MATCH'}
            </div>
            <div className="text-sm text-silver/80 mt-2">
              SuperEnhanced compatibility analysis with strategic fit assessment
            </div>
            {matchScore.confidence && matchScore.confidence.score && (
              <div className={`text-xs mt-2 ${getConfidenceColor(matchScore.confidence)}`}>
                {matchScore.confidence.score}% confidence{matchScore.confidence.methodology ? ` • ${matchScore.confidence.methodology}` : ''}
              </div>
            )}
          </div>

          {/* Score Breakdown with SuperEnhanced Details */}
          {matchScore.scoreBreakdown && (
            <div className="p-4 bg-purple-900/10 rounded-luxury border border-purple-400/20">
              <h4 className="text-lg font-semibold text-purple-400 mb-3 font-serif">Detailed Score Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{matchScore.scoreBreakdown.industryFit || 0}</div>
                  <div className="text-xs text-silver/70">Industry Fit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{matchScore.scoreBreakdown.financialFit || 0}</div>
                  <div className="text-xs text-silver/70">Financial Fit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{matchScore.scoreBreakdown.operationalFit || 0}</div>
                  <div className="text-xs text-silver/70">Operational</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{matchScore.scoreBreakdown.culturalFit || 0}</div>
                  <div className="text-xs text-silver/70">Cultural</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{matchScore.scoreBreakdown.strategicFit || 0}</div>
                  <div className="text-xs text-silver/70">Strategic</div>
                </div>
              </div>
            </div>
          )}

          {/* SuperEnhanced Compatibility Analysis */}
          {matchScore.compatibility && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
                <h4 className="text-lg font-semibold text-green-400 mb-3 font-serif flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Compatibility Analysis
                </h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-green-300 text-sm">Industry Experience</h5>
                    <p className="text-xs text-silver/80">{matchScore.compatibility.industryExperience.insight}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-300 text-sm">Financial Capacity</h5>
                    <p className="text-xs text-silver/80">{matchScore.compatibility.financialCapacity.insight}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-300 text-sm">Strategic Value</h5>
                    <p className="text-xs text-silver/80">{matchScore.compatibility.strategicValue.insight}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-900/10 rounded-luxury border border-blue-400/20">
                <h4 className="text-lg font-semibold text-blue-400 mb-3 font-serif flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Synergies & Opportunities
                </h4>
                <ul className="space-y-2">
                  {(matchScore.synergies || []).slice(0, 3).map((synergy, index) => (
                    <li key={index} className="text-silver/90 text-xs flex items-start">
                      <span className="text-blue-400 mr-2">→</span>
                      {synergy?.insight || ''}
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <h5 className="font-medium text-blue-300 text-sm mb-1">Growth Opportunities</h5>
                  {(matchScore.growthOpportunities || []).slice(0, 2).map((opportunity, index) =>
                    opportunity?.insight ? (
                      <p key={index} className="text-xs text-silver/80 mb-1">{opportunity.insight}</p>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {matchScore.risks && (matchScore.risks || []).length > 0 && (
            <div className="p-4 bg-red-900/10 rounded-luxury border border-red-400/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Risk Assessment
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {(matchScore.risks || []).slice(0, 4).map((risk, index) => (
                  <div key={index} className={`p-3 rounded-luxury border ${risk?.severity ? getRiskSeverityColor(risk.severity) : 'border-gray-400/30'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-xs">{risk?.factor || 'Risk factor'}</span>
                      {risk?.severity && (
                        <span className="text-xs uppercase font-bold">{risk.severity}</span>
                      )}
                    </div>
                    {risk?.description && (
                      <div className="text-xs opacity-90 mb-2">{risk.description}</div>
                    )}
                    <div className="text-xs">Risk Score: {risk?.riskScore || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          <div className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
            <h4 className="text-lg font-semibold text-gold mb-3 font-serif">Strategic Reasoning</h4>
            <ul className="space-y-2">
              {matchScore.reasoning && matchScore.reasoning.map((reason, index) => (
                <li key={index} className="text-silver/90 text-sm flex items-start">
                  <span className="text-gold mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Follow-up Questions */}
          <div className="p-4 bg-purple-900/10 rounded-luxury border border-purple-400/20">
            <h4 className="text-lg font-semibold text-purple-400 mb-3 font-serif flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ask Follow-up Questions
              {remainingQuestions !== null && (
                <span className="ml-2 text-xs text-purple-300">
                  ({remainingQuestions} remaining)
                </span>
              )}
            </h4>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                placeholder="Ask about buyer compatibility, synergies, or investment fit..."
                className="flex-1 px-3 py-2 bg-charcoal/50 border border-purple-400/20 rounded-luxury text-warm-white placeholder-silver/60 focus:outline-none focus:border-purple-400"
                onKeyPress={(e) => e.key === 'Enter' && handleFollowUp()}
                disabled={!user?.id}
              />
              <button
                onClick={handleFollowUp}
                disabled={isFollowUpLoading || !followUpQuery.trim() || !user?.id}
                className="px-4 py-2 bg-purple-600 text-white rounded-luxury hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFollowUpLoading ? '...' : 'Ask'}
              </button>
            </div>
            {!user?.id && (
              <p className="text-purple-300 text-xs mb-3">Sign in to ask follow-up questions</p>
            )}
            {followUpResponse && (
              <div className="p-3 bg-charcoal/30 rounded-luxury border border-purple-400/20">
                <div className="text-purple-300 text-sm leading-relaxed whitespace-pre-wrap">{followUpResponse}</div>
              </div>
            )}
            {remainingQuestions === 0 && (
              <div className="mt-2 p-2 bg-orange-900/20 border border-orange-400/20 rounded text-orange-300 text-xs">
                You&apos;ve reached your daily limit for follow-up questions. Upgrade your plan for more questions.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gold/10">
            <button
              onClick={handleAnalyzeMatch}
              disabled={isLoading}
              className="px-6 py-2 bg-transparent border-2 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-sm disabled:opacity-50"
            >
              {isLoading ? 'Calculating...' : 'Recalculate Match'}
            </button>

            {matchScore.score && matchScore.score >= 60 && (
              <button className="px-6 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary text-sm">
                Get Due Diligence Checklist
              </button>
            )}
          </div>

          {/* AI Disclaimer */}
          <div className="mt-6 p-4 bg-navy/20 rounded-luxury border border-gold/10">
            <p className="text-silver/70 text-xs leading-relaxed">
              <strong className="text-gold">AI Disclaimer:</strong> Succedence uses AI-powered tools to provide insights and recommendations. These tools are designed to assist your decision-making, but they do not constitute financial, legal, or investment advice. Users should conduct independent due diligence before making any acquisition or investment decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
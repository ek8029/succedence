'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SuperEnhancedMarketIntelligence } from '@/lib/ai/super-enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useAIAnalysis } from '@/contexts/AIAnalysisContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { useVisibilityProtectedRequest } from '@/lib/utils/page-visibility';
import { useResilientFetch } from '@/lib/utils/resilient-fetch';

interface MarketIntelligenceAIProps {
  industry?: string;
  geography?: string;
  dealSize?: number;
  listingId?: string;
}

export default function MarketIntelligenceAI({ industry, geography, dealSize, listingId }: MarketIntelligenceAIProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { analysisCompletedTrigger, triggerAnalysisRefetch, refreshTrigger } = useAIAnalysis();
  const { protectRequest } = useVisibilityProtectedRequest();
  const { fetchWithRetry } = useResilientFetch();
  const [intelligence, setIntelligence] = useState<SuperEnhancedMarketIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedForExisting, setHasCheckedForExisting] = useState(false);
  const analysisInProgressRef = useRef(false);
  const [formData, setFormData] = useState({
    industry: industry || '',
    geography: geography || '',
    dealSize: dealSize || 0
  });
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState<string | null>(null);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);

  // Check if user has access to market intelligence feature
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'marketIntelligence', user?.role);

  // Fetch existing analysis on component mount
  const fetchExistingAnalysis = useCallback(async () => {
    if (!user || hasCheckedForExisting || !formData.industry.trim()) return;

    try {
      let url = `/api/ai/history?analysisType=market_intelligence&limit=10&page=1`;
      if (listingId) {
        url += `&listingId=${listingId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.aiHistory && data.aiHistory.length > 0) {
        // Since API now filters by listingId, search through results for parameter match
        const existingAnalysis = data.aiHistory.find((item: any) => {
          const analysisParams = item.analysis_data?.parameters || {};
          return analysisParams.industry?.toLowerCase() === formData.industry.toLowerCase() &&
                 (!formData.geography || analysisParams.geography?.toLowerCase() === formData.geography.toLowerCase()) &&
                 (!formData.dealSize || analysisParams.dealSize === formData.dealSize);
        });

        if (existingAnalysis && existingAnalysis.analysis_data) {
          // Extract the intelligence data (skip parameters)
          const { parameters, ...intelligenceData } = existingAnalysis.analysis_data;
          setIntelligence(intelligenceData);
        }
      }
    } catch (err) {
      console.error('Error fetching existing market intelligence analysis:', err);
    } finally {
      setHasCheckedForExisting(true);
    }
  }, [user, hasCheckedForExisting, formData.industry, formData.geography, formData.dealSize, listingId]);

  // Removed problematic tab visibility logic that caused infinite loading

  const pollForResult = useCallback(async (targetJobId?: string): Promise<any> => {
    let attempts = 0;
    const maxAttempts = 180; // 6 minutes max

    while (analysisInProgressRef.current && attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(
          `/api/ai/run-analysis?listingId=${listingId || 'market-intelligence-general'}&analysisType=market_intelligence${
            targetJobId ? `&jobId=${targetJobId}` : ''
          }`,
          { credentials: 'include' }
        );
        const statusData = await statusResponse.json();

        if (statusData.status === 'completed' && statusData.result) {
          return statusData.result;
        } else if (statusData.status === 'error') {
          throw new Error(statusData.error || 'Market intelligence analysis failed');
        }

        // Still processing, wait and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (pollError) {
        console.warn('Poll error, retrying:', pollError);
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Market intelligence analysis timed out - but it may still be running in the background');
    }
    throw new Error('Market intelligence analysis cancelled');
  }, [listingId]);

  const resumePolling = useCallback(async (resumeJobId?: string) => {
    try {
      const result = await pollForResult(resumeJobId);
      if (result) {
        setIntelligence(result);
        console.log('✅ Market intelligence analysis completed (resumed)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Market intelligence analysis failed during resume');
      console.error('❌ Resumed market intelligence analysis failed:', err);
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
    }
  }, [pollForResult]);

  const checkForOngoingAnalysis = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/ai/run-analysis?listingId=${listingId || 'market-intelligence-general'}&analysisType=market_intelligence`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (response.ok && (data.status === 'processing' || data.status === 'queued')) {
        console.log('🔄 Resuming ongoing market intelligence analysis:', data.jobId);
        setIsLoading(true);
        analysisInProgressRef.current = true;

        // Resume polling for the ongoing job
        resumePolling(data.jobId);
      } else if (data.status === 'completed' && data.result) {
        console.log('✅ Found completed market intelligence analysis, loading result');
        setIntelligence(data.result);
      }
    } catch (error) {
      console.warn('Failed to check for ongoing market intelligence analysis:', error);
    }
  }, [listingId, resumePolling]);

  // Check for existing analysis when form data changes
  useEffect(() => {
    if (user && formData.industry.trim() && !intelligence) {
      setHasCheckedForExisting(false);
      fetchExistingAnalysis();
    }
  }, [user, formData.industry, formData.geography, formData.dealSize, intelligence, fetchExistingAnalysis]);

  // Check for ongoing analysis when component mounts/remounts
  useEffect(() => {
    if (user && !intelligence && !isLoading && hasCheckedForExisting && !analysisInProgressRef.current && formData.industry.trim()) {
      checkForOngoingAnalysis();
    }
  }, [user, formData.industry, intelligence, isLoading, hasCheckedForExisting, checkForOngoingAnalysis]);

  // Listen to analysis completion triggers from other components
  useEffect(() => {
    if (user && (analysisCompletedTrigger > 0 || refreshTrigger > 0) && formData.industry.trim()) {
      // Reset and refetch when other analyses complete
      setHasCheckedForExisting(false);
      if (!intelligence) {
        fetchExistingAnalysis();
      }
    }
  }, [user, analysisCompletedTrigger, refreshTrigger, formData.industry, intelligence, fetchExistingAnalysis]);

  // Removed session storage cleanup logic

  const handleGenerateIntelligence = async () => {
    if (!formData.industry.trim()) {
      setError('Industry is required');
      return;
    }

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
          listingId: listingId || 'market-intelligence-general',
          analysisType: 'market_intelligence',
          parameters: {
            industry: formData.industry,
            geography: formData.geography || undefined,
            dealSize: formData.dealSize || undefined
          }
        }),
      });

      const startData = await startResponse.json();

      if (!startResponse.ok) {
        throw new Error(startData.error || 'Failed to start market intelligence analysis');
      }

      // Use the shared polling function
      const result = await pollForResult();
      setIntelligence(result);

      // Notify other components that analysis completed
      triggerAnalysisRefetch();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate market intelligence');
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuery.trim() || !intelligence || !user?.id) return;

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
          listingId: listingId || 'market-intelligence-general',
          analysisType: 'market_intelligence',
          question: followUpQuery.trim(),
          previousAnalysis: intelligence
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

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  // Show loading while auth is initializing (prevents subscription popup on tab switch)
  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="glass p-6 rounded-luxury-lg border border-gold/20">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-silver">Loading market intelligence...</span>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if user doesn't have access
  if (!hasAccess) {
    return (
      <SubscriptionUpgrade
        currentPlan={userPlan}
        requiredFeature="marketIntelligence"
        featureName="Market Intelligence Dashboard"
        featureDescription="Access comprehensive market analysis including conditions, valuations, competitive landscape, timing insights, opportunities and risks."
      />
    );
  }

  return (
    <div className="glass p-6 rounded-luxury-lg border border-gold/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-warm-white font-serif">
          Market Intelligence Dashboard
        </h3>
      </div>

      {/* Input Form */}
      {!intelligence && (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-silver/80 mb-2">
              Industry *
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g., Technology, Healthcare, Manufacturing"
              className="w-full px-3 py-2 bg-charcoal/50 border border-gold/20 rounded-luxury text-warm-white placeholder-silver/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-silver/80 mb-2">
              Geography
            </label>
            <input
              type="text"
              value={formData.geography}
              onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
              placeholder="e.g., United States, California, Global"
              className="w-full px-3 py-2 bg-charcoal/50 border border-gold/20 rounded-luxury text-warm-white placeholder-silver/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-silver/80 mb-2">
              Deal Size
            </label>
            <input
              type="number"
              value={formData.dealSize || ''}
              onChange={(e) => setFormData({ ...formData, dealSize: Number(e.target.value) || 0 })}
              placeholder="100000"
              className="w-full px-3 py-2 bg-charcoal/50 border border-gold/20 rounded-luxury text-warm-white placeholder-silver/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleGenerateIntelligence}
          disabled={isLoading || !formData.industry.trim()}
          className="px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Intelligence...</span>
            </div>
          ) : (
            intelligence ? 'Regenerate Report' : 'Generate Market Intelligence'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-400/30 rounded-luxury text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {intelligence && (
        <div className="space-y-6">
          {/* Parameters Summary */}
          <div className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
            <h4 className="text-lg font-semibold text-gold mb-2 font-serif">Analysis Parameters</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-silver/60">Industry:</span>
                <span className="ml-2 text-warm-white font-medium">{formData.industry}</span>
              </div>
              {formData.geography && (
                <div>
                  <span className="text-silver/60">Geography:</span>
                  <span className="ml-2 text-warm-white font-medium">{formData.geography}</span>
                </div>
              )}
              {formData.dealSize > 0 && (
                <div>
                  <span className="text-silver/60">Deal Size:</span>
                  <span className="ml-2 text-warm-white font-medium">{formatCurrency(formData.dealSize)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Market Conditions */}
          <div className="p-4 bg-blue-900/10 rounded-luxury border border-blue-400/20">
            <h4 className="text-lg font-semibold text-blue-400 mb-3 font-serif flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Current Market Conditions
            </h4>
            <p className="text-silver/90 leading-relaxed text-sm">{intelligence.marketOverview?.size?.insight || 'Market overview unavailable'}</p>
          </div>

          {/* Key Insights Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Valuation Trends */}
            <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Valuation Trends
              </h4>
              <p className="text-silver/90 leading-relaxed text-sm">{intelligence.marketOverview?.growth?.insight || 'Valuation trends unavailable'}</p>
            </div>

            {/* Competitive Analysis */}
            <div className="p-4 bg-purple-900/10 rounded-luxury border border-purple-400/20">
              <h4 className="text-lg font-semibold text-purple-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Competitive Landscape
              </h4>
              <p className="text-silver/90 leading-relaxed text-sm">{intelligence.competitive?.intensity?.insight || 'Competitive analysis unavailable'}</p>
            </div>
          </div>

          {/* Market Timing */}
          <div className="p-4 bg-indigo-900/10 rounded-luxury border border-indigo-400/20">
            <h4 className="text-lg font-semibold text-indigo-400 mb-3 font-serif flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Market Timing Insights
            </h4>
            <div className="space-y-3">
              {intelligence.economic?.timing?.insight ? (
                <p className="text-silver/90 leading-relaxed text-sm">{intelligence.economic.timing.insight}</p>
              ) : (
                <p className="text-silver/90 leading-relaxed text-sm">Market timing analysis unavailable</p>
              )}
              {intelligence.timing && typeof intelligence.timing === 'string' && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-indigo-300 text-xs font-medium">Overall Timing Rating:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    intelligence.timing === 'excellent' ? 'bg-green-500/20 text-green-400' :
                    intelligence.timing === 'good' ? 'bg-blue-500/20 text-blue-400' :
                    intelligence.timing === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {intelligence.timing.charAt(0).toUpperCase() + intelligence.timing.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Opportunities & Risks */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Opportunities */}
            <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Market Opportunities
              </h4>
              <ul className="space-y-2">
                {(intelligence.competitive?.opportunities || []).map((opportunity, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {typeof opportunity === 'string' ? opportunity : opportunity?.insight || 'Opportunity unavailable'}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="p-4 bg-red-900/10 rounded-luxury border border-red-400/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Market Risks
              </h4>
              <ul className="space-y-2">
                {(intelligence.economic?.risks || []).map((risk, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    {typeof risk === 'string' ? risk : risk?.factor || 'Risk unavailable'}
                  </li>
                ))}
              </ul>
            </div>
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
                placeholder="Ask about market trends, competition, growth opportunities..."
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

          {/* Export Options */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gold/10">
            <button
              onClick={() => {
                const reportData = {
                  parameters: {
                    industry: formData.industry,
                    geography: formData.geography,
                    dealSize: formData.dealSize
                  },
                  intelligence,
                  generatedAt: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `market-intelligence-${formData.industry.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary text-sm"
            >
              Export Report
            </button>

            <button
              onClick={() => {
                const reportText = `Market Intelligence Report
Industry: ${formData.industry}
${formData.geography ? `Geography: ${formData.geography}` : ''}
${formData.dealSize ? `Deal Size: ${formatCurrency(formData.dealSize)}` : ''}

MARKET CONDITIONS
${intelligence.marketOverview?.size?.insight || 'Market conditions unavailable'}

VALUATION TRENDS
${intelligence.marketOverview?.growth?.insight || 'Valuation trends unavailable'}

COMPETITIVE ANALYSIS
${intelligence.competitive?.intensity?.insight || 'Competitive analysis unavailable'}

TIMING INSIGHTS
${intelligence.timing}

OPPORTUNITIES
${(intelligence.competitive?.opportunities || []).map(op => `• ${op?.insight || op}`).join('\n')}

RISKS
${(intelligence.economic?.risks || []).map(risk => `• ${risk?.factor || risk}`).join('\n')}

Generated on ${new Date().toLocaleDateString()}`;

                const blob = new Blob([reportText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `market-intelligence-${formData.industry.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-2 bg-transparent border-2 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-sm"
            >
              Export as Text
            </button>
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
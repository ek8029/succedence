'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BusinessAnalysis } from '@/lib/ai/openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';

interface BusinessAnalysisAIProps {
  listingId: string;
  listingTitle: string;
}

export default function BusinessAnalysisAI({ listingId, listingTitle }: BusinessAnalysisAIProps) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedForExisting, setHasCheckedForExisting] = useState(false);
  const analysisInProgressRef = useRef(false);

  // Check if user has access to business analysis feature
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'businessAnalysis', user?.role);

  // Fetch existing analysis on component mount
  const fetchExistingAnalysis = useCallback(async () => {
    if (!user || hasCheckedForExisting) return;

    try {
      const response = await fetch(`/api/ai/history?analysisType=business_analysis&limit=1&page=1`);
      const data = await response.json();

      if (data.success && data.aiHistory && data.aiHistory.length > 0) {
        const existingAnalysis = data.aiHistory.find((item: any) => item.listing_id === listingId);
        if (existingAnalysis && existingAnalysis.analysis_data) {
          setAnalysis(existingAnalysis.analysis_data);
        }
      }
    } catch (err) {
      console.error('Error fetching existing business analysis:', err);
    } finally {
      setHasCheckedForExisting(true);
    }
  }, [user, hasCheckedForExisting, listingId]);

  // Handle tab visibility to prevent analysis interruption
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only handle visibility change if analysis is actually in progress
      if (!analysisInProgressRef.current) return;

      if (document.hidden) {
        // Tab is hidden during analysis - store current state
        const analysisState = {
          listingId,
          isLoading,
          error,
          timestamp: Date.now()
        };
        sessionStorage.setItem(`business_analysis_${listingId}`, JSON.stringify(analysisState));
      } else if (!document.hidden) {
        // Tab is visible again - check for stored state
        const storedState = sessionStorage.getItem(`business_analysis_${listingId}`);
        if (storedState) {
          const state = JSON.parse(storedState);
          const timeDiff = Date.now() - state.timestamp;

          // If analysis was in progress less than 5 minutes ago, resume it
          if (state.isLoading && timeDiff < 300000) {
            setIsLoading(true);
            setError(null);
            analysisInProgressRef.current = true;
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [listingId, isLoading, error]);

  // Check for existing analysis and restore state on mount
  useEffect(() => {
    if (user) {
      // Check for stored session state first
      const storedState = sessionStorage.getItem(`business_analysis_${listingId}`);
      if (storedState) {
        const state = JSON.parse(storedState);
        const timeDiff = Date.now() - state.timestamp;

        // If analysis was in progress recently, resume it
        if (state.isLoading && timeDiff < 300000) {
          setIsLoading(true);
          setError(null);
        }
      }

      // Fetch existing analysis if not already loaded
      if (!analysis && !hasCheckedForExisting) {
        fetchExistingAnalysis();
      }
    }
  }, [user, listingId, analysis, hasCheckedForExisting, fetchExistingAnalysis]);

  // Clean up session storage when analysis completes
  useEffect(() => {
    if (!isLoading && analysis) {
      sessionStorage.removeItem(`business_analysis_${listingId}`);
    }
  }, [isLoading, analysis, listingId]);

  const handleAnalyzeClick = async () => {
    setIsLoading(true);
    setError(null);
    analysisInProgressRef.current = true;

    // Store analysis state
    const analysisState = {
      listingId,
      isLoading: true,
      error: null,
      timestamp: Date.now()
    };
    sessionStorage.setItem(`business_analysis_${listingId}`, JSON.stringify(analysisState));

    try {
      const response = await fetch('/api/ai/analyze-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze business');
      }

      setAnalysis(data.analysis);

      // Clear session storage on successful completion
      sessionStorage.removeItem(`business_analysis_${listingId}`);
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
    return recommendation.replace('_', ' ').toUpperCase();
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
          {/* Overall Score & Recommendation */}
          <div className="flex items-center justify-between p-4 bg-charcoal/50 rounded-luxury border border-gold/10">
            <div>
              <div className="text-3xl font-bold text-gold font-mono mb-1">
                {analysis.overallScore}/100
              </div>
              <div className="text-sm text-silver/80">Overall Score</div>
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

          {/* Analysis Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Strengths
              </h4>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 bg-yellow-900/10 rounded-luxury border border-yellow-400/20">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Areas of Concern
              </h4>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="p-4 bg-red-900/10 rounded-luxury border border-red-400/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Risk Factors
              </h4>
              <ul className="space-y-2">
                {analysis.risks.map((risk, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-4 bg-blue-900/10 rounded-luxury border border-blue-400/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Growth Opportunities
              </h4>
              <ul className="space-y-2">
                {analysis.opportunities.map((opportunity, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Valuation Insights */}
            <div className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
              <h4 className="text-lg font-semibold text-gold mb-3 font-serif">Valuation Insights</h4>
              <p className="text-silver/90 text-sm leading-relaxed">{analysis.valuationInsights}</p>
            </div>

            {/* Market Position */}
            <div className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
              <h4 className="text-lg font-semibold text-gold mb-3 font-serif">Market Position</h4>
              <p className="text-silver/90 text-sm leading-relaxed">{analysis.marketPosition}</p>
            </div>
          </div>

          {/* Regenerate Button */}
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
    </div>
  );
}
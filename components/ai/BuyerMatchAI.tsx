'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BuyerMatchScore } from '@/lib/ai/openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';

interface BuyerMatchAIProps {
  listingId: string;
  listingTitle: string;
}

export default function BuyerMatchAI({ listingId, listingTitle }: BuyerMatchAIProps) {
  const { user } = useAuth();
  const [matchScore, setMatchScore] = useState<BuyerMatchScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedForExisting, setHasCheckedForExisting] = useState(false);
  const analysisInProgressRef = useRef(false);

  // Check if user has access to buyer matching feature
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'buyerMatching', user?.role);

  // Fetch existing analysis on component mount
  const fetchExistingAnalysis = useCallback(async () => {
    if (!user || hasCheckedForExisting) return;

    try {
      const response = await fetch(`/api/ai/history?analysisType=buyer_match&limit=1&page=1`);
      const data = await response.json();

      if (data.success && data.aiHistory && data.aiHistory.length > 0) {
        const existingAnalysis = data.aiHistory.find((item: any) => item.listing_id === listingId);
        if (existingAnalysis && existingAnalysis.analysis_data) {
          setMatchScore(existingAnalysis.analysis_data);
        }
      }
    } catch (err) {
      console.error('Error fetching existing buyer match analysis:', err);
    } finally {
      setHasCheckedForExisting(true);
    }
  }, [user, hasCheckedForExisting, listingId]);

  // Handle tab visibility to prevent analysis interruption
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && analysisInProgressRef.current) {
        // Tab is hidden during analysis - store current state
        const analysisState = {
          listingId,
          isLoading,
          error,
          timestamp: Date.now()
        };
        sessionStorage.setItem(`buyer_match_${listingId}`, JSON.stringify(analysisState));
      } else if (!document.hidden) {
        // Tab is visible again - check for stored state
        const storedState = sessionStorage.getItem(`buyer_match_${listingId}`);
        if (storedState) {
          const state = JSON.parse(storedState);
          const timeDiff = Date.now() - state.timestamp;

          // If analysis was in progress less than 5 minutes ago, resume it
          if (state.isLoading && timeDiff < 300000) {
            setIsLoading(true);
            setError(null);
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
      const storedState = sessionStorage.getItem(`buyer_match_${listingId}`);
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
      if (!matchScore && !hasCheckedForExisting) {
        fetchExistingAnalysis();
      }
    }
  }, [user, listingId, matchScore, hasCheckedForExisting, fetchExistingAnalysis]);

  // Clean up session storage when analysis completes
  useEffect(() => {
    if (!isLoading && matchScore) {
      sessionStorage.removeItem(`buyer_match_${listingId}`);
    }
  }, [isLoading, matchScore, listingId]);

  const handleAnalyzeMatch = async () => {
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
    sessionStorage.setItem(`buyer_match_${listingId}`, JSON.stringify(analysisState));

    try {
      const response = await fetch('/api/ai/buyer-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate buyer match');
      }

      setMatchScore(data.matchScore);

      // Clear session storage on successful completion
      sessionStorage.removeItem(`buyer_match_${listingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate buyer match');
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
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
          {/* Match Score Display */}
          <div className={`text-center p-6 rounded-luxury border-2 ${getScoreBackground(matchScore.score)}`}>
            <div className={`text-4xl font-bold font-mono mb-2 ${getScoreColor(matchScore.score)}`}>
              {matchScore.score}%
            </div>
            <div className={`text-lg font-semibold ${getScoreColor(matchScore.score)}`}>
              {getScoreLabel(matchScore.score)}
            </div>
            <div className="text-sm text-silver/80 mt-2">
              Based on your preferences and investment criteria
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Compatibility Factors */}
            <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Why It&apos;s a Good Match
              </h4>
              <ul className="space-y-2">
                {matchScore.compatibilityFactors.map((factor, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            {/* Concerns */}
            <div className="p-4 bg-yellow-900/10 rounded-luxury border border-yellow-400/20">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Potential Concerns
              </h4>
              <ul className="space-y-2">
                {matchScore.concerns.map((concern, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reasoning */}
          <div className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
            <h4 className="text-lg font-semibold text-gold mb-3 font-serif">Match Analysis</h4>
            <ul className="space-y-2">
              {matchScore.reasoning.map((reason, index) => (
                <li key={index} className="text-silver/90 text-sm flex items-start">
                  <span className="text-gold mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendation */}
          <div className="p-4 bg-navy/30 rounded-luxury border border-gold/10">
            <h4 className="text-lg font-semibold text-warm-white mb-3 font-serif">AI Recommendation</h4>
            <p className="text-silver/90 leading-relaxed">{matchScore.recommendation}</p>
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

            {matchScore.score >= 60 && (
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
'use client';

import React, { useState } from 'react';
import { SuperEnhancedBusinessAnalysis, SuperConfidenceScore } from '@/lib/ai/super-enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { usePersistedAIAnalysis } from '@/lib/hooks/usePersistedAIAnalysis';
import ConversationalChatbox from './ConversationalChatbox';

interface BusinessAnalysisAIProps {
  listingId: string;
  listingTitle: string;
}

export default function BusinessAnalysisAI({ listingId, listingTitle }: BusinessAnalysisAIProps) {
  const { user, isLoading: authLoading } = useAuth();

  // Use the enhanced hook - it handles everything internally
  const {
    analysis,
    isLoading,
    error,
    startAnalysis,
    clearAnalysis,
  } = usePersistedAIAnalysis<SuperEnhancedBusinessAnalysis>(
    listingId,
    'business_analysis'
  );

  // Check if user has access
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'businessAnalysis', user?.role);
  const isAdmin = user?.role === 'admin';

  // Helper functions for styling
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_buy': return 'text-green-400 bg-green-900/20 border-green-400/30';
      case 'buy': return 'text-green-300 bg-green-900/10 border-green-400/20';
      case 'hold': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
      case 'avoid': return 'text-red-400 bg-red-900/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
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

  // Interactive features state
  const [bookmarkedInsights, setBookmarkedInsights] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary', 'strengths', 'risks']));
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const toggleBookmark = (insightId: string) => {
    setBookmarkedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;

    const exportData = {
      listing: listingTitle,
      date: new Date().toISOString(),
      score: analysis.overallScore,
      recommendation: analysis.recommendation,
      summary: analysis.summary,
      strengths: analysis.strengths,
      risks: analysis.riskMatrix,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-analysis-${listingId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printAnalysis = () => {
    window.print();
  };

  // Show loading while auth is initializing
  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="glass p-6 rounded-luxury-lg border border-gold/20">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-silver">Loading analysis...</span>
        </div>
      </div>
    );
  }

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
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-semibold text-warm-white font-serif">
          AI Business Analysis
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {analysis && (
            <>
              {/* Action Buttons */}
              <button
                onClick={() => copyToClipboard(analysis.summary, 'summary')}
                className="px-3 py-2 text-xs bg-neutral-800/40 border border-gold/20 text-silver rounded-lg hover:bg-neutral-700/50 transition-all flex items-center gap-1"
                title="Copy Summary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copySuccess === 'summary' ? 'Copied!' : 'Copy'}
              </button>

              <button
                onClick={exportAnalysis}
                className="px-3 py-2 text-xs bg-neutral-800/40 border border-gold/20 text-silver rounded-lg hover:bg-neutral-700/50 transition-all flex items-center gap-1"
                title="Export Analysis"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>

              <button
                onClick={printAnalysis}
                className="px-3 py-2 text-xs bg-neutral-800/40 border border-gold/20 text-silver rounded-lg hover:bg-neutral-700/50 transition-all flex items-center gap-1"
                title="Print Analysis"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </>
          )}

          {!analysis && (
            <button
              onClick={() => startAnalysis(false)}
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

          {analysis && (
            <button
              onClick={() => {
                clearAnalysis();
                startAnalysis(true);
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-transparent border-2 border-gold/30 text-gold font-medium rounded-luxury hover:border-gold hover:bg-gold/10 transition-all duration-300 text-sm disabled:opacity-50"
            >
              Re-analyze
            </button>
          )}
        </div>
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

          {/* Strengths & Risks Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
              <button
                onClick={() => toggleSection('strengths')}
                className="w-full flex items-center justify-between mb-3 group"
              >
                <h4 className="text-lg font-semibold text-green-400 font-serif flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Key Strengths
                </h4>
                <svg
                  className={`w-5 h-5 text-green-400 transition-transform ${expandedSections.has('strengths') ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.has('strengths') && (
                <ul className="space-y-3">
                  {(analysis.strengths || []).map((strength, index) => {
                    const insightId = `strength-${index}`;
                    const isBookmarked = bookmarkedInsights.has(insightId);
                    return (
                      <li key={index} className="text-silver/90 text-sm border-l-2 border-green-400/30 pl-3 relative group/item">
                        <div className="flex items-start justify-between mb-1">
                          <span className="flex-1 font-medium pr-2">{strength?.insight || 'Analyzing...'}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {strength?.confidence?.score && (
                              <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(strength.confidence)}`}>
                                {strength.confidence.score}%
                              </span>
                            )}
                            <button
                              onClick={() => toggleBookmark(insightId)}
                              className={`p-1 rounded hover:bg-green-400/20 transition-all ${isBookmarked ? 'text-gold' : 'text-silver/40 opacity-0 group-hover/item:opacity-100'}`}
                              title={isBookmarked ? 'Unbookmark' : 'Bookmark insight'}
                            >
                              <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-silver/70 mb-2">{strength?.actionable || ''}</div>
                        <div className="text-xs text-green-300/60">
                          Probability: {strength?.probability || 0}% • Timeframe: {strength?.timeframe || 'TBD'}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Risks */}
            <div className="p-4 bg-red-900/10 rounded-luxury border border-red-400/20">
              <button
                onClick={() => toggleSection('risks')}
                className="w-full flex items-center justify-between mb-3 group"
              >
                <h4 className="text-lg font-semibold text-red-400 font-serif flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Risk Factors
                </h4>
                <svg
                  className={`w-5 h-5 text-red-400 transition-transform ${expandedSections.has('risks') ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.has('risks') && (
                <ul className="space-y-3">
                  {(analysis.riskMatrix || []).map((risk, index) => {
                    const insightId = `risk-${index}`;
                    const isBookmarked = bookmarkedInsights.has(insightId);
                    return (
                      <li key={index} className={`text-sm border-l-2 pl-3 relative group/item ${getRiskSeverityColor(risk?.severity || 'medium')}`}>
                        <div className="flex items-start justify-between mb-1">
                          <span className="flex-1 font-medium pr-2">{risk?.factor || 'Analyzing...'}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs px-2 py-1 rounded border uppercase">
                              {risk?.severity || 'medium'}
                            </span>
                            <button
                              onClick={() => toggleBookmark(insightId)}
                              className={`p-1 rounded hover:bg-red-400/20 transition-all ${isBookmarked ? 'text-gold' : 'text-silver/40 opacity-0 group-hover/item:opacity-100'}`}
                              title={isBookmarked ? 'Unbookmark' : 'Bookmark risk'}
                            >
                              <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-xs opacity-70 mb-2">{risk?.description || ''}</div>
                        <div className="text-xs opacity-60">
                          Risk Score: {risk?.riskScore || 0}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Conversational Chatbox */}
          <ConversationalChatbox
            listingId={listingId}
            analysisType="business_analysis"
            previousAnalysis={{ ...analysis, listingTitle, listingId }}
            title="Ask About Business Analysis"
            placeholder="Ask about the analysis, risks, opportunities, or specific concerns..."
          />
        </div>
      )}
    </div>
  );
}

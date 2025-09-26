'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EnhancedBusinessAnalysis, FollowUpResponse, RiskFactor, EnhancedInsight, ConfidenceScore } from '@/lib/ai/enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';

interface SuperEnhancedBusinessAnalysisAIProps {
  listingId: string;
  listingTitle: string;
}

export default function SuperEnhancedBusinessAnalysisAI({ listingId, listingTitle }: SuperEnhancedBusinessAnalysisAIProps) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<EnhancedBusinessAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedForExisting, setHasCheckedForExisting] = useState(false);
  const [selectedPerspective, setSelectedPerspective] = useState<'strategic_buyer' | 'financial_buyer' | 'first_time_buyer' | 'general'>('general');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState<FollowUpResponse | null>(null);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const analysisInProgressRef = useRef(false);

  // Check if user has access to enhanced business analysis feature
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'businessAnalysis', user?.role);

  const focusAreaOptions = [
    'Financial Performance',
    'Market Position',
    'Operational Efficiency',
    'Growth Potential',
    'Risk Assessment',
    'Competitive Analysis',
    'Management Team',
    'Technology & Assets',
    'Customer Base',
    'Regulatory Environment'
  ];

  // Fetch existing analysis on component mount
  const fetchExistingAnalysis = useCallback(async () => {
    if (!user || hasCheckedForExisting) return;

    try {
      const response = await fetch(`/api/ai/history?analysisType=enhanced_business_analysis&listingId=${listingId}&limit=1&page=1`);
      const data = await response.json();

      if (data.success && data.aiHistory && data.aiHistory.length > 0) {
        const existingAnalysis = data.aiHistory[0];
        if (existingAnalysis && existingAnalysis.analysis_data) {
          setAnalysis(existingAnalysis.analysis_data);
        }
      }
    } catch (err) {
      console.error('Error fetching existing enhanced analysis:', err);
    } finally {
      setHasCheckedForExisting(true);
    }
  }, [user, hasCheckedForExisting, listingId]);

  useEffect(() => {
    if (user && !analysis && !hasCheckedForExisting) {
      fetchExistingAnalysis();
    }
  }, [user, listingId, analysis, hasCheckedForExisting, fetchExistingAnalysis]);

  const handleAnalyzeClick = async () => {
    setIsLoading(true);
    setError(null);
    setFollowUpResponse(null);
    analysisInProgressRef.current = true;

    try {
      const analysisOptions = {
        perspective: selectedPerspective,
        focusAreas: focusAreas,
      };

      const response = await fetch('/api/ai/enhanced-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          analysisOptions,
          forceRefresh: !!analysis // Force refresh if analysis already exists
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze business');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze business');
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
    }
  };

  const handleFollowUpQuery = async () => {
    if (!followUpQuery.trim() || !analysis) return;

    setIsFollowUpLoading(true);
    try {
      const response = await fetch('/api/ai/enhanced-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          followUpQuery: {
            query: followUpQuery,
            context: `Analysis of ${listingTitle}`
          }
        }),
      });

      const data = await response.json();
      if (data.success && data.type === 'follow_up') {
        setFollowUpResponse(data.response);
        setFollowUpQuery('');
      }
    } catch (err) {
      console.error('Follow-up query failed:', err);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getConfidenceColor = (confidence: ConfidenceScore) => {
    switch (confidence.level) {
      case 'high': return 'text-green-400 bg-green-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-red-400 bg-red-900/20';
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-400/50';
      case 'high': return 'text-red-300 bg-red-900/20 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

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
    return recommendation.replace('_', ' ').toUpperCase();
  };

  const renderEnhancedInsight = (insight: EnhancedInsight, index: number) => (
    <div key={index} className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
      <div className="flex items-start justify-between mb-2">
        <p className="text-silver/90 text-sm leading-relaxed flex-1">{insight.content}</p>
        <div className={`ml-3 px-2 py-1 rounded text-xs font-semibold ${getConfidenceColor(insight.confidence)}`}>
          {insight.confidence.percentage}%
        </div>
      </div>

      {expandedSections.has(`insight-${index}`) && (
        <div className="mt-3 space-y-2">
          {insight.supportingData.length > 0 && (
            <div>
              <h6 className="text-xs font-semibold text-warm-white mb-1">Supporting Data:</h6>
              <ul className="text-xs text-silver/70">
                {insight.supportingData.map((data, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-gold mr-2">•</span>
                    {data}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insight.assumptions.length > 0 && (
            <div>
              <h6 className="text-xs font-semibold text-warm-white mb-1">Key Assumptions:</h6>
              <ul className="text-xs text-silver/60 italic">
                {insight.assumptions.map((assumption, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-silver/40 mr-2">→</span>
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-silver/50">
            Confidence: {insight.confidence.reasoning}
          </div>
        </div>
      )}

      <button
        onClick={() => toggleSection(`insight-${index}`)}
        className="mt-2 text-xs text-gold hover:text-gold/80 font-medium"
      >
        {expandedSections.has(`insight-${index}`) ? 'Show Less' : 'Show Details'}
      </button>
    </div>
  );

  const renderRiskMatrix = (risks: RiskFactor[]) => {
    const risksByCategory = risks.reduce((acc, risk) => {
      if (!acc[risk.category]) acc[risk.category] = [];
      acc[risk.category].push(risk);
      return acc;
    }, {} as Record<string, RiskFactor[]>);

    return (
      <div className="space-y-4">
        {Object.entries(risksByCategory).map(([category, categoryRisks]) => (
          <div key={category} className="p-4 bg-charcoal/20 rounded-luxury border border-red-400/20">
            <h5 className="text-md font-semibold text-red-400 mb-3 capitalize">
              {category.replace('_', ' ')} Risks
            </h5>
            <div className="space-y-2">
              {categoryRisks.map((risk, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getRiskColor(risk.severity)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-silver/90 flex-1">{risk.description}</p>
                    <div className="flex items-center space-x-2 ml-3">
                      <span className="text-xs font-semibold bg-black/30 px-2 py-1 rounded">
                        {risk.severity.toUpperCase()}
                      </span>
                      <span className={`text-xs px-1 py-0.5 rounded ${getConfidenceColor(risk.confidence)}`}>
                        {risk.confidence.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex text-xs text-silver/60 space-x-4">
                    <span>Likelihood: <strong>{risk.likelihood}</strong></span>
                    <span>Impact: <strong>{risk.impact}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Show upgrade prompt if user doesn't have access
  if (!hasAccess) {
    return (
      <SubscriptionUpgrade
        currentPlan={userPlan}
        requiredFeature="businessAnalysis"
        featureName="Enhanced AI Business Analysis"
        featureDescription="Get advanced AI analysis with confidence scoring, risk matrices, personalized perspectives, and interactive follow-up capabilities."
      />
    );
  }

  return (
    <div className="glass p-6 rounded-luxury-lg border border-gold/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-warm-white font-serif">
          Enhanced AI Business Analysis
          <span className="ml-2 text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">
            BETA
          </span>
        </h3>
      </div>

      {/* Analysis Configuration */}
      {!analysis && (
        <div className="mb-6 p-4 bg-navy/20 rounded-luxury border border-gold/10">
          <h4 className="text-md font-semibold text-warm-white mb-4">Analysis Settings</h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-silver/80 mb-2">Analysis Perspective</label>
              <select
                value={selectedPerspective}
                onChange={(e) => setSelectedPerspective(e.target.value as any)}
                className="w-full p-2 bg-charcoal/50 border border-gold/20 rounded-luxury text-warm-white focus:border-gold focus:outline-none"
              >
                <option value="general">General Analysis</option>
                <option value="strategic_buyer">Strategic Buyer</option>
                <option value="financial_buyer">Financial Buyer</option>
                <option value="first_time_buyer">First-Time Buyer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-silver/80 mb-2">Focus Areas (Optional)</label>
              <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                {focusAreaOptions.map((area) => (
                  <label key={area} className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={focusAreas.includes(area)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFocusAreas([...focusAreas, area]);
                        } else {
                          setFocusAreas(focusAreas.filter(a => a !== area));
                        }
                      }}
                      className="mr-1 w-3 h-3"
                    />
                    <span className="text-silver/70">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-400/30 rounded-luxury text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Generate/Regenerate Button */}
      <div className="mb-6">
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading}
          className="px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Performing Enhanced Analysis...</span>
            </div>
          ) : analysis ? (
            'Regenerate Enhanced Analysis'
          ) : (
            'Start Enhanced Analysis'
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Header with Overall Score and Recommendation */}
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-charcoal/50 rounded-luxury border border-gold/10">
            <div className="text-center">
              <div className="text-4xl font-bold text-gold font-mono mb-1">
                {analysis.overallScore}/100
              </div>
              <div className="text-sm text-silver/80 mb-2">Overall Score</div>
              <div className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(analysis.overallScoreConfidence)}`}>
                {analysis.overallScoreConfidence.percentage}% confidence
              </div>
            </div>

            <div className="text-center">
              <div className={`px-4 py-2 rounded-luxury border-2 font-semibold text-sm mb-2 ${getRecommendationColor(analysis.recommendation)}`}>
                {formatRecommendation(analysis.recommendation)}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(analysis.recommendationConfidence)}`}>
                {analysis.recommendationConfidence.percentage}% confidence
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 font-mono mb-1">
                {analysis.riskScore}/100
              </div>
              <div className="text-sm text-silver/80">Risk Score</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 bg-navy/30 rounded-luxury border border-gold/10">
            <h4 className="text-lg font-semibold text-warm-white mb-3 font-serif">Executive Summary</h4>
            <p className="text-silver/90 leading-relaxed mb-3">{analysis.executiveSummary}</p>
            <div className="text-xs text-silver/60">
              Analysis Perspective: <span className="text-gold font-medium">{analysis.perspective.replace('_', ' ')}</span>
              {analysis.perspectiveNotes && (
                <span className="ml-2 italic">• {analysis.perspectiveNotes}</span>
              )}
            </div>
          </div>

          {/* Enhanced Insights Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 bg-green-900/10 rounded-luxury border border-green-400/20">
              <h4 className="text-lg font-semibold text-green-400 mb-4 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Strengths ({analysis.strengths.length})
              </h4>
              <div className="space-y-3">
                {analysis.strengths.map((strength, index) => renderEnhancedInsight(strength, index))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="p-4 bg-yellow-900/10 rounded-luxury border border-yellow-400/20">
              <h4 className="text-lg font-semibold text-yellow-400 mb-4 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Areas of Concern ({analysis.weaknesses.length})
              </h4>
              <div className="space-y-3">
                {analysis.weaknesses.map((weakness, index) => renderEnhancedInsight(weakness, index + 100))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="md:col-span-2 p-4 bg-blue-900/10 rounded-luxury border border-blue-400/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-4 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Growth Opportunities ({analysis.opportunities.length})
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {analysis.opportunities.map((opportunity, index) => renderEnhancedInsight(opportunity, index + 200))}
              </div>
            </div>
          </div>

          {/* Risk Matrix */}
          <div className="p-4 bg-red-900/5 rounded-luxury border border-red-400/20">
            <h4 className="text-lg font-semibold text-red-400 mb-4 font-serif flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Comprehensive Risk Matrix ({analysis.riskMatrix.length} risks identified)
            </h4>
            {renderRiskMatrix(analysis.riskMatrix)}
          </div>

          {/* Detailed Insights */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
              <h4 className="text-lg font-semibold text-gold mb-3 font-serif">Valuation Insights</h4>
              {renderEnhancedInsight(analysis.valuationInsights, 300)}
            </div>

            <div className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
              <h4 className="text-lg font-semibold text-gold mb-3 font-serif">Market Position</h4>
              {renderEnhancedInsight(analysis.marketPosition, 301)}
            </div>

            <div className="p-4 bg-charcoal/30 rounded-luxury border border-gold/10">
              <h4 className="text-lg font-semibold text-gold mb-3 font-serif">Competitive Advantage</h4>
              {renderEnhancedInsight(analysis.competitiveAdvantage, 302)}
            </div>
          </div>

          {/* Action Items and Red Flags */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-900/10 rounded-luxury border border-blue-400/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-3 font-serif">Recommended Actions</h4>
              <ul className="space-y-2">
                {analysis.recommendedActions.map((action, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-blue-400 mr-2">→</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-red-900/10 rounded-luxury border border-red-400/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3 font-serif">Red Flags</h4>
              <ul className="space-y-2">
                {analysis.redFlags.map((flag, index) => (
                  <li key={index} className="text-silver/90 text-sm flex items-start">
                    <span className="text-red-400 mr-2">⚠</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Follow-up Query Section */}
          <div className="p-4 bg-charcoal/20 rounded-luxury border border-gold/20">
            <h4 className="text-lg font-semibold text-warm-white mb-3 font-serif">Ask Follow-up Questions</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                placeholder="Ask for deeper insights... (e.g., 'What are the biggest risks to the revenue model?')"
                className="flex-1 p-2 bg-charcoal/50 border border-gold/20 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleFollowUpQuery()}
              />
              <button
                onClick={handleFollowUpQuery}
                disabled={!followUpQuery.trim() || isFollowUpLoading}
                className="px-4 py-2 bg-gold text-midnight font-medium rounded-luxury hover:bg-gold/90 transition-all duration-300 disabled:opacity-50"
              >
                {isFollowUpLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Ask'
                )}
              </button>
            </div>

            {followUpResponse && (
              <div className="mt-4 p-3 bg-navy/30 rounded-luxury border border-gold/10">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-warm-white text-sm">AI Response</h5>
                  <div className={`text-xs px-2 py-1 rounded ${getConfidenceColor(followUpResponse.confidence)}`}>
                    {followUpResponse.confidence.percentage}% confidence
                  </div>
                </div>
                <p className="text-silver/90 text-sm leading-relaxed mb-3">{followUpResponse.answer}</p>

                {followUpResponse.relatedInsights.length > 0 && (
                  <div className="mb-3">
                    <h6 className="text-xs font-semibold text-warm-white mb-1">Related Insights:</h6>
                    <ul className="text-xs text-silver/70">
                      {followUpResponse.relatedInsights.map((insight, i) => (
                        <li key={i} className="flex items-start mb-1">
                          <span className="text-gold mr-2">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {followUpResponse.suggestedFollowUps.length > 0 && (
                  <div>
                    <h6 className="text-xs font-semibold text-warm-white mb-1">Suggested Follow-ups:</h6>
                    <div className="flex flex-wrap gap-1">
                      {followUpResponse.suggestedFollowUps.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setFollowUpQuery(suggestion)}
                          className="text-xs px-2 py-1 bg-gold/20 text-gold rounded hover:bg-gold/30 transition-all duration-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div className="p-3 bg-charcoal/10 rounded-luxury border border-gold/10 text-xs text-silver/60">
            <div className="flex items-center justify-between">
              <div>
                Analysis Date: {new Date(analysis.analysisDate).toLocaleString()} |
                Data Quality: <span className="text-gold">{analysis.dataQuality}</span> |
                Analysis Depth: <span className="text-gold">{analysis.analysisDepth}</span>
              </div>
            </div>
            {analysis.keyAssumptions.length > 0 && (
              <div className="mt-2">
                <strong>Key Assumptions:</strong> {analysis.keyAssumptions.join(' • ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
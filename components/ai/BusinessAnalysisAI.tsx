'use client';

import React, { useState } from 'react';
import { SuperEnhancedBusinessAnalysis, SuperConfidenceScore } from '@/lib/ai/super-enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { usePersistedAIAnalysis } from '@/lib/hooks/usePersistedAIAnalysis';
import ConversationalChatbox from './ConversationalChatbox';
import * as XLSX from 'xlsx';

interface BusinessAnalysisAIProps {
  listingId: string;
  listingTitle: string;
}

export default function BusinessAnalysisAI({ listingId, listingTitle }: BusinessAnalysisAIProps) {
  const { user, isLoading: authLoading } = useAuth();

  // Use the enhanced hook with auto-start (priority #1 - immediate)
  const {
    analysis,
    isLoading,
    error,
    startAnalysis,
    clearAnalysis,
  } = usePersistedAIAnalysis<SuperEnhancedBusinessAnalysis>(
    listingId,
    'business_analysis',
    {
      autoStart: true,
      initialDelay: 0, // Start immediately - most important analysis
    }
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
      if (!analysis) return;

      // Create a formatted text version of the entire analysis
      const formattedText = `
═══════════════════════════════════════════════════════
AI BUSINESS ANALYSIS
${listingTitle}
Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════

OVERALL SCORE: ${analysis.overallScore}/100
RECOMMENDATION: ${formatRecommendation(analysis.recommendation)}
${analysis.overallScoreConfidence ? `CONFIDENCE: ${analysis.overallScoreConfidence.score}% (${analysis.overallScoreConfidence.methodology})` : ''}

───────────────────────────────────────────────────────
EXECUTIVE SUMMARY
───────────────────────────────────────────────────────
${analysis.summary}

───────────────────────────────────────────────────────
KEY STRENGTHS
───────────────────────────────────────────────────────
${(analysis.strengths || []).map((s, i) => `
${i + 1}. ${s.insight}
   ${s.actionable}
   Probability: ${s.probability}% | Timeframe: ${s.timeframe}
   ${s.confidence ? `Confidence: ${s.confidence.score}%` : ''}
`).join('\n')}

───────────────────────────────────────────────────────
RISK FACTORS
───────────────────────────────────────────────────────
${(analysis.riskMatrix || []).map((r, i) => `
${i + 1}. [${r.severity?.toUpperCase()}] ${r.factor}
   ${r.description}
   Risk Score: ${r.riskScore}
   ${r.mitigationStrategies && r.mitigationStrategies.length > 0 ? `Mitigation: ${r.mitigationStrategies.join('; ')}` : ''}
`).join('\n')}

═══════════════════════════════════════════════════════
Analysis provided by Succedence AI
https://succedence.com
═══════════════════════════════════════════════════════
      `.trim();

      await navigator.clipboard.writeText(formattedText);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;

    // Create Excel workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['AI BUSINESS ANALYSIS REPORT'],
      [''],
      ['Listing', listingTitle],
      ['Analysis ID', listingId],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['OVERALL ASSESSMENT'],
      ['Overall Score', `${analysis.overallScore}/100`],
      ['Recommendation', formatRecommendation(analysis.recommendation)],
      ...(analysis.overallScoreConfidence ? [
        ['Confidence Score', `${analysis.overallScoreConfidence.score}%`],
        ['Methodology', analysis.overallScoreConfidence.methodology]
      ] : []),
      [''],
      ['EXECUTIVE SUMMARY'],
      [analysis.summary],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Strengths Sheet
    const strengthsData = [
      ['#', 'Insight', 'Description', 'Probability %', 'Timeframe', 'Confidence %', 'Reasoning'],
      ...(analysis.strengths || []).map((s, i) => [
        i + 1,
        s.insight || '',
        s.actionable || '',
        s.probability || 0,
        s.timeframe || '',
        s.confidence?.score || '',
        s.confidence?.reasoning || ''
      ])
    ];
    const wsStrengths = XLSX.utils.aoa_to_sheet(strengthsData);
    wsStrengths['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 40 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsStrengths, 'Key Strengths');

    // Risks Sheet
    const risksData = [
      ['#', 'Risk Factor', 'Severity', 'Description', 'Risk Score', 'Likelihood', 'Impact', 'Mitigation Strategies'],
      ...(analysis.riskMatrix || []).map((r, i) => [
        i + 1,
        r.factor || '',
        r.severity?.toUpperCase() || '',
        r.description || '',
        r.riskScore || 0,
        r.likelihood || 0,
        r.impact || 0,
        (r.mitigationStrategies || []).join('; ')
      ])
    ];
    const wsRisks = XLSX.utils.aoa_to_sheet(risksData);
    wsRisks['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 10 }, { wch: 40 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsRisks, 'Risk Assessment');

    // Export the workbook
    const timestamp = Date.now();
    XLSX.writeFile(wb, `business-analysis-${listingTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}.xlsx`);
  };

  const printAnalysis = () => {
    if (!analysis) return;

    // Create a print-friendly version of the analysis
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Business Analysis - ${listingTitle}</title>
          <style>
            @media print {
              @page { margin: 1.5cm; }
              body { margin: 0; }
            }
            body {
              font-family: 'Georgia', serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #1a1a1a;
              border-bottom: 3px solid #d4af37;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            h2 {
              color: #2a2a2a;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 5px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            h3 {
              color: #3a3a3a;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #d4af37;
            }
            .score-box {
              background: #f5f5f5;
              border: 2px solid #d4af37;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .score {
              font-size: 48px;
              font-weight: bold;
              color: #d4af37;
              margin: 10px 0;
            }
            .recommendation {
              display: inline-block;
              padding: 8px 16px;
              background: #d4af37;
              color: white;
              border-radius: 4px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 10px 0;
            }
            .strength, .risk {
              margin: 15px 0;
              padding: 15px;
              border-left: 4px solid #ccc;
              background: #fafafa;
              page-break-inside: avoid;
            }
            .strength {
              border-left-color: #4caf50;
            }
            .risk {
              border-left-color: #f44336;
            }
            .strength h4, .risk h4 {
              margin-top: 0;
              margin-bottom: 10px;
            }
            .meta {
              color: #666;
              font-size: 0.9em;
              margin-top: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
            .summary {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              font-size: 1.1em;
              line-height: 1.8;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AI Business Analysis Report</h1>
            <h2>${listingTitle}</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="score-box">
            <div>
              <strong>Overall Score</strong>
              <div class="score">${analysis.overallScore}/100</div>
            </div>
            <div>
              <span class="recommendation">${formatRecommendation(analysis.recommendation)}</span>
            </div>
            ${analysis.overallScoreConfidence ? `
              <div class="meta">
                Confidence: ${analysis.overallScoreConfidence.score}% (${analysis.overallScoreConfidence.methodology})
              </div>
            ` : ''}
          </div>

          <h2>Executive Summary</h2>
          <div class="summary">
            ${analysis.summary}
          </div>

          <h2>Key Strengths</h2>
          ${(analysis.strengths || []).map((s, i) => `
            <div class="strength">
              <h4>${i + 1}. ${s.insight}</h4>
              <p>${s.actionable}</p>
              <div class="meta">
                Probability: ${s.probability}% | Timeframe: ${s.timeframe}
                ${s.confidence ? ` | Confidence: ${s.confidence.score}%` : ''}
              </div>
            </div>
          `).join('')}

          <h2>Risk Factors</h2>
          ${(analysis.riskMatrix || []).map((r, i) => `
            <div class="risk">
              <h4>${i + 1}. ${r.factor} <span style="color: ${
                r.severity === 'critical' ? '#d32f2f' :
                r.severity === 'high' ? '#f57c00' :
                r.severity === 'medium' ? '#fbc02d' : '#689f38'
              }">[${r.severity?.toUpperCase()}]</span></h4>
              <p>${r.description}</p>
              <div class="meta">
                Risk Score: ${r.riskScore}/100
                ${r.mitigationStrategies && r.mitigationStrategies.length > 0 ? ` | Mitigation: ${r.mitigationStrategies.join('; ')}` : ''}
              </div>
            </div>
          `).join('')}

          <div class="footer">
            <p><strong>Analysis provided by Succedence AI Platform</strong></p>
            <p>https://succedence.com</p>
            <p>Printed: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    // Open print dialog with the formatted content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();

      // Wait for content to load before printing
      printWindow.onload = () => {
        printWindow.print();
      };
    }
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

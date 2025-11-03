'use client';

import React, { useState } from 'react';
import { SuperEnhancedBuyerMatch, SuperConfidenceScore } from '@/lib/ai/super-enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { usePersistedAIAnalysis } from '@/lib/hooks/usePersistedAIAnalysis';
import ConversationalChatbox from './ConversationalChatbox';
import * as XLSX from 'xlsx';

interface BuyerMatchAIProps {
  listingId: string;
  listingTitle: string;
}

export default function BuyerMatchAI({ listingId, listingTitle }: BuyerMatchAIProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Use the enhanced hook - manual trigger only
  const {
    analysis,
    isLoading,
    error,
    startAnalysis,
    clearAnalysis,
  } = usePersistedAIAnalysis<SuperEnhancedBuyerMatch>(
    listingId,
    'buyer_match'
  );

  // Check if user has access
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'buyerMatching', user?.role);

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

  const copyToClipboard = async () => {
    if (!analysis) return;
    try {
      const formattedText = `
═══════════════════════════════════════════════════════
BUYER COMPATIBILITY SCORE
${listingTitle}
Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════

MATCH SCORE: ${analysis.score || 0}%
RECOMMENDATION: ${analysis.recommendation?.replace('_', ' ').toUpperCase() || 'ANALYZING'}
${analysis.confidence ? `CONFIDENCE: ${analysis.confidence.score}% (${analysis.confidence.methodology})` : ''}

───────────────────────────────────────────────────────
SCORE BREAKDOWN
───────────────────────────────────────────────────────
Industry Fit: ${analysis.scoreBreakdown?.industryFit || 0}
Financial Fit: ${analysis.scoreBreakdown?.financialFit || 0}
Operational Fit: ${analysis.scoreBreakdown?.operationalFit || 0}
Cultural Fit: ${analysis.scoreBreakdown?.culturalFit || 0}
Strategic Fit: ${analysis.scoreBreakdown?.strategicFit || 0}

───────────────────────────────────────────────────────
COMPATIBILITY ANALYSIS
───────────────────────────────────────────────────────
Industry Experience: ${analysis.compatibility?.industryExperience?.insight || 'N/A'}
Financial Capacity: ${analysis.compatibility?.financialCapacity?.insight || 'N/A'}
Strategic Value: ${analysis.compatibility?.strategicValue?.insight || 'N/A'}

───────────────────────────────────────────────────────
SYNERGIES & OPPORTUNITIES
───────────────────────────────────────────────────────
${(analysis.synergies || []).slice(0, 3).map((s: any, i: number) => `${i + 1}. ${s?.insight || ''}`).join('\n')}

Growth Opportunities:
${(analysis.growthOpportunities || []).slice(0, 2).map((o: any, i: number) => `${i + 1}. ${o?.insight || ''}`).join('\n')}

───────────────────────────────────────────────────────
RISK ASSESSMENT
───────────────────────────────────────────────────────
${(analysis.risks || []).slice(0, 4).map((r: any, i: number) => `
${i + 1}. [${r?.severity?.toUpperCase() || 'MEDIUM'}] ${r?.factor || 'Risk'}
   ${r?.description || ''}
   Risk Score: ${r?.riskScore || 0}
`).join('\n')}

───────────────────────────────────────────────────────
STRATEGIC REASONING
───────────────────────────────────────────────────────
${(analysis.reasoning || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

═══════════════════════════════════════════════════════
Generated by Succedence AI
https://succedence.com
═══════════════════════════════════════════════════════
      `.trim();

      await navigator.clipboard.writeText(formattedText);
      setCopySuccess('match');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportToExcel = () => {
    if (!analysis) return;

    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['BUYER COMPATIBILITY SCORE REPORT'],
      [''],
      ['Listing', listingTitle],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['MATCH ASSESSMENT'],
      ['Match Score', `${analysis.score || 0}%`],
      ['Recommendation', analysis.recommendation?.replace('_', ' ').toUpperCase() || 'ANALYZING'],
      ...(analysis.confidence ? [
        ['Confidence Score', `${analysis.confidence.score}%`],
        ['Methodology', analysis.confidence.methodology || '']
      ] : []),
      [''],
      ['SCORE BREAKDOWN'],
      ['Industry Fit', analysis.scoreBreakdown?.industryFit || 0],
      ['Financial Fit', analysis.scoreBreakdown?.financialFit || 0],
      ['Operational Fit', analysis.scoreBreakdown?.operationalFit || 0],
      ['Cultural Fit', analysis.scoreBreakdown?.culturalFit || 0],
      ['Strategic Fit', analysis.scoreBreakdown?.strategicFit || 0],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Compatibility Sheet
    const compatData = [
      ['Area', 'Insight'],
      ['Industry Experience', analysis.compatibility?.industryExperience?.insight || ''],
      ['Financial Capacity', analysis.compatibility?.financialCapacity?.insight || ''],
      ['Strategic Value', analysis.compatibility?.strategicValue?.insight || ''],
    ];
    const wsCompat = XLSX.utils.aoa_to_sheet(compatData);
    wsCompat['!cols'] = [{ wch: 25 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsCompat, 'Compatibility');

    // Synergies & Opportunities Sheet
    const synergiesData = [
      ['Type', 'Description'],
      ['Synergies', ''],
      ...(analysis.synergies || []).map((s: any) => ['', s?.insight || '']),
      ['', ''],
      ['Growth Opportunities', ''],
      ...(analysis.growthOpportunities || []).map((o: any) => ['', o?.insight || '']),
    ];
    const wsSynergies = XLSX.utils.aoa_to_sheet(synergiesData);
    wsSynergies['!cols'] = [{ wch: 25 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsSynergies, 'Opportunities');

    // Risks Sheet
    const risksData = [
      ['#', 'Risk Factor', 'Severity', 'Description', 'Risk Score'],
      ...(analysis.risks || []).map((r: any, i: number) => [
        i + 1,
        r?.factor || '',
        r?.severity?.toUpperCase() || '',
        r?.description || '',
        r?.riskScore || 0
      ])
    ];
    const wsRisks = XLSX.utils.aoa_to_sheet(risksData);
    wsRisks['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 60 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsRisks, 'Risks');

    // Reasoning Sheet
    const reasoningData = [
      ['#', 'Strategic Reasoning'],
      ...(analysis.reasoning || []).map((r: string, i: number) => [i + 1, r])
    ];
    const wsReasoning = XLSX.utils.aoa_to_sheet(reasoningData);
    wsReasoning['!cols'] = [{ wch: 5 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(wb, wsReasoning, 'Strategic Reasoning');

    const timestamp = Date.now();
    XLSX.writeFile(wb, `buyer-match-${listingTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}.xlsx`);
  };

  const printMatch = () => {
    if (!analysis) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Buyer Compatibility Score - ${listingTitle}</title>
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
            .breakdown {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .breakdown-item {
              background: #fafafa;
              padding: 15px;
              border-left: 4px solid #d4af37;
            }
            .section {
              margin: 25px 0;
              padding: 15px;
              background: #fafafa;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .risk {
              margin: 15px 0;
              padding: 15px;
              background: #fff;
              border-left: 4px solid #f44336;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
            ul {
              list-style: none;
              padding-left: 0;
            }
            li:before {
              content: "→ ";
              color: #d4af37;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Buyer Compatibility Score</h1>
            <h2>${listingTitle}</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="score-box">
            <div class="score">${analysis.score || 0}%</div>
            <div class="recommendation">${analysis.recommendation?.replace('_', ' ').toUpperCase() || 'ANALYZING'}</div>
            ${analysis.confidence ? `<p style="margin-top: 10px; color: #666;">Confidence: ${analysis.confidence.score}% (${analysis.confidence.methodology})</p>` : ''}
          </div>

          <h2>Score Breakdown</h2>
          <div class="breakdown">
            <div class="breakdown-item">
              <strong>Industry Fit</strong>
              <div style="font-size: 24px; color: #d4af37;">${analysis.scoreBreakdown?.industryFit || 0}</div>
            </div>
            <div class="breakdown-item">
              <strong>Financial Fit</strong>
              <div style="font-size: 24px; color: #d4af37;">${analysis.scoreBreakdown?.financialFit || 0}</div>
            </div>
            <div class="breakdown-item">
              <strong>Operational Fit</strong>
              <div style="font-size: 24px; color: #d4af37;">${analysis.scoreBreakdown?.operationalFit || 0}</div>
            </div>
            <div class="breakdown-item">
              <strong>Cultural Fit</strong>
              <div style="font-size: 24px; color: #d4af37;">${analysis.scoreBreakdown?.culturalFit || 0}</div>
            </div>
            <div class="breakdown-item">
              <strong>Strategic Fit</strong>
              <div style="font-size: 24px; color: #d4af37;">${analysis.scoreBreakdown?.strategicFit || 0}</div>
            </div>
          </div>

          <h2>Compatibility Analysis</h2>
          <div class="section">
            <h3>Industry Experience</h3>
            <p>${analysis.compatibility?.industryExperience?.insight || 'N/A'}</p>
          </div>
          <div class="section">
            <h3>Financial Capacity</h3>
            <p>${analysis.compatibility?.financialCapacity?.insight || 'N/A'}</p>
          </div>
          <div class="section">
            <h3>Strategic Value</h3>
            <p>${analysis.compatibility?.strategicValue?.insight || 'N/A'}</p>
          </div>

          <h2>Synergies & Growth Opportunities</h2>
          <div class="section">
            <h3>Synergies</h3>
            <ul>
              ${(analysis.synergies || []).slice(0, 3).map((s: any) => `<li>${s?.insight || ''}</li>`).join('')}
            </ul>
            <h3>Growth Opportunities</h3>
            <ul>
              ${(analysis.growthOpportunities || []).slice(0, 2).map((o: any) => `<li>${o?.insight || ''}</li>`).join('')}
            </ul>
          </div>

          ${(analysis.risks || []).length > 0 ? `
            <h2>Risk Assessment</h2>
            ${(analysis.risks || []).slice(0, 4).map((r: any) => `
              <div class="risk">
                <h3>${r?.factor || 'Risk'} <span style="color: ${
                  r?.severity === 'critical' ? '#d32f2f' :
                  r?.severity === 'high' ? '#f57c00' :
                  r?.severity === 'medium' ? '#fbc02d' : '#689f38'
                }">[${r?.severity?.toUpperCase() || 'MEDIUM'}]</span></h3>
                <p>${r?.description || ''}</p>
                <p><strong>Risk Score:</strong> ${r?.riskScore || 0}</p>
              </div>
            `).join('')}
          ` : ''}

          <h2>Strategic Reasoning</h2>
          <div class="section">
            <ul>
              ${(analysis.reasoning || []).map((r: string) => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div class="footer">
            <p><strong>Generated by Succedence AI Platform</strong></p>
            <p>https://succedence.com</p>
            <p>Printed: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
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
        {!analysis && (
          <button
            onClick={() => startAnalysis(false)}
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

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-400/30 rounded-luxury text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* SuperEnhanced Match Score Display */}
          <div className={`text-center p-6 rounded-luxury border-2 ${analysis.score ? getScoreBackground(analysis.score) : 'bg-gray-900/20 border-gray-400/30'}`}>
            <div className={`text-4xl font-bold font-mono mb-2 ${analysis.score ? getScoreColor(analysis.score) : 'text-gray-400'}`}>
              {analysis.score || 0}%
            </div>
            <div className={`text-lg font-semibold ${analysis.score ? getScoreColor(analysis.score) : 'text-gray-400'}`}>
              {analysis.recommendation ? analysis.recommendation.replace('_', ' ').toUpperCase() : 'ANALYZING MATCH'}
            </div>
            <div className="text-sm text-silver/80 mt-2">
              SuperEnhanced compatibility analysis with strategic fit assessment
            </div>
            {analysis.confidence && analysis.confidence.score && (
              <div className={`text-xs mt-2 ${getConfidenceColor(analysis.confidence)}`}>
                {analysis.confidence.score}% confidence{analysis.confidence.methodology ? ` • ${analysis.confidence.methodology}` : ''}
              </div>
            )}
          </div>

          {/* Score Breakdown with SuperEnhanced Details */}
          {analysis.scoreBreakdown && (
            <div className="p-4 bg-purple-900/10 rounded-luxury border border-purple-400/20">
              <h4 className="text-lg font-semibold text-purple-400 mb-3 font-serif">Detailed Score Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{analysis.scoreBreakdown.industryFit || 0}</div>
                  <div className="text-xs text-silver/70">Industry Fit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{analysis.scoreBreakdown.financialFit || 0}</div>
                  <div className="text-xs text-silver/70">Financial Fit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{analysis.scoreBreakdown.operationalFit || 0}</div>
                  <div className="text-xs text-silver/70">Operational</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{analysis.scoreBreakdown.culturalFit || 0}</div>
                  <div className="text-xs text-silver/70">Cultural</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">{analysis.scoreBreakdown.strategicFit || 0}</div>
                  <div className="text-xs text-silver/70">Strategic</div>
                </div>
              </div>
            </div>
          )}

          {/* SuperEnhanced Compatibility Analysis */}
          {analysis.compatibility && (
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
                    <p className="text-xs text-silver/80">{analysis.compatibility.industryExperience.insight}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-300 text-sm">Financial Capacity</h5>
                    <p className="text-xs text-silver/80">{analysis.compatibility.financialCapacity.insight}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-300 text-sm">Strategic Value</h5>
                    <p className="text-xs text-silver/80">{analysis.compatibility.strategicValue.insight}</p>
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
                  {(analysis.synergies || []).slice(0, 3).map((synergy, index) => (
                    <li key={index} className="text-silver/90 text-xs flex items-start">
                      <span className="text-blue-400 mr-2">→</span>
                      {synergy?.insight || ''}
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <h5 className="font-medium text-blue-300 text-sm mb-1">Growth Opportunities</h5>
                  {(analysis.growthOpportunities || []).slice(0, 2).map((opportunity, index) =>
                    opportunity?.insight ? (
                      <p key={index} className="text-xs text-silver/80 mb-1">{opportunity.insight}</p>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {analysis.risks && (analysis.risks || []).length > 0 && (
            <div className="p-4 bg-red-900/10 rounded-luxury border border-red-400/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Risk Assessment
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {(analysis.risks || []).slice(0, 4).map((risk, index) => (
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
              {analysis.reasoning && analysis.reasoning.map((reason, index) => (
                <li key={index} className="text-silver/90 text-sm flex items-start">
                  <span className="text-gold mr-2">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Conversational AI Chatbox */}
          <ConversationalChatbox
            listingId={listingId}
            analysisType="buyer_match"
            previousAnalysis={{ ...analysis, listingTitle, listingId }}
            title="Ask About Buyer Compatibility"
            placeholder="Ask about compatibility factors, synergies, investment fit, or specific concerns..."
            icon={
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gold/10">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-neutral-800/40 border border-gold/20 text-silver rounded-luxury hover:bg-neutral-700/50 transition-all flex items-center gap-2 justify-center"
              title="Copy Match Analysis"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copySuccess === 'match' ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={exportToExcel}
              className="px-6 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary text-sm flex items-center gap-2 justify-center"
              title="Export to Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to Excel
            </button>

            <button
              onClick={printMatch}
              className="px-4 py-2 bg-neutral-800/40 border border-gold/20 text-silver rounded-luxury hover:bg-neutral-700/50 transition-all flex items-center gap-2 justify-center"
              title="Print Match Analysis"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
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

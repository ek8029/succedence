'use client';

import React, { useState } from 'react';
import { SuperEnhancedDueDiligence } from '@/lib/ai/super-enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { usePersistedAIAnalysis } from '@/lib/hooks/usePersistedAIAnalysis';
import ConversationalChatbox from './ConversationalChatbox';
import * as XLSX from 'xlsx';

interface DueDiligenceAIProps {
  listingId: string;
  listingTitle: string;
  industry: string;
}

export default function DueDiligenceAI({ listingId, listingTitle, industry }: DueDiligenceAIProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Use the enhanced hook - manual trigger only
  const {
    analysis,
    isLoading,
    error,
    startAnalysis,
    cancelAnalysis,
    clearAnalysis,
  } = usePersistedAIAnalysis<SuperEnhancedDueDiligence>(
    listingId,
    'due_diligence'
  );

  // Check if user has access
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'dueDiligence', user?.role);

  const toggleItem = (category: string, index: number) => {
    const itemKey = `${category.toLowerCase()}-${index}`;
    const newCompleted = new Set(completedItems);

    if (newCompleted.has(itemKey)) {
      newCompleted.delete(itemKey);
    } else {
      newCompleted.add(itemKey);
    }

    setCompletedItems(newCompleted);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'legal':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        );
      case 'operational':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'strategic':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'risks':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'text-green-400 bg-green-900/10 border-green-400/20';
      case 'legal':
        return 'text-blue-400 bg-blue-900/10 border-blue-400/20';
      case 'operational':
        return 'text-purple-400 bg-purple-900/10 border-purple-400/20';
      case 'strategic':
        return 'text-indigo-400 bg-indigo-900/10 border-indigo-400/20';
      case 'risks':
        return 'text-red-400 bg-red-900/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-900/10 border-gray-400/20';
    }
  };

  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const copyToClipboard = async () => {
    if (!analysis) return;
    try {
      const formattedText = `
═══════════════════════════════════════════════════════
DUE DILIGENCE CHECKLIST
${listingTitle}
Industry: ${industry}
Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════

PROGRESS: ${totalCompleted}/${totalItems} items completed (${Math.round(overallProgress)}%)

${(analysis.criticalItems || []).map((categoryData: any) => {
  const categoryName = categoryData.category || 'Category';
  const items = (categoryData.items || []).map((item: any) =>
    typeof item === 'string' ? item : item.task || 'Unnamed task'
  );
  return `
───────────────────────────────────────────────────────
${formatCategoryName(categoryName).toUpperCase()}
───────────────────────────────────────────────────────
${items.map((item: string, i: number) => {
  const itemKey = `${categoryName.toLowerCase()}-${i}`;
  const isCompleted = completedItems.has(itemKey);
  return `${isCompleted ? '[✓]' : '[ ]'} ${item}`;
}).join('\n')}
`;
}).join('\n')}

${analysis.timeline && Array.isArray(analysis.timeline) ? `
───────────────────────────────────────────────────────
RECOMMENDED TIMELINE
───────────────────────────────────────────────────────
${analysis.timeline.map((phase: any) => `
${phase.phase} (${phase.duration})
${phase.milestones ? phase.milestones.map((m: string) => `  • ${m}`).join('\n') : ''}
${phase.dependencies ? phase.dependencies.map((d: string) => `  → ${d}`).join('\n') : ''}
`).join('\n')}
` : ''}

═══════════════════════════════════════════════════════
Generated by Succedence AI
https://succedence.com
═══════════════════════════════════════════════════════
      `.trim();

      await navigator.clipboard.writeText(formattedText);
      setCopySuccess('checklist');
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
      ['DUE DILIGENCE CHECKLIST'],
      [''],
      ['Listing', listingTitle],
      ['Industry', industry],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['PROGRESS SUMMARY'],
      ['Total Items', totalItems],
      ['Completed Items', totalCompleted],
      ['Progress', `${Math.round(overallProgress)}%`],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Checklist Items by Category
    const checklistData = [
      ['Category', 'Item', 'Status', 'Item #'],
    ];
    (analysis.criticalItems || []).forEach((categoryData: any) => {
      const categoryName = categoryData.category || 'Category';
      const items = (categoryData.items || []).map((item: any) =>
        typeof item === 'string' ? item : item.task || 'Unnamed task'
      );
      items.forEach((item: string, i: number) => {
        const itemKey = `${categoryName.toLowerCase()}-${i}`;
        const isCompleted = completedItems.has(itemKey);
        checklistData.push([
          formatCategoryName(categoryName),
          item,
          isCompleted ? 'Completed' : 'Pending',
          `${i + 1}`
        ]);
      });
    });
    const wsChecklist = XLSX.utils.aoa_to_sheet(checklistData);
    wsChecklist['!cols'] = [{ wch: 20 }, { wch: 60 }, { wch: 12 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, wsChecklist, 'Checklist Items');

    // Timeline Sheet
    if (analysis.timeline && Array.isArray(analysis.timeline)) {
      const timelineData = [
        ['Phase', 'Duration', 'Milestones', 'Dependencies'],
        ...analysis.timeline.map((phase: any) => [
          phase.phase || '',
          phase.duration || '',
          (phase.milestones || []).join('; '),
          (phase.dependencies || []).join('; ')
        ])
      ];
      const wsTimeline = XLSX.utils.aoa_to_sheet(timelineData);
      wsTimeline['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 50 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(wb, wsTimeline, 'Timeline');
    }

    const timestamp = Date.now();
    XLSX.writeFile(wb, `due-diligence-${listingTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}.xlsx`);
  };

  const printChecklist = () => {
    if (!analysis) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Due Diligence Checklist - ${listingTitle}</title>
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
            .progress-box {
              background: #f5f5f5;
              border: 2px solid #d4af37;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .category {
              margin: 25px 0;
              padding: 15px;
              background: #fafafa;
              border-left: 4px solid #d4af37;
              page-break-inside: avoid;
            }
            .checklist-item {
              padding: 8px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .checklist-item:last-child {
              border-bottom: none;
            }
            .checkbox {
              display: inline-block;
              width: 16px;
              height: 16px;
              border: 2px solid #333;
              margin-right: 10px;
              vertical-align: middle;
            }
            .checkbox.checked {
              background: #d4af37;
              position: relative;
            }
            .checkbox.checked:after {
              content: '✓';
              position: absolute;
              top: -3px;
              left: 2px;
              color: white;
              font-weight: bold;
            }
            .timeline {
              margin: 25px 0;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .phase {
              margin: 15px 0;
              padding-left: 20px;
              border-left: 3px solid #d4af37;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Due Diligence Checklist</h1>
            <h2>${listingTitle}</h2>
            <p>Industry: ${industry}</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="progress-box">
            <h3>Overall Progress</h3>
            <div style="font-size: 32px; font-weight: bold; color: #d4af37; margin: 10px 0;">
              ${totalCompleted}/${totalItems}
            </div>
            <div>${Math.round(overallProgress)}% Complete</div>
          </div>

          ${(analysis.criticalItems || []).map((categoryData: any) => {
            const categoryName = categoryData.category || 'Category';
            const items = (categoryData.items || []).map((item: any) =>
              typeof item === 'string' ? item : item.task || 'Unnamed task'
            );
            const completed = items.filter((_: any, index: number) =>
              completedItems.has(`${categoryName.toLowerCase()}-${index}`)
            ).length;

            return `
              <div class="category">
                <h2>${formatCategoryName(categoryName)} <span style="color: #666; font-size: 0.8em;">(${completed}/${items.length})</span></h2>
                ${items.map((item: string, i: number) => {
                  const itemKey = `${categoryName.toLowerCase()}-${i}`;
                  const isCompleted = completedItems.has(itemKey);
                  return `
                    <div class="checklist-item">
                      <span class="checkbox ${isCompleted ? 'checked' : ''}"></span>
                      <span>${item}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}

          ${analysis.timeline && Array.isArray(analysis.timeline) ? `
            <h2>Recommended Timeline</h2>
            <div class="timeline">
              ${analysis.timeline.map((phase: any) => `
                <div class="phase">
                  <h3>${phase.phase} <span style="color: #666; font-weight: normal;">(${phase.duration})</span></h3>
                  ${phase.milestones && phase.milestones.length > 0 ? `
                    <p><strong>Milestones:</strong></p>
                    <ul>
                      ${phase.milestones.map((m: string) => `<li>${m}</li>`).join('')}
                    </ul>
                  ` : ''}
                  ${phase.dependencies && phase.dependencies.length > 0 ? `
                    <p><strong>Dependencies:</strong></p>
                    <ul>
                      ${phase.dependencies.map((d: string) => `<li>${d}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

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

  const renderChecklistSection = (title: string, items: string[], category: string) => {
    const completed = items.filter((_, index) => completedItems.has(`${category.toLowerCase()}-${index}`)).length;
    const progress = items.length > 0 ? (completed / items.length) * 100 : 0;

    return (
      <div className={`p-4 rounded-luxury border ${getCategoryColor(category)}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold font-serif flex items-center">
            {getCategoryIcon(category)}
            <span className="ml-2">{formatCategoryName(title)}</span>
          </h4>
          <div className="text-sm font-medium">
            {completed}/{items.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-current h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <ul className="space-y-2">
          {items.map((item, index) => {
            const itemKey = `${category.toLowerCase()}-${index}`;
            const isCompleted = completedItems.has(itemKey);

            return (
              <li key={index} className="flex items-start space-x-3">
                <button
                  onClick={() => toggleItem(category, index)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? 'bg-gold/20 border-gold text-gold'
                      : 'border-current hover:bg-current/10'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className={`text-sm leading-relaxed flex-1 ${isCompleted ? 'line-through opacity-60' : ''}`}>
                  {item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const totalItems = analysis ?
    (analysis.criticalItems || []).reduce((total: number, category: any) => total + (category.items || []).length, 0) : 0;
  const totalCompleted = completedItems.size;
  const overallProgress = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;

  // Show loading while auth is initializing
  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="glass p-6 rounded-luxury-lg border border-gold/20">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-silver">Loading due diligence...</span>
        </div>
      </div>
    );
  }

  // Show upgrade prompt if user doesn't have access
  if (!hasAccess) {
    return (
      <SubscriptionUpgrade
        currentPlan={userPlan}
        requiredFeature="dueDiligence"
        featureName="AI Due Diligence Assistant"
        featureDescription="Generate comprehensive, industry-specific due diligence checklists with progress tracking and export capabilities."
      />
    );
  }

  return (
    <div className="glass p-6 rounded-luxury-lg border border-gold/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-warm-white font-serif">
          AI Due Diligence Assistant
        </h3>
        {!analysis && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => startAnalysis(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Checklist'
              )}
            </button>
            {isLoading && (
              <button
                onClick={cancelAnalysis}
                className="px-4 py-2 bg-transparent border-2 border-red-400/30 text-red-400 font-medium rounded-luxury hover:border-red-400 hover:bg-red-400/10 transition-all duration-300 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
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
          {/* Overall Progress */}
          <div className="p-4 bg-charcoal/50 rounded-luxury border border-gold/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gold font-semibold">Overall Progress</span>
              <span className="text-gold font-mono">{totalCompleted}/{totalItems}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gold h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-silver/80 mt-2">
              Complete your due diligence checklist for {industry} acquisition
            </div>
          </div>

          {/* Checklist Sections */}
          <div className="space-y-4">
            {analysis.criticalItems && analysis.criticalItems.length > 0 ? (
              analysis.criticalItems.map((categoryData: any, index: number) => {
                const categoryName = categoryData.category || `Category ${index + 1}`;
                const items = (categoryData.items || []).map((item: any) =>
                  typeof item === 'string' ? item : item.task || 'Unnamed task'
                );

                return (
                  <div key={index}>
                    {renderChecklistSection(categoryName, items, categoryName.toLowerCase())}
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-gray-900/20 rounded-luxury border border-gray-400/20 text-center">
                <p className="text-silver/70">No checklist items available. Generate a new checklist to see due diligence tasks.</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          {analysis.timeline && Array.isArray(analysis.timeline) && (
            <div className="p-4 bg-navy/30 rounded-luxury border border-gold/10">
              <h4 className="text-lg font-semibold text-gold mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recommended Timeline
              </h4>
              <div className="space-y-3">
                {analysis.timeline.map((phase, index) => (
                  <div key={index} className="border-l-2 border-gold/30 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-gold">{phase.phase}</h5>
                      <span className="text-sm text-silver/80">{phase.duration}</span>
                    </div>
                    {phase.milestones && phase.milestones.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-silver/70 mb-1">Milestones:</p>
                        <ul className="text-sm text-silver/90 space-y-1">
                          {phase.milestones.map((milestone, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-gold mr-2">•</span>
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {phase.dependencies && phase.dependencies.length > 0 && (
                      <div>
                        <p className="text-xs text-silver/70 mb-1">Dependencies:</p>
                        <ul className="text-sm text-silver/90">
                          {phase.dependencies.map((dependency, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-orange-400 mr-2">→</span>
                              {dependency}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversational AI Chatbox */}
          <ConversationalChatbox
            listingId={listingId}
            analysisType="due_diligence"
            previousAnalysis={{ ...analysis, listingTitle, listingId, industry }}
            title="Ask About Due Diligence"
            placeholder="Ask about specific checklist items, timelines, requirements, or industry considerations..."
            icon={
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gold/10">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-neutral-800/40 border border-gold/20 text-silver rounded-luxury hover:bg-neutral-700/50 transition-all flex items-center gap-2 justify-center"
              title="Copy Checklist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copySuccess === 'checklist' ? 'Copied!' : 'Copy'}
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
              onClick={printChecklist}
              className="px-4 py-2 bg-neutral-800/40 border border-gold/20 text-silver rounded-luxury hover:bg-neutral-700/50 transition-all flex items-center gap-2 justify-center"
              title="Print Checklist"
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

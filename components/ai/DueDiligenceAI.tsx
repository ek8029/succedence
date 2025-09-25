'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DueDiligenceChecklist } from '@/lib/ai/openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useAIAnalysis } from '@/contexts/AIAnalysisContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';

interface DueDiligenceAIProps {
  listingId: string;
  listingTitle: string;
  industry: string;
}

export default function DueDiligenceAI({ listingId, listingTitle, industry }: DueDiligenceAIProps) {
  const { user } = useAuth();
  const { analysisCompletedTrigger, triggerAnalysisRefetch, refreshTrigger } = useAIAnalysis();
  const [checklist, setChecklist] = useState<DueDiligenceChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [hasCheckedForExisting, setHasCheckedForExisting] = useState(false);
  const analysisInProgressRef = useRef(false);

  // Check if user has access to due diligence feature
  const userPlan = (user?.plan as PlanType) || 'free';
  const hasAccess = hasAIFeatureAccess(userPlan, 'dueDiligence', user?.role);

  // Fetch existing analysis on component mount
  const fetchExistingAnalysis = useCallback(async () => {
    if (!user || hasCheckedForExisting) return;

    try {
      const response = await fetch(`/api/ai/history?analysisType=due_diligence&listingId=${listingId}&limit=1&page=1`);
      const data = await response.json();

      if (data.success && data.aiHistory && data.aiHistory.length > 0) {
        // Since API now filters by listingId, take the first (and only) result
        const existingAnalysis = data.aiHistory[0];
        if (existingAnalysis && existingAnalysis.analysis_data) {
          setChecklist(existingAnalysis.analysis_data);
        }
      }
    } catch (err) {
      console.error('Error fetching existing due diligence analysis:', err);
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
        sessionStorage.setItem(`due_diligence_${listingId}`, JSON.stringify(analysisState));
      } else if (!document.hidden) {
        // Tab is visible again - check for stored state
        const storedState = sessionStorage.getItem(`due_diligence_${listingId}`);
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
      const storedState = sessionStorage.getItem(`due_diligence_${listingId}`);
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
      if (!checklist && !hasCheckedForExisting) {
        fetchExistingAnalysis();
      }
    }
  }, [user, listingId, checklist, hasCheckedForExisting, fetchExistingAnalysis]);

  // Listen to analysis completion triggers from other components
  useEffect(() => {
    if (user && (analysisCompletedTrigger > 0 || refreshTrigger > 0)) {
      // Reset and refetch when other analyses complete
      setHasCheckedForExisting(false);
      if (!checklist) {
        fetchExistingAnalysis();
      }
    }
  }, [user, analysisCompletedTrigger, refreshTrigger, checklist, fetchExistingAnalysis]);

  // Clean up session storage when analysis completes
  useEffect(() => {
    if (!isLoading && checklist) {
      sessionStorage.removeItem(`due_diligence_${listingId}`);
    }
  }, [isLoading, checklist, listingId]);

  const handleGenerateChecklist = async () => {
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
    sessionStorage.setItem(`due_diligence_${listingId}`, JSON.stringify(analysisState));

    try {
      const response = await fetch('/api/ai/due-diligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate due diligence checklist');
      }

      setChecklist(data.checklist);

      // Notify other components that analysis completed
      triggerAnalysisRefetch();

      // Clear session storage on successful completion
      sessionStorage.removeItem(`due_diligence_${listingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate due diligence checklist');
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
    }
  };

  const toggleItem = (category: string, index: number) => {
    const itemKey = `${category}-${index}`;
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

  const renderChecklistSection = (title: string, items: string[], category: string) => {
    const completed = items.filter((_, index) => completedItems.has(`${category}-${index}`)).length;
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
            const itemKey = `${category}-${index}`;
            const isCompleted = completedItems.has(itemKey);

            return (
              <li key={index} className="flex items-start space-x-3">
                <button
                  onClick={() => toggleItem(category, index)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? 'bg-current border-current text-midnight'
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

  const totalItems = checklist ?
    checklist.financial.length + checklist.legal.length + checklist.operational.length +
    checklist.strategic.length + checklist.risks.length : 0;
  const totalCompleted = completedItems.size;
  const overallProgress = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;

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
        {!checklist && (
          <button
            onClick={handleGenerateChecklist}
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
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-400/30 rounded-luxury text-red-400">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {checklist && (
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
          <div className="grid md:grid-cols-2 gap-4">
            {renderChecklistSection('financial', checklist.financial, 'financial')}
            {renderChecklistSection('legal', checklist.legal, 'legal')}
            {renderChecklistSection('operational', checklist.operational, 'operational')}
            {renderChecklistSection('strategic', checklist.strategic, 'strategic')}
          </div>

          {/* Risk Factors - Full Width */}
          <div className="grid grid-cols-1 gap-4">
            {renderChecklistSection('risks', checklist.risks, 'risks')}
          </div>

          {/* Timeline */}
          <div className="p-4 bg-navy/30 rounded-luxury border border-gold/10">
            <h4 className="text-lg font-semibold text-gold mb-3 font-serif flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recommended Timeline
            </h4>
            <p className="text-silver/90 leading-relaxed">{checklist.timeline}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gold/10">
            <button
              onClick={handleGenerateChecklist}
              disabled={isLoading}
              className="px-6 py-2 bg-transparent border-2 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-sm disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate New Checklist'}
            </button>

            <button
              onClick={() => {
                const checklistData = {
                  listing: listingTitle,
                  industry,
                  checklist,
                  completed: Array.from(completedItems),
                  progress: overallProgress
                };

                const blob = new Blob([JSON.stringify(checklistData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `due-diligence-checklist-${listingTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-2 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary text-sm"
            >
              Export Checklist
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
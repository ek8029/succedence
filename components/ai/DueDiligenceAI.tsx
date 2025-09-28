'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SuperEnhancedDueDiligence } from '@/lib/ai/super-enhanced-openai';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { PlanType } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useAIAnalysis } from '@/contexts/AIAnalysisContext';
import SubscriptionUpgrade from '@/components/SubscriptionUpgrade';
import { useVisibilityProtectedRequest } from '@/lib/utils/page-visibility';
import { useResilientFetch } from '@/lib/utils/resilient-fetch';

interface DueDiligenceAIProps {
  listingId: string;
  listingTitle: string;
  industry: string;
}

export default function DueDiligenceAI({ listingId, listingTitle, industry }: DueDiligenceAIProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { analysisCompletedTrigger, triggerAnalysisRefetch, refreshTrigger } = useAIAnalysis();
  const { protectRequest } = useVisibilityProtectedRequest();
  const { fetchWithRetry } = useResilientFetch();
  const [checklist, setChecklist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [hasCheckedForExisting, setHasCheckedForExisting] = useState(false);
  const analysisInProgressRef = useRef(false);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState<string | null>(null);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);

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

  // Removed problematic tab visibility logic that caused infinite loading

  const pollForResult = useCallback(async (targetJobId?: string): Promise<any> => {
    let attempts = 0;
    const maxAttempts = 180; // 6 minutes max

    while (analysisInProgressRef.current && attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(
          `/api/ai/run-analysis?listingId=${listingId}&analysisType=due_diligence${
            targetJobId ? `&jobId=${targetJobId}` : ''
          }`,
          { credentials: 'include' }
        );
        const statusData = await statusResponse.json();

        if (statusData.status === 'completed' && statusData.result) {
          return statusData.result;
        } else if (statusData.status === 'error') {
          throw new Error(statusData.error || 'Due diligence analysis failed');
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
      throw new Error('Due diligence analysis timed out - but it may still be running in the background');
    }
    throw new Error('Due diligence analysis cancelled');
  }, [listingId]);

  const resumePolling = useCallback(async (resumeJobId?: string) => {
    try {
      const result = await pollForResult(resumeJobId);
      if (result) {
        setChecklist(result);
        console.log('✅ Due diligence analysis completed (resumed)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Due diligence analysis failed during resume');
      console.error('❌ Resumed due diligence analysis failed:', err);
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
    }
  }, [pollForResult]);

  const checkForOngoingAnalysis = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/ai/run-analysis?listingId=${listingId}&analysisType=due_diligence`,
        { credentials: 'include' }
      );
      const data = await response.json();

      if (response.ok && (data.status === 'processing' || data.status === 'queued')) {
        console.log('🔄 Resuming ongoing due diligence analysis:', data.jobId);
        setIsLoading(true);
        analysisInProgressRef.current = true;

        // Resume polling for the ongoing job
        resumePolling(data.jobId);
      } else if (data.status === 'completed' && data.result) {
        console.log('✅ Found completed due diligence analysis, loading result');
        setChecklist(data.result);
      }
    } catch (error) {
      console.warn('Failed to check for ongoing due diligence analysis:', error);
    }
  }, [listingId, resumePolling]);

  // Check for existing analysis on mount
  useEffect(() => {
    if (user && !checklist && !hasCheckedForExisting) {
      fetchExistingAnalysis();
    }
  }, [user, listingId, checklist, hasCheckedForExisting, fetchExistingAnalysis]);

  // Check for ongoing analysis when component mounts/remounts
  useEffect(() => {
    if (user && !checklist && !isLoading && hasCheckedForExisting && !analysisInProgressRef.current) {
      checkForOngoingAnalysis();
    }
  }, [user, checklist, isLoading, hasCheckedForExisting, checkForOngoingAnalysis]);

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

  // Removed session storage cleanup logic

  const handleGenerateChecklist = async () => {
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
          analysisType: 'due_diligence'
        }),
      });

      const startData = await startResponse.json();

      if (!startResponse.ok) {
        throw new Error(startData.error || 'Failed to start due diligence analysis');
      }

      // Use the shared polling function
      const result = await pollForResult();
      setChecklist(result);

      // Notify other components that analysis completed
      triggerAnalysisRefetch();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate due diligence checklist');
    } finally {
      setIsLoading(false);
      analysisInProgressRef.current = false;
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuery.trim() || !checklist || !user?.id) return;

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
          analysisType: 'due_diligence',
          question: followUpQuery.trim(),
          previousAnalysis: checklist
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

  const totalItems = checklist ?
    (checklist.criticalItems || []).reduce((total: number, category: any) => total + (category.items || []).length, 0) : 0;
  const totalCompleted = completedItems.size;
  const overallProgress = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;

  // Show loading while auth is initializing (prevents subscription popup on tab switch)
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
          <div className="space-y-4">
            {checklist.criticalItems && checklist.criticalItems.length > 0 ? (
              checklist.criticalItems.map((categoryData: any, index: number) => {
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
          {checklist.timeline && Array.isArray(checklist.timeline) && (
            <div className="p-4 bg-navy/30 rounded-luxury border border-gold/10">
              <h4 className="text-lg font-semibold text-gold mb-3 font-serif flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recommended Timeline
              </h4>
              <div className="space-y-3">
                {checklist.timeline.map((phase, index) => (
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
                placeholder="Ask about specific due diligence items, timelines, or requirements..."
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
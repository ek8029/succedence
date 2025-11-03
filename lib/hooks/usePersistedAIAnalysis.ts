/**
 * Enhanced Persisted AI Analysis Hook
 *
 * This hook provides robust state management for AI analyses that survives:
 * - Page refreshes
 * - Component remounts
 * - Tab switches
 * - Browser navigation
 *
 * Key improvements:
 * - Self-contained data fetching (no external useEffects needed)
 * - Ref-based fetch deduplication
 * - Stable callbacks that don't cause re-renders
 * - Automatic resume of in-progress analyses
 * - localStorage persistence with smart caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface PersistedAnalysisState<T> {
  data: T | null;
  timestamp: number;
  jobId?: string;
  status: 'idle' | 'loading' | 'completed' | 'error';
  error?: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours - aggressive caching for one-off usage
const POLL_INTERVAL = 2000; // 2 seconds
const POLL_MAX_ATTEMPTS = 180; // 6 minutes max

export function usePersistedAIAnalysis<T = any>(
  listingId: string,
  analysisType: string,
  options: {
    autoStart?: boolean;
    initialDelay?: number; // Delay before auto-starting in ms
  } = {}
) {
  const { autoStart = false, initialDelay = 0 } = options;
  const cacheKey = `ai-analysis-${analysisType}-${listingId}`;

  // State
  const [analysis, setAnalysis] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // Refs to prevent stale closures and manage fetch lifecycle
  const analysisRef = useRef<T | null>(null);
  const isLoadingRef = useRef(false);
  const isFetchingRef = useRef(false); // Prevents duplicate fetches
  const hasInitializedRef = useRef(false);
  const pollingAbortRef = useRef(false);
  const mountedRef = useRef(true);

  // Sync state to refs to avoid stale closures
  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Safe state setters that check if component is mounted
  const safeSetAnalysis = useCallback((data: T | null) => {
    if (mountedRef.current) {
      setAnalysis(data);
      analysisRef.current = data;
    }
  }, []);

  const safeSetLoading = useCallback((loading: boolean) => {
    if (mountedRef.current) {
      setIsLoading(loading);
      isLoadingRef.current = loading;
    }
  }, []);

  const safeSetError = useCallback((err: string | null) => {
    if (mountedRef.current) {
      setError(err);
    }
  }, []);

  const safeSetJobId = useCallback((id: string | null) => {
    if (mountedRef.current) {
      setJobId(id);
    }
  }, []);

  // Load from localStorage on mount (runs once)
  useEffect(() => {
    if (hasInitializedRef.current) return;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed: PersistedAnalysisState<T> = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;

        if (age < CACHE_DURATION) {
          console.log(`📦 Loaded ${analysisType} from cache (${Math.floor(age / 1000)}s old)`);

          if (parsed.data && parsed.status === 'completed') {
            // We have completed data, use it immediately
            safeSetAnalysis(parsed.data);
            safeSetJobId(parsed.jobId || null);
          } else if (parsed.status === 'loading' && parsed.jobId) {
            // Analysis was in progress, we'll check status below
            safeSetLoading(true);
            safeSetJobId(parsed.jobId);
          }
        } else {
          console.log(`🗑️ Cache expired for ${analysisType}, clearing`);
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (err) {
      console.error('Error loading from cache:', err);
      localStorage.removeItem(cacheKey);
    }

    hasInitializedRef.current = true;
  }, [cacheKey, analysisType, safeSetAnalysis, safeSetLoading, safeSetJobId]);

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const state: PersistedAnalysisState<T> = {
      data: analysis,
      timestamp: Date.now(),
      jobId: jobId || undefined,
      status: isLoading ? 'loading' : error ? 'error' : analysis ? 'completed' : 'idle',
      error: error || undefined,
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(state));
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  }, [analysis, jobId, isLoading, error, cacheKey]);

  // Polling function with ref-based control
  const pollForResult = useCallback(async (targetJobId: string): Promise<T | null> => {
    let attempts = 0;
    pollingAbortRef.current = false;

    while (!pollingAbortRef.current && attempts < POLL_MAX_ATTEMPTS && mountedRef.current) {
      try {
        const statusResponse = await fetch(
          `/api/ai/run-analysis?listingId=${listingId}&analysisType=${analysisType}${
            targetJobId ? `&jobId=${targetJobId}` : ''
          }`,
          { credentials: 'include' }
        );

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.statusText}`);
        }

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed' && statusData.result) {
          console.log(`✅ ${analysisType} analysis completed`);
          return statusData.result;
        } else if (statusData.status === 'error') {
          throw new Error(statusData.error || 'Analysis failed');
        }

        // Still processing, wait and try again
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        attempts++;
      } catch (pollError) {
        console.warn(`Poll error (attempt ${attempts + 1}):`, pollError);
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL + 1000));
        attempts++;
      }
    }

    if (pollingAbortRef.current) {
      throw new Error('Analysis cancelled');
    }
    if (attempts >= POLL_MAX_ATTEMPTS) {
      throw new Error('Analysis timed out - but it may still be running in the background');
    }
    return null;
  }, [listingId, analysisType]);

  // Check for existing or ongoing analysis (runs once after initialization)
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (isFetchingRef.current) return; // Already fetching
    if (analysisRef.current) return; // Already have data
    if (!mountedRef.current) return;

    const checkExistingAnalysis = async () => {
      isFetchingRef.current = true;

      try {
        // First, check history for completed analysis
        const historyResponse = await fetch(
          `/api/ai/history?analysisType=${analysisType}&listingId=${listingId}&limit=1&page=1`,
          { credentials: 'include' }
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.success && historyData.aiHistory && historyData.aiHistory.length > 0) {
            const existing = historyData.aiHistory[0];
            if (existing?.analysis_data) {
              console.log(`✅ Loaded existing ${analysisType} from database`);
              safeSetAnalysis(existing.analysis_data);
              safeSetLoading(false);
              isFetchingRef.current = false;
              return; // Found completed analysis
            }
          }
        }

        // If no completed analysis, check for ongoing
        const statusResponse = await fetch(
          `/api/ai/run-analysis?listingId=${listingId}&analysisType=${analysisType}`,
          { credentials: 'include' }
        );

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();

          if (statusData.status === 'completed' && statusData.result) {
            console.log(`✅ Found completed ${analysisType} analysis`);
            safeSetAnalysis(statusData.result);
            safeSetLoading(false);
          } else if (statusData.status === 'processing' || statusData.status === 'queued') {
            console.log(`🔄 Resuming ongoing ${analysisType} analysis:`, statusData.jobId);
            safeSetLoading(true);
            safeSetJobId(statusData.jobId);

            // Resume polling in background
            const result = await pollForResult(statusData.jobId);
            if (result) {
              safeSetAnalysis(result);
            }
            safeSetLoading(false);
          }
        }
      } catch (err) {
        console.error(`Error checking for existing ${analysisType}:`, err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Small delay to let cache load first, then check for auto-start
    const timeoutId = setTimeout(async () => {
      await checkExistingAnalysis();

      // Auto-start if enabled and no existing analysis
      if (autoStart && !analysisRef.current && !isLoadingRef.current) {
        console.log(`⏲️ Auto-starting ${analysisType} in ${initialDelay}ms`);
        if (initialDelay > 0) {
          setTimeout(() => {
            if (mountedRef.current && !analysisRef.current && !isLoadingRef.current) {
              startAnalysis(false);
            }
          }, initialDelay);
        } else {
          startAnalysis(false);
        }
      }
    }, 100);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitializedRef.current]); // Only runs once after initialization

  // Start new analysis
  const startAnalysis = useCallback(async (forceNew: boolean = false, params?: any): Promise<void> => {
    if (isFetchingRef.current && !forceNew) {
      console.log(`⏭️ Analysis already in progress, skipping`);
      return;
    }

    pollingAbortRef.current = false;
    isFetchingRef.current = true;
    safeSetLoading(true);
    safeSetError(null);

    try {
      const startResponse = await fetch('/api/ai/run-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          listingId,
          analysisType,
          forceNew,
          ...(params && { parameters: params }),
        }),
      });

      const startData = await startResponse.json();

      if (!startResponse.ok) {
        throw new Error(startData.error || `Failed to start ${analysisType} analysis`);
      }

      console.log(`🚀 Started ${analysisType} analysis with job ID:`, startData.jobId);
      safeSetJobId(startData.jobId);

      // Poll for result
      const result = await pollForResult(startData.jobId);
      if (result) {
        safeSetAnalysis(result);
        safeSetError(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to analyze ${analysisType}`;
      console.error(`❌ ${analysisType} analysis error:`, errorMsg);
      safeSetError(errorMsg);
    } finally {
      safeSetLoading(false);
      isFetchingRef.current = false;
    }
  }, [listingId, analysisType, pollForResult, safeSetLoading, safeSetError, safeSetAnalysis, safeSetJobId]);

  // Clear cache and reset
  const clearAnalysis = useCallback(() => {
    pollingAbortRef.current = true;
    localStorage.removeItem(cacheKey);
    safeSetAnalysis(null);
    safeSetError(null);
    safeSetJobId(null);
    safeSetLoading(false);
    isFetchingRef.current = false;
  }, [cacheKey, safeSetAnalysis, safeSetError, safeSetJobId, safeSetLoading]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      pollingAbortRef.current = true;
    };
  }, []);

  return {
    analysis,
    isLoading,
    error,
    jobId,
    startAnalysis,
    clearAnalysis,
    // For backward compatibility
    analysisInProgressRef: isLoadingRef,
    updateAnalysis: safeSetAnalysis,
    setLoadingState: safeSetLoading,
    setErrorState: safeSetError,
    clearCache: clearAnalysis,
  };
}

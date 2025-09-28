'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Job } from '@/lib/kv'

type AnalysisType = 'business_analysis' | 'market_intelligence' | 'due_diligence' | 'buyer_match'

interface UseAnalysisReturn {
  job: Job | null
  isLoading: boolean
  error: string | null
  start: (listingId: string, analysisType: AnalysisType, params?: Record<string, any>) => Promise<void>
  attach: (listingId: string, analysisType: AnalysisType) => void
  cancel: () => Promise<void>
  clear: () => void
}

const STORAGE_KEY_PREFIX = 'analysis:'
const SESSION_KEY_PREFIX = 'job:'
const CACHE_EXPIRY_TIME = 30 * 60 * 1000 // 30 minutes

// Polling with exponential backoff + jitter
function getBackoffDelay(attempt: number): number {
  const base = 500 // 0.5s
  const max = 10000 // 10s cap
  const delay = Math.min(base * Math.pow(2, attempt), max)
  const jitter = Math.random() * 300 // 0-300ms jitter
  return delay + jitter
}

export function useAnalysis(): UseAnalysisReturn {
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollAttemptRef = useRef(0)
  const currentJobIdRef = useRef<string | null>(null)

  // Save job state to sessionStorage with timestamp
  const saveJobToSession = useCallback((job: Job) => {
    try {
      const jobWithTimestamp = {
        ...job,
        cachedAt: Date.now()
      }
      sessionStorage.setItem(`${SESSION_KEY_PREFIX}${job.id}`, JSON.stringify(jobWithTimestamp))
    } catch (e) {
      console.warn('Failed to save job to sessionStorage:', e)
    }
  }, [])

  // Load job state from sessionStorage with expiry check
  const loadJobFromSession = useCallback((jobId: string): Job | null => {
    try {
      const stored = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${jobId}`)
      if (!stored) return null

      const jobData = JSON.parse(stored)

      // Check if cache is expired
      if (jobData.cachedAt && (Date.now() - jobData.cachedAt) > CACHE_EXPIRY_TIME) {
        console.log('🗑️ Removing expired job cache:', jobId)
        sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${jobId}`)
        return null
      }

      // Remove the cachedAt timestamp before returning
      const { cachedAt, ...job } = jobData
      return job
    } catch (e) {
      console.warn('Failed to load job from sessionStorage:', e)
      return null
    }
  }, [])

  // Save active job reference to localStorage
  const saveJobReference = useCallback((listingId: string, analysisType: AnalysisType, jobId: string) => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${listingId}:${analysisType}`, jobId)
    } catch (e) {
      console.warn('Failed to save job reference:', e)
    }
  }, [])

  // Load active job reference from localStorage
  const loadJobReference = useCallback((listingId: string, analysisType: AnalysisType): string | null => {
    try {
      return localStorage.getItem(`${STORAGE_KEY_PREFIX}${listingId}:${analysisType}`)
    } catch (e) {
      console.warn('Failed to load job reference:', e)
      return null
    }
  }, [])

  // Clear job reference from localStorage
  const clearJobReference = useCallback((listingId: string, analysisType: AnalysisType) => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${listingId}:${analysisType}`)
    } catch (e) {
      console.warn('Failed to clear job reference:', e)
    }
  }, [])

  // Clear all stale cached data
  const clearStaleCache = useCallback(() => {
    try {
      // Clear expired session storage items
      const keysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key?.startsWith(SESSION_KEY_PREFIX)) {
          try {
            const stored = sessionStorage.getItem(key)
            if (stored) {
              const jobData = JSON.parse(stored)
              if (jobData.cachedAt && (Date.now() - jobData.cachedAt) > CACHE_EXPIRY_TIME) {
                keysToRemove.push(key)
              }
            }
          } catch (e) {
            // Invalid data, mark for removal
            keysToRemove.push(key)
          }
        }
      }

      keysToRemove.forEach(key => {
        console.log('🗑️ Removing stale cache:', key)
        sessionStorage.removeItem(key)
      })

      console.log(`🧹 Cleared ${keysToRemove.length} stale cache entries`)
    } catch (e) {
      console.warn('Failed to clear stale cache:', e)
    }
  }, [])

  // Clear polling timeout
  const clearPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
  }, [])

  // Poll job status using the AI endpoint
  const pollStatus = useCallback(async (analysisKey: string) => {
    try {
      const [listingId, analysisType] = analysisKey.split(':')
      const response = await fetch(`/api/ai/run-analysis?listingId=${listingId}&analysisType=${analysisType}`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Convert AI response to Job format
      const updatedJob: Job = {
        id: analysisKey,
        listingId,
        analysisType: analysisType as Job['analysisType'],
        params: {},
        status: result.status === 'processing' ? 'running' :
                result.status === 'completed' ? 'succeeded' :
                result.status === 'error' ? 'failed' : 'queued',
        progress: result.progress || 0,
        partialOutput: result.partialOutput,
        result: result.result,
        error: result.error,
        createdAt: result.startedAt || Date.now(),
        updatedAt: Date.now()
      }

      // Update state
      setJob(updatedJob)
      saveJobToSession(updatedJob)

      // Reset error on successful poll
      setError(null)
      pollAttemptRef.current = 0

      // Check if job is in terminal state
      if (['succeeded', 'failed', 'canceled'].includes(updatedJob.status)) {
        setIsLoading(false)
        clearPolling()

        // Clear references for completed jobs
        clearJobReference(updatedJob.listingId, updatedJob.analysisType)

        return true // Terminal state reached
      }

      return false // Continue polling

    } catch (err) {
      console.error('Polling error:', err)
      pollAttemptRef.current++

      // Set error but don't stop polling - network issues are temporary
      setError(err instanceof Error ? err.message : 'Status check failed')

      return false // Continue polling despite error
    }
  }, [saveJobToSession, clearJobReference])

  // Start polling with backoff
  const startPolling = useCallback((jobId: string) => {
    clearPolling()

    const poll = async () => {
      // Check if we should stop polling
      if (currentJobIdRef.current !== jobId) {
        return
      }

      const isTerminal = await pollStatus(jobId)

      if (!isTerminal && currentJobIdRef.current === jobId) {
        // Schedule next poll with backoff
        const delay = getBackoffDelay(pollAttemptRef.current)
        pollTimeoutRef.current = setTimeout(poll, delay)
      }
    }

    // Start immediately
    poll()
  }, [pollStatus, clearPolling])

  // Start a new analysis using the AI endpoint
  const start = useCallback(async (
    listingId: string,
    analysisType: AnalysisType,
    params?: Record<string, any>
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      // Generate unique poller ID for this client
      const pollerId = `poller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const response = await fetch('/api/ai/run-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          analysisType,
          parameters: params,
          pollerId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start analysis')
      }

      const result = await response.json()

      // Create analysis key for tracking
      const analysisKey = `${listingId}:${analysisType}`

      // Save reference and start polling
      saveJobReference(listingId, analysisType, analysisKey)
      currentJobIdRef.current = analysisKey

      // Create initial job state
      const initialJob: Job = {
        id: analysisKey,
        listingId,
        analysisType: analysisType as Job['analysisType'],
        params: params || {},
        status: 'running',
        progress: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      setJob(initialJob)
      saveJobToSession(initialJob)

      startPolling(analysisKey)

    } catch (err) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to start analysis')
    }
  }, [saveJobReference, saveJobToSession, startPolling])

  // Attach to existing analysis
  const attach = useCallback((listingId: string, analysisType: AnalysisType) => {
    const analysisKey = `${listingId}:${analysisType}`
    const storedKey = loadJobReference(listingId, analysisType)

    // Clear stale cache on attach
    clearStaleCache()

    // Use stored key if available, otherwise use the analysis key
    const keyToUse = storedKey || analysisKey

    setIsLoading(false) // Start conservative - don't show loading immediately
    setError(null)
    setJob(null) // Clear any previous job state

    // Don't immediately show cached data - verify with server first
    currentJobIdRef.current = keyToUse

    // Start polling to get current status (this will load cached data if valid)
    startPolling(keyToUse)
  }, [loadJobReference, clearStaleCache, startPolling])

  // Cancel current analysis (stop polling)
  const cancel = useCallback(async () => {
    if (!job?.id) return

    try {
      // AI endpoints don't support cancellation, so just stop polling
      clearPolling()
      currentJobIdRef.current = null
      setIsLoading(false)

      // Update job status to canceled locally
      if (job) {
        const canceledJob = {
          ...job,
          status: 'canceled' as const,
          updatedAt: Date.now()
        }
        setJob(canceledJob)
        saveJobToSession(canceledJob)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel analysis')
    }
  }, [job, clearPolling, saveJobToSession])

  // Clear current state
  const clear = useCallback(() => {
    clearPolling()
    currentJobIdRef.current = null
    setJob(null)
    setIsLoading(false)
    setError(null)
    pollAttemptRef.current = 0
    clearStaleCache() // Clean up stale data when clearing
  }, [clearPolling, clearStaleCache])

  // Clean stale cache on mount
  useEffect(() => {
    clearStaleCache()
  }, [clearStaleCache])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling()
    }
  }, [clearPolling])

  return {
    job,
    isLoading,
    error,
    start,
    attach,
    cancel,
    clear
  }
}
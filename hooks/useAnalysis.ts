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

  // Save job state to sessionStorage for instant restore
  const saveJobToSession = useCallback((job: Job) => {
    try {
      sessionStorage.setItem(`${SESSION_KEY_PREFIX}${job.id}`, JSON.stringify(job))
    } catch (e) {
      console.warn('Failed to save job to sessionStorage:', e)
    }
  }, [])

  // Load job state from sessionStorage
  const loadJobFromSession = useCallback((jobId: string): Job | null => {
    try {
      const stored = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${jobId}`)
      return stored ? JSON.parse(stored) : null
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

  // Clear polling timeout
  const clearPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
  }, [])

  // Poll job status
  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/analysis/status?jobId=${jobId}`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`)
      }

      const updatedJob: Job = await response.json()

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

  // Start a new analysis
  const start = useCallback(async (
    listingId: string,
    analysisType: AnalysisType,
    params?: Record<string, any>
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, analysisType, params })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to start analysis')
      }

      const { jobId } = await response.json()

      // Save reference and start polling
      saveJobReference(listingId, analysisType, jobId)
      currentJobIdRef.current = jobId

      // Try to load cached job state for instant feedback
      const cachedJob = loadJobFromSession(jobId)
      if (cachedJob) {
        setJob(cachedJob)
      }

      startPolling(jobId)

    } catch (err) {
      setIsLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to start analysis')
    }
  }, [saveJobReference, loadJobFromSession, startPolling])

  // Attach to existing job
  const attach = useCallback((listingId: string, analysisType: AnalysisType) => {
    const jobId = loadJobReference(listingId, analysisType)
    if (!jobId) return

    setIsLoading(true)
    setError(null)

    // Load cached state immediately
    const cachedJob = loadJobFromSession(jobId)
    if (cachedJob) {
      setJob(cachedJob)

      // If already terminal, don't start polling
      if (['succeeded', 'failed', 'canceled'].includes(cachedJob.status)) {
        setIsLoading(false)
        return
      }
    }

    currentJobIdRef.current = jobId
    startPolling(jobId)
  }, [loadJobReference, loadJobFromSession, startPolling])

  // Cancel current job
  const cancel = useCallback(async () => {
    if (!job?.id) return

    try {
      const response = await fetch('/api/analysis/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel job')
      }

      // Continue polling to see cancellation take effect
      // The polling will stop automatically when status becomes 'canceled'

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel analysis')
    }
  }, [job?.id])

  // Clear current state
  const clear = useCallback(() => {
    clearPolling()
    currentJobIdRef.current = null
    setJob(null)
    setIsLoading(false)
    setError(null)
    pollAttemptRef.current = 0
  }, [clearPolling])

  // Auto-attach on mount (for page refreshes)
  useEffect(() => {
    // This will be called by components when they mount
    // Components should call attach() with their listingId and analysisType
  }, [])

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
/**
 * Enhanced Server-Side Analysis Manager
 * Robust storage with better persistence, progress tracking, and auto-resume
 */

interface AnalysisEntry {
  id: string
  listingId: string
  analysisType: string
  status: 'pending' | 'processing' | 'completed' | 'error' | 'cancelled'
  result?: any
  error?: string
  startedAt: number
  completedAt?: number
  progress?: number
  partialOutput?: string
  retryCount?: number
  lastHeartbeat?: number
  parameters?: Record<string, any>
  userId?: string
}

// Enhanced in-memory store with better persistence
const analysisStore = new Map<string, AnalysisEntry>()

// Track active polling clients to prevent zombie processes
const activePollers = new Map<string, Set<string>>()

export function getAnalysisKey(listingId: string, analysisType: string): string {
  return `${listingId}:${analysisType}`
}

export function storeAnalysis(
  listingId: string,
  analysisType: string,
  data: any,
  userId?: string,
  parameters?: Record<string, any>
) {
  const key = getAnalysisKey(listingId, analysisType)
  const existing = analysisStore.get(key)
  analysisStore.set(key, {
    ...existing,
    id: key,
    listingId,
    analysisType,
    status: 'completed',
    result: data,
    startedAt: existing?.startedAt || Date.now(),
    completedAt: Date.now(),
    progress: 100,
    partialOutput: undefined,
    userId,
    parameters,
    lastHeartbeat: Date.now()
  })
}

export function getStoredAnalysis(listingId: string, analysisType: string): AnalysisEntry | undefined {
  const key = getAnalysisKey(listingId, analysisType)
  const analysis = analysisStore.get(key)

  // Update heartbeat when accessed
  if (analysis) {
    analysis.lastHeartbeat = Date.now()
  }

  return analysis
}

export function setAnalysisProcessing(
  listingId: string,
  analysisType: string,
  userId?: string,
  parameters?: Record<string, any>
) {
  const key = getAnalysisKey(listingId, analysisType)
  analysisStore.set(key, {
    id: key,
    listingId,
    analysisType,
    status: 'processing',
    startedAt: Date.now(),
    progress: 0,
    retryCount: 0,
    userId,
    parameters,
    lastHeartbeat: Date.now()
  })
}

export function updateAnalysisProgress(
  listingId: string,
  analysisType: string,
  progress: number,
  partialOutput?: string
) {
  const key = getAnalysisKey(listingId, analysisType)
  const existing = analysisStore.get(key)
  if (existing) {
    existing.progress = progress
    existing.partialOutput = partialOutput
    existing.lastHeartbeat = Date.now()
  }
}

export function setAnalysisError(
  listingId: string,
  analysisType: string,
  error: string
) {
  const key = getAnalysisKey(listingId, analysisType)
  const existing = analysisStore.get(key)
  if (existing) {
    existing.status = 'error'
    existing.error = error
    existing.completedAt = Date.now()
    existing.progress = 100
    existing.retryCount = (existing.retryCount || 0) + 1
    existing.lastHeartbeat = Date.now()
  }
}

export function registerPoller(listingId: string, analysisType: string, pollerId: string) {
  const key = getAnalysisKey(listingId, analysisType)
  if (!activePollers.has(key)) {
    activePollers.set(key, new Set())
  }
  activePollers.get(key)!.add(pollerId)
}

export function unregisterPoller(listingId: string, analysisType: string, pollerId: string) {
  const key = getAnalysisKey(listingId, analysisType)
  const pollers = activePollers.get(key)
  if (pollers) {
    pollers.delete(pollerId)
    if (pollers.size === 0) {
      activePollers.delete(key)
    }
  }
}

export function hasActivePollers(listingId: string, analysisType: string): boolean {
  const key = getAnalysisKey(listingId, analysisType)
  const pollers = activePollers.get(key)
  return pollers ? pollers.size > 0 : false
}

export function retryAnalysis(listingId: string, analysisType: string): boolean {
  const existing = getStoredAnalysis(listingId, analysisType)
  if (existing && existing.status === 'error' && (existing.retryCount || 0) < 3) {
    existing.status = 'pending'
    existing.error = undefined
    existing.progress = 0
    existing.retryCount = (existing.retryCount || 0) + 1
    existing.lastHeartbeat = Date.now()
    return true
  }
  return false
}

// Enhanced cleanup with better logic
setInterval(() => {
  const now = Date.now()
  const oneHour = 60 * 60 * 1000
  const thirtyMinutes = 30 * 60 * 1000

  for (const [key, analysis] of analysisStore.entries()) {
    let shouldDelete = false

    // Delete completed analyses older than 1 hour
    if (analysis.status === 'completed' && now - analysis.startedAt > oneHour) {
      shouldDelete = true
    }

    // Delete failed analyses older than 30 minutes
    if (analysis.status === 'error' && now - analysis.startedAt > thirtyMinutes) {
      shouldDelete = true
    }

    // Delete stale processing analyses (no heartbeat for 10 minutes and no active pollers)
    if (analysis.status === 'processing' &&
        analysis.lastHeartbeat &&
        now - analysis.lastHeartbeat > 10 * 60 * 1000 &&
        !hasActivePollers(analysis.listingId, analysis.analysisType)) {
      analysis.status = 'error'
      analysis.error = 'Analysis timed out'
      analysis.completedAt = now
    }

    if (shouldDelete) {
      analysisStore.delete(key)
      activePollers.delete(key)
    }
  }
}, 2 * 60 * 1000) // Clean every 2 minutes

// Export for debugging
export function getAnalysisStore() {
  return analysisStore
}

export function getActivePollers() {
  return activePollers
}
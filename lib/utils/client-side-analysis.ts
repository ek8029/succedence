/**
 * Client-Side Analysis State Management
 * Handles localStorage persistence, auto-resume, and robust state management
 */

interface ClientAnalysisState {
  listingId: string
  analysisType: string
  status: 'idle' | 'starting' | 'polling' | 'completed' | 'error'
  result?: any
  error?: string
  startedAt?: number
  completedAt?: number
  progress?: number
  partialOutput?: string
  pollerId: string
  lastPoll?: number
  retryCount?: number
}

class ClientAnalysisManager {
  private storageKey = 'dealsense_analysis_state'
  private state: Map<string, ClientAnalysisState> = new Map()
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    this.loadFromStorage()
    this.setupStorageListener()
    this.setupPageVisibilityHandler()
  }

  private getKey(listingId: string, analysisType: string): string {
    return `${listingId}:${analysisType}`
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        Object.entries(data).forEach(([key, value]) => {
          this.state.set(key, value as ClientAnalysisState)
        })
      }
    } catch (error) {
      console.warn('Failed to load analysis state from localStorage:', error)
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return

    try {
      const data = Object.fromEntries(this.state.entries())
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save analysis state to localStorage:', error)
    }
  }

  private setupStorageListener() {
    if (typeof window === 'undefined') return

    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        this.loadFromStorage()
      }
    })
  }

  private setupPageVisibilityHandler() {
    if (typeof document === 'undefined') return

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page became visible, resume any pending analyses
        this.resumePendingAnalyses()
      }
    })
  }

  private resumePendingAnalyses() {
    Array.from(this.state.entries()).forEach(([key, analysis]) => {
      if (analysis.status === 'polling' || analysis.status === 'starting') {
        // Resume polling for this analysis
        this.startPolling(analysis.listingId, analysis.analysisType, analysis.pollerId)
      }
    })
  }

  public startAnalysis(
    listingId: string,
    analysisType: string,
    onProgress?: (progress: number, partialOutput?: string) => void,
    onComplete?: (result: any) => void,
    onError?: (error: string) => void
  ): string {
    const key = this.getKey(listingId, analysisType)
    const pollerId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const analysis: ClientAnalysisState = {
      listingId,
      analysisType,
      status: 'starting',
      pollerId,
      startedAt: Date.now(),
      retryCount: 0
    }

    this.state.set(key, analysis)
    this.saveToStorage()

    // Start the analysis
    this.initiateServerAnalysis(listingId, analysisType, pollerId)
      .then(() => {
        analysis.status = 'polling'
        this.saveToStorage()
        this.startPolling(listingId, analysisType, pollerId, onProgress, onComplete, onError)
      })
      .catch((error) => {
        analysis.status = 'error'
        analysis.error = error.message
        analysis.completedAt = Date.now()
        this.saveToStorage()
        onError?.(error.message)
      })

    return pollerId
  }

  private async initiateServerAnalysis(
    listingId: string,
    analysisType: string,
    pollerId: string
  ): Promise<void> {
    const response = await fetch('/api/ai/run-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        listingId,
        analysisType,
        pollerId
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to start analysis')
    }
  }

  private startPolling(
    listingId: string,
    analysisType: string,
    pollerId: string,
    onProgress?: (progress: number, partialOutput?: string) => void,
    onComplete?: (result: any) => void,
    onError?: (error: string) => void
  ) {
    const key = this.getKey(listingId, analysisType)

    // Clear any existing interval
    const existingInterval = this.pollIntervals.get(key)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    const poll = async () => {
      try {
        const analysis = this.state.get(key)
        if (!analysis || analysis.pollerId !== pollerId) {
          // This poller is outdated, stop polling
          this.stopPolling(key)
          return
        }

        const response = await fetch(
          `/api/ai/run-analysis?listingId=${listingId}&analysisType=${analysisType}&pollerId=${pollerId}`,
          { credentials: 'include' }
        )

        if (!response.ok) {
          throw new Error('Polling request failed')
        }

        const data = await response.json()
        analysis.lastPoll = Date.now()

        if (data.status === 'completed' && data.result) {
          analysis.status = 'completed'
          analysis.result = data.result
          analysis.completedAt = Date.now()
          analysis.progress = 100
          this.saveToStorage()
          this.stopPolling(key)
          onComplete?.(data.result)
        } else if (data.status === 'error') {
          analysis.status = 'error'
          analysis.error = data.error || 'Analysis failed'
          analysis.completedAt = Date.now()
          this.saveToStorage()
          this.stopPolling(key)
          onError?.(analysis.error)
        } else {
          // Still processing
          if (data.progress !== undefined) {
            analysis.progress = data.progress
            onProgress?.(data.progress, data.partialOutput)
          }
          if (data.partialOutput) {
            analysis.partialOutput = data.partialOutput
          }
          this.saveToStorage()
        }
      } catch (error) {
        const analysis = this.state.get(key)
        if (analysis) {
          analysis.retryCount = (analysis.retryCount || 0) + 1

          if (analysis.retryCount >= 5) {
            analysis.status = 'error'
            analysis.error = 'Max retries exceeded'
            analysis.completedAt = Date.now()
            this.saveToStorage()
            this.stopPolling(key)
            onError?.('Analysis failed after multiple retries')
          } else {
            // Continue polling with exponential backoff
            this.saveToStorage()
          }
        }
      }
    }

    // Start polling immediately, then every 2 seconds
    poll()
    const interval = setInterval(poll, 2000)
    this.pollIntervals.set(key, interval)
  }

  private stopPolling(key: string) {
    const interval = this.pollIntervals.get(key)
    if (interval) {
      clearInterval(interval)
      this.pollIntervals.delete(key)
    }
  }

  public getAnalysisState(listingId: string, analysisType: string): ClientAnalysisState | undefined {
    const key = this.getKey(listingId, analysisType)
    return this.state.get(key)
  }

  public cancelAnalysis(listingId: string, analysisType: string) {
    const key = this.getKey(listingId, analysisType)
    const analysis = this.state.get(key)

    if (analysis) {
      analysis.status = 'error'
      analysis.error = 'Cancelled by user'
      analysis.completedAt = Date.now()
      this.saveToStorage()
    }

    this.stopPolling(key)
  }

  public clearAnalysis(listingId: string, analysisType: string) {
    const key = this.getKey(listingId, analysisType)
    this.state.delete(key)
    this.stopPolling(key)
    this.saveToStorage()
  }

  public cleanup() {
    // Clear all intervals
    Array.from(this.pollIntervals.values()).forEach(interval => {
      clearInterval(interval)
    })
    this.pollIntervals.clear()
  }
}

// Create singleton instance
export const clientAnalysisManager = new ClientAnalysisManager()

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clientAnalysisManager.cleanup()
  })
}

export default clientAnalysisManager
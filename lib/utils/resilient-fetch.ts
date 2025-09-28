/**
 * Resilient Fetch Utility
 * Automatically retries cancelled requests and handles tab switching
 */

interface ResilientFetchOptions extends RequestInit {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  onProgress?: (progress: { attempt: number; maxRetries: number }) => void;
}

interface RequestState {
  id: string;
  url: string;
  options: ResilientFetchOptions;
  attempt: number;
  aborted: boolean;
  completed: boolean;
  result?: any;
  error?: Error;
  startTime: number;
}

class ResilientFetchManager {
  private activeRequests = new Map<string, RequestState>();
  private retryTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Perform a resilient fetch that automatically retries on cancellation
   */
  async fetch(
    url: string,
    options: ResilientFetchOptions = {},
    requestId?: string
  ): Promise<Response> {
    const id = requestId || `resilient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const {
      timeout = 300000, // 5 minutes
      maxRetries = 5,
      retryDelay = 2000,
      onProgress,
      ...fetchOptions
    } = options;

    // Create or update request state
    const requestState: RequestState = {
      id,
      url,
      options,
      attempt: 1,
      aborted: false,
      completed: false,
      startTime: Date.now()
    };

    this.activeRequests.set(id, requestState);

    return new Promise((resolve, reject) => {
      const attemptFetch = async (attemptNumber: number) => {
        try {
          // Check if request was manually aborted
          if (requestState.aborted) {
            reject(new Error('Request was aborted'));
            return;
          }

          // Update progress
          if (onProgress) {
            onProgress({ attempt: attemptNumber, maxRetries });
          }

          console.log(`🔄 Attempt ${attemptNumber}/${maxRetries} for request: ${id}`);

          // Create abort controller for this attempt
          const controller = new AbortController();
          let timeoutId: NodeJS.Timeout | undefined;

          // Set timeout
          if (timeout > 0) {
            timeoutId = setTimeout(() => {
              controller.abort();
            }, timeout);
          }

          // Add headers to help with debugging
          const headers = new Headers(fetchOptions.headers || {});
          headers.set('X-Request-ID', id);
          headers.set('X-Attempt', attemptNumber.toString());
          headers.set('X-Resilient-Fetch', 'true');

          // Perform fetch with retry-aware configuration
          const response = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: controller.signal,
            // Use keepalive for smaller requests
            keepalive: !fetchOptions.body || JSON.stringify(fetchOptions.body).length < 32768
          });

          // Clear timeout
          if (timeoutId) clearTimeout(timeoutId);

          // Check if response is OK
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Mark as completed
          requestState.completed = true;
          requestState.result = response;

          // Clean up
          this.activeRequests.delete(id);
          const retryTimeout = this.retryTimeouts.get(id);
          if (retryTimeout) {
            clearTimeout(retryTimeout);
            this.retryTimeouts.delete(id);
          }

          console.log(`✅ Request completed successfully: ${id}`);
          resolve(response);

        } catch (error) {
          // Clear timeout if it exists
          const retryTimeout = this.retryTimeouts.get(id);
          if (retryTimeout) {
            clearTimeout(retryTimeout);
          }

          const isAbortError = error instanceof Error &&
            (error.name === 'AbortError' || error.message.includes('aborted'));

          const isNetworkError = error instanceof Error &&
            (error.message.includes('fetch') || error.message.includes('network'));

          const shouldRetry = (isAbortError || isNetworkError) &&
            attemptNumber < maxRetries &&
            !requestState.aborted;

          console.log(`❌ Attempt ${attemptNumber} failed for ${id}:`, {
            error: error instanceof Error ? error.message : error,
            isAbortError,
            isNetworkError,
            shouldRetry
          });

          if (shouldRetry) {
            // Update request state
            requestState.attempt = attemptNumber + 1;
            this.activeRequests.set(id, requestState);

            // Schedule retry
            const retryTimeout = setTimeout(() => {
              attemptFetch(attemptNumber + 1);
            }, retryDelay * attemptNumber); // Exponential backoff

            this.retryTimeouts.set(id, retryTimeout);

            console.log(`⏰ Scheduling retry in ${retryDelay * attemptNumber}ms for: ${id}`);
          } else {
            // Mark as failed
            requestState.error = error instanceof Error ? error : new Error(String(error));

            // Clean up
            this.activeRequests.delete(id);
            this.retryTimeouts.delete(id);

            reject(error);
          }
        }
      };

      // Start the first attempt
      attemptFetch(1);
    });
  }

  /**
   * Abort a specific request
   */
  abort(requestId: string): void {
    const requestState = this.activeRequests.get(requestId);
    if (requestState) {
      requestState.aborted = true;
      this.activeRequests.set(requestId, requestState);

      // Clear any pending retry
      const retryTimeout = this.retryTimeouts.get(requestId);
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        this.retryTimeouts.delete(requestId);
      }

      console.log(`🚫 Aborted request: ${requestId}`);
    }
  }

  /**
   * Abort all active requests
   */
  abortAll(): void {
    this.activeRequests.forEach((_, requestId) => {
      this.abort(requestId);
    });
    this.activeRequests.clear();
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }

  /**
   * Get active requests count
   */
  getActiveCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Get request state
   */
  getRequestState(requestId: string): RequestState | undefined {
    return this.activeRequests.get(requestId);
  }

  /**
   * Get all active requests
   */
  getActiveRequests(): RequestState[] {
    return Array.from(this.activeRequests.values())
      .filter(state => !state.completed && !state.aborted);
  }

  /**
   * Clean up old completed/failed requests
   */
  cleanup(maxAge: number = 3600000): void { // 1 hour
    const now = Date.now();
    const toDelete: string[] = [];

    this.activeRequests.forEach((state, requestId) => {
      if ((state.completed || state.error) && (now - state.startTime) > maxAge) {
        toDelete.push(requestId);
      }
    });

    toDelete.forEach(requestId => {
      this.activeRequests.delete(requestId);
      const retryTimeout = this.retryTimeouts.get(requestId);
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        this.retryTimeouts.delete(requestId);
      }
    });

    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} old requests`);
    }
  }
}

// Create singleton instance
const resilientFetchManager = new ResilientFetchManager();

// Auto-cleanup every 5 minutes
setInterval(() => {
  resilientFetchManager.cleanup();
}, 300000);

/**
 * Hook for React components to use resilient fetch
 */
export function useResilientFetch() {
  const fetchWithRetry = async (
    url: string,
    options: ResilientFetchOptions = {},
    requestId?: string
  ): Promise<Response> => {
    return resilientFetchManager.fetch(url, options, requestId);
  };

  const abortRequest = (requestId: string) => {
    resilientFetchManager.abort(requestId);
  };

  const abortAllRequests = () => {
    resilientFetchManager.abortAll();
  };

  return {
    fetchWithRetry,
    abortRequest,
    abortAllRequests,
    getRequestState: (id: string) => resilientFetchManager.getRequestState(id),
    getActiveRequests: () => resilientFetchManager.getActiveRequests(),
    activeRequestCount: resilientFetchManager.getActiveCount(),
  };
}

export default resilientFetchManager;
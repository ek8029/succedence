/**
 * Persistent Request Manager
 * Handles long-running AI requests that continue even when tab loses focus
 */

interface PersistentRequestOptions {
  pollInterval?: number;
  maxRetries?: number;
  timeout?: number;
}

interface RequestStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
  progress?: number;
  startTime: number;
}

class PersistentRequestManager {
  private activeRequests = new Map<string, RequestStatus>();
  private pollIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Start a persistent request that continues even when tab is inactive
   */
  async startRequest(
    url: string,
    requestData: any,
    requestId: string,
    options: PersistentRequestOptions = {}
  ): Promise<string> {
    const {
      pollInterval = 2000,
      maxRetries = 3,
      timeout = 300000 // 5 minutes
    } = options;

    // Initialize request status
    const requestStatus: RequestStatus = {
      id: requestId,
      status: 'pending',
      startTime: Date.now()
    };

    this.activeRequests.set(requestId, requestStatus);

    try {
      // Start the actual request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...requestData,
          requestId, // Include request ID for server tracking
          persistentRequest: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.statusText}`);
      }

      const result = await response.json();

      // If request completes immediately, return result
      if (result.status === 'completed') {
        requestStatus.status = 'completed';
        requestStatus.result = result.data;
        this.activeRequests.set(requestId, requestStatus);
        return requestId;
      }

      // If request is async, start polling
      if (result.status === 'processing' || result.status === 'pending') {
        requestStatus.status = 'processing';
        this.activeRequests.set(requestId, requestStatus);
        this.startPolling(requestId, pollInterval, timeout);
        return requestId;
      }

    } catch (error) {
      requestStatus.status = 'error';
      requestStatus.error = error instanceof Error ? error.message : 'Unknown error';
      this.activeRequests.set(requestId, requestStatus);
      throw error;
    }

    return requestId;
  }

  /**
   * Start polling for request status
   */
  private startPolling(requestId: string, pollInterval: number, timeout: number) {
    const startTime = Date.now();

    const poll = async () => {
      try {
        // Check if request has timed out
        if (Date.now() - startTime > timeout) {
          this.handleRequestTimeout(requestId);
          return;
        }

        // Poll for status
        const response = await fetch(`/api/ai/status/${requestId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.statusText}`);
        }

        const statusData = await response.json();
        const requestStatus = this.activeRequests.get(requestId);

        if (requestStatus) {
          requestStatus.status = statusData.status;
          requestStatus.progress = statusData.progress;

          if (statusData.status === 'completed') {
            requestStatus.result = statusData.result;
            this.stopPolling(requestId);
          } else if (statusData.status === 'error') {
            requestStatus.error = statusData.error;
            this.stopPolling(requestId);
          }

          this.activeRequests.set(requestId, requestStatus);
        }

      } catch (error) {
        console.error(`Polling error for request ${requestId}:`, error);
        // Continue polling unless it's a critical error
      }
    };

    // Start immediate poll, then set interval
    poll();
    const intervalId = setInterval(poll, pollInterval);
    this.pollIntervals.set(requestId, intervalId);
  }

  /**
   * Stop polling for a request
   */
  private stopPolling(requestId: string) {
    const intervalId = this.pollIntervals.get(requestId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollIntervals.delete(requestId);
    }
  }

  /**
   * Handle request timeout
   */
  private handleRequestTimeout(requestId: string) {
    const requestStatus = this.activeRequests.get(requestId);
    if (requestStatus) {
      requestStatus.status = 'error';
      requestStatus.error = 'Request timed out';
      this.activeRequests.set(requestId, requestStatus);
    }
    this.stopPolling(requestId);
  }

  /**
   * Get request status
   */
  getRequestStatus(requestId: string): RequestStatus | undefined {
    return this.activeRequests.get(requestId);
  }

  /**
   * Wait for request completion
   */
  async waitForCompletion(requestId: string, timeout: number = 300000): Promise<any> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkStatus = () => {
        const status = this.getRequestStatus(requestId);

        if (!status) {
          reject(new Error('Request not found'));
          return;
        }

        if (status.status === 'completed') {
          resolve(status.result);
          return;
        }

        if (status.status === 'error') {
          reject(new Error(status.error || 'Request failed'));
          return;
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {
          reject(new Error('Request timed out'));
          return;
        }

        // Continue checking
        setTimeout(checkStatus, 1000);
      };

      checkStatus();
    });
  }

  /**
   * Cancel a request
   */
  async cancelRequest(requestId: string): Promise<void> {
    try {
      await fetch(`/api/ai/cancel/${requestId}`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error(`Failed to cancel request ${requestId}:`, error);
    }

    this.stopPolling(requestId);
    this.activeRequests.delete(requestId);
  }

  /**
   * Get all active requests
   */
  getActiveRequests(): RequestStatus[] {
    return Array.from(this.activeRequests.values())
      .filter(status => status.status === 'pending' || status.status === 'processing');
  }

  /**
   * Clean up completed/errored requests older than specified time
   */
  cleanup(maxAge: number = 3600000): void { // 1 hour default
    const now = Date.now();
    const toDelete: string[] = [];

    this.activeRequests.forEach((status, requestId) => {
      if (
        (status.status === 'completed' || status.status === 'error') &&
        (now - status.startTime) > maxAge
      ) {
        toDelete.push(requestId);
      }
    });

    toDelete.forEach(requestId => {
      this.stopPolling(requestId);
      this.activeRequests.delete(requestId);
    });
  }
}

// Create singleton instance
const persistentRequestManager = new PersistentRequestManager();

/**
 * Hook for React components to use persistent requests
 */
export function usePersistentRequest() {
  const startPersistentRequest = async (
    url: string,
    requestData: any,
    requestId: string,
    options?: PersistentRequestOptions
  ): Promise<string> => {
    return persistentRequestManager.startRequest(url, requestData, requestId, options);
  };

  const waitForCompletion = async (requestId: string, timeout?: number): Promise<any> => {
    return persistentRequestManager.waitForCompletion(requestId, timeout);
  };

  const getRequestStatus = (requestId: string) => {
    return persistentRequestManager.getRequestStatus(requestId);
  };

  const cancelRequest = async (requestId: string) => {
    return persistentRequestManager.cancelRequest(requestId);
  };

  return {
    startPersistentRequest,
    waitForCompletion,
    getRequestStatus,
    cancelRequest,
    getActiveRequests: () => persistentRequestManager.getActiveRequests(),
  };
}

export default persistentRequestManager;
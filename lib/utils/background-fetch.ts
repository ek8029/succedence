/**
 * Background Fetch Utility
 * Ensures API requests continue even when tab is inactive
 */

interface BackgroundFetchOptions extends RequestInit {
  timeout?: number;
}

class BackgroundFetchManager {
  private activeRequests = new Map<string, AbortController>();

  /**
   * Perform a fetch that continues in background even when tab is inactive
   */
  async fetch(
    url: string,
    options: BackgroundFetchOptions = {},
    requestId?: string
  ): Promise<Response> {
    const id = requestId || `fetch-${Date.now()}`;

    // Create abort controller for this request
    const controller = new AbortController();
    this.activeRequests.set(id, controller);

    // Set timeout if specified
    let timeoutId: NodeJS.Timeout | undefined;
    if (options.timeout) {
      timeoutId = setTimeout(() => {
        controller.abort();
        this.activeRequests.delete(id);
      }, options.timeout);
    }

    try {
      // Add important headers to prevent cancellation
      const headers = new Headers(options.headers || {});
      headers.set('Cache-Control', 'no-cache');
      headers.set('X-Request-Id', id);

      // Perform fetch with keepalive to prevent cancellation
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        keepalive: true, // Critical: keeps request alive when tab is inactive
      });

      // Clear timeout if set
      if (timeoutId) clearTimeout(timeoutId);

      // Remove from active requests
      this.activeRequests.delete(id);

      return response;
    } catch (error) {
      // Clear timeout if set
      if (timeoutId) clearTimeout(timeoutId);

      // Remove from active requests
      this.activeRequests.delete(id);

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Cancel a specific request
   */
  cancel(requestId: string): void {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Cancel all active requests
   */
  cancelAll(): void {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }

  /**
   * Get count of active requests
   */
  getActiveCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Check if a specific request is active
   */
  isActive(requestId: string): boolean {
    return this.activeRequests.has(requestId);
  }
}

// Create singleton instance
const backgroundFetchManager = new BackgroundFetchManager();

/**
 * Hook for React components to use background fetch
 */
export function useBackgroundFetch() {
  const fetchWithBackground = async (
    url: string,
    options: BackgroundFetchOptions = {},
    requestId?: string
  ): Promise<Response> => {
    return backgroundFetchManager.fetch(url, options, requestId);
  };

  const cancelRequest = (requestId: string) => {
    backgroundFetchManager.cancel(requestId);
  };

  const cancelAllRequests = () => {
    backgroundFetchManager.cancelAll();
  };

  return {
    fetchWithBackground,
    cancelRequest,
    cancelAllRequests,
    isRequestActive: (id: string) => backgroundFetchManager.isActive(id),
    activeRequestCount: backgroundFetchManager.getActiveCount(),
  };
}

export default backgroundFetchManager;
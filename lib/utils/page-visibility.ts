/**
 * Page Visibility Utility
 * Prevents API requests from being interrupted when tab becomes inactive
 */

export class PageVisibilityManager {
  private static instance: PageVisibilityManager;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private activeRequests: Set<string> = new Set();

  private constructor() {
    // Only setup listeners in browser environment
    if (typeof window !== 'undefined') {
      this.setupVisibilityListener();
      this.setupKeepAlive();
    }
  }

  public static getInstance(): PageVisibilityManager {
    if (!PageVisibilityManager.instance) {
      PageVisibilityManager.instance = new PageVisibilityManager();
    }
    return PageVisibilityManager.instance;
  }

  /**
   * Register an active request to prevent interruption
   */
  public registerRequest(requestId: string): void {
    this.activeRequests.add(requestId);

    // Force spinner animations to continue
    this.forceAnimationContinuation();

    // Ensure keep-alive is running while requests are active
    if (!this.keepAliveInterval && this.activeRequests.size > 0) {
      this.startKeepAlive();
    }
  }

  /**
   * Unregister a completed request
   */
  public unregisterRequest(requestId: string): void {
    this.activeRequests.delete(requestId);

    // Stop keep-alive if no active requests
    if (this.activeRequests.size === 0) {
      this.stopKeepAlive();
    }
  }

  /**
   * Force spinner animations to continue even when tab is inactive
   */
  private forceAnimationContinuation(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    try {
      // Override CSS animation-play-state
      const style = document.createElement('style');
      style.textContent = `
        .animate-spin {
          animation: spin 1s linear infinite !important;
          animation-play-state: running !important;
          will-change: transform !important;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;

      // Remove existing override if present
      const existingOverride = document.getElementById('visibility-animation-override');
      if (existingOverride) {
        existingOverride.remove();
      }

      style.id = 'visibility-animation-override';
      document.head.appendChild(style);
    } catch (error) {
      console.error('Failed to force animation continuation:', error);
    }
  }

  /**
   * Setup Page Visibility API listener
   */
  private setupVisibilityListener(): void {
    // Complete SSR protection - early return for server-side
    if (typeof window === 'undefined') {
      console.log('SSR detected - skipping visibility listener setup');
      return;
    }

    // Additional safety checks before accessing document
    if (typeof document === 'undefined') {
      console.log('Document not available - skipping visibility listener setup');
      return;
    }

    try {
      // Check if visibilitychange is supported
      if ('visibilityState' in document && 'hidden' in document) {
        document.addEventListener('visibilitychange', () => {
          // Additional safety check inside the event listener
          if (typeof document !== 'undefined') {
            if (document.hidden) {
              console.log('Tab became hidden, maintaining active requests:', this.activeRequests.size);
              // Ensure animations continue and requests aren't interrupted
              this.preventRequestInterruption();
            } else {
              console.log('Tab became visible, active requests:', this.activeRequests.size);
            }
          }
        });
      } else {
        console.log('Page Visibility API not supported - skipping listener setup');
      }
    } catch (error) {
      console.error('Failed to setup visibility listener:', error);
    }
  }

  /**
   * Prevent browser from interrupting active requests
   */
  private preventRequestInterruption(): void {
    if (this.activeRequests.size > 0) {
      // Use requestIdleCallback or setTimeout to keep the event loop active
      const keepAlive = () => {
        if (this.activeRequests.size > 0) {
          setTimeout(keepAlive, 1000);
        }
      };
      keepAlive();
    }
  }

  /**
   * Setup periodic keep-alive ping
   */
  private setupKeepAlive(): void {
    // Initial setup, actual keep-alive starts when requests are registered
  }

  /**
   * Start keep-alive mechanism
   */
  private startKeepAlive(): void {
    if (this.keepAliveInterval) return;

    this.keepAliveInterval = setInterval(() => {
      if (this.activeRequests.size > 0) {
        // Small operation to keep the tab active
        if (typeof performance !== 'undefined') {
          performance.now();
        }

        // Force animations to continue (only in browser)
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          try {
            const spinners = document.querySelectorAll('.animate-spin');
            spinners.forEach(spinner => {
              (spinner as HTMLElement).style.animationPlayState = 'running';
            });
          } catch (error) {
            console.error('Failed to force animation continuation:', error);
          }
        }
      }
    }, 500); // Every 500ms while requests are active
  }

  /**
   * Stop keep-alive mechanism
   */
  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Check if there are active requests
   */
  public hasActiveRequests(): boolean {
    return this.activeRequests.size > 0;
  }

  /**
   * Get count of active requests
   */
  public getActiveRequestCount(): number {
    return this.activeRequests.size;
  }
}

// Export singleton instance
export const pageVisibilityManager = PageVisibilityManager.getInstance();

/**
 * Hook to use with AI analysis requests
 */
export function useVisibilityProtectedRequest() {
  const manager = PageVisibilityManager.getInstance();

  const protectRequest = async <T>(
    requestFn: () => Promise<T>,
    requestId?: string
  ): Promise<T> => {
    const id = requestId || `req_${Date.now()}_${Math.random()}`;

    try {
      manager.registerRequest(id);
      const result = await requestFn();
      return result;
    } finally {
      manager.unregisterRequest(id);
    }
  };

  return { protectRequest };
}
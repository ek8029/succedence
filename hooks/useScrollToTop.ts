'use client';

import { useEffect } from 'react';

/**
 * Hook to scroll to top of page on component mount
 * @param dependencies - Optional array of dependencies that trigger scroll-to-top
 * @param behavior - Scroll behavior ('smooth' or 'instant')
 */
export function useScrollToTop(dependencies: any[] = [], behavior: 'smooth' | 'instant' = 'smooth') {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior });
  }, dependencies);
}

/**
 * Hook to scroll to top when component mounts only
 * @param behavior - Scroll behavior ('smooth' or 'instant')
 */
export function useScrollToTopOnMount(behavior: 'smooth' | 'instant' = 'smooth') {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior });
  }, []);
}
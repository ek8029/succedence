'use client';

import { useEffect, useState, useRef } from 'react';

interface ScrollCueProps {
  className?: string;
}

export default function ScrollCue({ className = '' }: ScrollCueProps) {
  const [opacity, setOpacity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Hide when user is near the bottom (within 200px of bottom)
      const nearBottom = scrollTop + windowHeight >= documentHeight - 200;

      if (nearBottom) {
        setIsVisible(false);
        return;
      }

      // Check for overlap with text elements
      if (!scrollCueRef.current) {
        setIsVisible(true);
        setOpacity(1);
        return;
      }

      const cueRect = scrollCueRef.current.getBoundingClientRect();

      // Expand the detection area slightly for better UX
      const detectionArea = {
        top: cueRect.top - 20,
        bottom: cueRect.bottom + 20,
        left: cueRect.left - 20,
        right: cueRect.right + 20
      };

      // Get text elements that might overlap
      const textSelectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'span', 'div', 'a', 'button',
        'li', 'td', 'th', 'label'
      ];

      let hasOverlap = false;
      let maxOverlapIntensity = 0;

      textSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Skip if element has no visible text content
          const textContent = element.textContent?.trim();
          if (!textContent || textContent.length === 0) return;

          // Skip if element is not visible
          const style = window.getComputedStyle(element);
          if (style.display === 'none' ||
              style.visibility === 'hidden' ||
              style.opacity === '0') return;

          // Skip the scroll cue itself and its children
          if (element === scrollCueRef.current ||
              (scrollCueRef.current && scrollCueRef.current.contains(element)) ||
              element.contains(scrollCueRef.current as Node)) return;

          const rect = element.getBoundingClientRect();

          // Check for overlap with expanded detection area
          const overlapping = !(
            rect.bottom <= detectionArea.top ||
            rect.top >= detectionArea.bottom ||
            rect.right <= detectionArea.left ||
            rect.left >= detectionArea.right
          );

          if (overlapping) {
            hasOverlap = true;

            // Calculate overlap intensity for gradual opacity
            const overlapWidth = Math.min(rect.right, detectionArea.right) -
                               Math.max(rect.left, detectionArea.left);
            const overlapHeight = Math.min(rect.bottom, detectionArea.bottom) -
                                Math.max(rect.top, detectionArea.top);

            const overlapArea = overlapWidth * overlapHeight;
            const cueArea = (detectionArea.right - detectionArea.left) *
                           (detectionArea.bottom - detectionArea.top);

            const overlapRatio = Math.min(overlapArea / cueArea, 1);
            maxOverlapIntensity = Math.max(maxOverlapIntensity, overlapRatio);
          }
        });
      });

      setIsVisible(true);

      if (hasOverlap) {
        // Fade out based on overlap intensity
        const newOpacity = Math.max(0.1, 1 - (maxOverlapIntensity * 1.5));
        setOpacity(newOpacity);
      } else {
        setOpacity(1);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    // Initial check
    handleScroll();

    // Check again after a short delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={scrollCueRef}
      className={`fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300 pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <div className="flex flex-col items-center space-y-2">
        <span className="text-sm text-neutral-400 font-medium whitespace-nowrap">
          Scroll for more
        </span>
        <svg
          className="w-6 h-6 animate-bounce"
          style={{color: 'var(--gold)'}}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  );
}
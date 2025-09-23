'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export default function ScrollAnimation({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up'
}: ScrollAnimationProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add a small delay to ensure proper setup for instant loads
    const setupAnimation = () => {
      // Set initial state with smoother animation
      element.style.opacity = '0';
      element.style.transition = `opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;
      element.style.willChange = 'opacity, transform';

      // Set initial transform based on direction with smoother values
      switch (direction) {
        case 'up':
          element.style.transform = 'translateY(40px) translateZ(0)';
          break;
        case 'down':
          element.style.transform = 'translateY(-40px) translateZ(0)';
          break;
        case 'left':
          element.style.transform = 'translateX(40px) translateZ(0)';
          break;
        case 'right':
          element.style.transform = 'translateX(-40px) translateZ(0)';
          break;
        case 'fade':
          element.style.transform = 'scale(0.92) translateZ(0)';
          break;
      }

      const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate in with hardware acceleration
            const element = entry.target as HTMLElement;
            element.style.opacity = '1';
            element.style.transform = direction === 'fade' ? 'scale(1) translateZ(0)' : 'translate3d(0, 0, 0)';

            // Clean up will-change after animation
            setTimeout(() => {
              element.style.willChange = 'auto';
            }, 700 + delay);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 50px 0px'
      }
    );

        observer.observe(element);

        return () => {
          observer.unobserve(element);
        };
      };

      // Setup animation immediately for elements above the fold, or with small delay for others
      const rect = element.getBoundingClientRect();
      const isAboveFold = rect.top < window.innerHeight;

      if (isAboveFold) {
        // For elements above the fold (instant load pages), add small delay
        const timeoutId = setTimeout(setupAnimation, 10);
        return () => clearTimeout(timeoutId);
      } else {
        // For elements below the fold, setup immediately
        return setupAnimation();
      }
    }, [delay, direction]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
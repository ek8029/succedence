'use client';

import { useState, useEffect, useRef } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = tooltip.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      // Check if tooltip goes off left edge
      if (rect.left < 0) {
        setAdjustedPosition('right');
      }
      // Check if tooltip goes off right edge
      else if (rect.right > window.innerWidth) {
        setAdjustedPosition('left');
      }
      // Check if tooltip goes off top
      else if (rect.top < 0) {
        setAdjustedPosition('bottom');
      }
      // Check if tooltip goes off bottom
      else if (rect.bottom > window.innerHeight) {
        setAdjustedPosition('top');
      }
      // Otherwise use the requested position
      else {
        setAdjustedPosition(position);
      }
    }
  }, [isVisible, position]);

  const handleClick = (e: React.MouseEvent) => {
    if (isTouchDevice) {
      e.stopPropagation();
      setIsVisible(!isVisible);
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-3',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-midnight border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-midnight border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-midnight border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-midnight border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => !isTouchDevice && setIsVisible(true)}
      onMouseLeave={() => !isTouchDevice && setIsVisible(false)}
      onClick={handleClick}
    >
      {children}
      {isVisible && (
        <div ref={tooltipRef} className={`absolute z-50 ${positionClasses[adjustedPosition]}`} role="tooltip">
          <div className="bg-midnight text-warm-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gold/30 w-56 max-w-[calc(100vw-2rem)] leading-relaxed whitespace-normal">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 text-silver/50 hover:text-gold transition-colors cursor-help ${className || ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

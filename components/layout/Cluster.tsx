/**
 * Cluster - Horizontal layout with gap-based spacing (NO per-element margins)
 *
 * Gap sizes (design tokens):
 * - xs: gap-4 (1rem / 16px)
 * - sm: gap-6 (1.5rem / 24px)
 * - md: gap-8 (2rem / 32px)
 * - lg: gap-12 (3rem / 48px)
 * - xl: gap-16 (4rem / 64px)
 *
 * Usage:
 * <Cluster gap="sm" align="center">
 *   <button>Button 1</button>
 *   <button>Button 2</button>
 * </Cluster>
 */

import { ReactNode } from 'react';

interface ClusterProps {
  children: ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
}

const gapClasses = {
  xs: 'gap-4',
  sm: 'gap-6',
  md: 'gap-8',
  lg: 'gap-12',
  xl: 'gap-16',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};

export default function Cluster({
  children,
  gap = 'md',
  align = 'start',
  justify = 'start',
  wrap = false,
  className = '',
  as: Component = 'div',
}: ClusterProps) {
  return (
    <Component
      className={`flex ${gapClasses[gap]} ${alignClasses[align]} ${justifyClasses[justify]} ${
        wrap ? 'flex-wrap' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
}

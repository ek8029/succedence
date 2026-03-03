/**
 * Stack - Vertical layout with gap-based spacing (NO per-element margins)
 *
 * Gap sizes (design tokens):
 * - xs: gap-4 (1rem / 16px)
 * - sm: gap-6 (1.5rem / 24px)
 * - md: gap-8 (2rem / 32px)
 * - lg: gap-12 (3rem / 48px)
 * - xl: gap-16 (4rem / 64px)
 *
 * Usage:
 * <Stack gap="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 */

import { ReactNode } from 'react';

interface StackProps {
  children: ReactNode;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside' | 'ul';
}

const gapClasses = {
  xs: 'gap-4',
  sm: 'gap-6',
  md: 'gap-8',
  lg: 'gap-12',
  xl: 'gap-16',
};

export default function Stack({ children, gap = 'md', className = '', as: Component = 'div' }: StackProps) {
  return (
    <Component className={`flex flex-col ${gapClasses[gap]} ${className}`}>
      {children}
    </Component>
  );
}

/**
 * Section - Enforces consistent vertical spacing (padding) for page sections
 *
 * Variants:
 * - hero: py-24 md:py-32 (largest, for hero sections)
 * - default: py-16 md:py-20 (standard section spacing)
 * - tight: py-12 md:py-16 (compact spacing)
 *
 * Usage:
 * <Section variant="hero">...</Section>
 * <Section>...</Section> // defaults to "default"
 * <Section variant="tight">...</Section>
 */

import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  variant?: 'hero' | 'default' | 'tight';
  className?: string;
  withBorder?: 'top' | 'bottom' | 'both' | 'none';
}

const variantClasses = {
  hero: 'py-24 md:py-32',
  default: 'py-16 md:py-20',
  tight: 'py-12 md:py-16',
};

const borderClasses = {
  top: 'border-t border-slate/40',
  bottom: 'border-b border-slate/40',
  both: 'border-t border-b border-slate/40',
  none: '',
};

export default function Section({
  children,
  variant = 'default',
  className = '',
  withBorder = 'none',
}: SectionProps) {
  return (
    <section className={`${variantClasses[variant]} ${borderClasses[withBorder]} ${className}`}>
      {children}
    </section>
  );
}

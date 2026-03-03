/**
 * PageContainer - Enforces consistent max-width and horizontal padding across all pages
 *
 * Usage:
 * <PageContainer>
 *   <Section>...</Section>
 * </PageContainer>
 */

import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`w-full mx-auto max-w-7xl px-6 md:px-8 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}

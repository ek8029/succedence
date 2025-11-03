import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'Join Beta - Succedence',
  description: 'Sign up for early beta access to Succedence',
};

export default function GateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

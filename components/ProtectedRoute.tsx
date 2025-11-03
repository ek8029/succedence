'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'buyer' | 'seller' | 'admin';
  redirectTo?: string;
}

// Known admin emails - must match middleware and AuthContext
const KNOWN_ADMIN_EMAILS = [
  'evank8029@gmail.com',
  'succedence@gmail.com',
  'founder@succedence.com',
  'clydek627@gmail.com'
];

// Helper to check if user is admin (either by role or email)
const isUserAdmin = (user: any): boolean => {
  if (!user) return false;
  // Check role first
  if (user.role === 'admin') return true;
  // Check if email is in known admin list
  if (user.email && KNOWN_ADMIN_EMAILS.includes(user.email)) return true;
  return false;
};

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Special handling for admin role requirement
      if (requiredRole === 'admin') {
        if (!isUserAdmin(user)) {
          console.log('Access denied - not admin:', user.email, 'role:', user.role);
          router.push('/');
          return;
        } else {
          console.log('Admin access granted:', user.email);
        }
      } else if (requiredRole && user.role !== requiredRole) {
        router.push('/');
        return;
      }
    }
  }, [user, isLoading, requiredRole, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Authenticating...</div>
        </div>
      </div>
    );
  }

  // Show unauthorized message if user doesn't have required role
  if (user && requiredRole) {
    // Special check for admin requirement
    if (requiredRole === 'admin' && !isUserAdmin(user)) {
      return (
        <div className="min-h-screen bg-brand-darker flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl text-white font-medium mb-4">Admin Access Required</h1>
            <p className="text-neutral-400 mb-8">You don&apos;t have permission to access this page.</p>
            <Link href="/" className="btn-primary px-8 py-3 font-medium hover-lift">
              Return Home
            </Link>
          </div>
        </div>
      );
    }
    // Regular role check for non-admin roles
    else if (requiredRole !== 'admin' && user.role !== requiredRole) {
      return (
        <div className="min-h-screen bg-brand-darker flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl text-white font-medium mb-4">Access Restricted</h1>
            <p className="text-neutral-400 mb-8">You don&apos;t have permission to access this page.</p>
            <Link href="/" className="btn-primary px-8 py-3 font-medium hover-lift">
              Return Home
            </Link>
          </div>
        </div>
      );
    }
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Authentication Required</h1>
          <p className="text-neutral-400 mb-8">Please sign in to access this page.</p>
          <Link href="/login" className="btn-primary px-8 py-3 font-medium hover-lift">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}
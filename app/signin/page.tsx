'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the auth page
    router.replace('/auth');
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xl text-white font-medium">Redirecting to sign in...</div>
      </div>
    </div>
  );
}
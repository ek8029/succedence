'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      // Optionally verify the session with Stripe
      // For now, we'll just show success
      setLoading(false);
    } else {
      // No session ID, redirect to subscribe page
      router.push('/subscribe');
    }
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Processing your subscription...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-8 pt-32 pb-16 max-w-4xl">
          <div className="text-center">
            <div className="glass p-12 rounded-luxury border-2 border-green-400/30">
              {/* Success Icon */}
              <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-4xl text-white font-medium mb-6">
                Welcome to Succedence!
              </h1>

              <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
                Your subscription has been successfully activated. You now have access to all the premium features
                and AI-powered tools to help you find and analyze business opportunities.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center text-green-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Payment processed successfully</span>
                </div>
                <div className="flex items-center justify-center text-green-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">Account upgraded to premium</span>
                </div>
                <div className="flex items-center justify-center text-green-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">AI features now available</span>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/browse"
                  className="btn-primary px-8 py-4 text-lg font-medium hover-lift inline-block"
                >
                  Start Browsing Opportunities
                </Link>
                <div className="text-center">
                  <Link
                    href="/profile"
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    Manage your subscription
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-neutral-400 text-sm">
                Need help? <Link href="/support" className="text-gold hover:text-warm-white transition-colors">Contact our support team</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading...</div>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
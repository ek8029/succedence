'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function SubscribeCancelPage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-8 pt-32 pb-16 max-w-4xl">
          <div className="text-center">
            <div className="glass p-12 rounded-luxury border-2 border-yellow-400/30">
              {/* Cancel Icon */}
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h1 className="text-4xl text-white font-medium mb-6">
                Subscription Cancelled
              </h1>

              <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
                Your payment was cancelled and no charges have been made to your account.
                You can try again anytime or contact our support team if you need assistance.
              </p>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    <strong>No worries!</strong> Your account remains active and you can subscribe at any time.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/subscribe"
                  className="btn-primary px-8 py-4 text-lg font-medium hover-lift inline-block"
                >
                  Try Again
                </Link>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/browse"
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    Continue browsing
                  </Link>
                  <Link
                    href="/support"
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    Contact support
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 glass p-6 rounded-luxury">
              <h3 className="text-white font-medium mb-4">Why choose Succedence?</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-neutral-300">
                  <div className="font-medium text-gold mb-2">AI-Powered Analysis</div>
                  <p>Get intelligent insights on every business opportunity</p>
                </div>
                <div className="text-neutral-300">
                  <div className="font-medium text-gold mb-2">Comprehensive Database</div>
                  <p>Access thousands of verified business listings</p>
                </div>
                <div className="text-neutral-300">
                  <div className="font-medium text-gold mb-2">Expert Support</div>
                  <p>Get help from our acquisition specialists</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
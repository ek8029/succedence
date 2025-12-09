'use client';

import Link from 'next/link';

export function FreeTierGate() {
  return (
    <div className="glass rounded-luxury-lg border border-gold/30 p-8 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-warm-white mb-3">
        You&apos;ve Used Your Free Valuation
      </h2>
      <p className="text-silver/80 mb-6 max-w-md mx-auto">
        Sign up for a free account to run unlimited valuations, save your analyses, and access our full marketplace.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/login"
          className="px-8 py-3 bg-accent-gradient text-midnight font-semibold rounded-luxury hover:shadow-gold-glow transition-all"
        >
          Create Free Account
        </Link>
        <Link
          href="/pricing"
          className="px-8 py-3 bg-charcoal/50 text-silver border border-white/10 font-medium rounded-luxury hover:border-gold/30 hover:text-gold transition-all"
        >
          View Plans
        </Link>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-warm-white font-semibold mb-4">What You Get With a Free Account:</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 text-silver/80 text-sm">
            <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Unlimited valuations
          </div>
          <div className="flex items-center gap-2 text-silver/80 text-sm">
            <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save valuation history
          </div>
          <div className="flex items-center gap-2 text-silver/80 text-sm">
            <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Browse all listings
          </div>
          <div className="flex items-center gap-2 text-silver/80 text-sm">
            <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Set buyer preferences
          </div>
        </div>
      </div>
    </div>
  );
}

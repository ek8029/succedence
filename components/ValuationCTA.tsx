'use client';

import Link from 'next/link';

export default function ValuationCTA() {
  return (
    <div className="glass p-8 md:p-10 rounded-luxury-lg border-2 border-gold/40 bg-gradient-to-r from-gold/10 via-transparent to-gold/5 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center border border-gold/30">
            <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-bold text-warm-white mb-3 font-serif">
            Get a Free AI-Powered Valuation
          </h3>
          <p className="text-silver/80 text-lg mb-6 max-w-xl">
            Paste any business listing URL or enter financials to get an instant valuation with industry comparisons, risk analysis, and deal quality scoring.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
            <Link
              href="/valuation"
              className="inline-flex items-center px-8 py-4 bg-accent-gradient text-midnight font-semibold rounded-luxury hover:shadow-gold-glow hover:transform hover:scale-105 transition-all duration-300"
            >
              Try Free Valuation
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <span className="text-silver/60 text-sm">
              No signup required
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 hidden lg:flex flex-col gap-4">
          <div className="text-center px-6 py-3 bg-charcoal/30 rounded-luxury">
            <div className="text-2xl font-bold text-gold font-mono">50+</div>
            <div className="text-silver/60 text-xs">Industries</div>
          </div>
          <div className="text-center px-6 py-3 bg-charcoal/30 rounded-luxury">
            <div className="text-2xl font-bold text-gold font-mono">0-100</div>
            <div className="text-silver/60 text-xs">Deal Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function BrokerValuationToolPage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-12 md:pb-16 max-w-5xl">
          <div className="text-center">
            <div className="inline-block mb-6">
              <span className="px-6 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium tracking-wide">
                FOR BUSINESS BROKERS
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-warm-white mb-6 leading-tight">
              The Business Valuation Tool
              <span className="block text-blue-400">Brokers Actually Use</span>
            </h1>

            <p className="text-lg sm:text-xl text-platinum/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop reinventing valuations for every listing. Get consistent, defensible pricing in under a minute.
            </p>

            <Link
              href="/valuation"
              className="inline-flex items-center justify-center px-12 py-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-xl"
            >
              Try It Free →
            </Link>

            <p className="text-sm text-silver/60 mt-6">
              Used by brokers pricing $500K–$5M businesses • No signup required
            </p>
          </div>
        </section>

        {/* Broker Pain Points */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 md:auto-rows-fr">
            {/* Problems */}
            <div className="glass p-8 rounded-lg border border-red-500/30 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-semibold text-warm-white">Without This Tool</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-silver/80">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Inconsistent pricing across listings</span>
                </li>
                <li className="flex items-start gap-3 text-silver/80">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Hours spent building Excel models</span>
                </li>
                <li className="flex items-start gap-3 text-silver/80">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Hard to defend pricing to sellers</span>
                </li>
                <li className="flex items-start gap-3 text-silver/80">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>No documentation of methodology</span>
                </li>
              </ul>
            </div>

            {/* Solutions */}
            <div className="glass p-8 rounded-lg border border-blue-500/30 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-semibold text-warm-white">With This Tool</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-silver/80">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Consistent, repeatable methodology</span>
                </li>
                <li className="flex items-start gap-3 text-silver/80">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Results in under 60 seconds</span>
                </li>
                <li className="flex items-start gap-3 text-silver/80">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Documented rationale you can share</span>
                </li>
                <li className="flex items-start gap-3 text-silver/80">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Professional PDF reports for sellers</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Output Sample */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-8 text-center">
            What You Get
          </h2>
          <div className="glass p-8 rounded-lg border border-gold/20">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-warm-white mb-3">Valuation Range</h4>
                <div className="space-y-2 text-silver/80">
                  <div className="flex justify-between">
                    <span>Low:</span>
                    <span className="font-mono text-blue-400">$850K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mid:</span>
                    <span className="font-mono text-blue-400">$1.2M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High:</span>
                    <span className="font-mono text-blue-400">$1.5M</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-warm-white mb-3">Deal Quality Score</h4>
                <div className="text-4xl font-bold text-blue-400 mb-2">7.2<span className="text-xl text-silver/60">/10</span></div>
                <p className="text-sm text-silver/70">Above average marketability</p>
              </div>
            </div>
            <div className="border-t border-gold/20 pt-6">
              <h4 className="font-semibold text-warm-white mb-3">Broker Rationale</h4>
              <p className="text-silver/80 leading-relaxed text-sm italic">
                "This restaurant shows strong fundamentals with $400K SDE on $1.2M revenue. The mid-range valuation of $1.2M (3.0x SDE multiple) reflects typical pricing for established restaurants with stable cash flow. Risk adjustments account for moderate owner involvement and industry-standard customer concentration..."
              </p>
            </div>
          </div>
        </section>

        {/* Objections */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-8 text-center">
            Common Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:auto-rows-fr">
            <div className="glass p-6 rounded-lg border border-gold/20 flex flex-col h-full">
              <h4 className="text-lg font-semibold text-warm-white mb-3">How is this different from Excel?</h4>
              <p className="text-silver/80 text-sm">
                Risk-adjusted multiples, automated deal scoring, and client-ready output. No formulas to maintain or update.
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20 flex flex-col h-full">
              <h4 className="text-lg font-semibold text-warm-white mb-3">Will this replace my judgment?</h4>
              <p className="text-silver/80 text-sm">
                No. It gives you a documented starting point based on market data. You still apply your expertise and local knowledge.
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20 flex flex-col h-full">
              <h4 className="text-lg font-semibold text-warm-white mb-3">Is this for serious deals?</h4>
              <p className="text-silver/80 text-sm">
                Yes. Used by brokers pricing $500K–$5M Main Street businesses. Professional-grade methodology and output.
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20 flex flex-col h-full">
              <h4 className="text-lg font-semibold text-warm-white mb-3">What's the catch?</h4>
              <p className="text-silver/80 text-sm">
                No catch. Free valuations with no limits. Optional paid features like PDF export and advanced analytics.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Transparency */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <div className="glass p-8 rounded-lg border border-gold/20 text-center">
            <h3 className="text-2xl font-semibold text-warm-white mb-4">Pricing Transparency</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">Free</div>
                <div className="text-sm text-silver/80">Unlimited valuations</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">$19</div>
                <div className="text-sm text-silver/80">PDF exports (optional)</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">$49</div>
                <div className="text-sm text-silver/80">Pro features (optional)</div>
              </div>
            </div>
            <p className="text-sm text-silver/60 mt-6">
              Start free. Upgrade only when you need advanced features.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-16 max-w-5xl">
          <div className="glass p-12 rounded-lg border border-gold/20 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              Try It on Your Next Listing
            </h2>
            <p className="text-lg text-platinum/80 mb-8 max-w-2xl mx-auto">
              See how fast you can generate a defensible valuation. No signup required.
            </p>
            <Link
              href="/valuation"
              className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg"
            >
              Run a Free Valuation
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

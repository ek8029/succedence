'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function FreeBusinessValuationPage() {
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
                BUILT ON IBBA TRANSACTION DATA
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-warm-white mb-6 leading-tight">
              Free Business Valuation
              <span className="block text-blue-400">Tool for Brokers</span>
            </h1>

            <p className="text-lg sm:text-xl text-platinum/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Run unlimited valuations with industry-standard SDE multiples. No signup required.
            </p>

            <Link
              href="/valuation"
              className="inline-flex items-center justify-center px-12 py-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-xl"
            >
              Run a Free Valuation →
            </Link>

            <p className="text-sm text-silver/60 mt-6">
              No credit card • No signup • Real results in 60 seconds
            </p>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-lg border border-gold/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-sm text-silver/80">Industries covered</div>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">SDE</div>
              <div className="text-sm text-silver/80">Based methodology</div>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">Free</div>
              <div className="text-sm text-silver/80">Unlimited valuations</div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-12 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Enter Details</h3>
              <p className="text-silver/80">
                Industry, revenue, SDE, and optional business details
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Get Range</h3>
              <p className="text-silver/80">
                Low/mid/high valuation with risk-adjusted multiples
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Share Results</h3>
              <p className="text-silver/80">
                Export PDF or copy broker rationale for sellers
              </p>
            </div>
          </div>
        </section>

        {/* Objections Addressed */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <div className="glass p-12 rounded-lg border border-gold/20">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-8 text-center">
              Why Brokers Trust This Tool
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-warm-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Is this accurate?
                </h4>
                <p className="text-silver/80">
                  Built on IBBA transaction data and DealStats with 40,000+ completed deals. Industry-standard SDE multiples refreshed quarterly.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-warm-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Do I need to sign up?
                </h4>
                <p className="text-silver/80">
                  No. Run your first valuation with zero friction. Get full results instantly without creating an account.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-warm-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Is this just a lead capture form?
                </h4>
                <p className="text-silver/80">
                  No. You get real, actionable valuation results instantly. No bait-and-switch, no "contact us for results."
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-warm-white mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Can I use this with clients?
                </h4>
                <p className="text-silver/80">
                  Yes. Export professional PDF reports for listing presentations. Includes broker rationale you can share with sellers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Methodology Overview */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              How We Calculate Valuations
            </h2>
            <p className="text-lg text-platinum/80 max-w-2xl mx-auto">
              Industry-standard methodology backed by real transaction data.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-lg border border-gold/20">
              <h4 className="font-semibold text-warm-white mb-2">SDE Multiples</h4>
              <p className="text-silver/80 text-sm">
                Industry-specific ranges based on IBBA data for 50+ business types
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20">
              <h4 className="font-semibold text-warm-white mb-2">Risk Adjustments</h4>
              <p className="text-silver/80 text-sm">
                Customer concentration, owner dependency, revenue trends
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20">
              <h4 className="font-semibold text-warm-white mb-2">Deal Quality</h4>
              <p className="text-silver/80 text-sm">
                Objective scoring of business attractiveness and marketability
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/how-it-works"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Learn more about our methodology →
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-24 max-w-5xl">
          <div className="glass p-12 rounded-lg border border-gold/20 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              Ready to Run Your First Valuation?
            </h2>
            <p className="text-lg text-platinum/80 mb-8 max-w-2xl mx-auto">
              Get instant results. No signup, no credit card, no obligations.
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

'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PriceSmallBusinessPage() {
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
                FREE BUSINESS VALUATION
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-warm-white mb-6 leading-tight">
              What's Your Business
              <span className="block text-blue-400">Worth?</span>
            </h1>

            <p className="text-lg sm:text-xl text-platinum/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Get a professional valuation range based on real transaction data. Free, no obligation.
            </p>

            <Link
              href="/valuation"
              className="inline-flex items-center justify-center px-12 py-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-xl"
            >
              Get Your Valuation →
            </Link>

            <p className="text-sm text-silver/60 mt-6">
              No signup • No credit card • Results in 60 seconds
            </p>
          </div>
        </section>

        {/* Why You Need a Valuation */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-12 text-center">
            Why Get a Valuation?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-lg border border-gold/20 text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Know Your Number</h3>
              <p className="text-silver/80">
                Understand what buyers will pay before you list your business
              </p>
            </div>

            <div className="glass p-8 rounded-lg border border-gold/20 text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Plan Your Exit</h3>
              <p className="text-silver/80">
                Benchmark your business and set realistic expectations for a sale
              </p>
            </div>

            <div className="glass p-8 rounded-lg border border-gold/20 text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Talk to Brokers</h3>
              <p className="text-silver/80">
                Have an informed conversation about listing price and commissions
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-12 text-center">
            Simple, Fast, Free
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Enter Your Numbers</h3>
              <p className="text-silver/80">
                Annual revenue, owner earnings, and a few business details
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Get Your Range</h3>
              <p className="text-silver/80">
                See low, mid, and high valuations instantly
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Decide Next Steps</h3>
              <p className="text-silver/80">
                Explore listings, connect with brokers, or save your results
              </p>
            </div>
          </div>
        </section>

        {/* What You'll Learn */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <div className="glass p-12 rounded-lg border border-gold/20">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-8 text-center">
              What You'll Learn
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-warm-white mb-2">Market Value Range</h4>
                  <p className="text-silver/80 text-sm">
                    Low, mid, and high estimates based on actual business sales
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-warm-white mb-2">What Affects Your Price</h4>
                  <p className="text-silver/80 text-sm">
                    See which factors make your business more or less valuable
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-warm-white mb-2">Deal Quality Score</h4>
                  <p className="text-silver/80 text-sm">
                    Understand how attractive your business is to buyers
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-warm-white mb-2">Industry Benchmarks</h4>
                  <p className="text-silver/80 text-sm">
                    See how your business compares to others in your industry
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Objections */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-8 text-center">
            Common Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass p-6 rounded-lg border border-gold/20">
              <h4 className="text-lg font-semibold text-warm-white mb-3">Is this just a lead magnet?</h4>
              <p className="text-silver/80 text-sm">
                No. You get real results instantly with no signup. We don't collect your information or force you to "contact us for results."
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20">
              <h4 className="text-lg font-semibold text-warm-white mb-3">Will you share my information?</h4>
              <p className="text-silver/80 text-sm">
                No data required for your first valuation. If you choose to save results later, your information stays private.
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20">
              <h4 className="text-lg font-semibold text-warm-white mb-3">Is this a broker upsell?</h4>
              <p className="text-silver/80 text-sm">
                Optional. After you run a valuation, you can explore brokers if you want to. No pressure, no follow-up calls.
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20">
              <h4 className="text-lg font-semibold text-warm-white mb-3">How accurate is this?</h4>
              <p className="text-silver/80 text-sm">
                Based on IBBA transaction data and industry-standard methodology. It's a strong starting point, not a certified appraisal.
              </p>
            </div>
          </div>
        </section>

        {/* Next Steps After Valuation */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              After Your Valuation
            </h2>
            <p className="text-lg text-platinum/80 max-w-2xl mx-auto">
              Optional next steps if you're thinking of selling.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-lg border border-gold/10 text-center">
              <h4 className="font-semibold text-warm-white mb-2">Explore Listings</h4>
              <p className="text-silver/70 text-sm">
                Browse businesses like yours to see market pricing
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/10 text-center">
              <h4 className="font-semibold text-warm-white mb-2">Connect with Brokers</h4>
              <p className="text-silver/70 text-sm">
                Find experienced brokers in your industry (optional)
              </p>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/10 text-center">
              <h4 className="font-semibold text-warm-white mb-2">Save Your Results</h4>
              <p className="text-silver/70 text-sm">
                Track your valuation over time as your business grows
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-24 max-w-5xl">
          <div className="glass p-12 rounded-lg border border-gold/20 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              Ready to See What Your Business is Worth?
            </h2>
            <p className="text-lg text-platinum/80 mb-8 max-w-2xl mx-auto">
              Get your free valuation in under 60 seconds. No signup, no obligations.
            </p>
            <Link
              href="/valuation"
              className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg"
            >
              Get Your Valuation
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

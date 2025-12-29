'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        {/* Hero Section - Valuation First */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-16 md:pb-24 max-w-6xl">
          <div className="text-center">
            {/* Tag Line */}
            <div className="inline-block mb-6">
              <span className="px-6 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium tracking-wide">
                BUILT FOR BROKERS
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-warm-white mb-6 leading-tight">
              Business Valuation
              <span className="block text-blue-400">in Under 60 Seconds</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-platinum/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get a defensible price range for any Main Street business.
              Built for brokers, backed by IBBA transaction data.
            </p>

            {/* Trust Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-silver/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No signup required</span>
              </div>
              <span className="text-blue-400">•</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>SDE-based methodology</span>
              </div>
              <span className="text-blue-400">•</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>50+ industries covered</span>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link
                href="/valuation"
                className="group inline-flex items-center justify-center px-10 py-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg w-full sm:w-auto max-w-sm"
              >
                Get Free Valuation
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center px-10 py-5 bg-transparent border-2 border-silver/40 text-silver hover:bg-silver/10 hover:border-silver font-medium rounded-lg transition-all duration-200 text-lg w-full sm:w-auto max-w-sm"
              >
                How It Works
              </Link>
            </div>

            <p className="text-xs text-silver/60">No credit card • No signup • Just your numbers</p>

            {/* 3-Step Visual */}
            <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass p-6 rounded-lg border border-blue-500/20 text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-400 font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-warm-white mb-2">Enter the Basics</h3>
                <p className="text-silver/80 text-sm">
                  Industry, revenue, SDE. Takes 30 seconds.
                </p>
              </div>
              <div className="glass p-6 rounded-lg border border-blue-500/20 text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-400 font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-warm-white mb-2">Get Your Range</h3>
                <p className="text-silver/80 text-sm">
                  Low/mid/high valuation with reasoning.
                </p>
              </div>
              <div className="glass p-6 rounded-lg border border-blue-500/20 text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-400 font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-warm-white mb-2">Share with Sellers</h3>
                <p className="text-silver/80 text-sm">
                  Export PDF or copy broker rationale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Brokers Trust Our Valuations */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              Why Brokers Trust Our Valuations
            </h2>
            <p className="text-lg text-platinum/80 max-w-2xl mx-auto">
              Built on real transaction data from sources you already know.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-lg border border-gold/20 hover:border-gold/40 transition-all">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Real Transaction Data</h3>
              <p className="text-silver/80 leading-relaxed">
                Industry multiples sourced from IBBA, DealStats, and verified broker surveys. Updated quarterly.
              </p>
            </div>

            <div className="glass p-8 rounded-lg border border-gold/20 hover:border-gold/40 transition-all">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Risk-Adjusted Multiples</h3>
              <p className="text-silver/80 leading-relaxed">
                Accounts for customer concentration, owner dependency, revenue trends, and recurring revenue.
              </p>
            </div>

            <div className="glass p-8 rounded-lg border border-gold/20 hover:border-gold/40 transition-all">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Professional Output</h3>
              <p className="text-silver/80 leading-relaxed">
                Export PDF reports with broker rationale you can share with sellers. Looks professional, saves time.
              </p>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 max-w-6xl">
          <div className="glass p-12 rounded-lg border border-gold/20">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
                What You Get
              </h2>
              <p className="text-lg text-platinum/80">
                Everything you need to price a business confidently.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-warm-white mb-1">Valuation Range</h4>
                  <p className="text-silver/80 text-sm">Low, mid, and high estimates with applied SDE multiples</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-warm-white mb-1">Risk Factor Breakdown</h4>
                  <p className="text-silver/80 text-sm">See which factors adjusted the valuation up or down</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-warm-white mb-1">Deal Quality Score</h4>
                  <p className="text-silver/80 text-sm">Objective assessment of deal attractiveness</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-warm-white mb-1">Broker Rationale</h4>
                  <p className="text-silver/80 text-sm">Plain-English explanation you can share with sellers</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-warm-white mb-1">PDF Export</h4>
                  <p className="text-silver/80 text-sm">Professional reports for listing presentations</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-warm-white mb-1">Unlimited Runs</h4>
                  <p className="text-silver/80 text-sm">Run as many valuations as you need</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beyond Valuation - Feature Hints */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              Beyond Valuation
            </h2>
            <p className="text-lg text-platinum/80 max-w-2xl mx-auto">
              Once you've run a valuation, discover how it fits into the broader market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-lg border border-gold/10 text-center">
              <div className="text-silver/80 text-sm mb-2">Compare your valuation to</div>
              <div className="text-warm-white font-semibold text-lg mb-3">Live Market Listings</div>
              <p className="text-silver/70 text-sm">See how your pricing stacks up against businesses currently for sale</p>
            </div>

            <div className="glass p-6 rounded-lg border border-gold/10 text-center">
              <div className="text-silver/80 text-sm mb-2">Find buyers in</div>
              <div className="text-warm-white font-semibold text-lg mb-3">Your Valuation Range</div>
              <p className="text-silver/70 text-sm">Connect with qualified buyers searching for businesses at your price point</p>
            </div>

            <div className="glass p-6 rounded-lg border border-gold/10 text-center">
              <div className="text-silver/80 text-sm mb-2">Track valuations</div>
              <div className="text-warm-white font-semibold text-lg mb-3">Over Time</div>
              <p className="text-silver/70 text-sm">Save and compare valuations to see how businesses evolve</p>
            </div>
          </div>
        </section>

        {/* Methodology Trust Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              Built on Real Transaction Data
            </h2>
            <p className="text-lg text-platinum/80 max-w-2xl mx-auto">
              Our multiples come from industry sources brokers already trust.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6 rounded-lg border border-gold/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
              <div className="text-sm text-silver/80">Industries covered</div>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">IBBA</div>
              <div className="text-sm text-silver/80">Data sourced</div>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">SDE</div>
              <div className="text-sm text-silver/80">Based valuations</div>
            </div>
            <div className="glass p-6 rounded-lg border border-gold/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">Q4</div>
              <div className="text-sm text-silver/80">Updated quarterly</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-silver/60 max-w-3xl mx-auto">
              Multiples based on IBBA transaction data, DealStats, and industry surveys.
              This tool provides decision support for pricing discussions, not formal business appraisals.
            </p>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 max-w-6xl">
          <div className="glass p-12 md:p-16 rounded-lg border border-gold/20 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              Price your next listing in under a minute.
            </h2>
            <p className="text-lg text-platinum/80 mb-8 max-w-2xl mx-auto">
              Free to use. No login required for your first valuation.
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
            <p className="text-sm text-silver/60 mt-4">
              No credit card • No signup • Just enter your numbers
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

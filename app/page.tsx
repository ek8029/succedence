'use client';

import React from 'react';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import ConnectCTA from '@/components/ConnectCTA';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden pb-0 mb-0">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-0 max-w-7xl">

          {/* Hero Section - Enhanced with clear positioning */}
          <ScrollAnimation direction="fade">
            <div className="text-center mb-16 sm:mb-24 md:mb-32">
              <div className="max-w-5xl mx-auto">
                {/* NEW: Clear one-liner positioning */}
                <div className="inline-block mb-6">
                  <span className="px-6 py-2 bg-gold/10 border border-gold/30 text-gold rounded-full text-sm font-medium tracking-wide">
                    AI-POWERED MARKETPLACE FOR MAIN STREET BUSINESSES
                  </span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-warm-white mb-6 tracking-refined leading-tight">
                  Buy & Sell Businesses
                  <span className="block text-gold tracking-luxury">90% Smarter</span>
                </h1>
                <p className="font-sans text-lg sm:text-xl md:text-2xl leading-relaxed text-platinum/90 mb-4 max-w-3xl mx-auto">
                  The first AI-powered marketplace that connects buyers, sellers, and brokers for main-street business acquisitions. Find your perfect deal faster with automated valuations, due diligence, and buyer-fit scoring.
                </p>

                {/* NEW: Trust bar with real stats */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm text-silver/80">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>500+ Active Buyers</span>
                  </div>
                  <span className="text-gold">•</span>
                  <span>56 Live Listings</span>
                  <span className="text-gold">•</span>
                  <span>$47M+ Deal Volume</span>
                </div>

                {/* Key Benefits - GRID AUTO ROWS FOR EQUAL HEIGHT */}
                <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12 sm:auto-rows-fr">
                  <div className="text-center p-4 glass rounded-luxury border border-gold/20 flex flex-col justify-center h-full">
                    <div className="text-4xl font-bold text-gold mb-2 font-mono h-[48px] flex items-center justify-center">10x</div>
                    <div className="text-sm text-silver font-medium h-[20px] flex items-center justify-center">Faster Discovery</div>
                    <div className="text-xs text-silver/60 mt-1 h-[18px] flex items-center justify-center">vs traditional brokers</div>
                  </div>
                  <div className="text-center p-4 glass rounded-luxury border border-gold/20 flex flex-col justify-center h-full">
                    <div className="text-4xl font-bold text-gold mb-2 font-mono h-[48px] flex items-center justify-center">94%</div>
                    <div className="text-sm text-silver font-medium h-[20px] flex items-center justify-center">Match Accuracy</div>
                    <div className="text-xs text-silver/60 mt-1 h-[18px] flex items-center justify-center">AI-powered scoring</div>
                  </div>
                  <div className="text-center p-4 glass rounded-luxury border border-gold/20 flex flex-col justify-center h-full">
                    <div className="text-4xl font-bold text-gold mb-2 font-mono h-[48px] flex items-center justify-center">47M</div>
                    <div className="text-sm text-silver font-medium h-[20px] flex items-center justify-center">Deal Volume</div>
                    <div className="text-xs text-silver/60 mt-1 h-[18px] flex items-center justify-center">Total tracked</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/login"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-accent-gradient text-midnight font-semibold rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-base sm:text-lg w-full sm:w-auto max-w-sm min-h-[48px]"
                  >
                    Start Free Trial
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-silver text-silver hover:bg-silver hover:text-midnight font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-base sm:text-lg w-full sm:w-auto max-w-sm min-h-[48px]"
                  >
                    Watch Demo
                  </button>
                </div>

                <p className="text-xs text-silver/60 mt-4">No credit card required • 14-day free trial • Cancel anytime</p>

              </div>
            </div>
          </ScrollAnimation>

          {/* NEW: Problem/Solution Section */}
          <ScrollAnimation direction="up" delay={25}>
            <div className="mb-24 sm:mb-32">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 md:auto-rows-fr">
                  {/* Problem - EXACT HEIGHT MATCH */}
                  <div className="glass p-8 rounded-luxury-lg border border-red-500/20 relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-warm-white mb-2 h-[28px] flex items-center">The Old Way</h3>
                        <p className="text-silver/80 text-sm leading-relaxed min-h-[100px]">
                          Finding quality businesses takes 6-12 months. Cold-calling brokers, scattered listings across 15+ platforms, zero transparency on valuations, and endless back-and-forth just to see financials.
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-silver/70 mt-auto">
                      <li className="flex items-center gap-2 h-[24px]">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Manual research across fragmented platforms</span>
                      </li>
                      <li className="flex items-center gap-2 h-[24px]">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>No transparency on valuations or fit</span>
                      </li>
                      <li className="flex items-center gap-2 h-[24px]">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Weeks waiting for broker callbacks</span>
                      </li>
                    </ul>
                  </div>

                  {/* Solution - EXACT HEIGHT MATCH */}
                  <div className="glass p-8 rounded-luxury-lg border border-gold/20 relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-warm-white mb-2 h-[28px] flex items-center">Succedence</h3>
                        <p className="text-silver/80 text-sm leading-relaxed min-h-[100px]">
                          One centralized marketplace with AI that does the heavy lifting. Instant valuations, automated buyer-fit scoring, and direct connections to verified sellers and brokers.
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-silver/70 mt-auto">
                      <li className="flex items-center gap-2 h-[24px]">
                        <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>All listings in one searchable platform</span>
                      </li>
                      <li className="flex items-center gap-2 h-[24px]">
                        <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>AI-powered valuations and fit scores</span>
                      </li>
                      <li className="flex items-center gap-2 h-[24px]">
                        <svg className="w-4 h-4 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Direct messaging with sellers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Preview Section - What's Inside */}
          <ScrollAnimation direction="up" delay={50}>
            <div id="demo-section" className="mb-24 sm:mb-32">
              <div className="text-center mb-16">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">
                  See What's Inside Succedence
                </h2>
                <p className="font-sans text-xl text-platinum/80 max-w-3xl mx-auto leading-relaxed">
                  Get a preview of the premium business opportunities and AI tools waiting for you
                </p>
              </div>

              {/* Sample Listing Preview */}
              <div className="max-w-4xl mx-auto mb-16">
                <div className="glass p-8 rounded-luxury-lg border border-gold/20 relative overflow-hidden">
                  {/* Blur Overlay */}
                  <div className="absolute inset-0 backdrop-blur-sm bg-charcoal/30 z-10 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-warm-white mb-2">Premium Listings Inside</h3>
                      <p className="text-silver/80 mb-4">Unlock 56 verified business opportunities</p>
                      <Link
                        href="/login"
                        className="inline-flex items-center px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury hover:transform hover:scale-105 transition-all duration-300"
                      >
                        Start Free Trial →
                      </Link>
                    </div>
                  </div>

                  {/* Sample Content (blurred background) */}
                  <div className="opacity-60">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-xs font-semibold bg-accent-gradient text-midnight rounded-full">ACTIVE</span>
                        <span className="px-3 py-1 text-xs font-medium bg-charcoal/50 text-silver rounded-full">SaaS</span>
                      </div>
                      <span className="text-xs text-gold">AI MATCH: 94%</span>
                    </div>

                    <h3 className="text-2xl font-semibold text-warm-white mb-4">
                      Premium Marketing SaaS Platform
                    </h3>

                    <p className="text-silver/80 mb-6">
                      Established marketing automation platform serving 2,000+ customers with $2.4M ARR.
                      Strong growth trajectory, excellent team, and defensible market position...
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-charcoal/30 rounded-luxury">
                        <div className="text-sm text-silver/70 mb-1">Annual Revenue</div>
                        <div className="text-xl font-bold text-gold">$2.4M</div>
                      </div>
                      <div className="p-4 bg-charcoal/30 rounded-luxury">
                        <div className="text-sm text-silver/70 mb-1">Asking Price</div>
                        <div className="text-xl font-bold text-gold">$12M</div>
                      </div>
                      <div className="p-4 bg-charcoal/30 rounded-luxury">
                        <div className="text-sm text-silver/70 mb-1">Multiple</div>
                        <div className="text-xl font-bold text-gold">5.0x</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Features Preview */}
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden h-80 flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">AI Business Analysis</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm flex-grow">Get comprehensive AI-powered analysis including scoring, strengths, weaknesses, and growth opportunities for every listing.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden h-80 flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Buyer Compatibility</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm flex-grow">AI calculates compatibility scores between your investment criteria and business opportunities with detailed reasoning.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden h-80 flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Due Diligence Assistant</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm flex-grow">Generate comprehensive due diligence checklists with progress tracking and export capabilities for your deals.</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Social Proof - ENHANCED */}
          <ScrollAnimation direction="up" delay={100}>
            <div className="mb-32 sm:mb-40">
              <div className="text-center mb-20">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">
                  Trusted by Serious Buyers & Sellers
                </h2>
                <p className="font-sans text-xl text-platinum/80 max-w-3xl mx-auto leading-relaxed">
                  Join hundreds of successful entrepreneurs who've found their next acquisition through Succedence
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto lg:auto-rows-fr">
                <div className="glass p-8 rounded-luxury-lg border border-gold/20 flex flex-col h-full">
                  <div className="flex items-center mb-4 h-[56px]">
                    <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mr-4">
                      <span className="text-midnight font-bold">M.K.</span>
                    </div>
                    <div>
                      <div className="font-semibold text-warm-white">Michael K.</div>
                      <div className="text-sm text-silver/70">Private Equity Partner</div>
                    </div>
                  </div>
                  <p className="text-silver/80 leading-relaxed flex-grow mb-4 min-h-[72px]">
                    "Found and closed a $3.2M SaaS acquisition in 6 weeks. The AI analysis saved months of research."
                  </p>
                  <div className="flex gap-1 h-[20px]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 flex flex-col h-full">
                  <div className="flex items-center mb-4 h-[56px]">
                    <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mr-4">
                      <span className="text-midnight font-bold">S.T.</span>
                    </div>
                    <div>
                      <div className="font-semibold text-warm-white">Sarah T.</div>
                      <div className="text-sm text-silver/70">Serial Entrepreneur</div>
                    </div>
                  </div>
                  <p className="text-silver/80 leading-relaxed flex-grow mb-4 min-h-[72px]">
                    "The buyer compatibility scoring is incredible. No more wasting time on deals that don't fit my criteria."
                  </p>
                  <div className="flex gap-1 h-[20px]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 flex flex-col h-full">
                  <div className="flex items-center mb-4 h-[56px]">
                    <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mr-4">
                      <span className="text-midnight font-bold">R.C.</span>
                    </div>
                    <div>
                      <div className="font-semibold text-warm-white">Robert C.</div>
                      <div className="text-sm text-silver/70">Investment Banker</div>
                    </div>
                  </div>
                  <p className="text-silver/80 leading-relaxed flex-grow mb-4 min-h-[72px]">
                    "Best platform for sourcing deals. The verification process ensures I only see serious sellers."
                  </p>
                  <div className="flex gap-1 h-[20px]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Broker Network Section */}
          <ScrollAnimation direction="up" delay={125}>
            <div className="mb-24 sm:mb-32">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">
                  Connect with Expert Brokers
                </h2>
                <p className="font-sans text-xl text-platinum/80 max-w-3xl mx-auto leading-relaxed mb-8">
                  Access our network of experienced business brokers who can guide you through your acquisition journey
                </p>
                <Link
                  href="/brokers"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-transparent border-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 min-h-[48px] text-base"
                >
                  Browse Broker Directory
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto sm:auto-rows-fr">
                <div className="glass p-6 rounded-luxury border border-gold/10 text-center flex flex-col justify-center h-full">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">Verified Experts</div>
                  <div className="text-sm text-silver/80 h-[40px] flex items-center justify-center">Licensed and experienced professionals</div>
                </div>
                <div className="glass p-6 rounded-luxury border border-gold/10 text-center flex flex-col justify-center h-full">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">Industry Specialists</div>
                  <div className="text-sm text-silver/80 h-[40px] flex items-center justify-center">Experts in specific business sectors</div>
                </div>
                <div className="glass p-6 rounded-luxury border border-gold/10 text-center flex flex-col justify-center h-full">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">Direct Contact</div>
                  <div className="text-sm text-silver/80 h-[40px] flex items-center justify-center">Connect directly with brokers</div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Final CTA Section */}
          <ScrollAnimation direction="fade" delay={150}>
            <div className="mb-32">
              <div className="glass p-16 rounded-luxury-xl border border-gold/20 max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-navy/10"></div>
                <div className="relative z-10 text-center">
                  <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">
                    Ready to Find Your Next Acquisition?
                  </h2>
                  <p className="font-sans text-xl text-platinum/80 mb-8 leading-relaxed">
                    Join the platform that's changing how serious buyers discover and acquire premium businesses.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-base sm:text-lg min-h-[48px]"
                    >
                      Start Free Trial →
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-transparent border-2 border-silver text-silver hover:bg-silver hover:text-midnight font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-base sm:text-lg min-h-[48px]"
                    >
                      View Pricing
                    </Link>
                  </div>

                  <div className="text-sm text-silver/70">
                    <p>14-day free trial • No credit card required • Cancel anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

        </div>
      </div>

      {/* Connect with Succedence Section - Full Width */}
      <ScrollAnimation direction="up" delay={200}>
        <ConnectCTA />
      </ScrollAnimation>
    </div>
  );
}

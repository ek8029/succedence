'use client';

import React from 'react';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import EmailCopyButton from '@/components/EmailCopyButton';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden pb-0 mb-0">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-0 max-w-7xl">

          {/* Hero Section */}
          <ScrollAnimation direction="fade">
            <div className="text-center mb-16 sm:mb-24 md:mb-32">
              <div className="max-w-5xl mx-auto">
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-warm-white mb-6 tracking-refined leading-tight">
                  AI-Powered Business
                  <span className="block text-gold tracking-luxury">Acquisition Platform</span>
                </h1>
                <p className="font-sans text-lg sm:text-xl md:text-2xl leading-relaxed text-platinum/90 mb-8 max-w-3xl mx-auto">
                  Find, analyze, and acquire premium businesses 90% faster with our AI-driven marketplace.
                  Join 500+ serious buyers already using Succedence.
                </p>

                {/* Key Benefits */}
                <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold mb-2 font-mono">90%</div>
                    <div className="text-sm text-silver">Faster Deal Discovery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold mb-2 font-mono">35%</div>
                    <div className="text-sm text-silver">Faster Closures</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold mb-2 font-mono">500+</div>
                    <div className="text-sm text-silver">Active Buyers</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/auth"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-accent-gradient text-midnight font-semibold rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-lg w-full sm:w-auto max-w-sm"
                  >
                    Get Started
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-silver text-silver hover:bg-silver hover:text-midnight font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-lg w-full sm:w-auto max-w-sm"
                  >
                    See Demo
                  </button>
                </div>

                <p className="text-sm text-silver/70 mt-4">Professional platform</p>
              </div>
            </div>
          </ScrollAnimation>

          {/* Preview Section - What's Inside */}
          <ScrollAnimation direction="up" delay={50}>
            <div id="demo-section" className="mb-24 sm:mb-32">
              <div className="text-center mb-16">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">
                  See What&apos;s Inside Succedence
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
                    <div className="text-center">
                      <div className="w-16 h-16 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-warm-white mb-2">Premium Listings Inside</h3>
                      <p className="text-silver/80 mb-4">Unlock 500+ verified business opportunities</p>
                      <Link
                        href="/auth"
                        className="inline-flex items-center px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury hover:transform hover:scale-105 transition-all duration-300"
                      >
                        Get Access Now
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
                      <span className="text-xs text-gold">AI SCORE: 94/100</span>
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
                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">AI Business Analysis</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">Get comprehensive AI-powered analysis including scoring, strengths, weaknesses, risks, and growth opportunities for every listing.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Buyer Compatibility</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">AI calculates compatibility scores between your investment criteria and business opportunities with detailed reasoning.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Due Diligence Assistant</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">Generate comprehensive, industry-specific due diligence checklists with progress tracking and export capabilities.</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Social Proof */}
          <ScrollAnimation direction="up" delay={100}>
            <div className="mb-32 sm:mb-40">
              <div className="text-center mb-20">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">
                  Trusted by Serious Buyers
                </h2>
                <p className="font-sans text-xl text-platinum/80 max-w-3xl mx-auto leading-relaxed">
                  Join hundreds of successful entrepreneurs who&apos;ve found their next acquisition through Succedence
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="glass p-8 rounded-luxury-lg border border-gold/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mr-4">
                      <span className="text-midnight font-bold">M.K.</span>
                    </div>
                    <div>
                      <div className="font-semibold text-warm-white">Michael K.</div>
                      <div className="text-sm text-silver/70">Private Equity Partner</div>
                    </div>
                  </div>
                  <p className="text-silver/80 leading-relaxed">
                    &quot;Found and closed a $3.2M SaaS acquisition in 6 weeks. The AI analysis saved me months of manual research.&quot;
                  </p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mr-4">
                      <span className="text-midnight font-bold">S.T.</span>
                    </div>
                    <div>
                      <div className="font-semibold text-warm-white">Sarah T.</div>
                      <div className="text-sm text-silver/70">Serial Entrepreneur</div>
                    </div>
                  </div>
                  <p className="text-silver/80 leading-relaxed">
                    &quot;The buyer compatibility scoring is incredible. No more wasting time on deals that don&apos;t fit my criteria.&quot;
                  </p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mr-4">
                      <span className="text-midnight font-bold">R.C.</span>
                    </div>
                    <div>
                      <div className="font-semibold text-warm-white">Robert C.</div>
                      <div className="text-sm text-silver/70">Investment Banker</div>
                    </div>
                  </div>
                  <p className="text-silver/80 leading-relaxed">
                    &quot;Best platform for sourcing quality deals. The verification process ensures I&apos;m talking to serious sellers.&quot;
                  </p>
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
                    Join the platform that&apos;s changing how serious buyers discover and acquire premium businesses.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                    <Link
                      href="/auth"
                      className="inline-flex items-center px-10 py-5 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-lg"
                    >
                      Get Started
                    </Link>
                  </div>

                  <div className="text-sm text-silver/70 space-y-1">
                    <p>✓ Professional AI tools • ✓ Cancel anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Connect with Succedence Section */}
          <ScrollAnimation direction="up" delay={200}>
            <div className="mb-20">
              <div className="text-center mb-16">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">
                  Connect with Succedence
                </h2>
                <p className="font-sans text-xl text-platinum/80 max-w-3xl mx-auto leading-relaxed">
                  Follow our journey and stay updated on the latest business acquisition opportunities and platform developments.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12">
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/company/succedence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn Company Page
                </a>

                {/* Twitter/X */}
                <a
                  href="https://x.com/SuccedenceSMB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Follow @SuccedenceSMB
                </a>

                {/* Email */}
                <EmailCopyButton
                  email="founder@succedence.com"
                  showEmail={true}
                />
              </div>
            </div>
          </ScrollAnimation>

        </div>
      </div>
    </div>
  );
}
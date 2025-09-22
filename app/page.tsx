'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Listing } from '@/lib/types';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [waitlistData, setWaitlistData] = useState({
    email: '',
    name: '',
    role: 'BUYER' as 'BUYER' | 'SELLER' | 'BROKER',
    company: '',
    dealSize: '',
    interests: [] as string[]
  });
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const response = await fetch('/api/listings');
        const data = await response.json();
        setFeaturedListings((data.listings || []).slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured listings:', error);
      }
    };

    fetchFeaturedListings();
  }, []);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleWaitlistInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWaitlistData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setWaitlistData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistData.email || !waitlistData.name) return;

    setIsSubmittingWaitlist(true);

    try {
      // Simulate API call (no real backend yet)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'notification fixed top-4 right-4 z-50 text-white px-6 py-4 slide-up';
      notification.style.backgroundColor = 'var(--accent)';
      notification.style.color = '#000';
      notification.innerHTML = '🎉 You&apos;re on the waitlist! We&apos;ll notify you when beta launches.';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);

      // Show confirmation state
      setWaitlistSubmitted(true);

      // Reset form after showing confirmation for a bit
      setTimeout(() => {
        setWaitlistData({
          email: '',
          name: '',
          role: 'BUYER',
          company: '',
          dealSize: '',
          interests: []
        });
      }, 3000);
    } catch (error) {
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'notification fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 slide-up';
      notification.innerHTML = '✗ Something went wrong. Please try again.';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden pb-0 mb-0">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-0 max-w-7xl">
          <ScrollAnimation direction="fade">
            <div className="text-center mb-16 sm:mb-24 md:mb-32 lg:mb-40 mt-8 sm:mt-12 md:mt-16 lg:mt-24">
              <div className="max-w-6xl mx-auto px-2 sm:px-0">
                <div className="mb-12 sm:mb-16 md:mb-20 lg:mb-28">
                  <h1 className="font-serif text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-warm-white mb-4 xs:mb-6 sm:mb-8 lg:mb-12 tracking-refined leading-tight">
                    Succedence
                  </h1>
                  <div className="h-1 xs:h-1.5 sm:h-2 lg:h-3 w-24 xs:w-32 sm:w-48 lg:w-64 bg-accent-gradient mx-auto mb-6 xs:mb-8 sm:mb-12 lg:mb-16"></div>
                </div>
                <h2 className="font-serif text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-warm-white mb-6 xs:mb-8 sm:mb-12 lg:mb-16 tracking-refined leading-tight">
                  Acquire Premium
                  <span className="block text-gold tracking-luxury"> Businesses</span>
                </h2>
                <p className="font-sans text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed xs:leading-luxury text-platinum/90 mb-8 xs:mb-12 sm:mb-16 lg:mb-20 max-w-xs xs:max-w-md sm:max-w-3xl lg:max-w-4xl mx-auto px-2 xs:px-0">
                  Discover exceptional acquisition opportunities from verified sellers. Connect with business owners ready to transition their legacy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center">
                  <Link href="/browse" className="group inline-flex items-center px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 bg-accent-gradient text-midnight font-semibold rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-sm sm:text-base lg:text-lg w-full sm:w-auto">
                    Browse Opportunities
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 sm:ml-3 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link href="/auth" className="inline-flex items-center px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 bg-transparent border-2 border-silver text-silver hover:bg-silver hover:text-midnight font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary text-sm sm:text-base lg:text-lg w-full sm:w-auto">
                    List Your Business
                  </Link>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation direction="up" delay={50}>
            <div className="mb-24 sm:mb-32 md:mb-40 lg:mb-48">
              <div className="text-center mb-16 sm:mb-20 md:mb-24 lg:mb-32 px-2 sm:px-0">
                <h2 className="font-serif text-2xl xs:text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-warm-white mb-6 xs:mb-8 tracking-refined">The Problem We&apos;re Solving</h2>
                <p className="font-sans text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-platinum/80 max-w-xs xs:max-w-md sm:max-w-3xl md:max-w-4xl mx-auto leading-relaxed mb-12 xs:mb-16 sm:mb-20 lg:mb-24">Current business acquisition processes are inefficient, time-consuming, and often miss the best opportunities.</p>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto mb-16 xs:mb-20 sm:mb-28 lg:mb-36">
                  <div className="glass p-6 xs:p-8 lg:p-14 xl:p-16 rounded-luxury border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gold mb-3 xs:mb-4 lg:mb-6 font-mono leading-none whitespace-nowrap flex items-center justify-center w-full">90%</div>
                    <div className="text-xs xs:text-sm lg:text-base text-gold uppercase tracking-wider leading-relaxed font-medium px-1">Reduction in Manual Review Time</div>
                  </div>
                  <div className="glass p-6 xs:p-8 lg:p-14 xl:p-16 rounded-luxury border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gold mb-3 xs:mb-4 lg:mb-6 font-mono leading-none whitespace-nowrap flex items-center justify-center w-full">6-12</div>
                    <div className="text-xs xs:text-sm lg:text-base text-gold uppercase tracking-wider leading-relaxed font-medium px-1">Months to Find Target</div>
                  </div>
                  <div className="glass p-6 xs:p-8 lg:p-14 xl:p-16 rounded-luxury border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gold mb-3 xs:mb-4 lg:mb-6 font-mono leading-none whitespace-nowrap flex items-center justify-center w-full">35%</div>
                    <div className="text-xs xs:text-sm lg:text-base text-gold uppercase tracking-wider leading-relaxed font-medium px-1">Faster Deal Closures with AI</div>
                  </div>
                  <div className="glass p-6 xs:p-8 lg:p-14 xl:p-16 rounded-luxury border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 flex flex-col items-center justify-center text-center min-w-0">
                    <div className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gold mb-3 xs:mb-4 lg:mb-6 font-mono leading-none whitespace-nowrap flex items-center justify-center w-full">45%</div>
                    <div className="text-xs xs:text-sm lg:text-base text-gold uppercase tracking-wider leading-relaxed font-medium px-1">More Efficient Due Diligence</div>
                  </div>
                </div>

                <h3 className="font-serif text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-warm-white mb-4 xs:mb-6 sm:mb-8 lg:mb-12 tracking-refined px-2 sm:px-0">Why Choose Succedence?</h3>
                <p className="font-sans text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-platinum/80 max-w-xs xs:max-w-md sm:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed px-2 xs:px-0">Built for discerning buyers and sellers who value quality, transparency, and premium service.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-8 sm:gap-10 lg:gap-12 max-w-7xl mx-auto px-2 xs:px-0">
                <div className="glass p-6 sm:p-8 lg:p-10 xl:p-12 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6 sm:mb-8">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-warm-white mb-4 sm:mb-6 tracking-refined">Verified Opportunities</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm sm:text-base lg:text-lg">Every listing undergoes rigorous verification. Connect with serious sellers and pre-qualified opportunities.</p>
                </div>

                <div className="glass p-6 sm:p-8 lg:p-10 xl:p-12 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6 sm:mb-8">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-warm-white mb-4 sm:mb-6 tracking-refined">Secure Transactions</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm sm:text-base lg:text-lg">Industry-leading security protocols protect your information and ensure confidential deal-making.</p>
                </div>

                <div className="glass p-6 sm:p-8 lg:p-10 xl:p-12 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6 sm:mb-8">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-warm-white mb-4 sm:mb-6 tracking-refined">Lightning Fast</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm sm:text-base lg:text-lg">Streamlined processes and intelligent matching accelerate your path from discovery to acquisition.</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* AI-Powered Features Section */}
          <ScrollAnimation direction="up" delay={100}>
            <div className="mb-32">
              <div className="text-center mb-20">
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">AI-Powered Acquisition Intelligence</h2>
                <p className="font-sans text-xl text-platinum/80 max-w-3xl mx-auto leading-relaxed">Experience the future of business acquisition with our advanced AI platform launching soon.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">AI-Defined Buy-Box</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">Our AI learns your acquisition criteria, risk tolerance, and business goals to create a personalized search strategy.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Automated Search</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">Advanced algorithms continuously scan thousands of businesses across multiple platforms to find perfect matches.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Pre-Diligence Support</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">Get instant, comprehensive comparisons with financial metrics, growth potential, and risk assessments.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Market Intelligence</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">Access deep market insights, competitive analysis, and growth opportunity scoring for every potential acquisition.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM4 19h10M4 15h10M4 11h10M4 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Real-Time Alerts</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">Never miss an opportunity with instant notifications when new businesses matching your criteria become available.</p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-gradient"></div>
                  <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-4 tracking-refined">Risk Assessment</h3>
                  <p className="font-sans text-silver/80 leading-relaxed text-sm">Comprehensive due diligence reports highlighting potential risks, compliance issues, and red flags before you invest.</p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {featuredListings.length > 0 && (
            <ScrollAnimation direction="up" delay={150}>
              <div className="mb-32">
                <div className="text-center mb-20">
                  <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">Featured Opportunities</h2>
                  <p className="font-sans text-xl text-platinum/80 max-w-3xl mx-auto leading-relaxed">Hand-selected premium businesses ready for acquisition</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                  {featuredListings.map((listing, index) => (
                    <div key={listing.id} className="group" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="glass rounded-luxury-lg overflow-hidden border border-gold/10 hover:border-gold/30 transition-all duration-500 hover:transform hover:-translate-y-2 hover:scale-105 relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="p-8 pb-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex flex-wrap gap-2">
                              <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${listing.status === 'active' ? 'bg-accent-gradient text-midnight border-gold' : 'bg-slate/50 text-silver border-silver/50'}`}>
                                {listing.status}
                              </span>
                              <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider bg-charcoal/50 text-silver/80 rounded-full border border-silver/20">
                                {listing.industry}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-serif text-xl text-warm-white font-medium mb-4 line-clamp-2 leading-tight tracking-refined group-hover:text-gold-light transition-colors duration-300">
                            {listing.title}
                          </h3>

                          <p className="font-sans text-silver/80 mb-6 line-clamp-3 leading-relaxed text-sm">
                            {listing.description}
                          </p>
                        </div>

                        <div className="bg-navy/30 border-t border-gold/10 p-6 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-xs text-silver/70 font-medium uppercase tracking-wide">Revenue</span>
                            <span className="font-mono text-sm text-gold font-bold">{formatCurrency(listing.revenue)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-xs text-silver/70 font-medium uppercase tracking-wide">Valuation</span>
                            <span className="font-mono text-sm text-gold font-bold">
                              {formatCurrency(listing.price)}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 pt-4">
                          <Link href={`/listings/${listing.id}`} className="block">
                            <button className="w-full py-4 bg-accent-gradient text-midnight font-semibold rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury">
                              View Details →
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/browse" className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-sans">
                    View All Opportunities →
                  </Link>
                </div>
              </div>
            </ScrollAnimation>
          )}

          {/* Beta Waitlist Section */}
          <ScrollAnimation direction="fade" delay={100}>
            <div className="mb-32">
              <div className="glass p-16 rounded-luxury-xl border border-gold/20 max-w-5xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-navy/10"></div>
                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-6 tracking-refined">Why Join the Waitlist?</h2>
                    <p className="font-sans text-xl text-platinum/80 mb-8 leading-relaxed">The traditional approach to business acquisitions is broken. Long research cycles, missed opportunities, and information asymmetry cost entrepreneurs millions. We&apos;re changing that.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 mb-12">
                    <div className="space-y-8">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-warm-white mb-2 tracking-refined">Save Months of Research</h3>
                          <p className="font-sans text-silver/80 leading-relaxed text-sm sm:text-base lg:text-lg">What currently takes 6-12 months will be reduced to weeks with our AI-powered discovery engine.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-warm-white mb-2 tracking-refined">Data-Driven Decisions</h3>
                          <p className="font-sans text-silver/80 leading-relaxed text-sm sm:text-base lg:text-lg">Make confident acquisition decisions with comprehensive analytics and market insights at your fingertips.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-warm-white mb-2 tracking-refined">Minimize Risk</h3>
                          <p className="font-sans text-silver/80 leading-relaxed text-sm sm:text-base lg:text-lg">Advanced AI risk assessment will help you avoid costly mistakes and identify red flags early.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-slate/50 border-2 border-gold/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-warm-white mb-2 tracking-refined">First-Mover Advantage</h3>
                          <p className="font-sans text-silver/80 leading-relaxed text-sm sm:text-base lg:text-lg">Get exclusive access to opportunities before they hit the mainstream market or your competitors.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Beta Benefits */}
                  <div className="border-t border-gold/20 pt-12">
                    <h3 className="font-serif text-2xl font-semibold text-warm-white mb-8 text-center tracking-refined">Early Access Benefits</h3>
                    <p className="font-sans text-lg text-platinum/80 mb-8 text-center">Be among the first to experience the future</p>

                    <div className="grid md:grid-cols-4 gap-6 mb-12">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="font-serif text-lg font-semibold text-warm-white mb-2">Free Beta Access</div>
                        <div className="text-gold font-semibold">✓</div>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="font-serif text-lg font-semibold text-warm-white mb-2">Priority Support</div>
                        <div className="text-gold font-semibold">✓</div>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="font-serif text-lg font-semibold text-warm-white mb-2">Lifetime Discount</div>
                        <div className="text-gold font-semibold">✓</div>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-slate/50 border-2 border-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div className="font-serif text-lg font-semibold text-warm-white mb-2">Product Roadmap Input</div>
                        <div className="text-silver font-semibold">Coming Soon</div>
                      </div>
                    </div>

                    {/* Waitlist Form */}
                    <div className="max-w-2xl mx-auto">
                      {waitlistSubmitted ? (
                        /* Confirmation Message */
                        <div className="text-center space-y-6 py-8">
                          <div className="w-20 h-20 bg-accent-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>

                          <h3 className="font-serif text-3xl font-semibold text-warm-white mb-4 tracking-refined">
                            You&apos;re on the list! 🎉
                          </h3>

                          <p className="font-sans text-lg text-platinum/90 leading-relaxed mb-6">
                            Welcome to the Succedence beta program. We&apos;ll notify you as soon as we launch and keep you updated on our progress.
                          </p>

                          <div className="glass p-6 rounded-luxury border border-gold/20">
                            <h4 className="font-serif text-xl font-semibold text-warm-white mb-4">What happens next?</h4>
                            <div className="space-y-3 text-left">
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                                </div>
                                <p className="font-sans text-silver/80 text-sm">You&apos;ll receive a confirmation email within the next few minutes</p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                                </div>
                                <p className="font-sans text-silver/80 text-sm">We&apos;ll send you exclusive updates on our development progress</p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <div className="w-2 h-2 rounded-full bg-gold"></div>
                                </div>
                                <p className="font-sans text-silver/80 text-sm">You&apos;ll be among the first to get beta access when we launch</p>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => setWaitlistSubmitted(false)}
                            className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-silver/30 text-silver hover:border-gold/50 hover:text-gold font-medium rounded-luxury transition-all duration-300 font-sans text-sm"
                          >
                            Sign up another person
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="waitlist-name" className="form-label text-sm">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              id="waitlist-name"
                              name="name"
                              value={waitlistData.name}
                              onChange={handleWaitlistInputChange}
                              className="form-control w-full py-3 px-4"
                              placeholder="Your name"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="waitlist-email" className="form-label text-sm">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              id="waitlist-email"
                              name="email"
                              value={waitlistData.email}
                              onChange={handleWaitlistInputChange}
                              className="form-control w-full py-3 px-4"
                              placeholder="your@email.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label htmlFor="waitlist-role" className="form-label text-sm">
                              Primary Role
                            </label>
                            <select
                              id="waitlist-role"
                              name="role"
                              value={waitlistData.role}
                              onChange={handleWaitlistInputChange}
                              className="form-control w-full py-3 px-4"
                            >
                              <option value="BUYER">Buyer/Investor</option>
                              <option value="SELLER">Business Owner/Seller</option>
                              <option value="BROKER">Broker/Advisor</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="waitlist-company" className="form-label text-sm">
                              Company (Optional)
                            </label>
                            <input
                              type="text"
                              id="waitlist-company"
                              name="company"
                              value={waitlistData.company}
                              onChange={handleWaitlistInputChange}
                              className="form-control w-full py-3 px-4"
                              placeholder="Your company"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="waitlist-dealsize" className="form-label text-sm">
                            Target Deal Size
                          </label>
                          <select
                            id="waitlist-dealsize"
                            name="dealSize"
                            value={waitlistData.dealSize}
                            onChange={handleWaitlistInputChange}
                            className="form-control w-full py-3 px-4"
                          >
                            <option value="">Select range</option>
                            <option value="50K-250K">$50K - $250K</option>
                            <option value="250K-1M">$250K - $1M</option>
                            <option value="1M-5M">$1M - $5M</option>
                            <option value="5M-25M">$5M - $25M</option>
                            <option value="25M+">$25M+</option>
                          </select>
                        </div>

                        {/* Interests */}
                        <div className="space-y-4">
                          <label className="form-label text-sm">
                            Industries of Interest (Optional)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['SaaS', 'E-commerce', 'Manufacturing', 'Healthcare', 'Technology', 'Food & Beverage', 'Professional Services', 'Real Estate', 'Financial Services'].map(interest => (
                              <button
                                key={interest}
                                type="button"
                                onClick={() => handleInterestToggle(interest)}
                                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-300 ${
                                  waitlistData.interests.includes(interest)
                                    ? 'bg-accent-gradient text-midnight border-gold'
                                    : 'bg-transparent text-silver border-silver/30 hover:border-gold/50'
                                }`}
                              >
                                {interest}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                            type="submit"
                            disabled={isSubmittingWaitlist || !waitlistData.email || !waitlistData.name}
                            className="w-full py-4 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmittingWaitlist ? (
                              <div className="flex items-center justify-center space-x-3">
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>Joining Waitlist...</span>
                              </div>
                            ) : (
                              'Join Beta Waitlist'
                            )}
                          </button>

                          <p className="text-neutral-400 text-sm text-center mt-4">
                            No spam, ever. We&apos;ll only email you when the beta launches and with important updates.
                          </p>
                        </div>
                      </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation direction="fade" delay={150}>
            <div className="text-center mb-32">
              <div className="glass p-16 rounded-luxury-xl border border-gold/20 max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-navy/10"></div>
                <div className="relative z-10">
                  <h2 className="font-serif text-3xl md:text-4xl font-semibold text-warm-white mb-8 tracking-refined">Ready to Begin?</h2>
                  <p className="font-sans text-xl text-platinum/80 mb-12 leading-relaxed">Join the premier marketplace for business acquisition opportunities.</p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link href="/browse" className="inline-flex items-center px-10 py-5 bg-accent-gradient text-midnight font-medium rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-primary tracking-luxury">
                      Start Browsing
                    </Link>
                    <Link href="/auth" className="inline-flex items-center px-10 py-5 bg-transparent border-2 border-silver text-silver hover:bg-silver hover:text-midnight font-medium rounded-luxury transition-all duration-300 hover:transform hover:scale-105 font-primary">
                      List Your Business
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Social Contact Footer Banner */}
          <div className="mt-16 py-16 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]" style={{background: '#1a1a1a', borderTop: '2px solid rgba(212, 166, 80, 0.3)'}}>
      <ScrollAnimation direction="fade" delay={200}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-warm-white mb-8 tracking-refined">
            Connect With Us
          </h3>
          <p className="text-lg text-platinum/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Follow our journey and stay updated on the latest business acquisition opportunities and platform developments.
          </p>

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
              LinkedIn
            </a>

            {/* Twitter/X */}
            <a
              href="https://x.com/SuccedenceSMB"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow @SuccedenceSMB
            </a>

            {/* Email */}
            <div className="relative group" id="email-dropdown-home">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const dropdown = e.currentTarget.nextElementSibling;
                  dropdown.classList.toggle('hidden');

                  // Add click outside listener
                  if (!dropdown.classList.contains('hidden')) {
                    const closeDropdown = (event) => {
                      if (!e.currentTarget.contains(event.target) && !dropdown.contains(event.target)) {
                        dropdown.classList.add('hidden');
                        document.removeEventListener('click', closeDropdown);
                      }
                    };
                    setTimeout(() => document.addEventListener('click', closeDropdown), 10);
                  }
                }}
                className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                founder@succedence.com
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Success notification */}
              <div id="email-success-home" className="hidden absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg z-60">
                ✓ Email copied!
              </div>

              <div className="hidden absolute top-full left-0 mt-2 w-48 bg-slate border border-gold/30 rounded-luxury shadow-lg z-50">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const email = 'founder@succedence.com';

                    // Create mailto link and trigger it
                    const mailtoLink = document.createElement('a');
                    mailtoLink.href = `mailto:${email}`;
                    mailtoLink.target = '_blank';
                    mailtoLink.rel = 'noopener noreferrer';
                    document.body.appendChild(mailtoLink);
                    mailtoLink.click();
                    document.body.removeChild(mailtoLink);

                    // Close dropdown
                    const button = e.target as HTMLElement;
                    const dropdown = button.closest('.relative')?.querySelector('div:last-child');
                    if (dropdown) dropdown.classList.add('hidden');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gold hover:bg-gold/10 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const email = 'founder@succedence.com';

                    navigator.clipboard.writeText(email).then(() => {
                      // Show green notification above email
                      const notification = document.getElementById('email-success-home');
                      if (notification) {
                        notification.classList.remove('hidden');
                        setTimeout(() => {
                          notification.classList.add('hidden');
                        }, 2000);
                      }

                      // Close dropdown
                      const button = e.target as HTMLElement;
                      const dropdown = button.closest('.relative')?.querySelector('div:last-child');
                      if (dropdown) dropdown.classList.add('hidden');
                    }).catch(() => {
                      // Fallback notification if clipboard fails
                      alert('Email address: ' + email);
                      const button = e.target as HTMLElement;
                      const dropdown = button.closest('.relative')?.querySelector('div:last-child');
                      if (dropdown) dropdown.classList.add('hidden');
                    });
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gold hover:bg-gold/10 transition-all duration-300 border-t border-gold/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Email
                </button>
              </div>
            </div>
          </div>

          <div className="text-sm text-neutral-400 border-t border-gold/10 pt-8">
            <p>&copy; 2025 Succedence. All rights reserved. Built for discerning business professionals.</p>
          </div>
        </div>
      </ScrollAnimation>
          </div>
        </div>
      </div>
    </div>
  );
}
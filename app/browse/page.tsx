'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Listing, PlanType, SUBSCRIPTION_PLANS } from '@/lib/types';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { useAuth } from '@/contexts/AuthContext';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
import SubscriptionUpgrade, { SubscriptionGate } from '@/components/SubscriptionUpgrade';

export default function BrowsePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const userPlan = (user?.plan as PlanType) || 'free';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams();
        if (searchTerm) searchParams.set('q', searchTerm);
        searchParams.set('page', '1');
        searchParams.set('pageSize', '50');

        const response = await fetch(`/api/listings?${searchParams}`);
        if (response.ok) {
          const data = await response.json();
          setListings(data.listings || []);
        } else {
          console.error('Failed to fetch listings');
          setListings([]);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchListings, searchTerm ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-white font-medium">Loading opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-8 pb-24 max-w-7xl page-content">
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 pt-16">
            {/* Subscription Status Banner */}
            {!isAdmin && (
              <div className="mb-8 mx-auto max-w-4xl">
                <div className={`p-6 rounded-luxury-lg border-2 ${
                  userPlan === 'free'
                    ? 'bg-red-900/20 border-red-400/40'
                    : userPlan === 'starter'
                    ? 'bg-yellow-900/20 border-yellow-400/40'
                    : userPlan === 'professional'
                    ? 'bg-green-900/20 border-green-400/40'
                    : 'bg-purple-900/20 border-purple-400/40'
                }`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-warm-white mb-1">
                        Current Plan: {SUBSCRIPTION_PLANS[userPlan].name}
                      </h3>
                      <p className="text-sm text-silver/80">
                        {userPlan === 'free'
                          ? 'Subscription required to access platform features'
                          : `$${SUBSCRIPTION_PLANS[userPlan].price}/month - ${SUBSCRIPTION_PLANS[userPlan].description}`
                        }
                      </p>
                      {SUBSCRIPTION_PLANS[userPlan].aiFeatures.maxAnalysesPerMonth > 0 && (
                        <p className="text-xs text-silver/60 mt-1">
                          AI Analyses: {SUBSCRIPTION_PLANS[userPlan].aiFeatures.maxAnalysesPerMonth === -1 ? 'Unlimited' : SUBSCRIPTION_PLANS[userPlan].aiFeatures.maxAnalysesPerMonth} per month
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {userPlan === 'free' && (
                        <Link
                          href="/subscribe"
                          className="px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury hover:transform hover:scale-105 transition-all duration-300"
                        >
                          Subscribe Now
                        </Link>
                      )}
                      {userPlan !== 'free' && userPlan !== 'enterprise' && (
                        <Link
                          href="/subscribe"
                          className="px-4 py-2 bg-gold/20 text-gold border border-gold/30 rounded-luxury hover:bg-gold/30 transition-all duration-300 text-sm"
                        >
                          Upgrade Plan
                        </Link>
                      )}
                      <Link
                        href="/subscribe"
                        className="px-4 py-2 bg-charcoal/50 text-silver border border-silver/30 rounded-luxury hover:bg-charcoal/70 transition-all duration-300 text-sm"
                      >
                        Manage Subscription
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 px-6 py-3 bg-gold/20 border border-gold/40 rounded-lg inline-block">
              <p className="text-gold font-medium text-sm">🧪 Demo Content - Sample Business Listings for Testing</p>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-warm-white mb-8">Browse Opportunities</h1>
            <p className="font-sans text-xl text-platinum/90">Discover exceptional businesses ready for acquisition</p>
            <div className="mt-12">
              <Link href="/" className="btn-secondary inline-flex items-center px-8 py-4" style={{ fontFamily: "'Crimson Text', Georgia, serif", fontWeight: 400 }}>
                ← Return to Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="up" delay={50}>
          {/* Search Bar */}
          <div className="glass p-8 mb-16 rounded-lg">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search opportunities, industries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control w-full py-4 px-6 pr-12 text-lg"
                    aria-label="Search opportunities"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic AI Features Highlight */}
          <div className="glass p-8 mb-16 rounded-lg border-2 border-gold/30 bg-gradient-to-r from-gold/5 to-accent-gold/5">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gold mb-2">AI-Powered Acquisition Intelligence</h3>
              <p className="text-silver/80 text-sm">
                {isAdmin ? (
                  'Get comprehensive AI analysis, buyer compatibility scoring, due diligence checklists, and market intelligence for each listing.'
                ) : (
                  `Your ${SUBSCRIPTION_PLANS[userPlan].name} plan includes ${userPlan === 'free' ? 'no AI features' : 'AI-powered analysis tools'}. Upgrade for additional capabilities.`
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Business Analysis */}
              <div className={`flex items-center justify-between space-x-2 p-3 rounded-lg border ${
                isAdmin || hasAIFeatureAccess(userPlan, 'businessAnalysis', user?.role)
                  ? 'bg-green-900/20 border-green-400/30'
                  : 'bg-charcoal/30 border-red-400/30'
              }`}>
                <div className="flex items-center space-x-2">
                  <svg className={`w-5 h-5 ${isAdmin || hasAIFeatureAccess(userPlan, 'businessAnalysis', user?.role) ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-warm-white font-medium">Business Analysis</span>
                </div>
                {!isAdmin && !hasAIFeatureAccess(userPlan, 'businessAnalysis', user?.role) && (
                  <Link href="/subscribe" className="text-xs bg-gold/20 text-gold px-2 py-1 rounded border border-gold/30 hover:bg-gold/30 transition-colors">
                    Upgrade
                  </Link>
                )}
              </div>

              {/* Buyer Matching */}
              <div className={`flex items-center justify-between space-x-2 p-3 rounded-lg border ${
                isAdmin || hasAIFeatureAccess(userPlan, 'buyerMatching', user?.role)
                  ? 'bg-green-900/20 border-green-400/30'
                  : 'bg-charcoal/30 border-red-400/30'
              }`}>
                <div className="flex items-center space-x-2">
                  <svg className={`w-5 h-5 ${isAdmin || hasAIFeatureAccess(userPlan, 'buyerMatching', user?.role) ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-warm-white font-medium">Buyer Compatibility Matching</span>
                </div>
                {!isAdmin && !hasAIFeatureAccess(userPlan, 'buyerMatching', user?.role) && (
                  <Link href="/subscribe" className="text-xs bg-gold/20 text-gold px-2 py-1 rounded border border-gold/30 hover:bg-gold/30 transition-colors">
                    Upgrade
                  </Link>
                )}
              </div>

              {/* Due Diligence */}
              <div className={`flex items-center justify-between space-x-2 p-3 rounded-lg border ${
                isAdmin || hasAIFeatureAccess(userPlan, 'dueDiligence', user?.role)
                  ? 'bg-green-900/20 border-green-400/30'
                  : 'bg-charcoal/30 border-red-400/30'
              }`}>
                <div className="flex items-center space-x-2">
                  <svg className={`w-5 h-5 ${isAdmin || hasAIFeatureAccess(userPlan, 'dueDiligence', user?.role) ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-warm-white font-medium">Due Diligence Assistant</span>
                </div>
                {!isAdmin && !hasAIFeatureAccess(userPlan, 'dueDiligence', user?.role) && (
                  <Link href="/subscribe" className="text-xs bg-gold/20 text-gold px-2 py-1 rounded border border-gold/30 hover:bg-gold/30 transition-colors">
                    Upgrade
                  </Link>
                )}
              </div>

              {/* Market Intelligence */}
              <div className={`flex items-center justify-between space-x-2 p-3 rounded-lg border ${
                isAdmin || hasAIFeatureAccess(userPlan, 'marketIntelligence', user?.role)
                  ? 'bg-green-900/20 border-green-400/30'
                  : 'bg-charcoal/30 border-red-400/30'
              }`}>
                <div className="flex items-center space-x-2">
                  <svg className={`w-5 h-5 ${isAdmin || hasAIFeatureAccess(userPlan, 'marketIntelligence', user?.role) ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-warm-white font-medium">Market Intelligence</span>
                </div>
                {!isAdmin && !hasAIFeatureAccess(userPlan, 'marketIntelligence', user?.role) && (
                  <Link href="/subscribe" className="text-xs bg-gold/20 text-gold px-2 py-1 rounded border border-gold/30 hover:bg-gold/30 transition-colors">
                    Upgrade
                  </Link>
                )}
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="mt-8 p-4 bg-navy/20 rounded-lg border border-gold/10">
              <p className="text-silver/70 text-xs leading-relaxed">
                <strong className="text-gold">AI Disclaimer:</strong> Succedence uses AI-powered tools to provide insights and recommendations. These tools are designed to assist your decision-making, but they do not constitute financial, legal, or investment advice. Users should conduct independent due diligence before making any acquisition or investment decisions.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="mb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-warm-white">
                {listings.length} Opportunities Found
              </h2>
            </div>
          </div>

          {/* Subscription Gate for Free Users */}
          <SubscriptionGate requiredPlan="starter" requiredFeature="Browse business opportunities">
            {/* Listings Grid */}
            {listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6 text-gold">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-warm-white mb-4">No listings found</h3>
                <p className="text-platinum/80">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {listings.map((listing) => (
                <div key={listing.id} className="glass p-8 rounded-lg hover-lift border-2 border-gold/20 hover:border-gold/40 transition-all duration-300">
                  {/* Header Section */}
                  <div className="mb-6">
                    {/* Location - Prominent */}
                    <div className="flex items-center justify-center mb-4 p-2 bg-charcoal/30 rounded-lg border border-platinum/10">
                      <svg className="w-4 h-4 text-gold mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium text-warm-white">
                        {listing.city}, {listing.state}
                      </span>
                    </div>

                    {/* Industry and AI Badges */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-2 text-xs font-semibold rounded-lg bg-accent-gradient text-midnight leading-tight">
                        {listing.industry}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-lg bg-gold/20 text-gold border border-gold/30">
                        AI
                      </span>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-warm-white mb-3 line-clamp-2">
                      {listing.title}
                    </h3>
                    <p className="text-platinum/80 text-sm line-clamp-3">
                      {listing.description}
                    </p>
                  </div>

                  {/* Source */}
                  <div className="mb-4">
                    <span className="font-sans text-sm text-warm-white font-semibold">Source: {listing.source}</span>
                  </div>

                  {/* Financials */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">Revenue</span>
                      <span className="text-warm-white font-bold">
                        {formatCurrency(listing.revenue)}
                      </span>
                    </div>

                    {listing.ebitda && (
                      <div className="flex justify-between">
                        <span className="text-platinum/70 text-sm">EBITDA</span>
                        <span className="text-warm-white font-bold">
                          {formatCurrency(listing.ebitda)}
                        </span>
                      </div>
                    )}

                    {listing.price && (
                      <div className="flex justify-between">
                        <span className="text-platinum/70 text-sm">Asking Price</span>
                        <span className="text-warm-white font-bold">
                          {formatCurrency(listing.price)}
                        </span>
                      </div>
                    )}

                    {listing.employees && (
                      <div className="flex justify-between">
                        <span className="text-platinum/70 text-sm">Employees</span>
                        <span className="text-warm-white font-bold">
                          {listing.employees}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="btn-secondary w-full py-3 text-center hover-lift"
                      style={{ fontFamily: "'Crimson Text', Georgia, serif", fontWeight: 400 }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            )}
          </SubscriptionGate>
        </ScrollAnimation>
        </div>
      </div>

      {/* Additional spacing before footer */}
      <div className="mb-16"></div>

      <Footer />
    </div>
  );
}
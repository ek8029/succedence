'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useScrollToTopOnMount } from '@/hooks/useScrollToTop';
import { Listing, PlanType, SUBSCRIPTION_PLANS } from '@/lib/types';
import { hasAIFeatureAccess } from '@/lib/subscription';
import { useAuth } from '@/contexts/AuthContext';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
import SubscriptionUpgrade, { SubscriptionGate } from '@/components/SubscriptionUpgrade';
import Tooltip from '@/components/Tooltip';

export default function BrowsePage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    minRevenue: '',
    minPrice: '',
    maxPrice: '',
    state: '',
    sortBy: 'newest'
  });

  const userPlan = (user?.plan as PlanType) || 'free';
  const isAdmin = user?.role === 'admin' || userPlan === 'enterprise';
  const isDemoMode = !user; // Demo mode for non-authenticated users

  // Scroll to top when page loads
  useScrollToTopOnMount();

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
          let filteredListings = data.listings || [];

          // Apply client-side filters
          if (filters.industry) {
            filteredListings = filteredListings.filter((l: Listing) =>
              l.industry?.toLowerCase() === filters.industry.toLowerCase()
            );
          }
          if (filters.minRevenue) {
            const minRev = parseFloat(filters.minRevenue.replace(/,/g, ''));
            filteredListings = filteredListings.filter((l: Listing) =>
              l.revenue && l.revenue >= minRev
            );
          }
          if (filters.minPrice) {
            const minPr = parseFloat(filters.minPrice.replace(/,/g, ''));
            filteredListings = filteredListings.filter((l: Listing) =>
              l.price && l.price >= minPr
            );
          }
          if (filters.maxPrice) {
            const maxPr = parseFloat(filters.maxPrice.replace(/,/g, ''));
            filteredListings = filteredListings.filter((l: Listing) =>
              l.price && l.price <= maxPr
            );
          }
          if (filters.state) {
            filteredListings = filteredListings.filter((l: Listing) =>
              l.state?.toLowerCase() === filters.state.toLowerCase()
            );
          }

          // Apply sorting
          if (filters.sortBy === 'price-asc') {
            filteredListings.sort((a: Listing, b: Listing) => (a.price || 0) - (b.price || 0));
          } else if (filters.sortBy === 'price-desc') {
            filteredListings.sort((a: Listing, b: Listing) => (b.price || 0) - (a.price || 0));
          } else if (filters.sortBy === 'revenue-desc') {
            filteredListings.sort((a: Listing, b: Listing) => (b.revenue || 0) - (a.revenue || 0));
          }

          setListings(filteredListings);
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
  }, [searchTerm, filters]);

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
            {/* Demo Mode Banner */}
            {isDemoMode && (
              <div className="mb-8 mx-auto max-w-4xl">
                <div className="p-6 rounded-luxury-lg border-2 bg-gradient-to-r from-gold/20 to-accent-gold/20 border-gold/50">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <h3 className="text-xl font-semibold text-warm-white">
                        Browsing in Demo Mode
                      </h3>
                    </div>
                    <p className="text-silver/90 text-sm max-w-2xl">
                      You're viewing a limited preview of our marketplace. Create a free account to unlock full access, save listings, get AI-powered match scores, and receive personalized recommendations.
                    </p>
                    <div className="flex gap-3 mt-2">
                      <Link
                        href="/login"
                        className="px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all min-h-[48px] flex items-center"
                      >
                        Sign Up Free
                      </Link>
                      <Link
                        href="/pricing"
                        className="px-6 py-3 glass-border text-warm-white font-medium rounded-luxury hover:border-gold/50 transition-all min-h-[48px] flex items-center"
                      >
                        View Plans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Status Banner */}
            {!isAdmin && user && (
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
                      {['starter', 'professional'].includes(userPlan) && !isAdmin && (
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
            <div className="mt-16">
              <Link href="/" className="btn-secondary inline-flex items-center px-6 py-3" style={{ fontFamily: "'Crimson Text', Georgia, serif", fontWeight: 400 }}>
                ← Return to Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        {/* Search Bar and Filters */}
        <div className="glass p-6 mb-12 rounded-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 w-full flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search opportunities, industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control w-full pr-12"
                  style={{ height: '48px', padding: '0.75rem 1rem', lineHeight: '1.5' }}
                  aria-label="Search opportunities"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full lg:w-48 flex items-center">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="form-control w-full"
                style={{ height: '48px', padding: '0.75rem 1rem', lineHeight: '1.5' }}
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="revenue-desc">Revenue: High to Low</option>
              </select>
            </div>

            {/* Filter Toggle Button */}
            <div className="w-full lg:w-auto flex items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30 rounded-lg transition-all duration-300 whitespace-nowrap w-full"
                style={{ height: '48px' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden sm:inline">Filters</span>
                {(filters.industry || filters.minRevenue || filters.minPrice || filters.maxPrice || filters.state) && (
                  <span className="w-2 h-2 bg-gold rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gold/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-silver/80 text-sm font-medium mb-2">Industry</label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    className="form-control w-full py-2 px-3"
                  >
                    <option value="">All Industries</option>
                    <option value="SaaS">SaaS</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Healthcare Services">Healthcare</option>
                    <option value="Technology Services">Technology</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-silver/80 text-sm font-medium mb-2">State</label>
                  <select
                    value={filters.state}
                    onChange={(e) => setFilters({...filters, state: e.target.value})}
                    className="form-control w-full py-2 px-3"
                  >
                    <option value="">All States</option>
                    <option value="California">California</option>
                    <option value="New York">New York</option>
                    <option value="Texas">Texas</option>
                    <option value="Florida">Florida</option>
                    <option value="Illinois">Illinois</option>
                  </select>
                </div>

                <div>
                  <label className="block text-silver/80 text-sm font-medium mb-2">Min Revenue</label>
                  <input
                    type="text"
                    placeholder="e.g. 500,000"
                    value={filters.minRevenue}
                    onChange={(e) => setFilters({...filters, minRevenue: e.target.value})}
                    className="form-control w-full py-2 px-3"
                  />
                </div>

                <div>
                  <label className="block text-silver/80 text-sm font-medium mb-2">Min Price</label>
                  <input
                    type="text"
                    placeholder="e.g. 100,000"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    className="form-control w-full py-2 px-3"
                  />
                </div>

                <div>
                  <label className="block text-silver/80 text-sm font-medium mb-2">Max Price</label>
                  <input
                    type="text"
                    placeholder="e.g. 5,000,000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    className="form-control w-full py-2 px-3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setFilters({industry: '', minRevenue: '', minPrice: '', maxPrice: '', state: '', sortBy: 'newest'})}
                  className="px-4 py-2 text-silver/70 hover:text-warm-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary - Always Visible */}
        <div className="mb-12">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-warm-white">
              {isDemoMode
                ? `Showing ${Math.min(5, listings.length)} of ${listings.length} Opportunities`
                : user
                  ? `${listings.length} Opportunities Found`
                  : `${listings.length} Potential Opportunities`}
            </h2>
            {isDemoMode && listings.length > 5 && (
              <Link
                href="/login"
                className="text-gold hover:text-warm-white transition-colors font-medium text-sm"
              >
                Sign up to view all →
              </Link>
            )}
          </div>
        </div>

        <ScrollAnimation direction="up" delay={50}>

          {/* Dynamic AI Features Highlight */}
          <div className="glass p-8 mb-20 rounded-lg border-2 border-gold/30 bg-gradient-to-r from-gold/5 to-accent-gold/5">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gold">AI-Powered Acquisition Intelligence</h3>
                <Tooltip content="Our AI analyzes every listing to provide insights, compatibility scores, and due diligence support">
                  <svg className="w-5 h-5 text-gold/70 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
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
                  <Tooltip content="AI analyzes strengths, weaknesses, risks, and opportunities for each business">
                    <svg className="w-4 h-4 text-silver/50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
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
                  <Tooltip content="AI scores how well each business matches your investment preferences">
                    <svg className="w-4 h-4 text-silver/50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
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
                  <Tooltip content="Generate customized checklists to investigate businesses thoroughly">
                    <svg className="w-4 h-4 text-silver/50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
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
                  <Tooltip content="Understand industry trends, market conditions, and competitive landscape">
                    <svg className="w-4 h-4 text-silver/50 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
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

        </ScrollAnimation>

        {/* Add proper spacing before listings */}
        <div className="mb-12"></div>

        {/* Subscription Gate for Free Users - Skip for Demo Mode */}
        {isDemoMode ? (
          /* Demo Mode - Show limited listings without subscription gate */
          <>
          {listings.length === 0 ? (
            <div className="text-center py-16 px-6">
              {/* Icon */}
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h3 className="text-3xl font-semibold text-warm-white mb-4">
                No matches for those filters
              </h3>

              {/* Description */}
              <p className="text-platinum/80 mb-8 max-w-2xl mx-auto text-lg">
                Don't worry—this happens! Our marketplace is constantly growing with new opportunities.
                Here's what you can do:
              </p>

              {/* Action Cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <h4 className="text-warm-white font-semibold mb-2">Adjust Filters</h4>
                  <p className="text-silver/70 text-sm">
                    Try broadening your search by removing some filters or adjusting your criteria
                  </p>
                </div>

                <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h4 className="text-warm-white font-semibold mb-2">Set Up Alerts</h4>
                  <p className="text-silver/70 text-sm">
                    Save your search preferences and we'll notify you when matching businesses are listed
                  </p>
                </div>

                <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-warm-white font-semibold mb-2">Explore All Listings</h4>
                  <p className="text-silver/70 text-sm">
                    Browse our full marketplace to discover businesses you might not have considered
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setFilters({industry: '', minRevenue: '', minPrice: '', maxPrice: '', state: '', sortBy: 'newest'})
                    setSearchTerm('')
                  }}
                  className="px-8 py-4 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all"
                >
                  Clear All Filters
                </button>
                <Link
                  href="/preferences"
                  className="px-8 py-4 glass-border text-warm-white font-semibold rounded-luxury hover:border-gold/50 transition-all"
                >
                  Update My Preferences
                </Link>
              </div>

              {/* Encouragement */}
              <div className="mt-12 p-6 bg-gold/5 border border-gold/20 rounded-luxury-lg max-w-2xl mx-auto">
                <p className="text-silver/80 text-sm">
                  <strong className="text-gold">New opportunities daily:</strong> We add fresh listings every week.
                  Set up your preferences and we'll send you personalized matches as soon as they're available.
                </p>
              </div>
            </div>
          ) : (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-12">
            {listings.slice(0, 5).map((listing, index) => (
              <ScrollAnimation key={listing.id} direction="up" delay={index * 20} className="h-full">
                <div className="glass p-8 rounded-lg hover-lift border-2 border-gold/20 hover:border-gold/40 transition-all duration-300 h-full flex flex-col">
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

                  {/* Source and Aggregated Badge */}
                  {(listing.sourceWebsite || listing.source !== 'csv_import') && (
                    <div className="mb-4 space-y-2">
                      {listing.sourceWebsite && (
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-xs text-silver/70">Source:</span>
                          <span className="font-sans text-sm text-warm-white font-medium">{listing.sourceWebsite}</span>
                        </div>
                      )}
                      {listing.sourceWebsite && (
                        <div className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded">
                          Aggregated Listing
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financials */}
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">Revenue</span>
                      <span className="text-warm-white font-bold">
                        {formatCurrency(listing.revenue)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">EBITDA</span>
                      <span className="text-warm-white font-bold">
                        {listing.ebitda ? formatCurrency(listing.ebitda) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">Asking Price</span>
                      <span className="text-warm-white font-bold">
                        {listing.price ? formatCurrency(listing.price) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">Employees</span>
                      <span className="text-warm-white font-bold">
                        {listing.employees || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-white/10 mt-auto">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="btn-secondary w-full py-2 text-center hover-lift text-sm"
                      style={{ fontFamily: "'Crimson Text', Georgia, serif", fontWeight: 400 }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {/* Demo Mode Signup CTA - Show after first 5 listings */}
          {listings.length > 5 && (
            <div className="mt-16 text-center">
              <div className="glass p-12 rounded-luxury-lg border-2 border-gold/40 bg-gradient-to-br from-gold/10 to-transparent max-w-3xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-semibold text-warm-white mb-4">
                  Unlock {listings.length - 5} More Opportunities
                </h3>
                <p className="text-silver/90 mb-8 max-w-xl mx-auto text-lg">
                  Create a free account to view the full marketplace, save your favorites, and get AI-powered insights on every listing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all text-lg min-h-[48px] flex items-center justify-center"
                  >
                    Sign Up - It's Free
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-8 py-4 glass-border text-warm-white font-medium rounded-luxury hover:border-gold/50 transition-all min-h-[48px] flex items-center justify-center"
                  >
                    View Pricing Plans
                  </Link>
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </>
        ) : (
          /* Authenticated Users - Show with subscription gate */
          <SubscriptionGate requiredPlan="starter" requiredFeature="Browse business opportunities">
          {listings.length === 0 ? (
            <div className="text-center py-16 px-6">
              {/* Icon */}
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Heading */}
              <h3 className="text-3xl font-semibold text-warm-white mb-4">
                No matches for those filters
              </h3>

              {/* Description */}
              <p className="text-platinum/80 mb-8 max-w-2xl mx-auto text-lg">
                Don't worry—this happens! Our marketplace is constantly growing with new opportunities.
                Here's what you can do:
              </p>

              {/* Action Cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <h4 className="text-warm-white font-semibold mb-2">Adjust Filters</h4>
                  <p className="text-silver/70 text-sm">
                    Try broadening your search by removing some filters or adjusting your criteria
                  </p>
                </div>

                <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h4 className="text-warm-white font-semibold mb-2">Set Up Alerts</h4>
                  <p className="text-silver/70 text-sm">
                    Save your search preferences and we'll notify you when matching businesses are listed
                  </p>
                </div>

                <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-warm-white font-semibold mb-2">Explore All Listings</h4>
                  <p className="text-silver/70 text-sm">
                    Browse our full marketplace to discover businesses you might not have considered
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setFilters({industry: '', minRevenue: '', minPrice: '', maxPrice: '', state: '', sortBy: 'newest'})
                    setSearchTerm('')
                  }}
                  className="px-8 py-4 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all"
                >
                  Clear All Filters
                </button>
                <Link
                  href="/preferences"
                  className="px-8 py-4 glass-border text-warm-white font-semibold rounded-luxury hover:border-gold/50 transition-all"
                >
                  Update My Preferences
                </Link>
              </div>

              {/* Encouragement */}
              <div className="mt-12 p-6 bg-gold/5 border border-gold/20 rounded-luxury-lg max-w-2xl mx-auto">
                <p className="text-silver/80 text-sm">
                  <strong className="text-gold">New opportunities daily:</strong> We add fresh listings every week.
                  Set up your preferences and we'll send you personalized matches as soon as they're available.
                </p>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-12">
            {listings.map((listing, index) => (
              <ScrollAnimation key={listing.id} direction="up" delay={index * 20} className="h-full">
                <div className="glass p-8 rounded-lg hover-lift border-2 border-gold/20 hover:border-gold/40 transition-all duration-300 h-full flex flex-col">
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

                  {/* Source and Aggregated Badge */}
                  {(listing.sourceWebsite || listing.source !== 'csv_import') && (
                    <div className="mb-4 space-y-2">
                      {listing.sourceWebsite && (
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-xs text-silver/70">Source:</span>
                          <span className="font-sans text-sm text-warm-white font-medium">{listing.sourceWebsite}</span>
                        </div>
                      )}
                      {listing.sourceWebsite && (
                        <div className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded">
                          Aggregated Listing
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financials */}
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">Revenue</span>
                      <span className="text-warm-white font-bold">
                        {formatCurrency(listing.revenue)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">EBITDA</span>
                      <span className="text-warm-white font-bold">
                        {listing.ebitda ? formatCurrency(listing.ebitda) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">Asking Price</span>
                      <span className="text-warm-white font-bold">
                        {listing.price ? formatCurrency(listing.price) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-platinum/70 text-sm">Employees</span>
                      <span className="text-warm-white font-bold">
                        {listing.employees || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-white/10 mt-auto">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="btn-secondary w-full py-2 text-center hover-lift text-sm"
                      style={{ fontFamily: "'Crimson Text', Georgia, serif", fontWeight: 400 }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
          )}
        </SubscriptionGate>
        )}

        </div>

        {/* Additional spacing before footer */}
        <div className="mb-16"></div>

        <Footer />
      </div>
    </div>
  );
}
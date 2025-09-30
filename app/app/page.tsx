'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Listing, PlanType, SUBSCRIPTION_PLANS } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import OnboardingWizard from '@/components/OnboardingWizard';

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalListings, setTotalListings] = useState(0);
  const [savedListingsCount, setSavedListingsCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [aiHistory, setAiHistory] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const userPlan = (authUser?.plan as PlanType) || 'free';
  const isAdmin = authUser?.role === 'admin';

  useEffect(() => {
    const initializeAuth = async () => {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check if user has seen onboarding (using localStorage)
        const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }

        // Fetch recent listings
        try {
          const response = await fetch(`/api/listings?page=${currentPage}&pageSize=${itemsPerPage}`);
          const data = await response.json();
          setListings(data.listings || []);
          setTotalListings(data.total || 0);

          // Fetch saved listings count
          const savedResponse = await fetch('/api/saved-listings');
          if (savedResponse.ok) {
            const savedData = await savedResponse.json();
            setSavedListingsCount(savedData.length || 0);
          }

          // Fetch matches count and top 3 matches
          const matchesResponse = await fetch('/api/matches?limit=3');
          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json();
            setMatchesCount(matchesData.matches?.length || 0);
            setTopMatches(matchesData.matches?.slice(0, 3) || []);
          }

          // Fetch recent AI history
          const aiResponse = await fetch('/api/ai/history?page=1&limit=6');
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            setAiHistory(aiData.aiHistory?.slice(0, 6) || []);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, [currentPage, itemsPerPage]);

  // Refetch listings when pagination changes
  useEffect(() => {
    const fetchListings = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/listings?page=${currentPage}&pageSize=${itemsPerPage}`);
          const data = await response.json();
          setListings(data.listings || []);
          setTotalListings(data.total || 0);
        } catch (error) {
          console.error('Error fetching listings:', error);
        }
      }
    };

    fetchListings();
  }, [currentPage, itemsPerPage, user]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-orange-500/20 border-orange-500/30'
  }

  const getAnalysisTypeName = (type: string) => {
    switch (type) {
      case 'business_analysis': return 'Business Analysis';
      case 'buyer_match': return 'Buyer Match';
      case 'due_diligence': return 'Due Diligence';
      case 'market_intelligence': return 'Market Intelligence';
      default: return type;
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCompleteOnboarding = () => {
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'true');
    }
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-gradient flex items-center justify-center">
        <div className="text-warm-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl page-content">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-2 tracking-refined">
              Welcome back{authUser?.name ? `, ${authUser.name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </h1>
            <p className="text-silver/80 text-lg">
              Your business acquisition dashboard
            </p>
          </div>

          {/* Subscription Status */}
          {!isAdmin && (
            <div className="mb-8">
              <div className={`glass p-6 rounded-luxury-lg border-2 ${
                userPlan === 'free'
                  ? 'border-red-400/40 bg-gradient-to-r from-red-900/20 to-red-800/10'
                  : userPlan === 'starter'
                  ? 'border-yellow-400/40 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10'
                  : userPlan === 'professional'
                  ? 'border-green-400/40 bg-gradient-to-r from-green-900/20 to-green-800/10'
                  : 'border-purple-400/40 bg-gradient-to-r from-purple-900/20 to-purple-800/10'
              }`}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-warm-white mb-2">
                      Current Subscription: {SUBSCRIPTION_PLANS[userPlan].name}
                    </h3>
                    <p className="text-silver/80 mb-3">
                      {userPlan === 'free'
                        ? 'Subscription required to access platform features.'
                        : `${SUBSCRIPTION_PLANS[userPlan].description} - $${SUBSCRIPTION_PLANS[userPlan].price}/month`
                      }
                    </p>
                    {SUBSCRIPTION_PLANS[userPlan].aiFeatures.maxAnalysesPerMonth > 0 && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-silver/70">AI Analyses:</span>
                        <span className="text-warm-white font-medium">
                          {SUBSCRIPTION_PLANS[userPlan].aiFeatures.maxAnalysesPerMonth === -1
                            ? 'Unlimited'
                            : `${SUBSCRIPTION_PLANS[userPlan].aiFeatures.maxAnalysesPerMonth} per month`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {userPlan === 'free' && (
                      <Link
                        href="/subscribe"
                        className="px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury hover:transform hover:scale-105 transition-all duration-300 text-center"
                      >
                        Subscribe Now
                      </Link>
                    )}
                    {userPlan !== 'free' && userPlan !== 'enterprise' && (
                      <Link
                        href="/subscribe"
                        className="px-4 py-2 bg-gold/20 text-gold border border-gold/30 rounded-luxury hover:bg-gold/30 transition-all duration-300 text-sm text-center"
                      >
                        Upgrade Plan
                      </Link>
                    )}
                    <Link
                      href="/subscribe"
                      className="px-4 py-2 bg-charcoal/50 text-silver border border-silver/30 rounded-luxury hover:bg-charcoal/70 transition-all duration-300 text-sm text-center"
                    >
                      Manage Subscription
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16 max-w-7xl mx-auto">
            <div className="glass rounded-luxury-lg border border-gold/20" style={{height: '200px'}}>
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h.01M7 3h.01" />
                  </svg>
                  <h3 className="font-serif text-lg font-semibold text-warm-white whitespace-nowrap">
                    Available Listings
                  </h3>
                </div>
                <div className="text-5xl font-bold text-gold mb-2">{totalListings || 0}</div>
                <div className="text-sm text-silver/70">Total opportunities</div>
              </div>
            </div>

            <div className="glass rounded-luxury-lg border border-gold/20" style={{height: '200px'}}>
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h3 className="font-serif text-lg font-semibold text-warm-white whitespace-nowrap">
                    Total Value
                  </h3>
                </div>
                <div className="text-4xl font-bold text-gold mb-2">
                  {listings && listings.length > 0
                    ? formatCurrency(listings.reduce((sum, listing) => sum + (listing.price || 0), 0))
                    : '$0'
                  }
                </div>
                <div className="text-sm text-silver/70">Combined asking price</div>
              </div>
            </div>

            <div className="glass rounded-luxury-lg border border-gold/20" style={{height: '200px'}}>
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="font-serif text-lg font-semibold text-warm-white whitespace-nowrap">
                    Average Revenue
                  </h3>
                </div>
                <div className="text-4xl font-bold text-gold mb-2">
                  {listings && listings.length > 0
                    ? formatCurrency(listings.reduce((sum, listing) => sum + (listing.revenue || 0), 0) / listings.length)
                    : '$0'
                  }
                </div>
                <div className="text-sm text-silver/70">Per listing</div>
              </div>
            </div>
          </div>

          {/* My Matches - Condensed */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-warm-white tracking-refined">
                My Matches
              </h2>
              <Link
                href="/matches"
                className="text-gold hover:text-warm-white transition-colors font-medium text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="glass p-6 border border-gold/30 rounded-luxury">
              {topMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/listings/${match.listing.id}`}
                      className="block p-4 bg-charcoal/30 rounded-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-warm-white font-medium text-sm line-clamp-2 flex-1">
                          {match.listing.title}
                        </h3>
                        <div className={`ml-2 px-2 py-1 rounded text-xs border ${getScoreBadgeColor(match.score)}`}>
                          <span className={`font-medium ${getScoreColor(match.score)}`}>
                            {match.score}%
                          </span>
                        </div>
                      </div>
                      <div className="text-silver/70 text-xs mb-2">
                        {match.listing.industry} • {match.listing.city}, {match.listing.state}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gold">
                          {formatCurrency(match.listing.price)}
                        </span>
                        <span className="text-silver/60">
                          {match.reasons.length} reasons
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-silver/70 text-sm mb-4">No matches found yet</div>
                  <Link
                    href="/preferences"
                    className="text-gold hover:text-warm-white transition-colors text-sm font-medium"
                  >
                    Set your preferences to get matches →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis History - Embedded */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-warm-white tracking-refined">
                Recent AI Analysis
              </h2>
              <Link
                href="/ai-analysis-history"
                className="text-gold hover:text-warm-white transition-colors font-medium text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="glass p-6 border border-gold/30 rounded-luxury">
              {aiHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiHistory.map((analysis) => (
                    <Link
                      key={analysis.id}
                      href={`/listings/${analysis.listing_id}`}
                      className="block p-4 bg-charcoal/30 rounded-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="px-2 py-1 bg-gold/20 text-gold rounded text-xs font-medium">
                          {getAnalysisTypeName(analysis.analysis_type)}
                        </div>
                        <div className="text-silver/60 text-xs">
                          {formatDate(analysis.created_at)}
                        </div>
                      </div>
                      <h3 className="text-warm-white font-medium text-sm line-clamp-2 mb-2">
                        {analysis.listings.title}
                      </h3>
                      <div className="text-silver/70 text-xs mb-2">
                        {analysis.listings.industry} • {analysis.listings.city}, {analysis.listings.state}
                      </div>
                      <div className="text-gold text-xs">
                        {formatCurrency(analysis.listings.price)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="text-silver/70 text-sm mb-4">No AI analyses yet</div>
                  <Link
                    href="/browse"
                    className="text-gold hover:text-warm-white transition-colors text-sm font-medium"
                  >
                    Explore listings to generate AI insights →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-warm-white tracking-refined mb-8">
              Recommended For You
            </h2>
            <div className="glass p-8 rounded-luxury-lg border border-gold/20 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-warm-white mb-4">Based on Your Profile</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-gold mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <Link href="/preferences" className="text-gold hover:text-warm-white transition-colors">
                          Set your acquisition preferences
                        </Link>
                        <p className="text-sm text-silver/70 mt-1">Get personalized matches based on your criteria</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-gold mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <Link href="/profile" className="text-gold hover:text-warm-white transition-colors">
                          Complete your profile
                        </Link>
                        <p className="text-sm text-silver/70 mt-1">Unlock better recommendations and features</p>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-warm-white mb-4">Trending Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-gold/20 text-gold rounded-full border border-gold/30">SaaS</span>
                    <span className="px-3 py-1 text-xs font-medium bg-gold/20 text-gold rounded-full border border-gold/30">E-commerce</span>
                    <span className="px-3 py-1 text-xs font-medium bg-gold/20 text-gold rounded-full border border-gold/30">Healthcare</span>
                    <span className="px-3 py-1 text-xs font-medium bg-gold/20 text-gold rounded-full border border-gold/30">FinTech</span>
                    <span className="px-3 py-1 text-xs font-medium bg-gold/20 text-gold rounded-full border border-gold/30">Manufacturing</span>
                  </div>
                  <p className="text-sm text-silver/70 mt-4">These industries are seeing high activity this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-warm-white tracking-refined mb-8">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              <Link
                href="/browse"
                className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1 group h-full flex flex-col items-center text-center min-h-[200px] justify-center"
              >
                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                  <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-warm-white mb-3 whitespace-nowrap">Browse Listings</h3>
                <p className="text-silver/80 text-sm leading-relaxed">Discover and explore business acquisition opportunities across all industries</p>
              </Link>

              {user && (
                <Link
                  href="/listings/new"
                  className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1 group h-full flex flex-col items-center text-center min-h-[200px] justify-center"
                >
                  <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                    <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-warm-white mb-3 whitespace-nowrap">List Your Business</h3>
                  <p className="text-silver/80 text-sm leading-relaxed">Create a professional listing to sell your business to qualified buyers</p>
                </Link>
              )}

              <Link
                href="/preferences"
                className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1 group h-full flex flex-col items-center text-center min-h-[200px] justify-center"
              >
                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                  <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-warm-white mb-3 whitespace-nowrap">Set Preferences</h3>
                <p className="text-silver/80 text-sm leading-relaxed">Configure your acquisition criteria and receive personalized matches</p>
              </Link>

              <Link
                href="/saved-listings"
                className="glass p-8 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1 group h-full flex flex-col items-center text-center min-h-[200px] justify-center"
              >
                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold/30 transition-colors">
                  <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-semibold text-warm-white mb-3 whitespace-nowrap">Saved Listings</h3>
                <p className="text-silver/80 text-sm leading-relaxed">
                  {savedListingsCount > 0 ? `View your ${savedListingsCount} saved business opportunities` : 'Bookmark interesting businesses for later review'}
                </p>
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Wizard */}
      {showOnboarding && authUser && (
        <OnboardingWizard
          onComplete={handleCompleteOnboarding}
          userRole={authUser.role as 'buyer' | 'seller'}
        />
      )}

      <Footer />
    </div>
  );
}
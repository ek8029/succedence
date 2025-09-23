'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Listing, PlanType, SUBSCRIPTION_PLANS } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalListings, setTotalListings] = useState(0);

  const userPlan = (authUser?.plan as PlanType) || 'free';
  const isAdmin = authUser?.role === 'admin';

  useEffect(() => {
    const initializeAuth = async () => {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch recent listings
        try {
          const response = await fetch(`/api/listings?page=${currentPage}&pageSize=${itemsPerPage}`);
          const data = await response.json();
          setListings(data.listings || []);
          setTotalListings(data.total || 0);
        } catch (error) {
          console.error('Error fetching listings:', error);
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-2 tracking-refined">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
              </h1>
              <p className="text-silver/80 text-lg">
                Your business acquisition dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/browse"
                className="px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury hover:transform hover:scale-105 transition-all duration-300"
              >
                Browse Opportunities
              </Link>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="glass p-6 rounded-luxury-lg border border-gold/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold text-warm-white">
                  Available Listings
                </h3>
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h.01M7 3h.01" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gold mb-2">{totalListings}</div>
              <div className="text-sm text-silver/70">Total opportunities</div>
            </div>

            <div className="glass p-6 rounded-luxury-lg border border-gold/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold text-warm-white">
                  Total Value
                </h3>
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gold mb-2">
                {formatCurrency(listings.reduce((sum, listing) => sum + (listing.price || 0), 0))}
              </div>
              <div className="text-sm text-silver/70">Combined asking price</div>
            </div>

            <div className="glass p-6 rounded-luxury-lg border border-gold/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold text-warm-white">
                  Average Revenue
                </h3>
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gold mb-2">
                {listings.length > 0
                  ? formatCurrency(listings.reduce((sum, listing) => sum + (listing.revenue || 0), 0) / listings.length)
                  : '$0'
                }
              </div>
              <div className="text-sm text-silver/70">Across all listings</div>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-warm-white tracking-refined">
                Business Opportunities
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-silver/70 text-sm">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-charcoal/50 border border-gold/30 text-warm-white rounded px-3 py-1 text-sm focus:border-gold focus:outline-none"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-silver/70 text-sm">per page</span>
                </div>
                <Link
                  href="/browse"
                  className="text-gold hover:text-warm-white transition-colors font-medium text-sm"
                >
                  View All →
                </Link>
              </div>
            </div>

            {listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                  <div key={listing.id} className="glass p-6 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-xs font-semibold bg-accent-gradient text-midnight rounded-full">
                          {listing.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                        {listing.industry && (
                          <span className="px-3 py-1 text-xs font-medium bg-charcoal/50 text-silver rounded-full">
                            {listing.industry}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-warm-white mb-3 line-clamp-2">
                      {listing.title}
                    </h3>

                    <p className="text-silver/80 text-sm mb-4 line-clamp-3">
                      {listing.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-silver/70 mb-1">Annual Revenue</div>
                        <div className="text-sm font-semibold text-gold">
                          {formatCurrency(listing.revenue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-silver/70 mb-1">Asking Price</div>
                        <div className="text-sm font-semibold text-gold">
                          {formatCurrency(listing.price)}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/listings/${listing.id}`}
                      className="block w-full text-center px-4 py-2 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 font-medium rounded-luxury transition-all duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
                </div>

                {/* Pagination Controls */}
                {totalListings > itemsPerPage && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                    <div className="text-silver/70 text-sm">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalListings)} of {totalListings} opportunities
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-charcoal/50 border border-gold/30 text-warm-white rounded hover:bg-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, Math.ceil(totalListings / itemsPerPage)) }, (_, i) => {
                          const totalPages = Math.ceil(totalListings / itemsPerPage);
                          let pageNumber;

                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`px-3 py-2 rounded transition-colors ${
                                currentPage === pageNumber
                                  ? 'bg-gold text-midnight font-semibold'
                                  : 'bg-charcoal/50 border border-gold/30 text-warm-white hover:bg-gold/10'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(Math.ceil(totalListings / itemsPerPage), currentPage + 1))}
                        disabled={currentPage === Math.ceil(totalListings / itemsPerPage)}
                        className="px-3 py-2 bg-charcoal/50 border border-gold/30 text-warm-white rounded hover:bg-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glass p-8 rounded-luxury-lg border border-gold/20 text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h.01M7 3h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-warm-white mb-2">No listings available</h3>
                <p className="text-silver/80 mb-6">
                  There are currently no business opportunities available. Check back soon for new listings.
                </p>
                <Link
                  href="/browse"
                  className="inline-flex items-center px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury hover:transform hover:scale-105 transition-all duration-300"
                >
                  Refresh Listings
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-16">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-warm-white tracking-refined mb-12">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/browse"
                className="glass p-6 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold/30 transition-colors">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-warm-white mb-2">Browse Opportunities</h3>
                <p className="text-silver/80 text-sm">Discover new business acquisition opportunities</p>
              </Link>

              <div className="glass p-6 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1 group cursor-not-allowed opacity-75">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-warm-white mb-2">AI Analysis</h3>
                <p className="text-silver/80 text-sm">Get AI-powered business analysis (Coming Soon)</p>
              </div>

              <div className="glass p-6 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1 group cursor-not-allowed opacity-75">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-warm-white mb-2">Saved Searches</h3>
                <p className="text-silver/80 text-sm">Manage your saved search criteria (Coming Soon)</p>
              </div>

              <div className="glass p-6 rounded-luxury-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 hover:transform hover:-translate-y-1 group cursor-not-allowed opacity-75">
                <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-warm-white mb-2">Due Diligence</h3>
                <p className="text-silver/80 text-sm">Track your due diligence progress (Coming Soon)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
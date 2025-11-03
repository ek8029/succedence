'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';

interface SavedListingWithDetails {
  id: string;
  user_id: string;
  listing_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  listings: {
    id: string;
    title: string;
    industry: string;
    city: string;
    state: string;
    price: number | null;
    revenue: number | null;
    ebitda: number | null;
    description: string;
    status: string;
    created_at: string;
  };
  ai_analysis_count: number;
  analysis_types: string[];
}

export default function SavedListingsPage() {
  const { user } = useAuth();
  const [savedListings, setSavedListings] = useState<SavedListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSavedListings = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/saved-listings?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setSavedListings(data.savedListings);
        setTotalPages(data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching saved listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedListings();
    }
  }, [user]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const removeSavedListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/saved-listings?listingId=${listingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the list
        fetchSavedListings(page);
      } else {
        alert('Failed to remove saved listing');
      }
    } catch (error) {
      console.error('Error removing saved listing:', error);
      alert('Failed to remove saved listing');
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    // No emojis - clean text-only approach
    return '';
  };

  const getAnalysisTypeName = (type: string) => {
    switch (type) {
      case 'business_analysis':
        return 'Business Analysis';
      case 'buyer_match':
        return 'Buyer Match';
      case 'due_diligence':
        return 'Due Diligence';
      case 'market_intelligence':
        return 'Market Intelligence';
      case 'smart_buybox':
        return 'Smart BuyBox';
      default:
        return type;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Authentication Required</h1>
          <Link href="/login" className="btn-primary px-8 py-3 font-medium hover-lift">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="container-professional page-content flex-grow !pb-0">
          {/* Header */}
          <ScrollAnimation direction="fade">
            <div className="text-center mb-16">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-warm-white mb-8">
                Saved Listings
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Your bookmarked business opportunities and AI analysis history
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">
                <Link
                  href="/browse"
                  className="bg-neutral-800/40 backdrop-blur-sm border border-gold/20 rounded-luxury px-4 text-sm text-white text-center font-medium hover:bg-neutral-700/50 transition-all duration-200 h-[44px] flex items-center justify-center"
                >
                  Browse More Listings
                </Link>
                <Link
                  href="/ai-analysis-history"
                  className="bg-neutral-800/40 backdrop-blur-sm border border-gold/20 rounded-luxury px-4 text-sm text-white text-center font-medium hover:bg-neutral-700/50 transition-all duration-200 h-[44px] flex items-center justify-center"
                >
                  View AI History
                </Link>
              </div>
            </div>
          </ScrollAnimation>

          {/* Content */}
          <ScrollAnimation direction="up" delay={50}>
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-xl text-white font-medium">Loading saved listings...</div>
              </div>
            ) : savedListings.length === 0 ? (
              <div className="text-center pt-8 pb-0 px-6">
                {/* Icon */}
                <div className="mb-12 flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                </div>

                {/* Heading */}
                <h2 className="text-3xl text-white font-medium mb-8">Build Your Deal Pipeline</h2>

                {/* Description */}
                <p className="text-neutral-400 mb-14 max-w-2xl mx-auto leading-relaxed text-lg">
                  Save listings to track opportunities, compare businesses side-by-side, and build your acquisition shortlist.
                </p>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-14">
                  <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <h4 className="text-warm-white font-semibold mb-2">Bookmark Favorites</h4>
                    <p className="text-silver/70 text-sm">
                      Save promising businesses to review later without losing track
                    </p>
                  </div>

                  <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h4 className="text-warm-white font-semibold mb-2">Add Private Notes</h4>
                    <p className="text-silver/70 text-sm">
                      Keep track of your thoughts and due diligence findings
                    </p>
                  </div>

                  <div className="glass p-6 rounded-luxury-lg border border-gold/20 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-warm-white font-semibold mb-2">AI Analysis History</h4>
                    <p className="text-silver/70 text-sm">
                      Access all your saved AI reports and insights in one place
                    </p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
                  <Link
                    href="/browse"
                    className="px-8 py-4 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all"
                  >
                    Browse Listings →
                  </Link>
                  <Link
                    href="/preferences"
                    className="px-8 py-4 border border-gold/20 text-warm-white font-semibold rounded-luxury hover:border-gold/50 transition-all"
                  >
                    Set Up Preferences
                  </Link>
                </div>

                {/* Tip */}
                <div className="max-w-xl mx-auto p-4 bg-gold/5 border border-gold/20 rounded-luxury-lg">
                  <p className="text-silver/80 text-sm">
                    <strong className="text-gold">Pro tip:</strong> Click the bookmark icon on any listing to save it here.
                    You can also run AI analyses that will be automatically linked to your saved listings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {savedListings.map((savedListing) => {
                  const listing = savedListing.listings;
                  return (
                    <div key={savedListing.id} className="glass p-6 hover:bg-neutral-800/20 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Link
                              href={`/listings/${listing.id}`}
                              className="text-xl text-white font-medium hover:text-gold transition-colors"
                            >
                              {listing.title}
                            </Link>
                            <span className={`status-badge ${listing.status === 'active' ? 'status-main' : 'status-pending'}`}>
                              {listing.status}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-neutral-400">Industry</div>
                              <div className="text-white font-medium">{listing.industry}</div>
                            </div>
                            <div>
                              <div className="text-sm text-neutral-400">Location</div>
                              <div className="text-white font-medium">{listing.city}, {listing.state}</div>
                            </div>
                            <div>
                              <div className="text-sm text-neutral-400">Revenue</div>
                              <div className="text-white font-medium">{formatCurrency(listing.revenue)}</div>
                            </div>
                            <div>
                              <div className="text-sm text-neutral-400">Price</div>
                              <div className="text-white font-medium">{formatCurrency(listing.price)}</div>
                            </div>
                          </div>

                          <p className="text-neutral-300 text-sm leading-relaxed mb-4 line-clamp-2">
                            {listing.description}
                          </p>

                          {/* AI Analysis Info */}
                          {savedListing.ai_analysis_count > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs text-gold font-medium">
                                {savedListing.ai_analysis_count} AI {savedListing.ai_analysis_count === 1 ? 'Analysis' : 'Analyses'}:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {savedListing.analysis_types.map((type, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gold/10 text-gold px-1.5 py-0.5 rounded border border-gold/20"
                                  >
                                    {getAnalysisTypeName(type)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {savedListing.notes && (
                            <div className="bg-charcoal/30 rounded-lg p-3 mb-4">
                              <div className="text-sm text-neutral-400 mb-1">Your Notes:</div>
                              <div className="text-white text-sm">{savedListing.notes}</div>
                            </div>
                          )}

                          <div className="text-sm text-neutral-500">
                            Saved on {formatDate(savedListing.created_at)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/listings/${listing.id}`}
                            className="glass px-3 py-1 text-xs text-white hover:bg-neutral-700/50 transition-colors rounded border border-gold/20"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => removeSavedListing(listing.id)}
                            className="glass px-3 py-1 text-xs text-red-400 hover:bg-red-900/20 transition-colors rounded border border-red-400/20"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      onClick={() => fetchSavedListings(page - 1)}
                      disabled={page <= 1}
                      className="glass px-3 py-1 text-sm text-white hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded border border-gold/20"
                    >
                      Previous
                    </button>
                    <span className="text-white text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => fetchSavedListings(page + 1)}
                      disabled={page >= totalPages}
                      className="glass px-3 py-1 text-sm text-white hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded border border-gold/20"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </ScrollAnimation>
        </div>
      </div>

      <div className="-mt-16">
        <Footer />
      </div>
    </div>
  );
}
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
    switch (type) {
      case 'business_analysis':
        return '📊';
      case 'buyer_match':
        return '🎯';
      case 'due_diligence':
        return '📋';
      case 'market_intelligence':
        return '📈';
      case 'smart_buybox':
        return '🧠';
      default:
        return '🤖';
    }
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
          <Link href="/auth" className="btn-primary px-8 py-3 font-medium hover-lift">
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

      <div className="relative z-10">
        <div className="container-professional pb-16 page-content">
          {/* Header */}
          <ScrollAnimation direction="fade">
            <div className="text-center mb-16">
              <h1 className="text-4xl lg:text-5xl text-white font-medium mb-6 font-serif">
                Saved Listings
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Your bookmarked business opportunities and AI analysis history
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <Link
                  href="/browse"
                  className="glass px-6 py-3 text-white hover:bg-neutral-800/30 transition-colors rounded-luxury border border-gold/20"
                >
                  Browse More Listings
                </Link>
                <Link
                  href="/ai-analysis-history"
                  className="btn-primary px-6 py-3 font-medium hover-lift"
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
              <div className="text-center py-16">
                <div className="text-6xl mb-6">📑</div>
                <h2 className="text-2xl text-white font-medium mb-4">No Saved Listings Yet</h2>
                <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                  Start exploring business opportunities and save the ones that interest you.
                </p>
                <Link
                  href="/browse"
                  className="btn-primary px-8 py-3 font-medium hover-lift"
                >
                  Browse Listings
                </Link>
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
                            <div className="bg-navy/30 rounded-lg p-3 mb-4">
                              <div className="text-sm text-gold font-medium mb-2">
                                🤖 AI Analysis Available ({savedListing.ai_analysis_count} analyses)
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {savedListing.analysis_types.map((type, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gold/10 text-gold px-2 py-1 rounded border border-gold/20"
                                  >
                                    {getAnalysisTypeIcon(type)} {getAnalysisTypeName(type)}
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
                            className="glass px-4 py-2 text-sm text-white hover:bg-neutral-700/50 transition-colors rounded border border-gold/20"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => removeSavedListing(listing.id)}
                            className="glass px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors rounded border border-red-400/20"
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
                      className="glass px-4 py-2 text-white hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded border border-gold/20"
                    >
                      Previous
                    </button>
                    <span className="text-white">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => fetchSavedListings(page + 1)}
                      disabled={page >= totalPages}
                      className="glass px-4 py-2 text-white hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded border border-gold/20"
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

      <Footer />
    </div>
  );
}
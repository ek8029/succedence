'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Listing } from '@/lib/types';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-white font-medium">Loading opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient">
      <div className="container mx-auto px-8 pb-24 max-w-7xl page-content">
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-24">
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
          <div className="glass p-8 mb-12 rounded-lg">
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

          {/* Results */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-warm-white">
                {listings.length} Opportunities Found
              </h2>
            </div>
          </div>

          {/* Listings Grid */}
          {listings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-2xl font-semibold text-warm-white mb-4">No listings found</h3>
              <p className="text-platinum/80">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {listings.map((listing) => (
                <div key={listing.id} className="glass p-8 rounded-lg hover-lift border-2 border-gold/20 hover:border-gold/40 transition-all duration-300">
                  {/* Industry Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-accent-gradient text-midnight">
                      {listing.industry}
                    </span>
                    <span className="text-xs text-platinum/60">
                      {listing.city}, {listing.state}
                    </span>
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
        </ScrollAnimation>
      </div>
    </div>
  );
}
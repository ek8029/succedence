'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Listing, ListingFilters } from '@/lib/types';

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({});

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/listings');
        if (response.ok) {
          const data = await response.json();
          setListings(data);
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

    fetchListings();
  }, []);

  const formatCurrency = (amount: number) => {
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
      <div className="container mx-auto px-8 py-20 pb-24 max-w-7xl">
        <div className="text-center mb-20 mt-24">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-warm-white mb-8">Browse Opportunities</h1>
          <p className="font-sans text-xl text-platinum/90">Discover exceptional businesses ready for acquisition</p>
          <div className="mt-12">
            <Link href="/" className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-lg transition-all duration-300">
              ← Return to Home
            </Link>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-12">
          <p className="font-sans text-lg text-silver/90 text-center">
            Showing <span className="text-gold font-semibold font-mono">{listings.length}</span> {listings.length !== 1 ? 'opportunities' : 'opportunity'}
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-24">
          {listings.map((listing, index) => (
            <div key={listing.id} className="group" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="glass rounded-luxury-lg overflow-hidden border border-gold/10 hover:border-gold/30 transition-all duration-500 hover:transform hover:-translate-y-2 hover:scale-105 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="p-8 pb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${listing.lane === 'MAIN' ? 'bg-accent-gradient text-midnight border-gold' : 'bg-slate/50 text-silver border-silver/50'}`}>
                        {listing.lane}
                      </span>
                      <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider bg-charcoal/50 text-silver/80 rounded-full border border-silver/20">
                        {listing.industry}
                      </span>
                    </div>
                  </div>

                  <h2 className="font-serif text-xl text-warm-white font-medium mb-4 line-clamp-2 leading-tight tracking-refined group-hover:text-gold-light transition-colors duration-300">
                    {listing.title}
                  </h2>

                  <p className="font-sans text-silver/80 mb-6 line-clamp-3 leading-relaxed text-sm">
                    {listing.description}
                  </p>
                </div>

                <div className="bg-navy/30 border-t border-gold/10 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-xs text-silver/70 font-medium uppercase tracking-wide">Owner</span>
                    <span className="font-sans text-sm text-warm-white font-semibold">{listing.owner}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-xs text-silver/70 font-medium uppercase tracking-wide">Revenue</span>
                    <span className="font-mono text-sm text-gold font-bold">{formatCurrency(listing.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-sans text-xs text-silver/70 font-medium uppercase tracking-wide">Valuation</span>
                    <span className="font-mono text-sm text-gold font-bold">
                      {formatCurrency(listing.valuationLow)} - {formatCurrency(listing.valuationHigh)}
                    </span>
                  </div>
                </div>

                <div className="p-6 pt-4">
                  <Link href={`/listings/${listing.id}`} className="block">
                    <button className="w-full py-4 bg-accent-gradient text-midnight font-semibold rounded-luxury border-2 border-gold/30 hover:border-gold hover:transform hover:scale-105 hover:shadow-gold-glow transition-all duration-300 font-sans tracking-luxury">
                      View Details →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-24">
            <div className="glass w-32 h-32 rounded flex items-center justify-center mx-auto mb-8 border border-neutral-600">
              <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl text-white font-semibold mb-4">No opportunities found</h3>
            <p className="text-lg text-neutral-400 max-w-md mx-auto">Check back later for new listings or try creating some test data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
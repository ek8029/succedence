'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Listing, ListingFilters } from '@/lib/types';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({});
  const [industries, setIndustries] = useState<string[]>([]);

  const fetchListings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.industry) params.append('industry', filters.industry);
      if (filters.lane) params.append('lane', filters.lane);
      if (filters.minRevenue) params.append('minRevenue', filters.minRevenue.toString());
      
      const response = await fetch(`/api/listings?${params}`);
      const data = await response.json();
      setListings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
    fetchIndustries();
  }, [fetchListings]);

  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/listings');
      const data: Listing[] = await response.json();
      const uniqueIndustries = Array.from(new Set(data.map((listing: Listing) => listing.industry)));
      setIndustries(uniqueIndustries);
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFilterChange = (key: keyof ListingFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
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
    <div className="min-h-screen bg-brand-darker">
      <div className="container mx-auto px-3 py-20 pb-24 max-w-7xl">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-24">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-heading text-white font-medium mb-6">Browse Opportunities</h1>
              <p className="text-2xl text-neutral-400 leading-relaxed">Discover exceptional businesses ready for acquisition</p>
            </div>
            <div className="mt-12">
              <Link href="/" className="glass px-8 py-3 font-medium text-white hover-lift transition-all border-2 border-brand-darker hover:border-neutral-400 rounded-lg shadow-sm">
                Return to Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        {/* Filters */}
        <div className="glass p-12 mb-16 max-w-6xl mx-auto slide-up">
          <div className="text-center mb-10">
            <h2 className="text-2xl text-white font-medium mb-4">Refine Your Search</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium px-6 py-2"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <label className="text-sm text-neutral-300 font-medium">Industry</label>
              <select
                value={filters.industry || ''}
                onChange={(e) => handleFilterChange('industry', e.target.value || undefined)}
                className="form-control w-full"
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm text-neutral-300 font-medium">Investment Tier</label>
              <select
                value={filters.lane || ''}
                onChange={(e) => handleFilterChange('lane', e.target.value as "MAIN" | "STARTER" || undefined)}
                className="form-control w-full"
              >
                <option value="">All Tiers</option>
                <option value="MAIN">Main Street ($100K+)</option>
                <option value="STARTER">Starter ($50K-$100K)</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm text-neutral-300 font-medium">Minimum Revenue</label>
              <input
                type="number"
                value={filters.minRevenue || ''}
                onChange={(e) => handleFilterChange('minRevenue', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Enter amount"
                className="form-control w-full"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full glass px-6 py-3 hover-lift transition-all font-medium text-white border border-neutral-600"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-12 fade-in">
          <div className="flex items-center justify-between">
            <p className="text-lg text-neutral-300">
              Showing <span className="text-white font-semibold text-financial">{listings.length}</span> {listings.length !== 1 ? 'opportunities' : 'opportunity'}
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-500 font-medium">Sort by:</span>
              <select 
                className="form-control px-4 py-2 text-sm"
                onChange={(e) => {
                  const sortBy = e.target.value;
                  const sorted = [...listings].sort((a, b) => {
                    switch (sortBy) {
                      case 'revenue-high':
                        return b.revenue - a.revenue;
                      case 'revenue-low':
                        return a.revenue - b.revenue;
                      case 'valuation-high':
                        return b.valuationHigh - a.valuationHigh;
                      case 'valuation-low':
                        return a.valuationLow - b.valuationLow;
                      default:
                        return 0;
                    }
                  });
                  setListings(sorted);
                }}
              >
                <option value="latest">Latest</option>
                <option value="revenue-high">Revenue (High to Low)</option>
                <option value="revenue-low">Revenue (Low to High)</option>
                <option value="valuation-high">Valuation (High to Low)</option>
                <option value="valuation-low">Valuation (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-24">
          {listings.map((listing, index) => (
            <div key={listing.id} className="metric-card rounded-2xl p-8 slide-up hover-lift transition-all" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`status-badge ${listing.lane === 'MAIN' ? 'status-main' : 'status-starter'}`}>
                    {listing.lane}
                  </span>
                  <span className="status-badge bg-neutral-800 text-neutral-300 font-medium">
                    {listing.industry}
                  </span>
                </div>
                <div className="w-10 h-10 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                  <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
                </div>
              </div>
              
              <h2 className="text-xl text-white font-semibold mb-4 line-clamp-2 leading-tight">
                {listing.title}
              </h2>
              
              <p className="text-neutral-400 mb-8 line-clamp-3 leading-relaxed">
                {listing.description}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500 font-medium">Owner</span>
                  <span className="text-sm text-white font-semibold">{listing.owner}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500 font-medium">Annual Revenue</span>
                  <span className="text-sm text-white font-bold text-financial">{formatCurrency(listing.revenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500 font-medium">Valuation Range</span>
                  <span className="text-sm text-white font-bold text-financial">
                    {formatCurrency(listing.valuationLow)} - {formatCurrency(listing.valuationHigh)}
                  </span>
                </div>
              </div>
              
              <Link href={`/listings/${listing.id}`}>
                <div className="btn-primary w-full py-4 rounded-xl text-sm font-semibold focus-ring hover-lift">
                  View Details →
                </div>
              </Link>
            </div>
          ))}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-24 fade-in">
            <div className="glass w-32 h-32 rounded flex items-center justify-center mx-auto mb-8 border border-neutral-600">
              <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl text-white font-semibold mb-4">No opportunities found</h3>
            <p className="text-lg text-neutral-400 max-w-md mx-auto">Try adjusting your filters or check back later for new listings.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Listing, ListingFilters } from '@/lib/types';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function BrowsePage() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({
    sortBy: 'revenue',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/listings');
        if (response.ok) {
          const data = await response.json();
          setAllListings(data);
          setFilteredListings(data);
        } else {
          console.error('Failed to fetch listings');
          setAllListings([]);
          setFilteredListings([]);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
        setAllListings([]);
        setFilteredListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter and sort listings based on current filters
  useEffect(() => {
    let filtered = [...allListings];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm) ||
        listing.industry.toLowerCase().includes(searchTerm) ||
        listing.owner.toLowerCase().includes(searchTerm)
      );
    }

    // Industry filter
    if (filters.industry) {
      filtered = filtered.filter(listing => listing.industry === filters.industry);
    }

    // Lane filter
    if (filters.lane) {
      filtered = filtered.filter(listing => listing.lane === filters.lane);
    }

    // Revenue filters
    if (filters.minRevenue !== undefined) {
      filtered = filtered.filter(listing => listing.revenue >= filters.minRevenue!);
    }
    if (filters.maxRevenue !== undefined) {
      filtered = filtered.filter(listing => listing.revenue <= filters.maxRevenue!);
    }

    // Valuation filters
    if (filters.minValuation !== undefined) {
      filtered = filtered.filter(listing => listing.valuationLow >= filters.minValuation!);
    }
    if (filters.maxValuation !== undefined) {
      filtered = filtered.filter(listing => listing.valuationHigh <= filters.maxValuation!);
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.sortBy) {
          case 'revenue':
            aValue = a.revenue;
            bValue = b.revenue;
            break;
          case 'valuation':
            aValue = (a.valuationLow + a.valuationHigh) / 2;
            bValue = (b.valuationLow + b.valuationHigh) / 2;
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          default:
            aValue = a.title;
            bValue = b.title;
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    setFilteredListings(filtered);
  }, [allListings, filters]);

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'revenue',
      sortOrder: 'desc'
    });
  };

  const getUniqueIndustries = () => {
    return Array.from(new Set(allListings.map(listing => listing.industry))).sort();
  };

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
      <div className="container mx-auto px-8 pb-24 max-w-7xl page-content">
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-24">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-warm-white mb-8">Browse Opportunities</h1>
            <p className="font-sans text-xl text-platinum/90">Discover exceptional businesses ready for acquisition</p>
            <div className="mt-12">
              <Link href="/" className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-gold/40 text-gold hover:bg-gold/10 hover:border-gold font-medium rounded-lg transition-all duration-300">
                ← Return to Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="up" delay={50}>
          {/* Search and Filter Bar */}
          <div className="glass p-8 mb-12 rounded-lg">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search opportunities, industries, owners..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
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

              {/* Sort Dropdown */}
              <div className="lg:w-64">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="form-control w-full py-4 px-6 text-lg"
                  aria-label="Sort by"
                >
                  <option value="revenue-desc">Revenue (Highest First)</option>
                  <option value="revenue-asc">Revenue (Lowest First)</option>
                  <option value="valuation-desc">Valuation (Highest First)</option>
                  <option value="valuation-asc">Valuation (Lowest First)</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-primary px-6 py-4 flex items-center gap-2 lg:w-auto"
                aria-expanded={showFilters}
                aria-controls="filter-panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filters
                {Object.keys(filters).filter(key => key !== 'sortBy' && key !== 'sortOrder' && filters[key as keyof ListingFilters]).length > 0 && (
                  <span className="bg-gold text-midnight text-xs px-2 py-1 rounded-full font-bold">
                    {Object.keys(filters).filter(key => key !== 'sortBy' && key !== 'sortOrder' && filters[key as keyof ListingFilters]).length}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div id="filter-panel" className="mt-8 pt-8 border-t border-neutral-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Industry Filter */}
                  <div className="space-y-2">
                    <label htmlFor="industry-filter" className="form-label">Industry</label>
                    <select
                      id="industry-filter"
                      value={filters.industry || ''}
                      onChange={(e) => handleFilterChange('industry', e.target.value || undefined)}
                      className="form-control w-full py-3 px-4"
                    >
                      <option value="">All Industries</option>
                      {getUniqueIndustries().map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lane Filter */}
                  <div className="space-y-2">
                    <label htmlFor="lane-filter" className="form-label">Lane</label>
                    <select
                      id="lane-filter"
                      value={filters.lane || ''}
                      onChange={(e) => handleFilterChange('lane', e.target.value || undefined)}
                      className="form-control w-full py-3 px-4"
                    >
                      <option value="">All Lanes</option>
                      <option value="MAIN">Main</option>
                      <option value="STARTER">Starter</option>
                    </select>
                  </div>

                  {/* Revenue Range */}
                  <div className="space-y-2">
                    <label className="form-label">Revenue Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minRevenue || ''}
                        onChange={(e) => handleFilterChange('minRevenue', e.target.value ? Number(e.target.value) : undefined)}
                        className="form-control w-full py-3 px-4 text-sm"
                        min="0"
                        step="100000"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxRevenue || ''}
                        onChange={(e) => handleFilterChange('maxRevenue', e.target.value ? Number(e.target.value) : undefined)}
                        className="form-control w-full py-3 px-4 text-sm"
                        min="0"
                        step="100000"
                      />
                    </div>
                  </div>

                  {/* Valuation Range */}
                  <div className="space-y-2">
                    <label className="form-label">Valuation Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minValuation || ''}
                        onChange={(e) => handleFilterChange('minValuation', e.target.value ? Number(e.target.value) : undefined)}
                        className="form-control w-full py-3 px-4 text-sm"
                        min="0"
                        step="500000"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxValuation || ''}
                        onChange={(e) => handleFilterChange('maxValuation', e.target.value ? Number(e.target.value) : undefined)}
                        className="form-control w-full py-3 px-4 text-sm"
                        min="0"
                        step="500000"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="glass px-6 py-3 text-white hover:text-gold transition-colors border border-neutral-600 hover:border-gold"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-12">
            <p className="font-sans text-lg text-silver/90 text-center">
              Showing <span className="text-gold font-semibold font-mono">{filteredListings.length}</span> of <span className="font-mono">{allListings.length}</span> {filteredListings.length !== 1 ? 'opportunities' : 'opportunity'}
              {filters.search && (
                <span className="text-neutral-400"> matching &quot;{filters.search}&quot;</span>
              )}
            </p>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-24">
          {filteredListings.map((listing, index) => (
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
        </ScrollAnimation>

        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="glass w-32 h-32 rounded flex items-center justify-center mx-auto mb-8 border border-neutral-600">
              <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl text-white font-semibold mb-4">
              {allListings.length === 0 ? 'No opportunities available' : 'No opportunities match your filters'}
            </h3>
            <p className="text-lg text-neutral-400 max-w-md mx-auto mb-6">
              {allListings.length === 0
                ? 'Check back later for new listings or try creating some test data.'
                : 'Try adjusting your search criteria or clearing some filters to see more results.'
              }
            </p>
            {allListings.length > 0 && (
              <button
                onClick={clearFilters}
                className="btn-primary px-6 py-3"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
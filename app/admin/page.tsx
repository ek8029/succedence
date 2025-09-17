'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Listing } from '@/lib/types';

interface DashboardStats {
  totalListings: number;
  mainLaneListings: number;
  starterLaneListings: number;
  totalNDARequests: number;
  pendingNDARequests: number;
  totalMessages: number;
  industries: string[];
}

function AdminPageContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, listingsResponse] = await Promise.all([
        fetch('/api/admin'),
        fetch('/api/listings')
      ]);
      
      const statsData = await statsResponse.json();
      const listingsData = await listingsResponse.json();
      
      setStats(statsData);
      setListings(listingsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLaneUpdate = async (listingId: string, newLane: "MAIN" | "STARTER") => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId, newLane }),
      });

      if (response.ok) {
        // Refresh data
        fetchDashboardData();
        alert('Lane updated successfully!');
      } else {
        alert('Failed to update lane');
      }
    } catch (error) {
      console.error('Error updating lane:', error);
      alert('Failed to update lane');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Dashboard Unavailable</h1>
          <p className="text-neutral-400 mb-8">Failed to load dashboard data</p>
          <Link href="/" className="btn-primary px-8 py-3 font-medium hover-lift">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional py-16">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-16">
            <h1 className="text-heading text-white font-medium mb-6">Administration Dashboard</h1>
            <p className="text-xl text-neutral-400 leading-relaxed mb-12">Platform analytics and business listing management</p>
            <Link href="/" className="glass px-8 py-3 font-medium text-white hover-lift transition-all border border-neutral-600">
              ← Return Home
            </Link>
          </div>
        </ScrollAnimation>

        {/* Statistics Cards */}
        <ScrollAnimation direction="up" delay={50}>
          <div className="max-w-6xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="metric-card p-8 slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-white border border-neutral-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-caption text-neutral-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.totalListings}</div>
              <div className="text-neutral-400">Active Listings</div>
            </div>
          
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 border flex items-center justify-center" style={{backgroundColor: 'var(--accent)', borderColor: 'var(--accent)'}}>
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-caption text-neutral-500">Main Street</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.mainLaneListings}</div>
              <div className="text-neutral-400">High-Value Listings</div>
            </div>
            
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-caption text-neutral-500">Starter</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.starterLaneListings}</div>
              <div className="text-neutral-400">Entry-Level Listings</div>
            </div>
            
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-caption text-neutral-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.totalNDARequests}</div>
              <div className="text-neutral-400">NDA Requests</div>
            </div>
            
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-caption text-neutral-500">Pending</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.pendingNDARequests}</div>
              <div className="text-neutral-400">Awaiting Review</div>
            </div>
            
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-caption text-neutral-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.totalMessages}</div>
              <div className="text-neutral-400">Messages Sent</div>
            </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Industries */}
        <ScrollAnimation direction="up" delay={100}>
          <div className="max-w-6xl mx-auto mb-16">
          <div className="glass p-16 slide-up" style={{animationDelay: '0.6s'}}>
            <h2 className="text-2xl text-white font-medium mb-10">Industry Distribution</h2>
            <div className="flex flex-wrap gap-4">
              {stats.industries.map(industry => (
                <span key={industry} className="status-badge status-pending">
                  {industry}
                </span>
              ))}
            </div>
          </div>
          </div>
        </ScrollAnimation>

        {/* Lane Management */}
        <ScrollAnimation direction="up" delay={150}>
          <div className="max-w-6xl mx-auto">
          <div className="glass p-16 slide-up" style={{animationDelay: '0.7s'}}>
            <h2 className="text-2xl text-white font-medium mb-10">Listing Management</h2>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left py-6 px-8">Business</th>
                    <th className="text-left py-6 px-8">Industry</th>
                    <th className="text-left py-6 px-8">Revenue</th>
                    <th className="text-left py-6 px-8">Current Tier</th>
                    <th className="text-left py-6 px-8">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="py-6 px-8">
                        <div>
                          <div className="text-white font-semibold text-lg">{listing.title}</div>
                          <div className="text-neutral-400 text-sm">{listing.owner}</div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className="status-badge status-pending">
                          {listing.industry}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-white font-bold text-financial text-lg">
                        {formatCurrency(listing.revenue)}
                      </td>
                      <td className="py-6 px-8">
                        <span className={`status-badge ${listing.lane === 'MAIN' ? 'status-main' : 'status-starter'}`}>
                          {listing.lane}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleLaneUpdate(listing.id, 'MAIN')}
                            disabled={listing.lane === 'MAIN'}
                            className={`px-6 py-3 text-sm font-medium focus-ring hover-lift transition-all ${
                              listing.lane === 'MAIN'
                                ? 'glass text-neutral-500 cursor-not-allowed opacity-50 border border-neutral-600'
                                : 'btn-primary'
                            }`}
                          >
                            Main Street
                          </button>
                          <button
                            onClick={() => handleLaneUpdate(listing.id, 'STARTER')}
                            disabled={listing.lane === 'STARTER'}
                            className={`px-6 py-3 text-sm font-medium focus-ring hover-lift transition-all ${
                              listing.lane === 'STARTER'
                                ? 'glass text-neutral-500 cursor-not-allowed opacity-50 border border-neutral-600'
                                : 'btn-success'
                            }`}
                          >
                            Starter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminPageContent />
    </ProtectedRoute>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Listing } from '@/lib/types';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  draftListings: number;
  rejectedListings: number;
  archivedListings: number;
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
        fetch('/api/admin/listings') // Use admin-specific listings endpoint
      ]);

      const statsData = await statsResponse.json();
      const listingsData = await listingsResponse.json();

      setStats(statsData);
      setListings(listingsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (listingId: string, newStatus: "active" | "draft" | "rejected" | "archived") => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId, newStatus }),
      });

      if (response.ok) {
        // Refresh data
        fetchDashboardData();
        alert('Status updated successfully!');
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

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
                <span className="text-caption text-neutral-500">Total</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.totalListings}</div>
              <div className="text-neutral-400">Active Listings</div>
            </div>
          
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-caption text-neutral-500">Active</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.activeListings}</div>
              <div className="text-neutral-400">Live Listings</div>
            </div>
            
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-caption text-neutral-500">Draft</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.draftListings}</div>
              <div className="text-neutral-400">Draft Listings</div>
            </div>
            
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-caption text-neutral-500">Rejected</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.rejectedListings}</div>
              <div className="text-neutral-400">Rejected Listings</div>
            </div>
            
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-caption text-neutral-500">Archived</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.archivedListings}</div>
              <div className="text-neutral-400">Archived Listings</div>
            </div>
            
            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.5s'}}>
              <div className="flex items-center justify-between mb-6">
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

        {/* Listing Management */}
        <ScrollAnimation direction="up" delay={150}>
          <div className="max-w-full mx-auto px-4">
          <div className="glass p-8 lg:p-16 slide-up" style={{animationDelay: '0.7s'}}>
            <h2 className="text-2xl text-white font-medium mb-10">Listing Management</h2>
            <div className="overflow-x-auto">
              <table className="data-table w-full min-w-[1200px]">
                <thead>
                  <tr>
                    <th className="text-left py-6 px-8">Business</th>
                    <th className="text-left py-6 px-8">Industry</th>
                    <th className="text-left py-6 px-8">Revenue</th>
                    <th className="text-left py-6 px-8">Status</th>
                    <th className="text-left py-6 px-8">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="py-6 px-8">
                        <div>
                          <div className="text-white font-semibold text-lg">{listing.title}</div>
                          <div className="text-neutral-400 text-sm">{listing.source}</div>
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
                        <span className={`status-badge ${listing.status === 'active' ? 'status-approved' : 'status-pending'}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="py-6 px-8 min-w-[300px]">
                        <div className="flex flex-wrap gap-2">
                          {listing.status !== 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(listing.id, 'active')}
                              className="px-3 py-1.5 text-xs font-medium btn-success whitespace-nowrap"
                            >
                              Activate
                            </button>
                          )}
                          {listing.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(listing.id, 'rejected')}
                              className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white border border-red-600 rounded hover:bg-red-700 whitespace-nowrap"
                            >
                              Reject
                            </button>
                          )}
                          {listing.status !== 'archived' && (
                            <button
                              onClick={() => handleStatusUpdate(listing.id, 'archived')}
                              className="px-3 py-1.5 text-xs font-medium glass border border-neutral-600 text-neutral-300 hover:text-white whitespace-nowrap"
                            >
                              Archive
                            </button>
                          )}
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
    <ProtectedRoute requiredRole="admin">
      <AdminPageContent />
    </ProtectedRoute>
  );
}

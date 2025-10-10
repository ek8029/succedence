'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  created_at: string;
}

function AdminPageContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [brokerCount, setBrokerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showBetaManagement, setShowBetaManagement] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [betaUserEmail, setBetaUserEmail] = useState('');
  const [regeneratingMatches, setRegeneratingMatches] = useState(false);

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Pagination states
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(15);
  const [listingsPage, setListingsPage] = useState(1);
  const [listingsPageSize, setListingsPageSize] = useState(15);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter and pagination calculations
  const getFilteredUsers = () => {
    return users.filter(user => {
      const roleMatch = roleFilter === 'all' || user.role === roleFilter;
      const planMatch = planFilter === 'all' || user.plan === planFilter;
      return roleMatch && planMatch;
    });
  };

  const getUsersForCurrentPage = () => {
    const filteredUsers = getFilteredUsers();
    const startIndex = (usersPage - 1) * usersPageSize;
    const endIndex = startIndex + usersPageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const getListingsForCurrentPage = () => {
    const startIndex = (listingsPage - 1) * listingsPageSize;
    const endIndex = startIndex + listingsPageSize;
    return listings.slice(startIndex, endIndex);
  };

  const getUsersTotalPages = () => Math.ceil(getFilteredUsers().length / usersPageSize);
  const getListingsTotalPages = () => Math.ceil(listings.length / listingsPageSize);

  const handleUsersPageSizeChange = (newSize: number) => {
    setUsersPageSize(newSize);
    setUsersPage(1); // Reset to first page when changing page size
  };

  const handleListingsPageSizeChange = (newSize: number) => {
    setListingsPageSize(newSize);
    setListingsPage(1); // Reset to first page when changing page size
  };

  // Pagination component
  const PaginationControls = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    itemName
  }: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    itemName: string;
  }) => {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-charcoal/30 rounded-lg border border-silver/20">
        <div className="flex items-center gap-4">
          <span className="text-sm text-silver/80">
            Showing {startItem}-{endItem} of {totalItems} {itemName}
          </span>
          <div className="flex items-center gap-2">
            <label className="text-sm text-silver/80">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-charcoal border border-silver/30 text-white text-sm rounded px-2 py-1"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 text-sm bg-charcoal border border-silver/30 text-white rounded hover:bg-charcoal-light disabled:opacity-50 disabled:cursor-not-allowed transition-all h-8"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else {
              if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
            }

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`inline-flex items-center px-3 py-2 text-sm rounded transition-all h-8 ${
                  currentPage === pageNumber
                    ? 'bg-gold text-midnight font-medium'
                    : 'bg-charcoal border border-silver/30 text-white hover:bg-charcoal-light'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 text-sm bg-charcoal border border-silver/30 text-white rounded hover:bg-charcoal-light disabled:opacity-50 disabled:cursor-not-allowed transition-all h-8"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, listingsResponse, usersResponse, brokersResponse] = await Promise.all([
        fetch('/api/admin'),
        fetch('/api/admin/listings'),
        fetch('/api/admin/users'),
        fetch('/api/admin/brokers')
      ]);

      console.log('Admin API responses:', {
        stats: statsResponse.status,
        listings: listingsResponse.status,
        users: usersResponse.status,
        brokers: brokersResponse.status
      });

      const statsData = await statsResponse.json();
      const listingsData = await listingsResponse.json();
      const usersData = await usersResponse.json();
      const brokersData = await brokersResponse.json();

      console.log('Admin data received:', {
        statsData,
        listingsData,
        usersData,
        brokersData
      });

      setStats(statsData);
      // Defensive: ensure we set arrays even if API returns error objects
      setListings(Array.isArray(listingsData) ? listingsData : []);
      setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
      setBrokerCount(brokersData.brokers?.length || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays on error to prevent map() failures
      setListings([]);
      setUsers([]);
      setBrokerCount(0);
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

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdminData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Admin created successfully!');
        setShowCreateAdmin(false);
        setNewAdminData({ name: '', email: '', password: '' });
        fetchDashboardData(); // Refresh data
      } else {
        alert(data.error || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
        return;
      }

      // Refresh first, then show success
      await fetchDashboardData();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleGrantBetaAccess = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!betaUserEmail) {
      alert('Please enter a user email');
      return;
    }

    try {
      const response = await fetch('/api/admin/grant-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: betaUserEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to grant beta access');
        return;
      }

      // Refresh first, then show success
      setBetaUserEmail('');
      await fetchDashboardData();
      alert('Beta access granted successfully!');
    } catch (error) {
      console.error('Error granting beta access:', error);
      alert('Failed to grant beta access');
    }
  };

  const handleRevokeBetaAccess = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke beta access for "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/revoke-beta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to revoke beta access');
        return;
      }

      // Refresh first, then show success
      await fetchDashboardData();
      alert('Beta access revoked successfully!');
    } catch (error) {
      console.error('Error revoking beta access:', error);
      alert('Failed to revoke beta access');
    }
  };

  const handleUpgradeToAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to upgrade "${userName}" to admin role?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to upgrade user to admin');
        return;
      }

      // Refresh first, then show success
      await fetchDashboardData();
      alert('User upgraded to admin successfully!');
    } catch (error) {
      console.error('Error upgrading user:', error);
      alert('Failed to upgrade user to admin');
    }
  };

  const handleRegenerateMatches = async () => {
    if (!confirm('Regenerate all user matches with the new scoring system? This will update all existing match percentages.')) {
      return;
    }

    setRegeneratingMatches(true);

    try {
      const response = await fetch('/api/admin/regenerate-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to regenerate matches');
        return;
      }

      const data = await response.json();
      alert(`Success! Regenerated ${data.totalMatches} matches for ${data.usersProcessed} users.`);
    } catch (error) {
      console.error('Error regenerating matches:', error);
      alert('Failed to regenerate matches');
    } finally {
      setRegeneratingMatches(false);
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
          <Link href="/" className="btn-primary btn-lg font-medium hover-lift">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional page-content-large">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-32">
            <h1 className="text-heading text-white font-medium mb-6">Administration Dashboard</h1>
            <p className="text-xl text-neutral-400 leading-relaxed mb-12">Platform analytics and business listing management</p>
            <Link href="/" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white glass border border-neutral-600 hover-lift transition-all">
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

            <div className="metric-card p-8 slide-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-caption text-neutral-500">Brokers</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2 text-financial">{brokerCount}</div>
              <div className="text-neutral-400">Active Brokers</div>
            </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Industries */}
        <ScrollAnimation direction="up" delay={100}>
          <div className="max-w-6xl mx-auto mb-16">
          <div className="glass p-8 border border-gold/30 rounded-luxury slide-up" style={{animationDelay: '0.6s'}}>
            <h2 className="text-2xl text-white font-medium mb-6">Industry Distribution</h2>
            <div className="flex flex-wrap gap-4">
              {(stats.industries || []).map(industry => (
                <span key={industry} className="status-badge status-pending">
                  {industry}
                </span>
              ))}
            </div>
          </div>
          </div>
        </ScrollAnimation>

        {/* Admin Management */}
        <ScrollAnimation direction="up" delay={125}>
          <div className="max-w-6xl mx-auto mb-16">
          <div className="glass p-8 border border-gold/30 rounded-luxury slide-up" style={{animationDelay: '0.65s'}}>
            {!showCreateAdmin && !showBetaManagement && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl text-white font-medium">User Management</h2>
                  <div className="flex gap-4 items-center flex-wrap">
                    <Link
                      href="/admin/brokers"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 rounded transition-all h-10"
                    >
                      Manage Brokers
                    </Link>
                    <button
                      onClick={handleRegenerateMatches}
                      disabled={regeneratingMatches}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white border border-green-600 rounded transition-all h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {regeneratingMatches ? 'Regenerating...' : 'Regenerate Matches'}
                    </button>
                    <button
                      onClick={() => setShowBetaManagement(true)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded transition-all h-10"
                    >
                      Manage Beta Access
                    </button>
                    <button
                      onClick={() => setShowCreateAdmin(true)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gold hover:bg-gold-light text-midnight border border-gold rounded transition-all h-10"
                    >
                      Create New Admin
                    </button>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Filter by Role</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setUsersPage(1);
                      }}
                      className="form-control min-w-[150px]"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="broker">Broker</option>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Filter by Plan</label>
                    <select
                      value={planFilter}
                      onChange={(e) => {
                        setPlanFilter(e.target.value);
                        setUsersPage(1);
                      }}
                      className="form-control min-w-[150px]"
                    >
                      <option value="all">All Plans</option>
                      <option value="free">Free</option>
                      <option value="starter">Starter</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Create Admin Form */}
            {showCreateAdmin && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white font-medium">Create New Admin</h2>
                  <button
                    onClick={() => {
                      setShowCreateAdmin(false);
                      setNewAdminData({ name: '', email: '', password: '' });
                    }}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCreateAdmin} className="space-y-4 max-w-md">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={newAdminData.name}
                      onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
                      className="form-control w-full"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                      className="form-control w-full"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                      className="form-control w-full"
                      placeholder="Enter password (min 6 characters)"
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="btn-primary px-6 py-2.5 text-sm font-medium"
                    >
                      Create Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateAdmin(false);
                        setNewAdminData({ name: '', email: '', password: '' });
                      }}
                      className="glass border border-neutral-600 text-neutral-300 hover:text-white px-6 py-2.5 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Beta Management Form */}
            {showBetaManagement && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-white font-medium">Beta Access Management</h2>
                  <button
                    onClick={() => {
                      setShowBetaManagement(false);
                      setBetaUserEmail('');
                    }}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Grant Beta Access */}
                <div className="mb-8 max-w-md">
                  <h4 className="text-lg text-blue-200 font-medium mb-4">Grant Beta Access</h4>
                  <form onSubmit={handleGrantBetaAccess} className="space-y-4">
                    <div>
                      <label className="form-label">User Email</label>
                      <input
                        type="email"
                        value={betaUserEmail}
                        onChange={(e) => setBetaUserEmail(e.target.value)}
                        className="form-control w-full"
                        placeholder="Enter user email address"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium rounded transition-all"
                      >
                        Grant Beta Access
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBetaManagement(false);
                          setBetaUserEmail('');
                        }}
                        className="glass border border-neutral-600 text-neutral-300 hover:text-white px-6 py-2.5 text-sm font-medium rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Current Beta Users */}
                <div>
                  <h4 className="text-lg text-blue-200 font-medium mb-4">Current Beta Users ({users.filter(user => user.plan === 'beta').length})</h4>
                  {users.filter(user => user.plan === 'beta').length > 0 ? (
                    <div className="space-y-2">
                      {users.filter(user => user.plan === 'beta').map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-400/30 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">{user.name}</div>
                            <div className="text-blue-200 text-sm truncate">{user.email}</div>
                            <div className="text-blue-300 text-xs mt-1">
                              Beta since: {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevokeBetaAccess(user.id, user.name)}
                            className="ml-4 px-4 py-2 text-xs font-medium bg-red-600 text-white border border-red-600 rounded hover:bg-red-700 transition-all whitespace-nowrap"
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-neutral-400 bg-blue-900/10 border border-blue-400/20 rounded-lg">
                      No beta users currently active
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Table */}
            {!showCreateAdmin && !showBetaManagement && (
              <>
              <div className="overflow-x-auto">
                <table className="data-table w-full min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="text-left py-4 px-6">User</th>
                      <th className="text-left py-4 px-6">Role</th>
                      <th className="text-left py-4 px-6">Plan</th>
                      <th className="text-left py-4 px-6">Created</th>
                      <th className="text-left py-4 px-6">Actions</th>
                    </tr>
                  </thead>
                <tbody>
                  {getUsersForCurrentPage().map((user) => (
                    <tr key={user.id}>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-white font-semibold text-lg">{user.name}</div>
                          <div className="text-neutral-400 text-sm">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`status-badge ${
                          user.role === 'admin' ? 'status-approved' :
                          user.role === 'broker' ? 'bg-purple-600/20 text-purple-200 border-purple-400/30' :
                          user.role === 'seller' ? 'status-pending' : 'status-info'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`status-badge ${
                          user.plan === 'free' ? 'bg-red-600/20 text-red-200 border-red-400/30' :
                          user.plan === 'beta' ? 'bg-blue-600/20 text-blue-200 border-blue-400/30' :
                          user.plan === 'starter' ? 'bg-yellow-600/20 text-yellow-200 border-yellow-400/30' :
                          user.plan === 'professional' ? 'bg-green-600/20 text-green-200 border-green-400/30' :
                          user.plan === 'enterprise' ? 'bg-purple-600/20 text-purple-200 border-purple-400/30' :
                          'status-pending'
                        }`}>
                          {user.plan || 'free'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-neutral-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2 items-center flex-wrap">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleUpgradeToAdmin(user.id, user.name)}
                              className="inline-flex items-center px-3 py-2 text-xs font-medium bg-gold hover:bg-gold-light text-midnight border border-gold rounded transition-all whitespace-nowrap h-8"
                            >
                              Make Admin
                            </button>
                          )}
                          {user.plan === 'beta' && (
                            <button
                              onClick={() => handleRevokeBetaAccess(user.id, user.name)}
                              className="inline-flex items-center px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded transition-all whitespace-nowrap h-8"
                            >
                              Revoke Beta
                            </button>
                          )}
                          {user.plan === 'free' && (
                            <button
                              onClick={() => {
                                setBetaUserEmail(user.email);
                                setShowBetaManagement(true);
                              }}
                              className="inline-flex items-center px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded transition-all whitespace-nowrap h-8"
                            >
                              Grant Beta
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="inline-flex items-center px-3 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white border border-red-600 rounded transition-all whitespace-nowrap h-8"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Users Pagination */}
            <PaginationControls
              currentPage={usersPage}
              totalPages={getUsersTotalPages()}
              pageSize={usersPageSize}
              totalItems={getFilteredUsers().length}
              onPageChange={setUsersPage}
              onPageSizeChange={handleUsersPageSizeChange}
              itemName="users"
            />
            </>
            )}
          </div>
          </div>
        </ScrollAnimation>

        {/* Listing Management */}
        <ScrollAnimation direction="up" delay={150}>
          <div className="max-w-7xl mx-auto px-4">
          <div className="glass p-8 border border-gold/30 rounded-luxury slide-up" style={{animationDelay: '0.7s'}}>
            <h2 className="text-2xl text-white font-medium mb-8">Listing Management</h2>
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left py-4 px-4 min-w-[200px]">Business</th>
                    <th className="text-left py-4 px-4 min-w-[120px]">Industry</th>
                    <th className="text-left py-4 px-4 min-w-[100px]">Revenue</th>
                    <th className="text-left py-4 px-4 min-w-[80px]">Status</th>
                    <th className="text-left py-4 px-4 min-w-[200px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getListingsForCurrentPage().map((listing) => (
                    <tr key={listing.id}>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white font-semibold text-base">{listing.title}</div>
                          <div className="text-neutral-400 text-xs">{listing.source}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="status-badge status-pending text-xs">
                          {listing.industry}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-bold text-financial text-base">
                        {formatCurrency(listing.revenue)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`status-badge text-xs ${listing.status === 'active' ? 'status-approved' : 'status-pending'}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-2 items-center">
                          {listing.status !== 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(listing.id, 'active')}
                              className="inline-flex items-center px-3 py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white border border-green-600 rounded transition-all whitespace-nowrap h-8"
                            >
                              Activate
                            </button>
                          )}
                          {listing.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(listing.id, 'rejected')}
                              className="inline-flex items-center px-3 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white border border-red-600 rounded transition-all whitespace-nowrap h-8"
                            >
                              Reject
                            </button>
                          )}
                          {listing.status !== 'archived' && (
                            <button
                              onClick={() => handleStatusUpdate(listing.id, 'archived')}
                              className="inline-flex items-center px-3 py-2 text-xs font-medium bg-neutral-600 hover:bg-neutral-700 text-white border border-neutral-600 rounded transition-all whitespace-nowrap h-8"
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

            {/* Listings Pagination */}
            <PaginationControls
              currentPage={listingsPage}
              totalPages={getListingsTotalPages()}
              pageSize={listingsPageSize}
              totalItems={listings.length}
              onPageChange={setListingsPage}
              onPageSizeChange={handleListingsPageSizeChange}
              itemName="listings"
            />
          </div>
          </div>
        </ScrollAnimation>
      </div>
      <Footer />
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

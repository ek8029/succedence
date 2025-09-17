'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Listing, NDARequest, Message } from '@/lib/types';

interface User {
  name: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
}

interface UserStats {
  listingsCreated: number;
  ndasRequested: number;
  ndasReceived: number;
  messagesExchanged: number;
}

function ProfilePageContent() {
  const { user, updateProfile, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userNDAs, setUserNDAs] = useState<NDARequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
      fetchUserData(user);
    }
  }, [user]);

  const fetchUserData = async (currentUser: User) => {
    try {
      // Fetch listings
      const listingsResponse = await fetch('/api/listings');
      const allListings: Listing[] = await listingsResponse.json();
      const userOwnedListings = allListings.filter(l => l.owner === currentUser.name);
      setUserListings(userOwnedListings);

      // Fetch NDAs
      const ndasResponse = await fetch('/api/ndas');
      const allNDAs: NDARequest[] = await ndasResponse.json();
      const userNDAs = allNDAs.filter(nda => 
        nda.buyerName === currentUser.name || 
        userOwnedListings.some(listing => listing.id === nda.listingId)
      );
      setUserNDAs(userNDAs);

      // Fetch messages
      const messagesResponse = await fetch('/api/messages');
      const allMessages: Message[] = await messagesResponse.json();
      const userMessages = allMessages.filter(msg => msg.from === currentUser.name);

      // Calculate stats
      setStats({
        listingsCreated: userOwnedListings.length,
        ndasRequested: allNDAs.filter(nda => nda.buyerName === currentUser.name).length,
        ndasReceived: allNDAs.filter(nda => 
          userOwnedListings.some(listing => listing.id === nda.listingId)
        ).length,
        messagesExchanged: userMessages.length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;
    
    updateProfile({ name: editedName.trim() });
    setEditMode(false);
    
    // Refresh data with new name
    fetchUserData({ ...user, name: editedName.trim() });
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
          <div className="text-xl text-white font-medium">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Authentication Required</h1>
          <Link href="/auth" className="btn-primary px-8 py-3 font-medium hover-lift">
            Sign In
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
            <div className="w-20 h-20 bg-white border border-neutral-300 flex items-center justify-center mx-auto mb-8">
              <span className="text-black font-bold text-2xl">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-heading text-white font-medium mb-4">User Profile</h1>
            <p className="text-xl text-neutral-400">Manage your account and view activity</p>
            <div className="mt-8">
              <Link href="/" className="glass px-8 py-3 font-medium text-white hover-lift transition-all border border-neutral-600">
                ← Return Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="up" delay={50}>
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Profile Information */}
            <div className="glass p-16">
            <h2 className="text-2xl text-white font-medium mb-10">Account Information</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-lg text-neutral-300 font-medium">Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="form-control w-full py-4 px-6 text-lg"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg">
                      {user.name}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="block text-lg text-neutral-300 font-medium">Role</label>
                  <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600">
                    <span className={`status-badge ${
                      user.role === 'ADMIN' ? 'status-main' : 
                      user.role === 'SELLER' ? 'status-approved' : 'status-starter'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {editMode ? (
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={!editedName.trim()}
                      className="btn-success px-8 py-3 font-medium hover-lift disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditedName(user.name);
                      }}
                      className="glass px-8 py-3 font-medium text-white hover-lift border border-neutral-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setEditMode(true)}
                      className="btn-primary px-8 py-3 font-medium hover-lift"
                    >
                      Edit Profile
                    </button>
                    <div>
                      <button
                        onClick={() => signOut()}
                        className="glass px-8 py-3 font-medium text-white hover-lift border border-neutral-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          {stats && (
            <div className="glass p-16">
              <h2 className="text-2xl text-white font-medium mb-10">Activity Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="metric-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-white border border-neutral-300 flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.listingsCreated}</div>
                  <div className="text-neutral-400">Listings Created</div>
                </div>

                <div className="metric-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 border flex items-center justify-center" style={{backgroundColor: 'var(--accent)', borderColor: 'var(--accent)'}}>
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.ndasRequested}</div>
                  <div className="text-neutral-400">NDAs Requested</div>
                </div>

                <div className="metric-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.ndasReceived}</div>
                  <div className="text-neutral-400">NDAs Received</div>
                </div>

                <div className="metric-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 text-financial">{stats.messagesExchanged}</div>
                  <div className="text-neutral-400">Messages Sent</div>
                </div>
              </div>
            </div>
          )}

          {/* User Listings */}
          {userListings.length > 0 && (
            <div className="glass p-16">
              <h2 className="text-2xl text-white font-medium mb-10">Your Listings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {userListings.map((listing) => (
                  <div key={listing.id} className="metric-card p-8 hover-lift">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex flex-wrap gap-2">
                        <span className={`status-badge ${listing.lane === 'MAIN' ? 'status-main' : 'status-starter'}`}>
                          {listing.lane}
                        </span>
                        <span className="status-badge status-pending">
                          {listing.industry}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl text-white font-semibold mb-4">{listing.title}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Annual Revenue</span>
                        <span className="text-white font-bold text-financial">{formatCurrency(listing.revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Valuation Range</span>
                        <span className="text-white font-bold text-financial">
                          {formatCurrency(listing.valuationLow)} - {formatCurrency(listing.valuationHigh)}
                        </span>
                      </div>
                    </div>
                    
                    <Link href={`/listings/${listing.id}`}>
                      <div className="btn-primary w-full py-3 text-center font-medium hover-lift">
                        View Details →
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent NDA Activity */}
          {userNDAs.length > 0 && (
            <div className="glass p-16">
              <h2 className="text-2xl text-white font-medium mb-10">NDA Activity</h2>
              
              <div className="space-y-4">
                {userNDAs.slice(0, 5).map((nda) => (
                  <div key={nda.id} className="p-6 bg-neutral-900/50 border border-neutral-600 flex justify-between items-center">
                    <div>
                      <div className="text-white font-semibold text-lg">{nda.buyerName}</div>
                      <div className="text-neutral-400 text-sm">Listing ID: {nda.listingId}</div>
                    </div>
                    <span className={`status-badge ${
                      nda.status === 'APPROVED' ? 'status-approved' :
                      nda.status === 'REJECTED' ? 'status-rejected' : 'status-pending'
                    }`}>
                      {nda.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
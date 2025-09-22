'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollAnimation from '@/components/ScrollAnimation';
import { createClient } from '@/lib/supabase/client';
import type { ProfileFormData, UserRole } from '@/lib/types';
import { showNotification } from '@/components/Notification';
import Footer from '@/components/Footer';
import MyMatches from '@/components/MyMatches';

interface UserStats {
  listingsCreated: number;
  messagesExchanged: number;
  profileCompleteness: number;
}

function ProfilePageContent() {
  const { user, userProfile, updateProfile, signOut, isLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Form data
  const [formData, setFormData] = useState<ProfileFormData>({
    phone: '',
    company: '',
    headline: '',
    location: '',
    avatarUrl: '',
  });

  // Basic info editing
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicFormData, setBasicFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (userProfile) {
      // Set form data from current profile
      setFormData({
        phone: userProfile.profile?.phone || '',
        company: userProfile.profile?.company || '',
        headline: userProfile.profile?.headline || '',
        location: userProfile.profile?.location || '',
        avatarUrl: userProfile.profile?.avatarUrl || '',
      });

      setBasicFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
      });

      fetchUserStats();
    }
  }, [userProfile]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Get user's listings count
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('ownerUserId', user.id);

      // Get user's messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('fromUser', user.id);

      // Calculate profile completeness
      const profileFields = [
        userProfile?.name,
        userProfile?.email,
        userProfile?.profile?.phone,
        userProfile?.profile?.company,
        userProfile?.profile?.headline,
        userProfile?.profile?.location,
      ];
      const completedFields = profileFields.filter(field => field && field.trim()).length;
      const completeness = Math.round((completedFields / profileFields.length) * 100);

      setStats({
        listingsCreated: listingsCount || 0,
        messagesExchanged: messagesCount || 0,
        profileCompleteness: completeness,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error || 'Failed to update profile', 'error');
      } else {
        setEditMode(false);
        showNotification('Profile updated successfully!', 'success');
        // Refresh user profile
        window.location.reload();
      }
    } catch (error) {
      showNotification('Failed to update profile', 'error');
    }
  };

  const handleUpdateBasicInfo = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Update user basic info in users table
      const { error } = await (supabase
        .from('users') as any)
        .update({
          name: basicFormData.name,
          email: basicFormData.email,
        })
        .eq('id', user.id);

      if (error) {
        showNotification('Failed to update basic information', 'error');
      } else {
        setEditingBasic(false);
        showNotification('Basic information updated successfully!', 'success');
        // The auth context will automatically refresh the user data
        window.location.reload();
      }
    } catch (error) {
      showNotification('An error occurred while updating', 'error');
    }
  };

  if (isLoading || loading) {
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
      <div className="container-professional pb-16 page-content-large">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-16 mt-24">
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

            {/* Profile Completeness */}
            {stats && (
              <div className="glass p-8 border border-gold/30 rounded-luxury">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl text-white font-medium">Profile Completeness</h3>
                  <span className="text-2xl font-bold text-gold">{stats.profileCompleteness}%</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-gold to-yellow-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.profileCompleteness}%` }}
                  ></div>
                </div>
                <p className="text-neutral-400 text-sm mt-2">
                  Complete your profile to get better matches and connect with more opportunities
                </p>
              </div>
            )}

            {/* Basic Information */}
            <div className="glass p-16 border border-gold/30 rounded-luxury">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl text-white font-medium">Basic Information</h2>
                <button
                  onClick={() => setEditingBasic(!editingBasic)}
                  className="glass px-6 py-2 text-white border border-neutral-600 hover-lift"
                >
                  {editingBasic ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-2">Name</label>
                    {editingBasic ? (
                      <input
                        type="text"
                        value={basicFormData.name}
                        onChange={(e) => setBasicFormData({ ...basicFormData, name: e.target.value })}
                        className="form-control w-full py-3 px-4"
                      />
                    ) : (
                      <div className="py-3 px-4 bg-neutral-900/50 border border-neutral-600 text-white">
                        {userProfile?.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-2">Email</label>
                    {editingBasic ? (
                      <input
                        type="email"
                        value={basicFormData.email}
                        onChange={(e) => setBasicFormData({ ...basicFormData, email: e.target.value })}
                        className="form-control w-full py-3 px-4"
                      />
                    ) : (
                      <div className="py-3 px-4 bg-neutral-900/50 border border-neutral-600 text-white">
                        {userProfile?.email}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-2">Role</label>
                  <div className="py-3 px-4 bg-neutral-900/50 border border-neutral-600">
                    <span className={`status-badge ${
                      user.role === 'admin' ? 'status-main' :
                      user.role === 'seller' ? 'status-approved' : 'status-starter'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-2">Plan</label>
                  <div className="py-3 px-4 bg-neutral-900/50 border border-neutral-600">
                    <span className={`status-badge ${
                      user.plan === 'enterprise' ? 'status-main' :
                      user.plan === 'pro' ? 'status-approved' : 'status-starter'
                    }`}>
                      {user.plan.toUpperCase()}
                    </span>
                  </div>
                </div>

                {editingBasic && (
                  <div className="flex justify-center space-x-4 pt-4">
                    <button
                      onClick={handleUpdateBasicInfo}
                      className="btn-success px-6 py-3 font-medium hover-lift"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* My Matches */}
            <MyMatches />

            {/* Profile Details */}
            <div className="glass p-16 border border-gold/30 rounded-luxury">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl text-white font-medium">Profile Details</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="glass px-6 py-2 text-white border border-neutral-600 hover-lift"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-2">Phone</label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-control w-full py-3 px-4"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="py-3 px-4 bg-neutral-900/50 border border-neutral-600 text-white">
                        {userProfile?.profile?.phone || 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-2">Company</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="form-control w-full py-3 px-4"
                        placeholder="Enter your company"
                      />
                    ) : (
                      <div className="py-3 px-4 bg-neutral-900/50 border border-neutral-600 text-white">
                        {userProfile?.profile?.company || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-2">Professional Headline</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      className="form-control w-full py-3 px-4"
                      placeholder="e.g., Senior Investment Analyst at XYZ Capital"
                    />
                  ) : (
                    <div className="py-3 px-4 bg-neutral-900/50 border border-neutral-600 text-white">
                      {userProfile?.profile?.headline || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-2">Location</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="form-control w-full py-3 px-4"
                      placeholder="e.g., New York, NY"
                    />
                  ) : (
                    <div className="py-3 px-4 bg-neutral-900/50 border border-neutral-600 text-white">
                      {userProfile?.profile?.location || 'Not provided'}
                    </div>
                  )}
                </div>

                {editMode && (
                  <div className="flex justify-center space-x-4 pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      className="btn-success px-6 py-3 font-medium hover-lift"
                    >
                      Save Profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Statistics */}
            {stats && (
              <div className="glass p-16 border border-gold/30 rounded-luxury">
                <h2 className="text-2xl text-white font-medium mb-10 text-center">Activity Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="metric-card p-8 text-center">
                    <div className="text-4xl font-bold text-gold mb-4 font-mono">{stats.listingsCreated}</div>
                    <div className="text-neutral-400 text-lg">Listings Created</div>
                  </div>

                  <div className="metric-card p-8 text-center">
                    <div className="text-4xl font-bold text-gold mb-4 font-mono">{stats.messagesExchanged}</div>
                    <div className="text-neutral-400 text-lg">Messages Sent</div>
                  </div>

                  <div className="metric-card p-8 text-center">
                    <div className="text-4xl font-bold text-gold mb-4 font-mono">{stats.profileCompleteness}%</div>
                    <div className="text-neutral-400 text-lg">Profile Complete</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="glass p-16 border border-gold/30 rounded-luxury">
              <h2 className="text-2xl text-white font-medium mb-10 text-center">Quick Actions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Link href="/preferences" className="metric-card p-6 hover-lift block">
                  <div className="text-center">
                    <h3 className="text-white font-medium mb-2">Set Preferences</h3>
                    <p className="text-neutral-400 text-sm">Configure your acquisition preferences</p>
                  </div>
                </Link>

                <Link href="/browse" className="metric-card p-6 hover-lift block">
                  <div className="text-center">
                    <h3 className="text-white font-medium mb-2">Browse Listings</h3>
                    <p className="text-neutral-400 text-sm">Explore available opportunities</p>
                  </div>
                </Link>

                {user.role === 'seller' && (
                  <Link href="/listings/new" className="metric-card p-6 hover-lift block">
                    <div className="text-center">
                      <h3 className="text-white font-medium mb-2">Create Listing</h3>
                      <p className="text-neutral-400 text-sm">List your business for sale</p>
                    </div>
                  </Link>
                )}
              </div>

              <div className="flex justify-center mt-10">
                <button
                  onClick={() => signOut()}
                  className="glass px-8 py-3 font-medium text-white hover-lift border border-neutral-600"
                >
                  Sign Out
                </button>
              </div>
            </div>

          </div>
        </ScrollAnimation>
      </div>
      <Footer />
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
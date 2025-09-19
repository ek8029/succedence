'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Listing, NDARequest, Message } from '@/lib/types';

interface User {
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  profilePicture?: string;
  bio?: string;
  preferredContact?: 'Phone' | 'Email' | 'Other';
  preferredPhoneNumber?: string;
  location?: string;
  phone?: string;
  contactInfoVisible?: boolean;
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
  const [aboutMeEditMode, setAboutMeEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedRole, setEditedRole] = useState<'BUYER' | 'SELLER' | 'ADMIN'>('BUYER');
  const [editedProfilePicture, setEditedProfilePicture] = useState('');
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedPreferredContact, setEditedPreferredContact] = useState<'Phone' | 'Email' | 'Other' | ''>('');
  const [editedPreferredPhoneNumber, setEditedPreferredPhoneNumber] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedContactInfoVisible, setEditedContactInfoVisible] = useState(true);

  useEffect(() => {
    if (user) {
      setEditedName(user.name);
      setEditedEmail(user.email);
      setEditedRole(user.role);
      setEditedProfilePicture(user.profilePicture || '');
      setEditedBio(user.bio || '');
      setEditedPreferredContact(user.preferredContact || '');
      setEditedPreferredPhoneNumber(user.preferredPhoneNumber || '');
      setEditedLocation(user.location || '');
      setEditedPhone(user.phone || '');
      setEditedContactInfoVisible(user.contactInfoVisible ?? true);
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

    const updatedProfile = {
      name: editedName.trim(),
      email: editedEmail.trim(),
      role: editedRole,
      profilePicture: editedProfilePicture.trim(),
      bio: editedBio.trim(),
      preferredContact: editedPreferredContact as 'Phone' | 'Email' | 'Other' | undefined,
      location: editedLocation.trim(),
      phone: editedPhone.trim()
    };

    updateProfile(updatedProfile);
    setEditMode(false);

    // Refresh data with updated profile
    fetchUserData({ ...user, ...updatedProfile });
  };

  const handleSaveAboutMe = () => {
    if (!user) return;

    const aboutMeUpdates = {
      profilePicture: profilePreviewUrl || editedProfilePicture.trim(),
      bio: editedBio.trim(),
      preferredContact: editedPreferredContact as 'Phone' | 'Email' | 'Other' | undefined,
      preferredPhoneNumber: editedPreferredPhoneNumber.trim(),
      location: editedLocation.trim(),
      phone: editedPhone.trim(),
      contactInfoVisible: editedContactInfoVisible
    };

    updateProfile(aboutMeUpdates);
    setAboutMeEditMode(false);

    // Clear file selection
    setSelectedProfileFile(null);
    setProfilePreviewUrl('');

    // Refresh data with updated About Me info
    fetchUserData({ ...user, ...aboutMeUpdates });
  };

  const handleProfileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedProfileFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
            {/* Profile Information */}
            <div className="glass p-16">
              <h2 className="text-2xl text-white font-medium mb-10 text-center">Account Information</h2>

              <div className="max-w-2xl mx-auto">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-lg text-neutral-300 font-medium text-center">Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="form-control w-full py-4 px-6 text-lg text-center"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg text-center">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-lg text-neutral-300 font-medium text-center">Email</label>
                    {editMode ? (
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="form-control w-full py-4 px-6 text-lg text-center"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg text-center">
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-lg text-neutral-300 font-medium text-center">Role</label>
                    {editMode ? (
                      <select
                        value={editedRole}
                        onChange={(e) => setEditedRole(e.target.value as 'BUYER' | 'SELLER' | 'ADMIN')}
                        className="form-control w-full py-4 px-6 text-lg text-center"
                      >
                        <option value="BUYER">BUYER</option>
                        <option value="SELLER">SELLER</option>
                      </select>
                    ) : (
                      <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-center">
                        <span className={`status-badge ${
                          user.role === 'ADMIN' ? 'status-main' :
                          user.role === 'SELLER' ? 'status-approved' : 'status-starter'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center space-x-4 pt-6">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          disabled={!editedName.trim() || !editedEmail.trim()}
                          className="btn-success px-8 py-3 font-medium hover-lift disabled:opacity-50"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditMode(false);
                            setEditedName(user.name);
                            setEditedEmail(user.email);
                            setEditedRole(user.role);
                            setEditedProfilePicture(user.profilePicture || '');
                            setEditedBio(user.bio || '');
                            setEditedPreferredContact(user.preferredContact || '');
                            setEditedLocation(user.location || '');
                            setEditedPhone(user.phone || '');
                          }}
                          className="glass px-8 py-3 font-medium text-white hover-lift border border-neutral-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditMode(true)}
                          className="btn-primary px-8 py-3 font-medium hover-lift"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => signOut()}
                          className="glass px-8 py-3 font-medium text-white hover-lift border border-neutral-600"
                        >
                          Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About Me Section */}
            <div className="glass p-16">
              <h2 className="text-2xl text-white font-medium mb-10 text-center">About Me</h2>

              <div className="max-w-2xl mx-auto">
                <div className="space-y-8">
                  {/* Profile Picture */}
                  <div className="space-y-4">
                    <label className="block text-lg text-neutral-300 font-medium text-center">Profile Picture</label>
                    <div className="flex flex-col items-center space-y-4">
                      {(aboutMeEditMode ? (profilePreviewUrl || editedProfilePicture) : user.profilePicture) ? (
                        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-neutral-600">
                          <img
                            src={aboutMeEditMode ? (profilePreviewUrl || editedProfilePicture) : user.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-neutral-900/50 border-2 border-neutral-600 rounded-full flex items-center justify-center">
                          <span className="text-neutral-500 text-4xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {aboutMeEditMode && (
                        <div className="space-y-3 w-full">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileFileSelect}
                            className="form-control w-full py-3 px-4 text-center file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          <div className="text-center text-sm text-neutral-400">
                            Select an image file (max 5MB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-4">
                    <label className="block text-lg text-neutral-300 font-medium text-center">Bio</label>
                    {aboutMeEditMode ? (
                      <textarea
                        value={editedBio}
                        onChange={(e) => setEditedBio(e.target.value)}
                        className="form-control w-full py-4 px-6 text-lg resize-none h-32"
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg min-h-[8rem] whitespace-pre-wrap">
                        {user.bio || 'No bio added yet.'}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <label className="block text-lg text-neutral-300 font-medium text-center">Location</label>
                    {aboutMeEditMode ? (
                      <input
                        type="text"
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        className="form-control w-full py-4 px-6 text-lg text-center"
                        placeholder="Enter your location"
                      />
                    ) : (
                      <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg text-center">
                        {user.location || 'No location specified'}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-4">
                    <label className="block text-lg text-neutral-300 font-medium text-center">Phone</label>
                    {aboutMeEditMode ? (
                      <input
                        type="tel"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        className="form-control w-full py-4 px-6 text-lg text-center"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg text-center">
                        {user.phone || 'No phone number provided'}
                      </div>
                    )}
                  </div>

                  {/* Contact Information Privacy Toggle */}
                  <div className="space-y-4">
                    <label className="block text-lg text-neutral-300 font-medium text-center">Contact Information Visibility</label>
                    {aboutMeEditMode ? (
                      <div className="flex items-center justify-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editedContactInfoVisible}
                            onChange={(e) => setEditedContactInfoVisible(e.target.checked)}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-white text-lg">Make contact information visible to others</span>
                        </label>
                      </div>
                    ) : (
                      <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg text-center">
                        {user.contactInfoVisible ? 'Contact information is visible' : 'Contact information is private'}
                      </div>
                    )}
                  </div>

                  {/* Contact Information Section - Only show if visible or in edit mode */}
                  {(user.contactInfoVisible || aboutMeEditMode) && (
                    <>
                      {/* Preferred Contact Method */}
                      <div className="space-y-4">
                        <label className="block text-lg text-neutral-300 font-medium text-center">Preferred Contact Method</label>
                        {aboutMeEditMode ? (
                          <select
                            value={editedPreferredContact}
                            onChange={(e) => setEditedPreferredContact(e.target.value as 'Phone' | 'Email' | 'Other')}
                            className="form-control w-full py-4 px-6 text-lg text-center"
                          >
                            <option value="">Select preferred contact method</option>
                            <option value="Phone">Phone</option>
                            <option value="Email">Email</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg text-center">
                            {user.preferredContact || 'No preference specified'}
                          </div>
                        )}
                      </div>

                      {/* Preferred Phone Number */}
                      <div className="space-y-4">
                        <label className="block text-lg text-neutral-300 font-medium text-center">Preferred Phone Number</label>
                        {aboutMeEditMode ? (
                          <input
                            type="tel"
                            value={editedPreferredPhoneNumber}
                            onChange={(e) => setEditedPreferredPhoneNumber(e.target.value)}
                            className="form-control w-full py-4 px-6 text-lg text-center"
                            placeholder="Enter your preferred phone number"
                          />
                        ) : (
                          <div className="py-4 px-6 bg-neutral-900/50 border border-neutral-600 text-white text-lg text-center">
                            {user.preferredPhoneNumber || 'No preferred phone number provided'}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* About Me Edit Buttons */}
                  <div className="flex justify-center space-x-4 pt-6">
                    {aboutMeEditMode ? (
                      <>
                        <button
                          onClick={handleSaveAboutMe}
                          className="btn-success px-8 py-3 font-medium hover-lift"
                        >
                          Save About Me
                        </button>
                        <button
                          onClick={() => {
                            setAboutMeEditMode(false);
                            setEditedProfilePicture(user.profilePicture || '');
                            setEditedBio(user.bio || '');
                            setEditedPreferredContact(user.preferredContact || '');
                            setEditedPreferredPhoneNumber(user.preferredPhoneNumber || '');
                            setEditedLocation(user.location || '');
                            setEditedPhone(user.phone || '');
                            setEditedContactInfoVisible(user.contactInfoVisible ?? true);
                            setSelectedProfileFile(null);
                            setProfilePreviewUrl('');
                          }}
                          className="glass px-8 py-3 font-medium text-white hover-lift border border-neutral-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setAboutMeEditMode(true)}
                        className="btn-primary px-8 py-3 font-medium hover-lift"
                      >
                        Edit About Me
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          {/* Activity Statistics */}
          {stats && (
            <div className="glass p-16">
              <h2 className="text-2xl text-white font-medium mb-10 text-center">Activity Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="metric-card p-8 text-center">
                  <div className="text-4xl font-bold text-gold mb-4 font-mono">{stats.listingsCreated}</div>
                  <div className="text-neutral-400 text-lg">Listings Created</div>
                </div>

                <div className="metric-card p-8 text-center">
                  <div className="text-4xl font-bold text-gold mb-4 font-mono">{stats.ndasRequested}</div>
                  <div className="text-neutral-400 text-lg">NDAs Requested</div>
                </div>

                <div className="metric-card p-8 text-center">
                  <div className="text-4xl font-bold text-gold mb-4 font-mono">{stats.ndasReceived}</div>
                  <div className="text-neutral-400 text-lg">NDAs Received</div>
                </div>

                <div className="metric-card p-8 text-center">
                  <div className="text-4xl font-bold text-gold mb-4 font-mono">{stats.messagesExchanged}</div>
                  <div className="text-neutral-400 text-lg">Messages Sent</div>
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
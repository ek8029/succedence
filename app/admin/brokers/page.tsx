'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
import { BrokerProfile } from '@/lib/types';

interface BrokerWithUser extends BrokerProfile {
  users?: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
}

interface BrokerFormData {
  userId: string;
  displayName: string;
  headshotUrl: string;
  bio: string;
  phone: string;
  email: string;
  company: string;
  licenseNumber: string;
  workAreas: string[];
  specialties: string[];
  yearsExperience: number;
  websiteUrl: string;
  linkedinUrl: string;
  isPublic: string;
}

// Broker form component - moved outside to prevent re-render issues
function BrokerForm({
  formData,
  setFormData,
  users,
  selectedBroker,
  onSubmit,
  onCancel,
  submitLabel
}: {
  formData: BrokerFormData;
  setFormData: React.Dispatch<React.SetStateAction<BrokerFormData>>;
  users: any[];
  selectedBroker: BrokerWithUser | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!selectedBroker && (
        <div>
          <label className="form-label">Link to User Account (Optional)</label>
          <select
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            className="form-control w-full"
          >
            <option value="">No user account - standalone broker</option>
            {users.filter(u => u.role !== 'broker').map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <p className="text-xs text-neutral-400 mt-1">
            Only link if this broker has a user account on the platform
          </p>
        </div>
      )}

      <div>
        <label className="form-label">Display Name *</label>
        <input
          type="text"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          className="form-control w-full"
          required
        />
      </div>

      <div>
        <label className="form-label">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="form-control w-full"
          required
        />
      </div>

      <div>
        <label className="form-label">Phone *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="form-control w-full"
          required
        />
      </div>

      <div>
        <label className="form-label">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="form-control w-full"
          rows={4}
        />
      </div>

      <div>
        <label className="form-label">Company</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="form-control w-full"
        />
      </div>

      <div>
        <label className="form-label">License Number</label>
        <input
          type="text"
          value={formData.licenseNumber}
          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          className="form-control w-full"
        />
      </div>

      <div>
        <label className="form-label">Years of Experience</label>
        <input
          type="number"
          value={formData.yearsExperience}
          onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
          className="form-control w-full"
          min="0"
        />
      </div>

      <div>
        <label className="form-label">Work Areas (comma-separated)</label>
        <input
          type="text"
          value={formData.workAreas.join(', ')}
          onChange={(e) => setFormData({ ...formData, workAreas: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
          className="form-control w-full"
          placeholder="e.g., California, Nevada, Arizona"
        />
      </div>

      <div>
        <label className="form-label">Specialties (comma-separated)</label>
        <input
          type="text"
          value={formData.specialties.join(', ')}
          onChange={(e) => setFormData({ ...formData, specialties: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
          className="form-control w-full"
          placeholder="e.g., Restaurants, Retail, Healthcare"
        />
      </div>

      <div>
        <label className="form-label">Website URL</label>
        <input
          type="url"
          value={formData.websiteUrl}
          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
          className="form-control w-full"
        />
      </div>

      <div>
        <label className="form-label">LinkedIn URL</label>
        <input
          type="url"
          value={formData.linkedinUrl}
          onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
          className="form-control w-full"
        />
      </div>

      <div>
        <label className="form-label">Headshot URL</label>
        <input
          type="url"
          value={formData.headshotUrl}
          onChange={(e) => setFormData({ ...formData, headshotUrl: e.target.value })}
          className="form-control w-full"
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublic === 'true'}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked ? 'true' : 'false' })}
            className="form-checkbox"
          />
          <span className="text-white">Public Profile (visible to all users)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-6 border-t border-neutral-700 mt-6">
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium bg-gold hover:bg-gold-light text-midnight border border-gold rounded transition-all"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 rounded transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function BrokerManagementContent() {
  const [brokers, setBrokers] = useState<BrokerWithUser[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<BrokerWithUser | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    displayName: '',
    headshotUrl: '',
    bio: '',
    phone: '',
    email: '',
    company: '',
    licenseNumber: '',
    workAreas: [] as string[],
    specialties: [] as string[],
    yearsExperience: 0,
    websiteUrl: '',
    linkedinUrl: '',
    isPublic: 'true',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brokersRes, usersRes] = await Promise.all([
        fetch('/api/admin/brokers'),
        fetch('/api/admin/users'),
      ]);

      const brokersData = await brokersRes.json();
      const usersData = await usersRes.json();

      setBrokers(brokersData.brokers || []);
      setUsers(usersData.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      displayName: '',
      headshotUrl: '',
      bio: '',
      phone: '',
      email: '',
      company: '',
      licenseNumber: '',
      workAreas: [],
      specialties: [],
      yearsExperience: 0,
      websiteUrl: '',
      linkedinUrl: '',
      isPublic: 'true',
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/brokers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Broker profile created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchData();
      } else {
        alert(data.error || 'Failed to create broker profile');
      }
    } catch (error) {
      console.error('Error creating broker:', error);
      alert('Failed to create broker profile');
    }
  };

  const handleEdit = (broker: BrokerWithUser) => {
    setSelectedBroker(broker);
    setFormData({
      userId: broker.userId,
      displayName: broker.displayName,
      headshotUrl: broker.headshotUrl || '',
      bio: broker.bio || '',
      phone: broker.phone || '',
      email: broker.email || '',
      company: broker.company || '',
      licenseNumber: broker.licenseNumber || '',
      workAreas: broker.workAreas || [],
      specialties: broker.specialties || [],
      yearsExperience: broker.yearsExperience || 0,
      websiteUrl: broker.websiteUrl || '',
      linkedinUrl: broker.linkedinUrl || '',
      isPublic: broker.isPublic || 'true',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBroker) return;

    try {
      const response = await fetch(`/api/admin/brokers/${selectedBroker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Broker profile updated successfully!');
        setShowEditModal(false);
        setSelectedBroker(null);
        resetForm();
        fetchData();
      } else {
        alert(data.error || 'Failed to update broker profile');
      }
    } catch (error) {
      console.error('Error updating broker:', error);
      alert('Failed to update broker profile');
    }
  };

  const handleDelete = async (broker: BrokerWithUser) => {
    if (!confirm(`Are you sure you want to delete broker profile for "${broker.displayName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/brokers/${broker.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Broker profile deleted successfully!');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete broker profile');
      }
    } catch (error) {
      console.error('Error deleting broker:', error);
      alert('Failed to delete broker profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading broker profiles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional page-content-large">
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-32">
            <h1 className="text-heading text-white font-medium mb-6">Broker Management</h1>
            <p className="text-xl text-neutral-400 leading-relaxed mb-12">Create and manage broker profiles</p>
            <div className="flex gap-4 justify-center items-center">
              <Link href="/admin" className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 rounded transition-all">
                Back to Dashboard
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-gold hover:bg-gold-light text-midnight border border-gold rounded transition-all"
              >
                Create New Broker
              </button>
            </div>
          </div>
        </ScrollAnimation>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen flex items-start justify-center p-4">
              <div className="glass p-8 border border-gold/30 rounded-luxury max-w-2xl w-full my-8 relative">
                <h3 className="text-xl text-white font-medium mb-6">Create Broker Profile</h3>
                <BrokerForm
                  formData={formData}
                  setFormData={setFormData}
                  users={users}
                  selectedBroker={null}
                  onSubmit={handleCreate}
                  onCancel={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  submitLabel="Create Broker"
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedBroker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="min-h-screen flex items-start justify-center p-4">
              <div className="glass p-8 border border-gold/30 rounded-luxury max-w-2xl w-full my-8 relative">
                <h3 className="text-xl text-white font-medium mb-6">Edit Broker Profile</h3>
                <BrokerForm
                  formData={formData}
                  setFormData={setFormData}
                  users={users}
                  selectedBroker={selectedBroker}
                  onSubmit={handleUpdate}
                  onCancel={() => {
                    setShowEditModal(false);
                    setSelectedBroker(null);
                    resetForm();
                  }}
                  submitLabel="Update Broker"
                />
              </div>
            </div>
          </div>
        )}

        {/* Brokers List */}
        <ScrollAnimation direction="up" delay={50}>
          <div className="max-w-6xl mx-auto">
            <div className="glass p-8 border border-gold/30 rounded-luxury">
              {brokers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-400 text-lg mb-6">No broker profiles yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium bg-gold hover:bg-gold-light text-midnight border border-gold rounded transition-all"
                  >
                    Create First Broker
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {brokers.map((broker) => (
                    <div key={broker.id} className="glass p-6 border border-gold/20 rounded-lg flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {broker.headshotUrl ? (
                            <Image
                              src={broker.headshotUrl}
                              alt={broker.displayName}
                              width={64}
                              height={64}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl text-neutral-500">{broker.displayName.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 truncate">{broker.displayName}</h3>
                          <p className="text-sm text-neutral-400 truncate">{broker.users?.email || 'No email'}</p>
                          <p className="text-sm text-neutral-300 truncate">{broker.company || 'No company'}</p>
                        </div>
                      </div>

                      <div className="space-y-2 flex-1">
                        {broker.yearsExperience && broker.yearsExperience > 0 && (
                          <p className="text-xs text-neutral-400">{broker.yearsExperience} years experience</p>
                        )}
                        {broker.workAreas && broker.workAreas.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {broker.workAreas.slice(0, 3).map((area, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-gold/20 text-gold rounded">
                                {area}
                              </span>
                            ))}
                            {broker.workAreas.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-300 rounded">
                                +{broker.workAreas.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gold/10 items-center">
                        <button
                          onClick={() => handleEdit(broker)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(broker)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white border border-red-600 rounded transition-all"
                        >
                          Delete
                        </button>
                        {broker.isPublic === 'true' && (
                          <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-green-600/20 text-green-200 border border-green-400/30 rounded ml-auto">
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollAnimation>
      </div>
      <Footer />
    </div>
  );
}

export default function BrokerManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <BrokerManagementContent />
    </ProtectedRoute>
  );
}

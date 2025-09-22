'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DraftListing {
  id: string;
  title: string;
  industry: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function MyDrafts() {
  const [drafts, setDrafts] = useState<DraftListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/listings?status=draft&my_listings=true');

      if (!response.ok) {
        throw new Error('Failed to fetch drafts');
      }

      const data = await response.json();
      setDrafts(data.listings || []);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${draftId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDrafts(drafts.filter(draft => draft.id !== draftId));
        showNotification('Draft deleted successfully', 'success');
      } else {
        throw new Error('Failed to delete draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      showNotification('Failed to delete draft', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 text-white px-6 py-4 slide-up ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  if (loading) {
    return (
      <div className="glass p-8 border border-gold/30 rounded-luxury">
        <h3 className="text-xl font-medium text-white mb-4">My Drafts</h3>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-neutral-700 rounded mb-2"></div>
              <div className="h-3 bg-neutral-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-8 border border-gold/30 rounded-luxury">
        <h3 className="text-xl font-medium text-white mb-4">My Drafts</h3>
        <div className="text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-8 border border-gold/30 rounded-luxury">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-white">My Drafts</h3>
        <Link
          href="/listings/new"
          className="btn-primary px-4 py-2 text-sm font-medium hover-lift"
        >
          Create New Listing
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-neutral-400 mb-4">
            No drafts found
          </div>
          <p className="text-sm text-neutral-500 mb-6">
            Start creating your first business listing to see drafts here
          </p>
          <Link
            href="/listings/new"
            className="btn-primary px-6 py-3 font-medium hover-lift"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="border border-neutral-700 rounded-lg p-4 hover:border-gold/40 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">
                    {draft.title || 'Untitled Draft'}
                  </h4>
                  <div className="text-sm text-neutral-400">
                    {draft.industry && (
                      <span className="inline-block bg-neutral-800 px-2 py-1 rounded text-xs mr-2">
                        {draft.industry}
                      </span>
                    )}
                    <span className="status-badge status-pending">
                      {draft.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-neutral-500 mb-4">
                Created: {new Date(draft.created_at).toLocaleDateString()}
                {draft.updated_at !== draft.created_at && (
                  <> • Last saved: {new Date(draft.updated_at).toLocaleDateString()}</>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="space-x-3">
                  <Link
                    href={`/listings/${draft.id}/edit`}
                    className="text-gold hover:text-gold-light font-medium transition-colors text-sm"
                  >
                    Continue Editing →
                  </Link>
                </div>

                <button
                  onClick={() => deleteDraft(draft.id)}
                  className="text-red-400 hover:text-red-300 font-medium transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {drafts.length > 0 && (
            <div className="text-center pt-4">
              <p className="text-sm text-neutral-500">
                Drafts are automatically saved as you type. Complete and submit them for review when ready.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
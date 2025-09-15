'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Listing, NDARequest, Message, User } from '@/lib/types';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [ndas, setNdas] = useState<NDARequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyerName, setBuyerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showDealCompleteModal, setShowDealCompleteModal] = useState(false);
  const [dealCompleteData, setDealCompleteData] = useState({
    buyerName: '',
    finalPrice: '',
    completionDate: '',
    testimonial: '',
    allowPublicSharing: false
  });
  const [completingDeal, setCompletingDeal] = useState(false);

  const listingId = params.id as string;

  const fetchListingData = useCallback(async () => {
    try {
      // Fetch listing details
      const listingsResponse = await fetch('/api/listings');
      const listings: Listing[] = await listingsResponse.json();
      const foundListing = listings.find(l => l.id === listingId);
      
      if (foundListing) {
        setListing(foundListing);
      } else {
        router.push('/browse');
        return;
      }

      // Fetch NDAs for this listing
      const ndasResponse = await fetch('/api/ndas');
      const allNdas: NDARequest[] = await ndasResponse.json();
      const listingNdas = allNdas.filter(nda => nda.listingId === listingId);
      setNdas(listingNdas);

      // Fetch messages for this listing
      const messagesResponse = await fetch(`/api/messages?listingId=${listingId}`);
      const listingMessages: Message[] = await messagesResponse.json();
      setMessages(listingMessages);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching listing data:', error);
      setLoading(false);
    }
  }, [listingId, router]);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('dealsense_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchListingData();
  }, [fetchListingData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNDASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !user) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/ndas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          buyerName: buyerName.trim(),
        }),
      });

      if (response.ok) {
        const newNDA = await response.json();
        setNdas([...ndas, newNDA]);
        setBuyerName('');
        alert('NDA request submitted successfully');
      } else {
        alert('Failed to submit NDA request');
      }
    } catch (error) {
      console.error('Error submitting NDA:', error);
      alert('Failed to submit NDA request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNDAStatusUpdate = async (ndaId: string, action: 'approve' | 'deny') => {
    try {
      const response = await fetch(`/api/ndas/${ndaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const updatedNDA = await response.json();
        setNdas(ndas.map(nda => nda.id === ndaId ? updatedNDA : nda));
        alert(`NDA ${action}d successfully`);
      } else {
        alert(`Failed to ${action} NDA`);
      }
    } catch (error) {
      console.error(`Error ${action}ing NDA:`, error);
      alert(`Failed to ${action} NDA`);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSendingMessage(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          from: user.name,
          body: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages([...messages, newMsg]);
        setNewMessage('');
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDealComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealCompleteData.buyerName.trim() || !dealCompleteData.finalPrice.trim()) return;

    setCompletingDeal(true);
    try {
      // Simulate API call to mark deal as completed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message and offer to share story
      alert('Deal marked as completed successfully!');

      if (dealCompleteData.allowPublicSharing && dealCompleteData.testimonial.trim()) {
        // Prompt to share success story
        const shareStory = confirm('Would you like to share your success story publicly to inspire other users?');
        if (shareStory) {
          // Navigate to success story sharing
          alert('Thank you! Your success story will be reviewed and added to our Success Stories page.');
        }
      }

      setShowDealCompleteModal(false);
      // Optionally refresh the listing data or update the UI
    } catch (error) {
      alert('Failed to mark deal as completed. Please try again.');
    } finally {
      setCompletingDeal(false);
    }
  };

  const hasApprovedNDA = ndas.some(nda => nda.status === 'APPROVED');
  const isOwner = user && listing && user.name === listing.owner;
  const canRequestNDA = user && user.role === 'BUYER' && !ndas.some(nda => nda.buyerName === user.name);
  const canMessage = hasApprovedNDA || isOwner;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading business details...</div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Listing Not Found</h1>
          <Link href="/browse" className="btn-primary px-8 py-3 font-medium hover-lift">
            Return to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <Link href="/browse" className="glass px-8 py-3 font-medium text-white hover-lift transition-all border border-neutral-600 inline-block mb-12">
            ← Browse Opportunities
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Business Overview */}
          <div className="glass p-16">
            <div className="flex flex-wrap gap-4 mb-10">
              <span className={`status-badge ${listing.lane === 'MAIN' ? 'status-main' : 'status-starter'}`}>
                {listing.lane}
              </span>
              <span className="status-badge bg-neutral-800 text-neutral-300 font-medium">
                {listing.industry}
              </span>
            </div>

            <h1 className="text-heading text-white font-medium mb-8">
              {listing.title}
            </h1>

            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl text-white font-medium mb-6">Business Description</h2>
                  <p className="text-neutral-400 text-lg leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl text-white font-medium mb-6">Financial Overview</h2>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-neutral-600">
                      <span className="text-neutral-400 font-medium">Contact</span>
                      <span className="text-white font-semibold">{listing.owner}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-neutral-600">
                      <span className="text-neutral-400 font-medium">Annual Revenue</span>
                      <span className="text-white font-bold text-financial text-xl">{formatCurrency(listing.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-neutral-600">
                      <span className="text-neutral-400 font-medium">Valuation Range</span>
                      <span className="text-white font-bold text-financial text-xl">
                        {formatCurrency(listing.valuationLow)} — {formatCurrency(listing.valuationHigh)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {hasApprovedNDA && (
              <div className="mt-16 p-12 border border-neutral-600 bg-neutral-900/50">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-neutral-800 border border-neutral-600 flex items-center justify-center mx-auto mb-6" style={{backgroundColor: 'var(--accent)', borderColor: 'var(--accent)'}}>
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl text-white font-medium mb-4">Confidential Data Room</h3>
                  <p className="text-neutral-400 text-lg">
                    You have authorized access to detailed financial statements, projections, and proprietary business information.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* NDA Management */}
          {user && (
            <div className="glass p-16">
              <h2 className="text-2xl text-white font-medium mb-10">Due Diligence Access</h2>
              
              {canRequestNDA && (
                <div className="mb-12 p-8 bg-neutral-900/50 border border-neutral-600">
                  <h3 className="text-xl text-white font-medium mb-6">Request Access to Confidential Information</h3>
                  <form onSubmit={handleNDASubmit} className="space-y-6">
                    <div>
                      <label htmlFor="buyerName" className="block text-lg text-neutral-300 font-medium mb-4">
                        Your Company/Organization Name
                      </label>
                      <input
                        type="text"
                        id="buyerName"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="form-control w-full py-4 px-6 text-lg"
                        placeholder="Enter your company name"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={submitting || !buyerName.trim()}
                      className="btn-primary px-12 py-4 text-lg font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting Request...' : 'Request NDA Access'}
                    </button>
                  </form>
                </div>
              )}

              {ndas.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl text-white font-medium">Access Requests</h3>
                  {ndas.map((nda) => (
                    <div key={nda.id} className="p-6 bg-neutral-900/50 border border-neutral-600 flex justify-between items-center">
                      <div>
                        <span className="text-white font-semibold text-lg">{nda.buyerName}</span>
                        <div className="mt-2">
                          <span className={`status-badge ${
                            nda.status === 'APPROVED' ? 'status-approved' :
                            nda.status === 'REJECTED' ? 'status-rejected' : 'status-pending'
                          }`}>
                            {nda.status}
                          </span>
                        </div>
                      </div>
                      
                      {isOwner && nda.status === 'REQUESTED' && (
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleNDAStatusUpdate(nda.id, 'approve')}
                            className="btn-success px-6 py-3 font-medium hover-lift"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleNDAStatusUpdate(nda.id, 'deny')}
                            className="glass px-6 py-3 font-medium text-white hover-lift border border-neutral-600"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Deal Completion Section for Owner */}
              {isOwner && (
                <div className="mt-12 p-8 border-t border-gold/30">
                  <div className="text-center">
                    <h3 className="text-xl text-white font-medium mb-4">Deal Management</h3>
                    <p className="text-neutral-400 mb-6">Have you completed a transaction for this listing?</p>
                    <button
                      onClick={() => setShowDealCompleteModal(true)}
                      className="btn-success px-8 py-3 font-medium hover-lift"
                    >
                      Mark Deal as Completed
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deal Complete Modal */}
          {showDealCompleteModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="glass p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto tier-premium">
                <div className="text-center mb-8">
                  <h2 className="text-3xl text-white font-medium mb-4">Congratulations on Your Deal!</h2>
                  <p className="text-neutral-400 text-lg">Please provide details about your completed transaction.</p>
                </div>

                <form onSubmit={handleDealComplete} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Buyer Name/Company</label>
                      <input
                        type="text"
                        value={dealCompleteData.buyerName}
                        onChange={(e) => setDealCompleteData(prev => ({...prev, buyerName: e.target.value}))}
                        className="form-control w-full"
                        placeholder="Enter buyer's name or company"
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label">Final Sale Price</label>
                      <input
                        type="text"
                        value={dealCompleteData.finalPrice}
                        onChange={(e) => setDealCompleteData(prev => ({...prev, finalPrice: e.target.value}))}
                        className="form-control w-full"
                        placeholder="e.g., $1,250,000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Completion Date</label>
                    <input
                      type="date"
                      value={dealCompleteData.completionDate}
                      onChange={(e) => setDealCompleteData(prev => ({...prev, completionDate: e.target.value}))}
                      className="form-control w-full"
                    />
                  </div>

                  <div>
                    <label className="form-label">Share Your Experience (Optional)</label>
                    <textarea
                      value={dealCompleteData.testimonial}
                      onChange={(e) => setDealCompleteData(prev => ({...prev, testimonial: e.target.value}))}
                      rows={4}
                      className="form-control w-full"
                      placeholder="How was your experience using DealSense? This could be featured in our Success Stories..."
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="allowSharing"
                      checked={dealCompleteData.allowPublicSharing}
                      onChange={(e) => setDealCompleteData(prev => ({...prev, allowPublicSharing: e.target.checked}))}
                      className="w-5 h-5"
                    />
                    <label htmlFor="allowSharing" className="text-neutral-300 font-medium">
                      Allow DealSense to feature this success story publicly (with your permission for final review)
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <button
                      type="button"
                      onClick={() => setShowDealCompleteModal(false)}
                      className="glass px-8 py-3 font-medium text-white hover-lift border border-neutral-600"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={completingDeal}
                      className="btn-primary px-12 py-3 font-medium hover-lift disabled:opacity-50"
                    >
                      {completingDeal ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Completing...</span>
                        </div>
                      ) : (
                        'Complete Deal'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Messaging */}
          {user && canMessage && (
            <div className="glass p-16">
              <h2 className="text-2xl text-white font-medium mb-10">Private Communications</h2>
              
              <div className="mb-12 max-h-96 overflow-y-auto space-y-6">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className="p-8 bg-neutral-900/50 border border-neutral-600">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-white font-semibold text-lg">{message.from}</span>
                        <span className="text-neutral-400 text-sm">{formatDate(message.timestamp)}</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed text-lg">{message.body}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-neutral-400">
                    <p className="text-lg">No messages yet. Begin the conversation.</p>
                  </div>
                )}
              </div>

              <form onSubmit={handleMessageSubmit} className="space-y-6">
                <div>
                  <label className="block text-lg text-neutral-300 font-medium mb-4">
                    Compose Message
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    className="form-control w-full py-4 px-6 text-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="btn-primary px-12 py-4 text-lg font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          )}

          {!user && (
            <div className="glass p-16 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl text-white font-medium mb-6">Authentication Required</h3>
                <p className="text-xl text-neutral-400 mb-10 leading-relaxed">
                  Please authenticate to access detailed business information, request due diligence materials, and communicate with the listing owner.
                </p>
                <Link href="/auth" className="btn-primary px-12 py-4 text-lg font-medium hover-lift">
                  Authenticate Access
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
import { Listing } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';


interface Message {
  id: string;
  listingId: string;
  from: string;
  body: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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
  const [activeAccordion, setActiveAccordion] = useState<string | null>('overview');

  const listingId = params.id as string;

  const fetchListingData = useCallback(async () => {
    try {
      // Fetch listing details
      const listingsResponse = await fetch('/api/listings');
      const listingsData = await listingsResponse.json();
      const listings: Listing[] = listingsData.listings || listingsData;
      const foundListing = listings.find(l => l.id === listingId);
      
      if (foundListing) {
        setListing(foundListing);
      } else {
        router.push('/browse');
        return;
      }


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
    fetchListingData();
  }, [fetchListingData]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
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

  const isOwner = user && listing && user.id === listing.ownerUserId;
  const canMessage = user && (user.role === 'buyer' || isOwner);

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const AccordionSection = ({ id, title, children, defaultOpen = false }: {
    id: string;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const isOpen = activeAccordion === id;
    return (
      <div className="glass overflow-hidden">
        <button
          onClick={() => toggleAccordion(id)}
          className="w-full p-6 flex justify-between items-center text-left hover:bg-neutral-800/30 transition-colors"
        >
          <h2 className="text-2xl text-white font-medium">{title}</h2>
          <svg
            className={`w-6 h-6 text-neutral-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <div className="px-6 pb-6">
            {children}
          </div>
        )}
      </div>
    );
  };

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
      <div className="container-professional pb-16 page-content">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="mb-16 text-center">
            <Link href="/browse" className="glass px-8 py-3 font-medium text-white hover-lift transition-all border border-neutral-600 inline-block mb-12">
              ← Browse Opportunities
            </Link>
          </div>
        </ScrollAnimation>

        {/* Main Content */}
        <ScrollAnimation direction="up" delay={50}>
          <div className="max-w-6xl mx-auto space-y-8">

            {/* Hero Section with Primary CTA */}
            <div className="glass p-16">
              <div className="flex flex-wrap gap-4 mb-10">
                <span className={`status-badge ${listing.status === 'active' ? 'status-main' : 'status-pending'}`}>
                  {listing.status}
                </span>
                <span className="status-badge bg-neutral-800 text-neutral-300 font-medium">
                  {listing.industry}
                </span>
              </div>

              <h1 className="text-heading text-white font-medium mb-8">
                {listing.title}
              </h1>

              <div className="grid lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                  <p className="text-neutral-400 text-lg leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-6 bg-neutral-900/50 border border-neutral-600">
                    <div className="text-3xl text-white font-bold mb-2">{formatCurrency(listing.revenue)}</div>
                    <div className="text-neutral-400">Annual Revenue</div>
                  </div>
                  <div className="text-center p-6 bg-neutral-900/50 border border-neutral-600">
                    <div className="text-2xl text-white font-bold mb-2">
                      {formatCurrency(listing.price)}
                    </div>
                    <div className="text-neutral-400">Valuation Range</div>
                  </div>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                {user && canMessage && (
                  <button
                    onClick={() => toggleAccordion('messages')}
                    className="glass px-8 py-4 text-lg font-medium text-white hover-lift border border-neutral-600"
                  >
                    View Messages
                  </button>
                )}
                {!user && (
                  <Link
                    href="/auth"
                    className="btn-primary px-8 py-4 text-lg font-medium hover-lift inline-block"
                  >
                    Authenticate to Access Details
                  </Link>
                )}
              </div>

              {hasApprovedNDA && (
                <div className="mt-12 p-8 border border-gold/30 bg-neutral-900/30">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gold flex items-center justify-center" style={{backgroundColor: 'var(--accent)'}}>
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl text-white font-medium">Confidential Data Room Access Granted</h3>
                      <p className="text-neutral-400">You can access detailed financial statements and proprietary information</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion Sections */}
            <AccordionSection id="overview" title="Business Overview & Financials">
              <div className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl text-white font-medium mb-4">Contact Information</h3>
                    <div className="p-4 bg-neutral-900/50 border border-neutral-600">
                      <span className="text-white font-semibold text-lg">{listing.source}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl text-white font-medium mb-4">Industry</h3>
                    <div className="p-4 bg-neutral-900/50 border border-neutral-600">
                      <span className="text-white font-semibold text-lg">{listing.industry}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl text-white font-medium mb-4">Detailed Financial Metrics</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-6 bg-neutral-900/50 border border-neutral-600">
                      <div className="text-neutral-400 font-medium mb-2">Annual Revenue</div>
                      <div className="text-white font-bold text-financial text-2xl">{formatCurrency(listing.revenue)}</div>
                    </div>
                    <div className="p-6 bg-neutral-900/50 border border-neutral-600">
                      <div className="text-neutral-400 font-medium mb-2">Valuation Range</div>
                      <div className="text-white font-bold text-financial text-2xl">
                        {formatCurrency(listing.price)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Deal Completion Section for Owner */}
            {user && isOwner && (
              <div className="glass p-8 border border-gold/30 rounded-luxury mb-8">
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
                      placeholder="How was your experience using Succedence? This could be featured in our Success Stories..."
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
                      Allow Succedence to feature this success story publicly (with your permission for final review)
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

            {/* Messaging Accordion */}
            {user && canMessage && (
              <AccordionSection id="messages" title="Private Communications">
                <div className="space-y-8">
                  <div className="max-h-80 overflow-y-auto space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div key={message.id} className="p-6 bg-neutral-900/50 border border-neutral-600">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-white font-semibold">{message.from}</span>
                            <span className="text-neutral-400 text-sm">{formatDate(message.timestamp)}</span>
                          </div>
                          <p className="text-neutral-300 leading-relaxed">{message.body}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-neutral-400">
                        <p>No messages yet. Begin the conversation.</p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleMessageSubmit} className="space-y-4">
                    <div>
                      <label className="block text-lg text-neutral-300 font-medium mb-3">
                        Compose Message
                      </label>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={4}
                        className="form-control w-full py-4 px-6"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={sendingMessage || !newMessage.trim()}
                      className="btn-primary px-8 py-3 font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMessage ? 'Sending Message...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </AccordionSection>
            )}

          </div>
        </ScrollAnimation>
      </div>
      <Footer />
    </div>
  );
}
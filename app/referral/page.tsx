'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollAnimation from '@/components/ScrollAnimation';
import { showNotification } from '@/components/Notification';
import Footer from '@/components/Footer';

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  referralCode: string;
}

function ReferralPageContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchReferralStats = async () => {
      try {
        const response = await fetch('/api/referral/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching referral stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, [user]);

  const getReferralLink = () => {
    if (!stats?.referralCode) return '';
    return `${window.location.origin}/auth?ref=${stats.referralCode}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      showNotification('Referral link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      showNotification('Failed to copy link', 'error');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me on Succedence - Business Acquisition Platform');
    const body = encodeURIComponent(
      `I've been using Succedence to find business acquisition opportunities, and I think you'd find it valuable too.\n\nSign up using my referral link and we both get access to premium features:\n${getReferralLink()}\n\nSuccedence makes it easy to discover, analyze, and acquire businesses with AI-powered insights.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaLinkedIn = () => {
    const url = encodeURIComponent(getReferralLink());
    const text = encodeURIComponent('Check out Succedence - the smartest way to find and acquire businesses. Join me and get exclusive access!');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareViaTwitter = () => {
    const url = encodeURIComponent(getReferralLink());
    const text = encodeURIComponent('Just found an amazing platform for business acquisitions! Join me on Succedence:');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading referral info...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Authentication Required</h1>
          <Link href="/login" className="btn-primary px-8 py-3 font-medium hover-lift">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="container-professional pb-16 page-content flex-grow">
          {/* Header */}
          <ScrollAnimation direction="fade">
            <div className="text-center mb-16">
              <h1 className="text-4xl lg:text-5xl text-white font-medium mb-6 font-serif">
                Refer Friends & Earn Rewards
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Share Succedence with your network and unlock exclusive benefits when they sign up
              </p>
              <div className="mt-8">
                <Link href="/" className="text-gold hover:text-warm-white transition-colors font-medium">
                  ← Return Home
                </Link>
              </div>
            </div>
          </ScrollAnimation>

          {/* Referral Link Card */}
          <ScrollAnimation direction="up" delay={50}>
            <div className="max-w-4xl mx-auto mb-16">
              <div className="glass p-8 border-2 border-gold/30 rounded-luxury-lg">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">Your Unique Referral Link</h2>

                <div className="bg-charcoal/50 border border-gold/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={getReferralLink()}
                      readOnly
                      className="flex-1 bg-transparent text-white font-mono text-sm outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-6 py-3 bg-gold text-midnight font-semibold rounded-lg hover:bg-gold/90 transition-all flex items-center gap-2 min-h-[48px]"
                    >
                      {copied ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-neutral-400 text-sm mb-4">Share via</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={shareViaEmail}
                      className="px-6 py-3 glass-border text-white font-medium rounded-lg hover:border-gold/50 transition-all flex items-center gap-2 min-h-[48px]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </button>
                    <button
                      onClick={shareViaLinkedIn}
                      className="px-6 py-3 glass-border text-white font-medium rounded-lg hover:border-gold/50 transition-all flex items-center gap-2 min-h-[48px]"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </button>
                    <button
                      onClick={shareViaTwitter}
                      className="px-6 py-3 glass-border text-white font-medium rounded-lg hover:border-gold/50 transition-all flex items-center gap-2 min-h-[48px]"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Stats Grid */}
          <ScrollAnimation direction="up" delay={100}>
            <div className="max-w-6xl mx-auto mb-16">
              <h2 className="text-2xl font-semibold text-white mb-8 text-center">Your Referral Stats</h2>
              <div className="grid md:grid-cols-3 gap-6 md:auto-rows-fr">
                <div className="glass p-8 border border-gold/20 rounded-luxury text-center flex flex-col h-full">
                  <div className="text-5xl font-bold text-gold mb-4">{stats?.totalReferrals || 0}</div>
                  <div className="text-lg text-white font-medium mb-2 h-[28px] flex items-center justify-center">Total Referrals</div>
                  <div className="text-sm text-neutral-400 flex-grow min-h-[40px] flex items-center justify-center">People who signed up with your link</div>
                </div>

                <div className="glass p-8 border border-gold/20 rounded-luxury text-center flex flex-col h-full">
                  <div className="text-5xl font-bold text-gold mb-4">{stats?.completedReferrals || 0}</div>
                  <div className="text-lg text-white font-medium mb-2 h-[28px] flex items-center justify-center">Active Referrals</div>
                  <div className="text-sm text-neutral-400 flex-grow min-h-[40px] flex items-center justify-center">Referrals who completed onboarding</div>
                </div>

                <div className="glass p-8 border border-gold/20 rounded-luxury text-center flex flex-col h-full">
                  <div className="text-5xl font-bold text-gold mb-4">{stats?.pendingReferrals || 0}</div>
                  <div className="text-lg text-white font-medium mb-2 h-[28px] flex items-center justify-center">Pending</div>
                  <div className="text-sm text-neutral-400 flex-grow min-h-[40px] flex items-center justify-center">Referrals still getting started</div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Benefits */}
          <ScrollAnimation direction="up" delay={150}>
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-2xl font-semibold text-white mb-8 text-center">Referral Benefits</h2>
              <div className="glass p-8 border border-gold/20 rounded-luxury">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Bonus AI Credits</h3>
                      <p className="text-neutral-400 text-sm">
                        Earn 5 bonus AI analysis credits for each friend who signs up and completes their profile
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Premium Features</h3>
                      <p className="text-neutral-400 text-sm">
                        Unlock exclusive features after 10 successful referrals, including priority matching and advanced filters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2">Build Your Network</h3>
                      <p className="text-neutral-400 text-sm">
                        Connect with like-minded business acquirers and expand your professional network
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-gold/5 border border-gold/20 rounded-lg">
                  <p className="text-sm text-neutral-300 text-center">
                    <strong className="text-gold">Pro Tip:</strong> Your referrals also get 3 free AI analyses when they sign up using your link!
                  </p>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* CTA */}
          <ScrollAnimation direction="up" delay={200}>
            <div className="max-w-2xl mx-auto text-center">
              <div className="glass p-8 border border-gold/20 rounded-luxury-lg">
                <h3 className="text-2xl font-semibold text-white mb-4">Start Referring Today</h3>
                <p className="text-neutral-400 mb-6">
                  The more you share, the more you earn. Help others discover smarter business acquisitions.
                </p>
                <button
                  onClick={copyToClipboard}
                  className="px-8 py-4 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all text-lg min-h-[48px]"
                >
                  Copy Referral Link
                </button>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ReferralPage() {
  return (
    <ProtectedRoute>
      <ReferralPageContent />
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ValuationForm } from '@/components/valuation/ValuationForm';
import { ValuationResults } from '@/components/valuation/ValuationResults';
import { FreeTierGate } from '@/components/valuation/FreeTierGate';
import { getAllIndustryOptions, ValuationInput, ValuationOutput, calculateValuation } from '@/lib/valuation';

// Email capture component shown inline with results
function EmailCaptureBar({
  valuation,
  businessName,
  anonymousId,
  isAuthenticated,
}: {
  valuation: ValuationOutput;
  businessName?: string;
  anonymousId: string;
  isAuthenticated: boolean;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Don't show for logged-in users (they already have an account)
  if (isAuthenticated) return null;

  const handleSend = async () => {
    if (!email || !email.includes('@')) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/valuation/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, valuation, businessName, anonymousId }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-luxury text-center">
        <p className="text-green-400 text-sm font-medium">Results sent! Check your inbox.</p>
        <p className="text-silver/60 text-xs mt-1">
          <Link href="/login" className="text-blue-400 hover:underline">Create a free account</Link>
          {' '}to save unlimited valuations and track over time.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-charcoal/40 border border-white/10 rounded-luxury">
      <p className="text-silver/80 text-sm font-medium mb-3 text-center">
        Email these results to yourself
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="your@email.com"
          className="flex-1 px-3 py-2 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/40 focus:border-gold/50 focus:outline-none text-sm"
        />
        <button
          onClick={handleSend}
          disabled={status === 'sending' || !email}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-luxury hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Sending…' : 'Send'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2 text-center">Failed to send. Try again.</p>
      )}
      <p className="text-silver/50 text-xs mt-2 text-center">
        Or{' '}
        <Link href="/login" className="text-gold hover:underline">
          create a free account
        </Link>
        {' '}to save results permanently.
      </p>
    </div>
  );
}

// Sample business used for demo valuation — computed once from the real engine
const SAMPLE_INPUT: ValuationInput = {
  industry: 'landscaping',
  businessName: 'Green Valley Landscaping',
  revenue: 350000,
  sde: 120000,
  employees: 7,
  yearEstablished: 2015,
  ownerHoursPerWeek: 45,
  city: 'Denver',
  state: 'CO',
  customerConcentration: 0.15,
  revenueGrowthTrend: 'stable',
  recurringRevenuePct: 0.35,
};

export default function ValuationPageClient() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'url' | 'manual' | 'listing'>('manual');
  const [valuation, setValuation] = useState<ValuationOutput | null>(null);
  const [valuationInput, setValuationInput] = useState<ValuationInput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canUseFree, setCanUseFree] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [isSampleValuation, setIsSampleValuation] = useState(false);

  // Parse initial values from URL query params (from listing pages)
  const initialValues = useMemo((): Partial<ValuationInput> => {
    const industry = searchParams.get('industry') || '';
    const revenue = searchParams.get('revenue');
    const ebitda = searchParams.get('ebitda');
    const cashFlow = searchParams.get('cashFlow');
    const price = searchParams.get('price');
    const employees = searchParams.get('employees');
    const yearEstablished = searchParams.get('yearEstablished');
    const ownerHours = searchParams.get('ownerHours');
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const businessName = searchParams.get('businessName') || '';

    return {
      industry,
      revenue: revenue ? parseInt(revenue) : undefined,
      ebitda: ebitda ? parseInt(ebitda) : undefined,
      cashFlow: cashFlow ? parseInt(cashFlow) : undefined,
      askingPrice: price ? parseInt(price) : undefined,
      employees: employees ? parseInt(employees) : undefined,
      yearEstablished: yearEstablished ? parseInt(yearEstablished) : undefined,
      ownerHoursPerWeek: ownerHours ? parseInt(ownerHours) : undefined,
      city,
      state,
      businessName,
    };
  }, [searchParams]);

  // Generate anonymous ID for free tier tracking
  const [anonymousId] = useState(() => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('succedence_anon_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('succedence_anon_id', id);
    }
    return id;
  });

  // Check free tier status on mount
  useEffect(() => {
    if (!user && anonymousId) {
      checkFreeTier();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, anonymousId]);

  const checkFreeTier = async () => {
    try {
      const res = await fetch('/api/valuation/check-free-tier', {
        headers: { 'x-anonymous-id': anonymousId },
      });
      const data = await res.json();
      setCanUseFree(data.canUse);
    } catch (err) {
      console.error('Free tier check failed:', err);
    }
  };

  const handleShowSample = () => {
    // Compute sample valuation using the real engine — no API call, instant
    const sampleResult = calculateValuation(SAMPLE_INPUT);
    setValuation(sampleResult);
    setValuationInput(SAMPLE_INPUT);
    setIsSampleValuation(true);
    setShowResults(true);
    setError(null);
  };

  const handleCalculate = async (
    input: ValuationInput,
    sourceType: 'url_parse' | 'manual_entry' | 'existing_listing',
    sourceUrl?: string,
  ) => {
    setIsCalculating(true);
    setError(null);
    setIsSampleValuation(false);

    try {
      const res = await fetch('/api/valuation/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          sourceUrl,
          input,
          anonymousId: !user ? anonymousId : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresSignup) {
          setCanUseFree(false);
          setError("You've used your free valuation. Sign up to continue!");
        } else {
          setError(data.error || 'Failed to calculate valuation');
        }
        return;
      }

      setValuation(data.valuation);
      setValuationInput(input);
      setShowResults(true);

      if (!user) {
        setCanUseFree(false);
      }
    } catch (err) {
      console.error('Valuation error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setValuation(null);
    setShowResults(false);
    setError(null);
    setIsSampleValuation(false);
  };

  const industryOptions = getAllIndustryOptions();

  return (
    <>
      {showResults && valuation ? (
        <div className="space-y-6">
          {/* Top bar */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-silver/80 hover:text-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Run Another Valuation
            </button>
            {!user && (
              <Link
                href="/login"
                className="px-4 py-2 bg-gold/20 text-gold border border-gold/30 rounded-luxury hover:bg-gold/30 transition-colors text-sm"
              >
                Sign Up to Save
              </Link>
            )}
          </div>

          {/* Email capture — shown for non-authenticated users after real (non-sample) valuations */}
          {!isSampleValuation && (
            <EmailCaptureBar
              valuation={valuation}
              businessName={valuationInput?.businessName}
              anonymousId={anonymousId}
              isAuthenticated={!!user}
            />
          )}

          {/* Sample valuation banner */}
          {isSampleValuation && (
            <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-luxury text-center">
              <p className="text-blue-400 text-sm font-medium mb-1">
                Example Valuation — Green Valley Landscaping (Hypothetical)
              </p>
              <p className="text-silver/70 text-xs">
                This is a sample showing what a real output looks like. Enter your own numbers above to get your valuation.
              </p>
            </div>
          )}

          <ValuationResults valuation={valuation} input={valuationInput || undefined} />
        </div>
      ) : (
        <>
          {/* Free tier gate */}
          {!user && !canUseFree ? (
            <FreeTierGate />
          ) : (
            <>
              {/* Tab Navigation */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex flex-wrap justify-center bg-charcoal/50 rounded-luxury p-1 border border-white/5 gap-0.5">
                  <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-3 sm:px-6 py-2.5 rounded-luxury text-sm font-medium transition-all ${
                      activeTab === 'manual'
                        ? 'bg-gold text-midnight'
                        : 'text-silver hover:text-warm-white'
                    }`}
                  >
                    Enter Details
                  </button>
                  <button
                    onClick={() => setActiveTab('url')}
                    className={`px-3 sm:px-6 py-2.5 rounded-luxury text-sm font-medium transition-all ${
                      activeTab === 'url'
                        ? 'bg-gold text-midnight'
                        : 'text-silver hover:text-warm-white'
                    }`}
                  >
                    Paste URL
                  </button>
                  {user && (
                    <button
                      onClick={() => setActiveTab('listing')}
                      className={`px-3 sm:px-6 py-2.5 rounded-luxury text-sm font-medium transition-all ${
                        activeTab === 'listing'
                          ? 'bg-gold text-midnight'
                          : 'text-silver hover:text-warm-white'
                      }`}
                    >
                      From Listing
                    </button>
                  )}
                </div>
              </div>

              {/* See example link */}
              <div className="text-center mb-6">
                <button
                  onClick={handleShowSample}
                  className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                >
                  See an example valuation first →
                </button>
              </div>

              {/* Error display */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-luxury text-red-400 text-center">
                  {error}
                </div>
              )}

              {/* Form */}
              <ValuationForm
                activeTab={activeTab}
                industryOptions={industryOptions}
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
                initialValues={initialValues}
              />

              {/* Info cards */}
              <div className="mt-12 grid md:grid-cols-3 gap-4 items-start">
                <div className="glass p-4 rounded-luxury border border-white/5 h-full">
                  <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-warm-white font-semibold mb-2">Industry Multiples</h3>
                  <p className="text-silver/70 text-sm">
                    50+ industry-specific multiples based on IBBA transaction data.
                  </p>
                </div>

                <div className="glass p-4 rounded-luxury border border-white/5 h-full">
                  <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-warm-white font-semibold mb-2">Risk Analysis</h3>
                  <p className="text-silver/70 text-sm">
                    Adjustments for concentration, owner dependency, trends, and more.
                  </p>
                </div>

                <div className="glass p-4 rounded-luxury border border-white/5 h-full">
                  <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-warm-white font-semibold mb-2">Deal Quality Score</h3>
                  <p className="text-silver/70 text-sm">
                    0-100 score for pricing, financials, and operational quality.
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

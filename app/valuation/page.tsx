'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ValuationForm } from '@/components/valuation/ValuationForm';
import { ValuationResults } from '@/components/valuation/ValuationResults';
import { FreeTierGate } from '@/components/valuation/FreeTierGate';
import { getAllIndustryOptions, ValuationInput, ValuationOutput } from '@/lib/valuation';
import Footer from '@/components/Footer';

// Wrapper component to handle Suspense boundary for useSearchParams
export default function ValuationPage() {
  return (
    <Suspense fallback={<ValuationPageLoading />}>
      <ValuationPageContent />
    </Suspense>
  );
}

function ValuationPageLoading() {
  return (
    <>
      <div className="min-h-screen bg-primary-gradient">
        <div className="container mx-auto px-4 pb-16 max-w-5xl page-content">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 bg-gold/10 border border-gold/30 text-gold rounded-full text-sm font-medium">
                AI-POWERED VALUATION
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-warm-white mb-4">
              Business Valuation Tool
            </h1>
            <p className="text-lg text-silver/80 max-w-2xl mx-auto">
              Loading...
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function ValuationPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'url' | 'manual' | 'listing'>('manual');
  const [valuation, setValuation] = useState<ValuationOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canUseFree, setCanUseFree] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Parse initial values from URL query params (from listing pages)
  const initialValues = useMemo((): Partial<ValuationInput> => {
    const industry = searchParams.get('industry') || '';
    const revenue = searchParams.get('revenue');
    const ebitda = searchParams.get('ebitda');
    const price = searchParams.get('price');
    const employees = searchParams.get('employees');
    const yearEstablished = searchParams.get('yearEstablished');
    const ownerHours = searchParams.get('ownerHours');

    return {
      industry,
      revenue: revenue ? parseInt(revenue) : undefined,
      ebitda: ebitda ? parseInt(ebitda) : undefined,
      askingPrice: price ? parseInt(price) : undefined,
      employees: employees ? parseInt(employees) : undefined,
      yearEstablished: yearEstablished ? parseInt(yearEstablished) : undefined,
      ownerHoursPerWeek: ownerHours ? parseInt(ownerHours) : undefined,
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
  }, [user, anonymousId]);

  const checkFreeTier = async () => {
    try {
      const res = await fetch('/api/valuation/check-free-tier', {
        headers: {
          'x-anonymous-id': anonymousId,
        },
      });
      const data = await res.json();
      setCanUseFree(data.canUse);
    } catch (err) {
      console.error('Free tier check failed:', err);
    }
  };

  const handleCalculate = async (input: ValuationInput, sourceType: 'url_parse' | 'manual_entry' | 'existing_listing', sourceUrl?: string) => {
    setIsCalculating(true);
    setError(null);

    try {
      const res = await fetch('/api/valuation/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          setError('You\'ve used your free valuation. Sign up to continue!');
        } else {
          setError(data.error || 'Failed to calculate valuation');
        }
        return;
      }

      setValuation(data.valuation);
      setShowResults(true);

      // Update free tier status
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
  };

  const industryOptions = getAllIndustryOptions();

  return (
    <>
      <div className="min-h-screen bg-primary-gradient">
        <div className="container mx-auto px-4 pb-16 max-w-5xl page-content">
          {/* Header */}
          <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 bg-gold/10 border border-gold/30 text-gold rounded-full text-sm font-medium">
              AI-POWERED VALUATION
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-warm-white mb-4">
            Business Valuation Tool
          </h1>
          <p className="text-lg text-silver/80 max-w-2xl mx-auto">
            Get an instant, data-driven valuation with industry-specific multiples, risk analysis, and deal quality scoring.
            {!user && canUseFree && (
              <span className="block mt-2 text-gold">
                Try one free valuation - no signup required!
              </span>
            )}
          </p>
        </div>

        {/* Show results or form */}
        {showResults && valuation ? (
          <div className="space-y-6">
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
                  className="px-4 py-2 bg-gold/20 text-gold border border-gold/30 rounded-luxury hover:bg-gold/30 transition-colors"
                >
                  Sign Up to Save
                </Link>
              )}
            </div>
            <ValuationResults valuation={valuation} />
          </div>
        ) : (
          <>
            {/* Free tier gate */}
            {!user && !canUseFree ? (
              <FreeTierGate />
            ) : (
              <>
                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                  <div className="inline-flex bg-charcoal/50 rounded-luxury p-1 border border-white/5">
                    <button
                      onClick={() => setActiveTab('manual')}
                      className={`px-6 py-2.5 rounded-luxury text-sm font-medium transition-all ${
                        activeTab === 'manual'
                          ? 'bg-gold text-midnight'
                          : 'text-silver hover:text-warm-white'
                      }`}
                    >
                      Enter Details
                    </button>
                    <button
                      onClick={() => setActiveTab('url')}
                      className={`px-6 py-2.5 rounded-luxury text-sm font-medium transition-all ${
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
                        className={`px-6 py-2.5 rounded-luxury text-sm font-medium transition-all ${
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

                {/* Info section */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                  <div className="glass p-6 rounded-luxury border border-white/5">
                    <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-warm-white font-semibold mb-2">Industry Multiples</h3>
                    <p className="text-silver/70 text-sm">
                      50+ industry-specific SDE and EBITDA multiples based on real transaction data.
                    </p>
                  </div>

                  <div className="glass p-6 rounded-luxury border border-white/5">
                    <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-warm-white font-semibold mb-2">Risk Analysis</h3>
                    <p className="text-silver/70 text-sm">
                      Automatic adjustments for customer concentration, owner dependency, and more.
                    </p>
                  </div>

                  <div className="glass p-6 rounded-luxury border border-white/5">
                    <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-warm-white font-semibold mb-2">Deal Quality Score</h3>
                    <p className="text-silver/70 text-sm">
                      0-100 score combining pricing, financials, operations, and documentation quality.
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
}

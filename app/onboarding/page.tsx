'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ScrollAnimation from '@/components/ScrollAnimation';

// Force dynamic rendering to avoid SSR issues with authentication
export const dynamic = 'force-dynamic';

type UserGoal = 'buyer' | 'seller' | 'broker';
type OnboardingStep = 'welcome' | 'goal' | 'buyer-preferences' | 'seller-profile' | 'broker-profile' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buyer preferences state
  const [buyerPreferences, setBuyerPreferences] = useState({
    industries: [] as string[],
    states: [] as string[],
    minRevenue: undefined as number | undefined,
    priceMax: undefined as number | undefined,
  });

  // Check if user has already completed onboarding
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const data = await response.json();
          // If user has preferences, they've likely completed onboarding
          if (data && (data.industries?.length > 0 || data.states?.length > 0)) {
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [user, router]);

  // Set initial goal based on user profile
  useEffect(() => {
    if (userProfile?.role) {
      setSelectedGoal(userProfile.role as UserGoal);
    }
  }, [userProfile]);

  const industryOptions = [
    'SaaS (Software as a Service)', 'Technology Services', 'E-commerce', 'Digital Marketing',
    'Professional Services', 'Medical & Dental Practices', 'HVAC Services', 'Plumbing Services',
    'Retail (Local/Traditional)', 'Food & Beverage', 'Manufacturing', 'Transportation & Logistics',
  ];

  const stateOptions = [
    'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois',
    'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'New Jersey', 'Virginia',
    'Washington', 'Arizona', 'Massachusetts', 'Tennessee', 'Indiana', 'Missouri',
  ];

  const handleWelcomeNext = () => {
    setCurrentStep('goal');
  };

  const handleGoalSelect = (goal: UserGoal) => {
    setSelectedGoal(goal);
  };

  const handleGoalNext = () => {
    if (!selectedGoal) return;

    if (selectedGoal === 'buyer') {
      setCurrentStep('buyer-preferences');
    } else if (selectedGoal === 'seller') {
      setCurrentStep('seller-profile');
    } else if (selectedGoal === 'broker') {
      setCurrentStep('broker-profile');
    }
  };

  const handleArrayToggle = (array: string[], value: string, setter: (val: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleBuyerPreferencesSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industries: buyerPreferences.industries,
          states: buyerPreferences.states,
          min_revenue: buyerPreferences.minRevenue,
          price_max: buyerPreferences.priceMax,
          alert_frequency: 'weekly',
        })
      });

      if (response.ok) {
        setCurrentStep('complete');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipToComplete = () => {
    setCurrentStep('complete');
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '';
    return value.toLocaleString('en-US');
  };

  const parseCurrency = (value: string) => {
    if (!value) return undefined;
    const cleanValue = value.replace(/[^\d]/g, '');
    const numValue = parseInt(cleanValue);
    return isNaN(numValue) ? undefined : numValue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Only redirect on client side
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Progress Bar */}
        <div className="w-full bg-neutral-800/50 h-1">
          <div
            className="h-1 bg-gold transition-all duration-500"
            style={{
              width: currentStep === 'welcome' ? '20%' :
                     currentStep === 'goal' ? '40%' :
                     currentStep === 'buyer-preferences' || currentStep === 'seller-profile' || currentStep === 'broker-profile' ? '70%' : '100%'
            }}
          ></div>
        </div>

        <div className="container-professional pb-16 page-content flex-grow flex items-center justify-center">
          <div className="w-full max-w-4xl">
            {/* Welcome Step */}
            {currentStep === 'welcome' && (
              <ScrollAnimation direction="fade">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>

                  <h1 className="text-4xl lg:text-5xl text-white font-medium mb-6 font-serif">
                    Welcome to Succedence
                  </h1>

                  <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-12">
                    Let's get you set up in just a few minutes. We'll customize your experience based on your goals and preferences.
                  </p>

                  <div className="grid md:grid-cols-3 gap-6 mb-12 md:auto-rows-fr">
                    <div className="glass p-6 rounded-luxury border border-gold/20 text-center flex flex-col h-full">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">Personalized</h3>
                      <p className="text-sm text-silver/80 flex-grow min-h-[60px] flex items-center justify-center">
                        Tailored to your specific acquisition criteria
                      </p>
                    </div>

                    <div className="glass p-6 rounded-luxury border border-gold/20 text-center flex flex-col h-full">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">AI-Powered</h3>
                      <p className="text-sm text-silver/80 flex-grow min-h-[60px] flex items-center justify-center">
                        Smart matching and instant business analysis
                      </p>
                    </div>

                    <div className="glass p-6 rounded-luxury border border-gold/20 text-center flex flex-col h-full">
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">Confidential</h3>
                      <p className="text-sm text-silver/80 flex-grow min-h-[60px] flex items-center justify-center">
                        Your information is secure and private
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleWelcomeNext}
                    className="px-8 py-4 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all min-h-[48px]"
                  >
                    Get Started →
                  </button>
                </div>
              </ScrollAnimation>
            )}

            {/* Goal Selection Step */}
            {currentStep === 'goal' && (
              <ScrollAnimation direction="fade">
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl text-white font-medium mb-4 font-serif">
                    What brings you to Succedence?
                  </h2>
                  <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                    Choose your primary goal to customize your experience
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8 md:auto-rows-fr">
                  <button
                    onClick={() => handleGoalSelect('buyer')}
                    className={`glass p-8 rounded-luxury-lg border-2 transition-all hover-lift text-left flex flex-col h-full ${
                      selectedGoal === 'buyer' ? 'border-gold bg-gold/10' : 'border-gold/20 hover:border-gold/50'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 flex-shrink-0">
                      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-warm-white mb-3 h-[32px] flex items-center">Buyer</h3>
                    <p className="text-silver/80 leading-relaxed flex-grow min-h-[80px]">
                      I'm looking to acquire a business or explore investment opportunities
                    </p>
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Browse thousands of businesses</span>
                      </div>
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Get AI-powered match scores</span>
                      </div>
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Receive curated opportunities</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGoalSelect('seller')}
                    className={`glass p-8 rounded-luxury-lg border-2 transition-all hover-lift text-left flex flex-col h-full ${
                      selectedGoal === 'seller' ? 'border-gold bg-gold/10' : 'border-gold/20 hover:border-gold/50'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 flex-shrink-0">
                      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-warm-white mb-3 h-[32px] flex items-center">Seller</h3>
                    <p className="text-silver/80 leading-relaxed flex-grow min-h-[80px]">
                      I'm considering selling my business or exploring its value
                    </p>
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Get instant valuation insights</span>
                      </div>
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Reach qualified buyers</span>
                      </div>
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Maintain confidentiality</span>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGoalSelect('broker')}
                    className={`glass p-8 rounded-luxury-lg border-2 transition-all hover-lift text-left flex flex-col h-full ${
                      selectedGoal === 'broker' ? 'border-gold bg-gold/10' : 'border-gold/20 hover:border-gold/50'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 flex-shrink-0">
                      <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-warm-white mb-3 h-[32px] flex items-center">Broker</h3>
                    <p className="text-silver/80 leading-relaxed flex-grow min-h-[80px]">
                      I'm a broker or advisor helping clients buy or sell businesses
                    </p>
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Manage multiple listings</span>
                      </div>
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Connect with serious buyers</span>
                      </div>
                      <div className="flex items-center gap-2 h-[24px]">
                        <svg className="w-5 h-5 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-silver/70">Streamline deal flow</span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="px-6 py-3 glass-border text-warm-white font-semibold rounded-luxury hover:border-gold/50 transition-all min-h-[48px]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleGoalNext}
                    disabled={!selectedGoal}
                    className="px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    Continue →
                  </button>
                </div>
              </ScrollAnimation>
            )}

            {/* Buyer Preferences Step */}
            {currentStep === 'buyer-preferences' && (
              <ScrollAnimation direction="fade">
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl text-white font-medium mb-4 font-serif">
                    What are you looking for?
                  </h2>
                  <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                    Set your preferences to get personalized business matches
                  </p>
                </div>

                <div className="glass p-8 rounded-luxury-lg border border-gold/20 mb-8">
                  <div className="space-y-8">
                    {/* Industries */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Industries of Interest</h3>
                      <p className="text-sm text-neutral-400 mb-4">Select at least one industry</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {industryOptions.map((industry) => (
                          <label
                            key={industry}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all hover-lift text-sm ${
                              buyerPreferences.industries.includes(industry)
                                ? 'border-gold bg-gold/10 text-gold'
                                : 'border-neutral-600 text-neutral-300 hover:border-gold/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={buyerPreferences.industries.includes(industry)}
                              onChange={() => handleArrayToggle(
                                buyerPreferences.industries,
                                industry,
                                (newIndustries) => setBuyerPreferences({ ...buyerPreferences, industries: newIndustries })
                              )}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              buyerPreferences.industries.includes(industry)
                                ? 'border-gold bg-gold'
                                : 'border-neutral-500'
                            }`}>
                              {buyerPreferences.industries.includes(industry) && (
                                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="font-medium">{industry}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* States */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Preferred Locations</h3>
                      <p className="text-sm text-neutral-400 mb-4">Select states where you'd like to find businesses</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {stateOptions.map((state) => (
                          <label
                            key={state}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all hover-lift text-sm ${
                              buyerPreferences.states.includes(state)
                                ? 'border-gold bg-gold/10 text-gold'
                                : 'border-neutral-600 text-neutral-300 hover:border-gold/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={buyerPreferences.states.includes(state)}
                              onChange={() => handleArrayToggle(
                                buyerPreferences.states,
                                state,
                                (newStates) => setBuyerPreferences({ ...buyerPreferences, states: newStates })
                              )}
                              className="sr-only"
                            />
                            <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${
                              buyerPreferences.states.includes(state)
                                ? 'border-gold bg-gold'
                                : 'border-neutral-500'
                            }`}>
                              {buyerPreferences.states.includes(state) && (
                                <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="font-medium">{state}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Financial Criteria */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Minimum Revenue ($)</label>
                        <input
                          type="text"
                          value={formatCurrency(buyerPreferences.minRevenue)}
                          onChange={(e) => setBuyerPreferences({
                            ...buyerPreferences,
                            minRevenue: parseCurrency(e.target.value)
                          })}
                          className="form-control w-full"
                          placeholder="e.g., 500,000"
                        />
                        <p className="text-sm text-neutral-400 mt-1">Optional: Filter by minimum annual revenue</p>
                      </div>

                      <div>
                        <label className="block text-white font-medium mb-2">Maximum Price ($)</label>
                        <input
                          type="text"
                          value={formatCurrency(buyerPreferences.priceMax)}
                          onChange={(e) => setBuyerPreferences({
                            ...buyerPreferences,
                            priceMax: parseCurrency(e.target.value)
                          })}
                          className="form-control w-full"
                          placeholder="e.g., 2,000,000"
                        />
                        <p className="text-sm text-neutral-400 mt-1">Optional: Maximum purchase price</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentStep('goal')}
                    className="px-6 py-3 glass-border text-warm-white font-semibold rounded-luxury hover:border-gold/50 transition-all min-h-[48px]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSkipToComplete}
                    className="px-6 py-3 text-neutral-400 hover:text-white transition-colors font-medium min-h-[48px]"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={handleBuyerPreferencesSubmit}
                    disabled={isSubmitting || (buyerPreferences.industries.length === 0 && buyerPreferences.states.length === 0)}
                    className="px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Continue →'}
                  </button>
                </div>
              </ScrollAnimation>
            )}

            {/* Seller Profile Step */}
            {currentStep === 'seller-profile' && (
              <ScrollAnimation direction="fade">
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl text-white font-medium mb-4 font-serif">
                    Let's get your business listed
                  </h2>
                  <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                    Connect with qualified buyers and get your business in front of the right audience
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8 md:auto-rows-fr">
                  <div className="glass p-8 rounded-luxury-lg border border-gold/20 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-warm-white mb-3 h-[28px] flex items-center">Create a Listing</h3>
                    <p className="text-silver/80 mb-6 flex-grow min-h-[60px]">
                      Provide details about your business to create a confidential listing that reaches qualified buyers
                    </p>
                    <Link
                      href="/listings/new"
                      className="px-6 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all text-center min-h-[48px] flex items-center justify-center"
                    >
                      Create Listing
                    </Link>
                  </div>

                  <div className="glass p-8 rounded-luxury-lg border border-gold/20 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-warm-white mb-3 h-[28px] flex items-center">Schedule Consultation</h3>
                    <p className="text-silver/80 mb-6 flex-grow min-h-[60px]">
                      Not ready to list? Speak with an expert to understand your business value and exit options
                    </p>
                    <Link
                      href="/contact"
                      className="px-6 py-3 glass-border text-warm-white font-semibold rounded-luxury hover:border-gold/50 transition-all text-center min-h-[48px] flex items-center justify-center"
                    >
                      Contact Expert
                    </Link>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentStep('goal')}
                    className="px-6 py-3 glass-border text-warm-white font-semibold rounded-luxury hover:border-gold/50 transition-all min-h-[48px]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSkipToComplete}
                    className="px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all min-h-[48px]"
                  >
                    I'll do this later →
                  </button>
                </div>
              </ScrollAnimation>
            )}

            {/* Broker Profile Step */}
            {currentStep === 'broker-profile' && (
              <ScrollAnimation direction="fade">
                <div className="text-center mb-8">
                  <h2 className="text-3xl lg:text-4xl text-white font-medium mb-4 font-serif">
                    Welcome to the broker network
                  </h2>
                  <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                    Access powerful tools to manage your listings and connect with serious buyers
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8 md:auto-rows-fr">
                  <div className="glass p-6 rounded-luxury border border-gold/20 text-center flex flex-col h-full">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">Manage Listings</h3>
                    <p className="text-sm text-silver/80 flex-grow min-h-[60px] flex items-center justify-center">
                      Create and manage multiple business listings from one dashboard
                    </p>
                  </div>

                  <div className="glass p-6 rounded-luxury border border-gold/20 text-center flex flex-col h-full">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">Qualified Buyers</h3>
                    <p className="text-sm text-silver/80 flex-grow min-h-[60px] flex items-center justify-center">
                      Connect with pre-vetted buyers who match your listings
                    </p>
                  </div>

                  <div className="glass p-6 rounded-luxury border border-gold/20 text-center flex flex-col h-full">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-warm-white mb-2 h-[28px] flex items-center justify-center">AI Insights</h3>
                    <p className="text-sm text-silver/80 flex-grow min-h-[60px] flex items-center justify-center">
                      Get AI-powered valuations and market intelligence
                    </p>
                  </div>
                </div>

                <div className="glass p-6 rounded-luxury-lg border border-gold/20 mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Next Steps</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 text-sm font-bold">1</div>
                      <div className="flex-grow">
                        <div className="text-white font-medium">Complete your broker profile</div>
                        <div className="text-sm text-neutral-400">Add your credentials and experience</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 text-sm font-bold">2</div>
                      <div className="flex-grow">
                        <div className="text-white font-medium">Create your first listing</div>
                        <div className="text-sm text-neutral-400">Start attracting qualified buyers</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center shrink-0 text-sm font-bold">3</div>
                      <div className="flex-grow">
                        <div className="text-white font-medium">Explore the platform</div>
                        <div className="text-sm text-neutral-400">Get familiar with AI tools and features</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentStep('goal')}
                    className="px-6 py-3 glass-border text-warm-white font-semibold rounded-luxury hover:border-gold/50 transition-all min-h-[48px]"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSkipToComplete}
                    className="px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all min-h-[48px]"
                  >
                    Continue to Dashboard →
                  </button>
                </div>
              </ScrollAnimation>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <ScrollAnimation direction="fade">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  <h2 className="text-3xl lg:text-4xl text-white font-medium mb-4 font-serif">
                    You're all set!
                  </h2>

                  <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
                    {selectedGoal === 'buyer' && "You'll start receiving personalized business matches based on your preferences"}
                    {selectedGoal === 'seller' && "You're ready to list your business and connect with qualified buyers"}
                    {selectedGoal === 'broker' && "You're ready to manage listings and connect clients with opportunities"}
                  </p>

                  <div className="glass p-8 rounded-luxury-lg border border-gold/20 max-w-2xl mx-auto mb-12">
                    <h3 className="text-xl font-semibold text-white mb-6">Quick Tips to Get Started</h3>
                    <div className="space-y-4 text-left">
                      {selectedGoal === 'buyer' && (
                        <>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Browse available listings</div>
                              <div className="text-sm text-neutral-400">Start exploring businesses that match your criteria</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Try AI analysis tools</div>
                              <div className="text-sm text-neutral-400">Get detailed insights on any business listing</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Save favorites</div>
                              <div className="text-sm text-neutral-400">Bookmark interesting opportunities for later review</div>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedGoal === 'seller' && (
                        <>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Create your listing</div>
                              <div className="text-sm text-neutral-400">Provide key details while maintaining confidentiality</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Get AI valuation</div>
                              <div className="text-sm text-neutral-400">Understand your business value with AI analysis</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Review buyer interest</div>
                              <div className="text-sm text-neutral-400">Monitor match scores and qualified buyer activity</div>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedGoal === 'broker' && (
                        <>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Complete your profile</div>
                              <div className="text-sm text-neutral-400">Build trust with credentials and experience</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Add client listings</div>
                              <div className="text-sm text-neutral-400">Create professional listings for your clients</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <div className="text-white font-medium">Leverage AI tools</div>
                              <div className="text-sm text-neutral-400">Provide better insights to your clients</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleComplete}
                    className="px-8 py-4 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-all text-lg min-h-[48px]"
                  >
                    Go to Dashboard →
                  </button>
                </div>
              </ScrollAnimation>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

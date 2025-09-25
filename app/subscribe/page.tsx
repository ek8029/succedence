'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, PlanType } from '@/lib/types';
import { formatPrice } from '@/lib/subscription';
import Footer from '@/components/Footer';

export default function SubscribePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('starter');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is already authenticated with a paid plan
  React.useEffect(() => {
    if (user?.plan && user.plan !== 'free') {
      // Allow beta users to see upgrade options but don't redirect
      if (user.plan === 'beta') {
        // Show current beta status but allow upgrades
      } else {
        router.push('/browse');
      }
    }
  }, [user, router]);

  const handlePlanSelection = async (planType: PlanType) => {
    if (planType === 'free') {
      // No longer allow free plan selection - show upgrade message
      alert('No access available. Please select a paid plan to access the platform.');
      return;
    } else if (planType === 'beta') {
      // Beta access is invite-only
      alert('Beta access is invite-only. Please contact support or select a paid plan.');
      return;
    } else {
      // For paid plans, create Stripe checkout session
      setSelectedPlan(planType);
      setIsLoading(true);

      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planType }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Redirect to Stripe checkout
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      } catch (error) {
        console.error('Error creating checkout session:', error);
        alert('Payment processing failed. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const planOrder: PlanType[] = ['starter', 'professional', 'enterprise'];

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-8 pt-24 pb-16 max-w-7xl">
        {/* Current Plan Status Banner */}
        {user && (
          <div className="mt-12 mb-12">
            <div className={`glass p-6 rounded-luxury border-2 max-w-4xl mx-auto ${
              user.plan === 'free'
                ? 'border-red-400/40 bg-red-900/20'
                : user.plan === 'beta'
                ? 'border-blue-400/40 bg-blue-900/20'
                : 'border-green-400/40 bg-green-900/20'
            }`}>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-warm-white mb-2">
                  Current Plan: {SUBSCRIPTION_PLANS[user.plan as PlanType]?.name}
                </h3>
                <p className={`text-sm ${
                  user.plan === 'free' ? 'text-red-200' :
                  user.plan === 'beta' ? 'text-blue-200' : 'text-green-200'
                }`}>
                  {user.plan === 'free' && 'Subscription is required to access Succedence'}
                  {user.plan === 'beta' && 'You have complimentary beta access. Consider upgrading for continued access after beta period.'}
                  {user.plan !== 'free' && user.plan !== 'beta' && 'You can upgrade or manage your subscription below.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-warm-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-platinum/90 max-w-3xl mx-auto leading-relaxed">
            Select the perfect plan to access our AI-powered acquisition intelligence platform.
            Start building your portfolio with professional tools and insights.
          </p>
        </div>

        {/* Pricing Cards - New Horizontal Layout */}
        <div className="space-y-6 mb-12 max-w-7xl mx-auto">
          {planOrder.map((planType) => {
            const plan = SUBSCRIPTION_PLANS[planType];
            const isPopular = planType === 'professional';
            const isSelected = selectedPlan === planType;

            return (
              <div
                key={planType}
                className={`relative rounded-luxury-lg border-2 transition-all duration-300 ${
                  isPopular
                    ? 'border-gold bg-gradient-to-r from-gold/10 to-gold/5 shadow-gold-glow/20'
                    : isSelected
                    ? 'border-gold bg-charcoal/50'
                    : 'border-silver/20 bg-charcoal/30 hover:border-gold/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-8">
                    <span className="px-4 py-1 bg-gold text-midnight text-sm font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <div className="grid md:grid-cols-5 gap-8 items-start">
                    {/* Plan Info */}
                    <div className="md:col-span-1 min-w-0">
                      <h3 className="text-2xl font-serif font-semibold text-warm-white mb-3">
                        {plan.name}
                      </h3>
                      <div className="mb-3">
                        <div className="text-3xl font-bold text-gold">
                          {formatPrice(plan.price)}
                        </div>
                        {plan.price > 0 && (
                          <div className="text-silver/70 text-xs">/month</div>
                        )}
                      </div>
                      <p className="text-silver/80 text-sm leading-relaxed mb-8">
                        {plan.description}
                      </p>

                      {/* CTA Button */}
                      <button
                        onClick={() => handlePlanSelection(planType)}
                        disabled={isLoading}
                        className={`w-full py-3 px-6 rounded-luxury font-medium transition-all duration-300 disabled:opacity-50 ${
                          isPopular
                            ? 'bg-gold text-midnight hover:bg-gold/90 hover:transform hover:scale-105'
                            : planType === 'free'
                            ? 'bg-transparent border-2 border-silver/30 text-silver hover:border-silver hover:text-warm-white'
                            : 'bg-accent-gradient text-midnight hover:transform hover:scale-105 hover:shadow-gold-glow'
                        }`}
                      >
                        {isLoading && selectedPlan === planType ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          `Select ${plan.name}`
                        )}
                      </button>
                    </div>

                    {/* Features */}
                    <div className="md:col-span-1 min-w-0">
                      <h4 className="text-sm font-semibold text-warm-white mb-4 uppercase tracking-wider">
                        Features
                      </h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <svg className="w-4 h-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-silver/90">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Features */}
                    <div className="md:col-span-1 min-w-0">
                      <h4 className="text-sm font-semibold text-warm-white mb-4 uppercase tracking-wider">
                        AI Analysis
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-silver/70">Business Analysis</span>
                          <span className={plan.aiFeatures.businessAnalysis ? 'text-green-400' : 'text-red-400'}>
                            {plan.aiFeatures.businessAnalysis ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-silver/70">Buyer Matching</span>
                          <span className={plan.aiFeatures.buyerMatching ? 'text-green-400' : 'text-red-400'}>
                            {plan.aiFeatures.buyerMatching ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-silver/70">Due Diligence</span>
                          <span className={plan.aiFeatures.dueDiligence ? 'text-green-400' : 'text-red-400'}>
                            {plan.aiFeatures.dueDiligence ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-silver/70">Market Intelligence</span>
                          <span className={plan.aiFeatures.marketIntelligence ? 'text-green-400' : 'text-red-400'}>
                            {plan.aiFeatures.marketIntelligence ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-silver/20 pt-3 mt-4">
                          <span className="text-silver/70 font-medium">Monthly Analyses</span>
                          <span className="text-gold font-bold">
                            {plan.aiFeatures.maxAnalysesPerMonth === -1
                              ? 'Unlimited'
                              : plan.aiFeatures.maxAnalysesPerMonth === 0
                              ? 'None'
                              : plan.aiFeatures.maxAnalysesPerMonth
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Limitations */}
                    <div className="md:col-span-1 min-w-0">
                      {plan.limitations ? (
                        <>
                          <h4 className="text-sm font-semibold text-silver/70 mb-4 uppercase tracking-wider">
                            Limitations
                          </h4>
                          <ul className="space-y-3">
                            {plan.limitations.map((limitation, index) => (
                              <li key={index} className="flex items-start text-sm">
                                <svg className="w-4 h-4 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-silver/70">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-green-400 font-medium text-sm">No Limitations</p>
                          <p className="text-silver/60 text-xs mt-1">Full access to all features</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Disclaimer */}
        <div className="text-center mb-8">
          <div className="glass p-6 rounded-luxury border border-gold/20 max-w-4xl mx-auto bg-navy/20">
            <h3 className="text-lg font-semibold text-gold mb-4">
              Important AI Disclaimer
            </h3>
            <p className="text-silver/80 text-sm leading-relaxed">
              <strong>Succedence uses AI-powered tools to provide insights and recommendations.</strong> These tools are designed to assist your decision-making, but they do not constitute financial, legal, or investment advice. Users should conduct independent due diligence before making any acquisition or investment decisions. AI output may not always be complete or accurate, and we are not financial advisors. Users are solely responsible for their investment decisions.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mb-12">
          <div className="glass p-6 rounded-luxury border border-gold/20 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-warm-white mb-4">
              All Plans Include
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-silver/80 justify-center">
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cancel or upgrade anytime
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Secure payment processing
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
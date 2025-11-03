'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OnboardingWizardProps {
  onComplete: () => void;
  userRole: 'buyer' | 'seller';
}

export default function OnboardingWizard({ onComplete, userRole }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const buyerSteps = [
    {
      title: 'Welcome to Succedence!',
      description: 'Your AI-powered business acquisition platform',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-semibold text-warm-white mb-4">
              Find Your Next Acquisition
            </h3>
            <p className="text-silver/90 leading-relaxed">
              Succedence helps you discover, analyze, and acquire premium businesses with AI-powered insights.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-warm-white font-medium mb-1">AI Business Analysis</h4>
                <p className="text-silver/80 text-sm">Get comprehensive scoring, strengths, weaknesses, and opportunities for every listing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-warm-white font-medium mb-1">Smart Matching</h4>
                <p className="text-silver/80 text-sm">Our AI matches you with businesses that fit your investment criteria</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-warm-white font-medium mb-1">Due Diligence Tools</h4>
                <p className="text-silver/80 text-sm">Generate comprehensive checklists and track your acquisition progress</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Set Your Preferences',
      description: 'Tell us what you\'re looking for',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <p className="text-silver/90 leading-relaxed">
              Define your acquisition criteria to receive personalized matches and email alerts for relevant opportunities.
            </p>
          </div>
          <div className="glass p-6 rounded-lg border border-gold/20">
            <h4 className="text-warm-white font-semibold mb-4">What You&apos;ll Set:</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-silver/80">
                <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Financial criteria (revenue, price range)
              </li>
              <li className="flex items-center text-silver/80">
                <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Industries of interest
              </li>
              <li className="flex items-center text-silver/80">
                <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Preferred locations
              </li>
              <li className="flex items-center text-silver/80">
                <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email alert frequency
              </li>
            </ul>
          </div>
          <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm">
              <strong>Pro tip:</strong> You can always update your preferences later from your profile settings.
            </p>
          </div>
        </div>
      ),
      action: () => router.push('/preferences'),
      actionLabel: 'Set Preferences Now',
      skipLabel: 'Skip for Now',
    },
    {
      title: 'Explore the Platform',
      description: 'Here\'s what you can do',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <Link
            href="/browse"
            onClick={onComplete}
            className="block glass p-4 rounded-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div>
                  <h4 className="text-warm-white font-semibold group-hover:text-gold transition-colors">Browse Listings</h4>
                  <p className="text-silver/70 text-sm">Explore available business opportunities</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-silver/50 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          <Link
            href="/matches"
            onClick={onComplete}
            className="block glass p-4 rounded-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <h4 className="text-warm-white font-semibold group-hover:text-gold transition-colors">View Your Matches</h4>
                  <p className="text-silver/70 text-sm">See businesses matched to your criteria</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-silver/50 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          <Link
            href="/dashboard"
            onClick={onComplete}
            className="block glass p-4 rounded-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <h4 className="text-warm-white font-semibold group-hover:text-gold transition-colors">Go to Dashboard</h4>
                  <p className="text-silver/70 text-sm">View your personalized dashboard</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-silver/50 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      ),
    },
  ];

  const sellerSteps = [
    {
      title: 'Welcome to Succedence!',
      description: 'Your AI-powered business marketplace',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-semibold text-warm-white mb-4">
              List Your Business
            </h3>
            <p className="text-silver/90 leading-relaxed">
              Connect with serious buyers and showcase your business with AI-enhanced listings.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-warm-white font-medium mb-1">Qualified Buyers</h4>
                <p className="text-silver/80 text-sm">Connect with verified investors actively seeking acquisitions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-warm-white font-medium mb-1">AI-Enhanced Listings</h4>
                <p className="text-silver/80 text-sm">Our AI helps showcase your business&apos;s strengths to potential buyers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-warm-white font-medium mb-1">Confidential Process</h4>
                <p className="text-silver/80 text-sm">Control who sees your listing and manage buyer communications</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Create Your First Listing',
      description: 'List your business in minutes',
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-silver/90 leading-relaxed">
              Create a professional listing to attract qualified buyers. You can save drafts and publish when ready.
            </p>
          </div>
          <div className="glass p-6 rounded-lg border border-gold/20">
            <h4 className="text-warm-white font-semibold mb-4">What You&apos;ll Need:</h4>
            <ul className="space-y-3">
              <li className="flex items-center text-silver/80">
                <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Business description and highlights
              </li>
              <li className="flex items-center text-silver/80">
                <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Financial information (revenue, asking price)
              </li>
              <li className="flex items-center text-silver/80">
                <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Location and industry details
              </li>
              <li className="flex items-center text-silver/80">
                <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact preferences
              </li>
            </ul>
          </div>
        </div>
      ),
      action: () => router.push('/listings/new'),
      actionLabel: 'Create Listing',
      skipLabel: 'Maybe Later',
    },
    {
      title: 'You\'re All Set!',
      description: 'Start exploring',
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <Link
            href="/browse"
            onClick={onComplete}
            className="block glass p-4 rounded-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div>
                  <h4 className="text-warm-white font-semibold group-hover:text-gold transition-colors">Browse Listings</h4>
                  <p className="text-silver/70 text-sm">See what others are offering</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-silver/50 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          <Link
            href="/dashboard"
            onClick={onComplete}
            className="block glass p-4 rounded-lg border border-gold/20 hover:border-gold/40 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <div>
                  <h4 className="text-warm-white font-semibold group-hover:text-gold transition-colors">Go to Dashboard</h4>
                  <p className="text-silver/70 text-sm">View your personalized dashboard</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-silver/50 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      ),
    },
  ];

  const steps = userRole === 'buyer' ? buyerSteps : sellerSteps;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStepData.action) {
      currentStepData.action();
      onComplete();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-midnight/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass max-w-2xl w-full rounded-luxury-lg border-2 border-gold/30 p-8 relative">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-silver/70 text-sm">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={onComplete}
              className="text-silver/70 hover:text-warm-white transition-colors"
              aria-label="Close onboarding"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div
              className="bg-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-semibold text-warm-white mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-silver/80 mb-6">{currentStepData.description}</p>
          <div>{currentStepData.content}</div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-silver/70 hover:text-warm-white transition-colors font-medium"
            >
              ← Back
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            {currentStepData.skipLabel && (
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-silver/70 hover:text-warm-white transition-colors font-medium"
              >
                {currentStepData.skipLabel}
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-accent-gradient text-midnight font-medium rounded-luxury hover:transform hover:scale-105 transition-all duration-300"
            >
              {currentStepData.actionLabel || (currentStep < steps.length - 1 ? 'Next' : 'Get Started')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

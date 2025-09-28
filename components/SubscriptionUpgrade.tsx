'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PlanType, SUBSCRIPTION_PLANS } from '@/lib/types';
import { formatPrice, getPlanDetails, getUpgradeSuggestions, isAdminUser } from '@/lib/subscription';

interface SubscriptionUpgradeProps {
  currentPlan?: PlanType;
  requiredFeature?: keyof typeof SUBSCRIPTION_PLANS.professional.aiFeatures;
  featureName?: string;
  featureDescription?: string;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showCurrentPlan?: boolean;
  className?: string;
}

export default function SubscriptionUpgrade({
  currentPlan,
  requiredFeature,
  featureName,
  featureDescription,
  size = 'md',
  message,
  showCurrentPlan = true,
  className = ''
}: SubscriptionUpgradeProps) {
  const { user } = useAuth();

  // Use user's plan if not provided
  const userPlan = currentPlan || (user?.plan as PlanType) || 'free';
  const upgradePlans = requiredFeature ? getUpgradeSuggestions(userPlan, requiredFeature) : (['starter', 'professional', 'enterprise'] as PlanType[]);
  const currentPlanDetails = getPlanDetails(userPlan);

  // Admin users bypass all paywalls (check both role and enterprise plan)
  const isAdmin = isAdminUser(user?.role) || userPlan === 'enterprise';
  const isBlocked = !isAdmin && userPlan === 'free';
  const isBeta = userPlan === 'beta';

  // Don't show upgrade prompts to admin users or enterprise users
  if (isAdmin) {
    return null;
  }

  const getDefaultMessage = () => {
    if (isBlocked) {
      return 'Subscribe to access this feature and unlock the full platform';
    }
    if (featureName) {
      return `Upgrade your plan to access ${featureName}`;
    }
    return 'Upgrade your plan for enhanced features and capabilities';
  };

  const displayMessage = message || getDefaultMessage();

  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg'
  };

  return (
    <div className={`glass rounded-luxury border-2 ${isBlocked ? 'border-red-400/40 bg-red-900/20' : 'border-gold/30 bg-gradient-to-r from-gold/5 to-accent-gold/10'} ${sizeClasses[size]} ${className}`}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gold/20 rounded-full flex items-center justify-center">
          {isBlocked ? (
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>

        <h3 className="text-xl font-semibold text-warm-white font-serif mb-2">
          {isBlocked ? 'Subscription Required' : 'Upgrade Required'}
        </h3>

        <div className="mb-6">
          <p className={`${isBlocked ? 'text-red-200' : 'text-gold'} font-medium mb-2`}>
            {displayMessage}
          </p>

          {featureName && (
            <h4 className="text-lg font-medium text-gold mb-2">{featureName}</h4>
          )}

          {featureDescription && (
            <p className="text-silver/80 text-sm leading-relaxed mb-4">
              {featureDescription}
            </p>
          )}

          {showCurrentPlan && (
            <div className="inline-flex items-center px-3 py-1 bg-charcoal/50 rounded-full border border-silver/20 mb-4">
              <span className="text-xs text-silver/70">Current Plan:</span>
              <span className="ml-2 text-sm font-medium text-warm-white">
                {currentPlanDetails.name} ({formatPrice(currentPlanDetails.price)})
              </span>
              {isBeta && <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-full">BETA</span>}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link
              href="/subscribe"
              className={`inline-flex items-center px-6 py-3 rounded-luxury font-medium transition-all duration-300 hover:transform hover:scale-105 ${
                isBlocked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-accent-gradient text-midnight hover:shadow-gold-glow'
              }`}
            >
              {isBlocked ? 'Subscribe Now' : 'Upgrade Plan'}
            </Link>

            {!isBlocked && (
              <Link
                href="/subscribe"
                className="inline-flex items-center px-4 py-3 bg-transparent border border-gold/30 text-gold rounded-luxury hover:bg-gold/10 transition-all duration-300"
              >
                View Plans
              </Link>
            )}
          </div>
        </div>

        {upgradePlans.length > 0 && (
          <div className="space-y-4">
            <p className="text-silver/80 text-sm">
              Upgrade to access this feature:
            </p>

            <div className="grid gap-4">
              {upgradePlans.map((planType) => {
                const plan = getPlanDetails(planType);
                const isRecommended = planType === 'professional';

                return (
                  <div
                    key={planType}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isRecommended
                        ? 'border-gold bg-gold/10 relative'
                        : 'border-silver/20 bg-charcoal/30 hover:border-gold/50'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="px-2 py-1 bg-gold text-midnight text-xs font-bold rounded">
                          RECOMMENDED
                        </span>
                      </div>
                    )}

                    <div className="text-center">
                      <h5 className="text-lg font-semibold text-warm-white mb-1">
                        {plan.name}
                      </h5>
                      <p className="text-2xl font-bold text-gold mb-2">
                        {formatPrice(plan.price)}
                      </p>
                      <p className="text-silver/80 text-sm mb-4">
                        {plan.description}
                      </p>

                      <div className="text-left mb-4">
                        <h6 className="text-sm font-medium text-warm-white mb-2">Key Features:</h6>
                        <ul className="space-y-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="text-xs text-silver/80 flex items-start">
                              <svg className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                          isRecommended
                            ? 'bg-gold text-midnight hover:bg-gold/90'
                            : 'bg-accent-gradient text-midnight hover:transform hover:scale-105'
                        }`}
                      >
                        Upgrade to {plan.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-silver/20">
          <p className="text-xs text-silver/60 leading-relaxed">
            All plans include a 30-day money-back guarantee. You can upgrade or downgrade at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component for blocking access completely
export function SubscriptionGate({
  children,
  fallback,
  requiredPlan = 'starter',
  requiredFeature
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPlan?: PlanType;
  requiredFeature?: string;
}) {
  const { user, isLoading } = useAuth();

  // Show loading state while authentication is initializing (prevents subscription popup on tab switch)
  if (isLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="glass p-8 rounded-luxury border-2 border-gold/20 bg-charcoal/20 text-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-silver/80">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass p-8 rounded-luxury border-2 border-red-400/40 bg-red-900/20 text-center">
        <h3 className="text-xl font-semibold text-red-200 mb-4">Authentication Required</h3>
        <p className="text-silver/80 mb-6">Please sign in to access this feature</p>
        <Link href="/auth" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  // Admin users bypass all restrictions (check both role and enterprise plan)
  if (isAdminUser(user.role) || user.plan === 'enterprise') {
    return <>{children}</>;
  }

  const userPlan = user.plan as PlanType;
  const planHierarchy: PlanType[] = ['free', 'starter', 'professional', 'enterprise'];
  const userPlanIndex = planHierarchy.indexOf(userPlan);
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

  // Check if user plan meets or exceeds required plan
  const hasAccess = userPlan === 'beta' || userPlanIndex >= requiredPlanIndex;

  if (!hasAccess) {
    return fallback || (
      <SubscriptionUpgrade
        size="lg"
        message={`This feature requires ${SUBSCRIPTION_PLANS[requiredPlan].name} plan or higher`}
        featureName={requiredFeature}
      />
    );
  }

  return <>{children}</>;
}
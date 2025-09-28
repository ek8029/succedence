'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import UsageDashboard from '@/components/subscription/UsageDashboard'
import { PlanType } from '@/lib/types'

const PLANS = [
  {
    name: 'Free',
    id: 'free' as PlanType,
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with AI business analysis',
    features: [
      '2 analyses per day',
      '2 follow-up questions for business analysis',
      'Basic reports',
      'Email support'
    ],
    limitations: [
      'No market intelligence follow-ups',
      'No due diligence follow-ups',
      'No buyer match follow-ups',
      'No export functionality'
    ],
    color: 'border-gray-400/20 bg-gray-900/10',
    buttonColor: 'bg-gray-600 hover:bg-gray-500'
  },
  {
    name: 'Starter',
    id: 'starter' as PlanType,
    price: '$49',
    period: 'month',
    description: 'Ideal for small businesses and individual investors',
    features: [
      '10 analyses per day',
      '10 follow-up questions per analysis type',
      'All analysis types available',
      'Export reports',
      'Conversation history',
      'Priority email support'
    ],
    limitations: [
      'Limited to 50 analyses per month',
      'Basic metrics only'
    ],
    color: 'border-blue-400/20 bg-blue-900/10',
    buttonColor: 'bg-blue-600 hover:bg-blue-500',
    popular: false
  },
  {
    name: 'Professional',
    id: 'professional' as PlanType,
    price: '$199',
    period: 'month',
    description: 'Perfect for investment firms and M&A professionals',
    features: [
      '50 analyses per day',
      '50 follow-up questions per analysis type',
      'All analysis types available',
      'Export reports',
      'Advanced metrics and analytics',
      'Conversation history',
      'Priority support',
      'Custom parameters'
    ],
    limitations: [
      'Limited to 500 analyses per month'
    ],
    color: 'border-purple-400/20 bg-purple-900/10',
    buttonColor: 'bg-purple-600 hover:bg-purple-500',
    popular: true
  },
  {
    name: 'Enterprise',
    id: 'enterprise' as PlanType,
    price: 'Custom',
    period: 'contact us',
    description: 'For large organizations with high-volume needs',
    features: [
      'Unlimited analyses',
      'Unlimited follow-up questions',
      'All analysis types available',
      'Export reports',
      'Advanced metrics and analytics',
      'Conversation history',
      'Dedicated support',
      'Custom integrations',
      'API access',
      'Custom branding'
    ],
    limitations: [],
    color: 'border-gold/20 bg-yellow-900/10',
    buttonColor: 'bg-gold hover:bg-yellow-500',
    popular: false
  }
]

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'plans' | 'usage'>('usage')

  const currentPlan = (user?.plan as PlanType) || 'free'

  const handleUpgrade = (planId: PlanType) => {
    if (planId === 'enterprise') {
      // Open contact form or redirect to contact page
      window.open('mailto:support@dealsense.com?subject=Enterprise Plan Inquiry', '_blank')
    } else {
      // Integrate with Stripe or payment provider
      console.log(`Upgrading to ${planId} plan`)
      // TODO: Implement Stripe integration
    }
  }

  return (
    <div className="min-h-screen bg-charcoal text-warm-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif text-purple-400 mb-4">
            Subscription & Usage
          </h1>
          <p className="text-silver/70 max-w-2xl mx-auto">
            Manage your plan, track your AI usage, and upgrade for more powerful analysis capabilities.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-charcoal/50 rounded-luxury p-1 border border-purple-400/20">
            <button
              onClick={() => setActiveTab('usage')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'usage'
                  ? 'bg-purple-600 text-white'
                  : 'text-silver hover:text-white hover:bg-charcoal/50'
              }`}
            >
              Usage Dashboard
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeTab === 'plans'
                  ? 'bg-purple-600 text-white'
                  : 'text-silver hover:text-white hover:bg-charcoal/50'
              }`}
            >
              Plans & Pricing
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'usage' ? (
          <div>
            <h2 className="text-2xl font-serif text-purple-400 mb-6">Your Usage Dashboard</h2>
            <UsageDashboard />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-serif text-purple-400 mb-6 text-center">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative p-6 rounded-luxury border ${plan.color} ${
                    plan.popular ? 'ring-2 ring-purple-400/50' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {currentPlan === plan.id && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-serif text-warm-white mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-warm-white">{plan.price}</span>
                      {plan.period !== 'contact us' && plan.period !== 'forever' && (
                        <span className="text-silver/70">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-sm text-silver/70">{plan.description}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-2">Features Included:</h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="text-sm text-silver flex items-start">
                            <svg className="w-4 h-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-orange-400 mb-2">Limitations:</h4>
                        <ul className="space-y-1">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="text-sm text-silver/70 flex items-start">
                              <svg className="w-4 h-4 text-orange-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={currentPlan === plan.id}
                    className={`w-full py-3 px-4 rounded-luxury font-medium transition-colors ${
                      currentPlan === plan.id
                        ? 'bg-charcoal/50 text-silver/50 cursor-not-allowed'
                        : `${plan.buttonColor} text-white`
                    }`}
                  >
                    {currentPlan === plan.id
                      ? 'Current Plan'
                      : plan.id === 'enterprise'
                      ? 'Contact Sales'
                      : `Upgrade to ${plan.name}`
                    }
                  </button>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-charcoal/20 rounded-luxury border border-purple-400/20 p-6">
              <h3 className="text-xl font-serif text-purple-400 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-warm-white mb-2">What happens if I exceed my limits?</h4>
                  <p className="text-silver/70 text-sm">
                    When you reach your daily or monthly limits, you'll need to wait for the next period or upgrade your plan.
                    We'll notify you when you're approaching your limits.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-warm-white mb-2">Can I change my plan anytime?</h4>
                  <p className="text-silver/70 text-sm">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately,
                    and billing is prorated accordingly.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-warm-white mb-2">What's included in follow-up questions?</h4>
                  <p className="text-silver/70 text-sm">
                    Follow-up questions allow you to dive deeper into any analysis. Each analysis type
                    (Business Analysis, Market Intelligence, Due Diligence, Buyer Match) has separate limits.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-warm-white mb-2">Is there a free trial?</h4>
                  <p className="text-silver/70 text-sm">
                    The Free plan gives you access to basic features immediately. You can upgrade anytime
                    to access more analyses and advanced features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
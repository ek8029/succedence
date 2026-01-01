'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, X } from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Feature comparison structure (excludes Enterprise-only features)
  const features = [
    { name: 'Browse all active listings', tiers: ['Free', 'Starter', 'Professional'] },
    { name: 'Basic search and filters', tiers: ['Free', 'Starter', 'Professional'] },
    { name: 'AI match reports', free: '3/month', starter: 'Unlimited', pro: 'Unlimited' },
    { name: 'Save favorites', free: 'Up to 5', starter: 'Unlimited', pro: 'Unlimited' },
    { name: 'Direct messaging with sellers', tiers: ['Starter', 'Professional'] },
    { name: 'Weekly digest of new matches', tiers: ['Starter', 'Professional'] },
    { name: 'Due diligence tools', free: false, starter: 'Basic', pro: 'Advanced' },
    { name: 'Email support', free: '48hr', starter: '24hr', pro: '4hr' },
    { name: 'Advanced AI business analysis', tiers: ['Professional'] },
    { name: 'Market intelligence reports', tiers: ['Professional'] },
    { name: 'Deal pipeline management', tiers: ['Professional'] },
    { name: 'Pre-launch listings', tiers: ['Professional'] },
  ]

  const plans = [
    {
      name: 'Free',
      tagline: 'Perfect for exploring',
      price: { monthly: 0, annual: 0 },
      description: 'Start browsing deals and get a feel for the platform',
      cta: 'Start Free',
      highlighted: false,
      popular: false
    },
    {
      name: 'Starter',
      tagline: 'For serious buyers',
      price: { monthly: 19.99, annual: 15.99 },
      description: 'Get matched with opportunities automatically',
      cta: 'Get Started',
      highlighted: true,
      popular: true,
      savings: '20% off with annual'
    },
    {
      name: 'Professional',
      tagline: 'For active dealmakers',
      price: { monthly: 49.99, annual: 39.99 },
      description: 'Full suite of AI-powered analysis and insights',
      cta: 'Get Started',
      highlighted: true,
      popular: false,
      savings: '20% off with annual'
    },
    {
      name: 'Enterprise',
      tagline: 'For funds & groups',
      price: { monthly: null, annual: null },
      description: 'Custom solutions for teams and investment groups',
      cta: 'Contact Sales',
      highlighted: false,
      popular: false,
      enterpriseFeatures: [
        'Multi-user team accounts',
        'Custom matching algorithms',
        'White-glove deal sourcing',
        'Private deal flow',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Quarterly strategy reviews'
      ]
    }
  ]

  const handleSelectPlan = async (planName: string) => {
    if (planName === 'Free') {
      router.push('/login')
      return
    }

    if (planName === 'Enterprise') {
      window.location.href = 'mailto:founder@succedence.com?subject=Enterprise Plan Inquiry'
      return
    }

    // Handle paid plans - create Stripe checkout session
    setIsLoading(true)
    setSelectedPlan(planName)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planName.toLowerCase(),
          billingCycle: billingCycle,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
      } else {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          router.push('/login?redirect=/pricing')
        } else {
          alert(data.error || 'Failed to start checkout. Please try again.')
          setIsLoading(false)
          setSelectedPlan(null)
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Something went wrong. Please try again.')
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  const getFeatureValue = (feature: any, planName: string) => {
    const tierMap: any = {
      'Free': 'free',
      'Starter': 'starter',
      'Professional': 'pro',
      'Enterprise': 'enterprise'
    }

    if (feature.tiers) {
      return feature.tiers.includes(planName)
    }

    const tierKey = tierMap[planName]
    return feature[tierKey] || false
  }

  return (
    <div className="min-h-screen bg-midnight pt-24 pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <div className="inline-block mb-6">
          <span className="px-6 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium tracking-wide">
            VALUATIONS ALWAYS FREE
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-warm-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg md:text-xl text-silver/80 max-w-2xl mx-auto mb-8">
          Run unlimited valuations for free. Upgrade for PDF exports, advanced features, and buyer matching.
        </p>

        {/* Billing Toggle - Mobile optimized touch targets */}
        <div className="inline-flex items-stretch gap-2 sm:gap-4 glass rounded-luxury-lg p-1.5">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 sm:px-6 py-3 rounded-lg transition-all flex items-center justify-center ${
              billingCycle === 'monthly'
                ? 'bg-gold text-midnight font-semibold'
                : 'text-silver/70 hover:text-warm-white'
            }`}
          >
            <span className="leading-none">Monthly</span>
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 sm:px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              billingCycle === 'annual'
                ? 'bg-gold text-midnight font-semibold'
                : 'text-silver/70 hover:text-warm-white'
            }`}
          >
            <span className="leading-none">Annual</span>
            <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap leading-none ${
              billingCycle === 'annual'
                ? 'bg-midnight/20 text-midnight font-semibold'
                : 'bg-gold/20 text-gold'
            }`}>
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative glass rounded-luxury-lg flex flex-col h-full ${
                plan.popular ? 'p-8 sm:p-10 lg:scale-[1.05]' : 'p-6 sm:p-8'
              } ${
                plan.highlighted
                  ? 'border-2 border-gold shadow-2xl shadow-gold/20'
                  : 'border border-warm-white/10'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="mb-4 -mt-2">
                  <span className="inline-block px-4 py-1.5 bg-gold text-midnight text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-bold text-warm-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-gold mb-4">{plan.tagline}</p>

                {/* Price */}
                <div className="mb-2">
                  {plan.price[billingCycle] === null ? (
                    <div className="text-3xl font-bold text-warm-white">Custom</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-warm-white">
                        ${plan.price[billingCycle]}
                      </span>
                      {plan.price[billingCycle] > 0 && (
                        <span className="text-silver/60">/month</span>
                      )}
                    </div>
                  )}
                  {billingCycle === 'annual' && plan.price.annual !== null && plan.price.annual > 0 && (
                    <div className="text-xs text-silver/60 mt-1">
                      ${plan.price.annual * 12}/year • {plan.savings}
                    </div>
                  )}
                </div>

                <p className="text-sm text-silver/70">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-grow">
                {plan.name === 'Enterprise' ? (
                  <>
                    <li className="text-silver/70 text-sm mb-4 italic">
                      Everything in Professional, plus:
                    </li>
                    {(plan as any).enterpriseFeatures?.map((feature: string, idx: number) => (
                      <li key={`ent-${idx}`} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <span className="text-silver/80">{feature}</span>
                      </li>
                    ))}
                  </>
                ) : (
                  features.map((feature, idx) => {
                    const featureValue = getFeatureValue(feature, plan.name)
                    const isIncluded = featureValue !== false
                    const hasCustomValue = typeof featureValue === 'string'

                    return (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        {isIncluded ? (
                          <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-silver/30 shrink-0 mt-0.5" />
                        )}
                        <span className={isIncluded ? 'text-silver/80' : 'text-silver/40'}>
                          {feature.name}
                          {hasCustomValue && <span className="text-gold ml-1">({featureValue})</span>}
                        </span>
                      </li>
                    )
                  })
                )}
              </ul>

              {/* CTA - Mobile optimized */}
              <button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-luxury-lg font-semibold transition-all min-h-[48px] text-base mt-auto disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.highlighted
                    ? 'bg-gold text-midnight hover:bg-gold/90 shadow-lg shadow-gold/20'
                    : 'glass-border hover:border-gold/50 text-warm-white'
                }`}
              >
                {isLoading && selectedPlan === plan.name ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  plan.cta
                )}
              </button>

              {plan.name !== 'Free' && plan.name !== 'Enterprise' && (
                <p className="text-xs text-center text-silver/60 mt-3">
                  No credit card required
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="glass rounded-luxury-lg p-4 sm:p-8 mb-16">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-warm-white mb-6 sm:mb-8 text-center">
            Compare Features
          </h2>

          {/* Mobile hint */}
          <div className="lg:hidden text-center mb-4 text-xs text-silver/60">
            Swipe to see all plans →
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full px-4 sm:px-0">
              <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-warm-white/10">
                  <th className="text-left py-4 px-4 text-silver/60 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-warm-white font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-warm-white font-semibold">Starter</th>
                  <th className="text-center py-4 px-4 text-warm-white font-semibold">Professional</th>
                  <th className="text-center py-4 px-4 text-warm-white font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Active listings access', free: true, starter: true, pro: true, enterprise: true },
                  { feature: 'AI match reports', free: '3/month', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Saved favorites', free: '5', starter: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
                  { feature: 'Direct seller messaging', free: false, starter: true, pro: true, enterprise: true },
                  { feature: 'Weekly match digest', free: false, starter: true, pro: true, enterprise: true },
                  { feature: 'AI business analysis', free: false, starter: false, pro: true, enterprise: true },
                  { feature: 'Market intelligence', free: false, starter: false, pro: true, enterprise: true },
                  { feature: 'Due diligence tools', free: false, starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
                  { feature: 'Pre-launch listings', free: false, starter: false, pro: true, enterprise: true },
                  { feature: 'Team accounts', free: false, starter: false, pro: false, enterprise: true },
                  { feature: 'API access', free: false, starter: false, pro: false, enterprise: true },
                  { feature: 'Dedicated support', free: false, starter: false, pro: false, enterprise: true }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-warm-white/5">
                    <td className="py-4 px-4 text-silver/80">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-5 h-5 text-gold mx-auto" />
                        ) : (
                          <span className="text-silver/40">—</span>
                        )
                      ) : (
                        <span className="text-silver/80">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? (
                          <Check className="w-5 h-5 text-gold mx-auto" />
                        ) : (
                          <span className="text-silver/40">—</span>
                        )
                      ) : (
                        <span className="text-silver/80">{row.starter}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <Check className="w-5 h-5 text-gold mx-auto" />
                        ) : (
                          <span className="text-silver/40">—</span>
                        )
                      ) : (
                        <span className="text-silver/80">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? (
                          <Check className="w-5 h-5 text-gold mx-auto" />
                        ) : (
                          <span className="text-silver/40">—</span>
                        )
                      ) : (
                        <span className="text-silver/80">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Trust Signals & FAQ */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 md:auto-rows-fr">
          {/* Trust Signals */}
          <div className="glass rounded-luxury-lg p-8 flex flex-col h-full">
            <h3 className="text-xl font-serif font-bold text-warm-white mb-6">
              Why Succedence?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-warm-white font-semibold mb-1">Instant Access</h4>
                  <p className="text-sm text-silver/70">
                    Start browsing and analyzing deals immediately after signup.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-warm-white font-semibold mb-1">Cancel Anytime</h4>
                  <p className="text-sm text-silver/70">
                    No long-term contracts. Pause or cancel with one click.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-warm-white font-semibold mb-1">30-Day Money Back</h4>
                  <p className="text-sm text-silver/70">
                    Not satisfied? Full refund within 30 days of purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="glass rounded-luxury-lg p-8 flex flex-col h-full">
            <h3 className="text-xl font-serif font-bold text-warm-white mb-6">
              Common Questions
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-warm-white font-semibold mb-1">Can I switch plans?</h4>
                <p className="text-sm text-silver/70">
                  Yes! Upgrade or downgrade anytime. Pro-rated credits apply.
                </p>
              </div>
              <div>
                <h4 className="text-warm-white font-semibold mb-1">What happens after I subscribe?</h4>
                <p className="text-sm text-silver/70">
                  You&apos;ll get instant access to all features in your selected plan.
                </p>
              </div>
              <div>
                <h4 className="text-warm-white font-semibold mb-1">What payment methods do you accept?</h4>
                <p className="text-sm text-silver/70">
                  All major credit cards, ACH transfers for Enterprise plans.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="glass rounded-luxury-lg p-6 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-warm-white mb-4">
            Start with a Free Valuation
          </h2>
          <p className="text-base sm:text-lg text-silver/80 mb-8 max-w-2xl mx-auto">
            See what your business is worth or price a listing. No signup required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/valuation')}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg min-h-[48px] text-base"
            >
              Get Free Valuation →
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 glass-border text-warm-white font-semibold rounded-luxury-lg hover:border-gold/50 transition-all min-h-[48px] text-base"
            >
              Sign Up for More Features
            </button>
          </div>
          <p className="text-xs sm:text-sm text-silver/60 mt-6">
            Unlimited free valuations • Upgrade for PDF exports and advanced features
          </p>
        </div>
      </div>
    </div>
  )
}

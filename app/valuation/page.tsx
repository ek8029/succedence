import type { Metadata } from 'next';
import { Suspense } from 'react';
import Footer from '@/components/Footer';
import ValuationPageClient from './ValuationPageClient';

export const metadata: Metadata = {
  title: 'Free Business Valuation Calculator | SDE Tool for Brokers | Succedence',
  description:
    'Get a defensible valuation range for any small business in under 60 seconds. SDE-based methodology, 50+ industries, IBBA-sourced transaction data. Free for brokers and business owners.',
  keywords: [
    'free business valuation calculator',
    'SDE valuation tool',
    'what is my business worth',
    'small business valuation',
    'business broker valuation tool',
    'seller discretionary earnings calculator',
    'business valuation multiples',
  ],
  openGraph: {
    title: 'Free Business Valuation Calculator | Succedence',
    description:
      'Instant SDE-based valuation with risk adjustments, deal quality scoring, and broker rationale. Free, no signup required.',
    type: 'website',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HowTo',
      name: 'How to Value a Small Business Using the SDE Method',
      description:
        'Use the Succedence free valuation tool to get a defensible, SDE-based business valuation with risk adjustments in under 60 seconds.',
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
      step: [
        {
          '@type': 'HowToStep',
          name: 'Select your industry and enter financials',
          text: "Choose your business industry from 50+ categories and enter annual revenue and SDE (Seller's Discretionary Earnings). SDE is your net profit plus owner salary and any one-time expenses.",
        },
        {
          '@type': 'HowToStep',
          name: 'Add optional risk factors',
          text: 'Optionally provide risk context: customer concentration, owner hours per week, revenue growth trend, recurring revenue percentage, and lease terms remaining.',
        },
        {
          '@type': 'HowToStep',
          name: 'Review your valuation range',
          text: 'Receive a low, mid, and high valuation range with the applied SDE multiple, a deal quality score (0-100), risk factor breakdown, and a broker rationale paragraph you can copy directly.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is SDE and why is it used for small business valuation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "SDE (Seller's Discretionary Earnings) is the total financial benefit to a working owner-operator. It equals net profit plus owner salary, owner benefits, depreciation, amortization, and any one-time non-recurring expenses. SDE is the standard metric for valuing Main Street businesses under $5M because it captures the true economic value to a full-time owner.",
          },
        },
        {
          '@type': 'Question',
          name: 'How accurate is this free business valuation tool?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The tool uses industry multiples sourced from IBBA transaction data and applies risk adjustments based on your specific business characteristics. It provides a strong starting point for pricing conversations. For formal transactions, we recommend verifying with a Quality of Earnings analysis and consulting a certified business appraiser.',
          },
        },
        {
          '@type': 'Question',
          name: 'What industries does the valuation tool cover?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The tool covers 50+ industries including HVAC, landscaping, restaurants, retail, healthcare practices, SaaS, professional services, manufacturing, construction, e-commerce, and more. Each industry has its own set of transaction-based multiples.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to sign up to use the valuation tool?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No signup is required for your first valuation. Create a free account to run unlimited valuations and save your results.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is a typical SDE multiple for a small business?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SDE multiples for Main Street businesses typically range from 1.5x to 4.5x depending on industry, size, and risk profile. Service businesses with recurring revenue and low owner dependency command higher multiples. Restaurants and retail typically trade at 1.5x-2.5x SDE, while home services trade at 2.5x-4x SDE.',
          },
        },
      ],
    },
  ],
};

function ValuationLoadingFallback() {
  return (
    <div className="text-center py-12 text-silver/60">
      Loading valuation tool...
    </div>
  );
}

export default function ValuationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <noscript>
        <div style={{ padding: '2rem', textAlign: 'center', background: '#0f172a', color: '#94a3b8' }}>
          <h1 style={{ color: '#f8fafc', marginBottom: '1rem' }}>Free Business Valuation Calculator</h1>
          <p style={{ marginBottom: '0.5rem' }}>
            Succedence provides a free SDE-based business valuation tool for brokers and business owners.
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            Covers 50+ industries with IBBA-sourced transaction data. Provides low, mid, and high valuation
            range with risk adjustments, deal quality score, and broker rationale.
          </p>
          <p>Please enable JavaScript to use the interactive valuation calculator.</p>
        </div>
      </noscript>

      <div className="min-h-screen bg-primary-gradient">
        <div className="container mx-auto px-4 pb-16 max-w-5xl page-content">
          {/* Server-rendered header — always present in HTML for crawlers */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 bg-gold/10 border border-gold/30 text-gold rounded-full text-sm font-medium">
                FREE VALUATION TOOL
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-warm-white mb-4">
              Free Business Valuation Calculator
            </h1>
            <p className="text-lg text-silver/80 max-w-2xl mx-auto">
              Get a defensible valuation range for any small business in under 60 seconds.
              SDE-based methodology with IBBA transaction data across 50+ industries.
            </p>
          </div>

          {/* Interactive client component — wrapped in Suspense for useSearchParams */}
          <Suspense fallback={<ValuationLoadingFallback />}>
            <ValuationPageClient />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  );
}

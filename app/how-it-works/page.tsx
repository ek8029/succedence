'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        {/* Header */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 max-w-5xl">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-warm-white mb-4">
              How It Works
            </h1>
            <p className="text-lg text-platinum/80 max-w-2xl mx-auto">
              A simple, consistent approach to business valuation that brokers can rely on.
            </p>
          </div>
        </section>

        {/* Three Steps */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 md:auto-rows-fr">
            <div className="glass p-8 rounded-lg border border-gold/20 text-center flex flex-col h-full">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Enter the Basics</h3>
              <p className="text-silver/80 leading-relaxed">
                Select industry, enter revenue and SDE. Add optional details like employees, year established, or asking price.
              </p>
            </div>
            <div className="glass p-8 rounded-lg border border-gold/20 text-center flex flex-col h-full">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Get Your Valuation</h3>
              <p className="text-silver/80 leading-relaxed">
                Receive a valuation range with applied SDE multiples, risk adjustments, and a deal quality score.
              </p>
            </div>
            <div className="glass p-8 rounded-lg border border-gold/20 text-center flex flex-col h-full">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-blue-400 font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-warm-white mb-3">Share with Sellers</h3>
              <p className="text-silver/80 leading-relaxed">
                Copy the broker rationale directly or download a professional PDF report to use in listing presentations.
              </p>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <div className="glass rounded-lg border border-gold/20 overflow-hidden">
            <div className="bg-charcoal/50 border-b border-gold/20 px-8 py-6">
              <h2 className="text-2xl font-serif font-semibold text-warm-white">Our Methodology</h2>
            </div>
            <div className="p-10 space-y-10">
              <div>
                <h3 className="text-xl font-semibold text-warm-white mb-3">SDE-Based Valuation</h3>
                <p className="text-silver/80 leading-relaxed">
                  We use Seller's Discretionary Earnings (SDE) as the primary valuation metric for Main Street businesses.
                  SDE represents the total financial benefit to a working owner: net profit plus owner salary, benefits,
                  and discretionary expenses. This is the industry standard for businesses under $5M in value.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-warm-white mb-3">Industry-Specific Multiples</h3>
                <p className="text-silver/80 leading-relaxed">
                  We maintain SDE multiple ranges for 50+ industries based on actual transaction data. Multiples vary
                  by industry due to factors like growth potential, capital requirements, owner dependency, and
                  recurring revenue characteristics.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-warm-white mb-3">Risk Adjustments</h3>
                <p className="text-silver/80 leading-relaxed mb-4">
                  We adjust base multiples for business-specific risk factors including:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-silver/80">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Customer concentration (top customer &gt;30% of revenue)</span>
                  </li>
                  <li className="flex items-start gap-3 text-silver/80">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Owner dependency (hours worked, specialized skills)</span>
                  </li>
                  <li className="flex items-start gap-3 text-silver/80">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Revenue trends (growing, stable, or declining)</span>
                  </li>
                  <li className="flex items-start gap-3 text-silver/80">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Recurring revenue percentage</span>
                  </li>
                  <li className="flex items-start gap-3 text-silver/80">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Business age and lease terms</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-warm-white mb-3">Valuation Range</h3>
                <p className="text-silver/80 leading-relaxed">
                  We provide a low-mid-high range rather than a single number. This accounts for negotiation dynamics,
                  deal structure variations (asset sale vs. stock sale, seller financing terms), and inherent
                  uncertainty in small business valuations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <div className="glass rounded-lg border border-gold/20 overflow-hidden">
            <div className="bg-charcoal/50 border-b border-gold/20 px-8 py-6">
              <h2 className="text-2xl font-serif font-semibold text-warm-white">Data Sources</h2>
            </div>
            <div className="p-10">
              <p className="text-silver/80 leading-relaxed mb-6">
                Our industry multiples are derived from:
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-charcoal/30 rounded-lg p-6 border border-gold/10">
                  <h4 className="font-semibold text-warm-white mb-2">IBBA Transaction Data</h4>
                  <p className="text-silver/70 text-sm">
                    International Business Brokers Association market pulse surveys
                  </p>
                </div>
                <div className="bg-charcoal/30 rounded-lg p-6 border border-gold/10">
                  <h4 className="font-semibold text-warm-white mb-2">DealStats</h4>
                  <p className="text-silver/70 text-sm">
                    Transaction database with 40,000+ completed deals
                  </p>
                </div>
                <div className="bg-charcoal/30 rounded-lg p-6 border border-gold/10">
                  <h4 className="font-semibold text-warm-white mb-2">Industry Surveys</h4>
                  <p className="text-silver/70 text-sm">
                    Sector-specific multiple studies and benchmarks
                  </p>
                </div>
                <div className="bg-charcoal/30 rounded-lg p-6 border border-gold/10">
                  <h4 className="font-semibold text-warm-white mb-2">Quarterly Updates</h4>
                  <p className="text-silver/70 text-sm">
                    Multiples refreshed each quarter to reflect market conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-10">
            <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Important Notes
            </h3>
            <ul className="space-y-3 text-amber-200/90">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>This tool provides decision support for pricing discussions, not formal business appraisals.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Actual transaction prices depend on deal structure, financing terms, and negotiation outcomes.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>For SBA loans or formal valuations, buyers may require a certified appraisal.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Valuations are based on normalized financials - garbage in, garbage out.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-16 max-w-5xl">
          <div className="glass p-12 rounded-lg border border-gold/20 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white mb-4">
              Ready to try it?
            </h2>
            <p className="text-lg text-platinum/80 mb-8 max-w-xl mx-auto">
              Run your first valuation in under 60 seconds. No signup required.
            </p>
            <Link
              href="/valuation"
              className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg"
            >
              Run a Free Valuation
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

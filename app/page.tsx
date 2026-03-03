import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';
import Cluster from '@/components/layout/Cluster';

export const metadata: Metadata = {
  title: 'Standardize SMB Valuations with Transaction-Backed Multiples | Succedence',
  description: 'Free business valuation tool powered by IBBA transaction data. Defensible valuations with risk-adjusted multiples and deal quality scoring. No signup required.',
  openGraph: {
    title: 'Standardize SMB Valuations | Succedence',
    description: 'Data you can defend. Prices buyers respect.',
    type: 'website',
  },
};

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Succedence Business Valuation Tool",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127"
  },
  "description": "Free business valuation tool powered by IBBA transaction data with risk-adjusted multiples."
};

const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Succedence",
  "url": "https://www.succedence.com",
  "logo": "https://www.succedence.com/logo.png",
  "description": "Transaction-backed business valuation infrastructure for SMB acquisitions"
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-color">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      {/* Hero Section */}
      <Section variant="hero">
        <PageContainer>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <Stack gap="lg">
              <Stack gap="md">
                {/* IBBA Badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 border border-accent-color/30 bg-accent-color/10 rounded-lg w-fit"
                  role="img"
                  aria-label="Powered by IBBA transaction data"
                >
                  <svg
                    className="w-4 h-4 text-accent-color"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-accent-color">Powered by IBBA transaction data</span>
                </div>

                <h1 className="font-serif text-hero-mobile lg:text-hero text-text-primary">
                  Standardize SMB valuations with transaction‑backed, defensible multiples
                </h1>

                <p className="text-body-lg text-text-secondary leading-body-relaxed max-w-xl font-sans">
                  Data you can defend. Prices buyers respect.
                </p>

                <p className="text-body text-text-secondary/80 leading-body max-w-xl">
                  Anchor seller expectations with data-backed multiples from 20,000+ closed transactions. Risk-adjusted methodology and buyer-oriented deal quality scoring in every report.
                </p>
              </Stack>

              <Stack gap="xs">
                {/* Primary CTA */}
                <Link
                  href="/valuation"
                  className="group inline-flex items-center justify-center px-8 h-12 bg-accent-color text-white font-semibold rounded-lg transition-all duration-200 hover:bg-[#E6A238] hover:-translate-y-0.5 active:scale-[0.97] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color w-fit"
                  aria-label="Get your free defensible valuation"
                >
                  Get Your Defensible Valuation
                  <svg
                    className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Stack gap="xs" className="ml-1">
                  <p className="text-label text-text-secondary/60 leading-ui">Free. No signup required. Export PDF immediately.</p>
                  <p className="text-micro text-text-secondary/50 leading-body">
                    Complete valuation report with risk analysis, industry comps, and deal quality scoring in under 60 seconds.
                  </p>
                </Stack>

                {/* Secondary CTA */}
                <Link
                  href="/how-it-works"
                  className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium underline underline-offset-4 decoration-text-secondary/30 hover:decoration-text-primary/50"
                  aria-label="View our methodology"
                >
                  View Methodology →
                </Link>
              </Stack>

              {/* Key Stats Strip */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-text-secondary/20 text-sm text-text-secondary/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent-color rounded-full" aria-hidden="true"></span>
                  50+ industries
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent-color rounded-full" aria-hidden="true"></span>
                  20K+ transactions analysed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent-color rounded-full" aria-hidden="true"></span>
                  Updated quarterly (Q4 2024)
                </span>
              </div>
            </Stack>

            {/* Right: Process Steps - Redesigned as Cards */}
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-accent-color/20" aria-hidden="true"></div>

              <Stack gap="sm">
                {/* Step 1 */}
                <div
                  className="relative bg-surface-color border border-text-secondary/20 rounded-lg p-6 hover:bg-text-secondary/5 hover:-translate-y-0.5 transition-all duration-200 hover:border-accent-color/40 focus-within:ring-2 focus-within:ring-accent-color focus-within:ring-offset-2 focus-within:ring-offset-surface-color"
                  role="article"
                  aria-labelledby="step-1-title"
                >
                  <Cluster gap="md" align="start">
                    <div
                      className="relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-accent-color text-white font-semibold text-lg"
                      aria-label="Step 1"
                    >
                      1
                    </div>
                    <Stack gap="xs">
                      <div>
                        <p className="text-micro text-accent-color font-medium uppercase tracking-caps mb-1">Data Input</p>
                        <h3 id="step-1-title" className="text-h3 text-text-primary font-sans">Input Financials</h3>
                      </div>
                      <p className="text-text-secondary text-label leading-ui">
                        Upload P&L and tax returns. System normalises SDE automatically and classifies industry using NAICS taxonomy.
                      </p>
                    </Stack>
                  </Cluster>
                </div>

                {/* Step 2 */}
                <div
                  className="relative bg-surface-color border border-text-secondary/20 rounded-lg p-6 hover:bg-text-secondary/5 hover:-translate-y-0.5 transition-all duration-200 hover:border-accent-color/40 focus-within:ring-2 focus-within:ring-accent-color focus-within:ring-offset-2 focus-within:ring-offset-surface-color"
                  role="article"
                  aria-labelledby="step-2-title"
                >
                  <Cluster gap="md" align="start">
                    <div
                      className="relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-accent-color text-white font-semibold text-lg"
                      aria-label="Step 2"
                    >
                      2
                    </div>
                    <Stack gap="xs">
                      <div>
                        <p className="text-micro text-accent-color font-medium uppercase tracking-caps mb-1">Risk Analysis</p>
                        <h3 id="step-2-title" className="text-h3 text-text-primary font-sans">Review Risk-Adjusted Range</h3>
                      </div>
                      <p className="text-text-secondary text-label leading-ui">
                        Receive low/mid/high valuation range with documented risk adjustments across six evaluation dimensions.
                      </p>
                    </Stack>
                  </Cluster>
                </div>

                {/* Step 3 */}
                <div
                  className="relative bg-surface-color border border-text-secondary/20 rounded-lg p-6 hover:bg-text-secondary/5 hover:-translate-y-0.5 transition-all duration-200 hover:border-accent-color/40 focus-within:ring-2 focus-within:ring-accent-color focus-within:ring-offset-2 focus-within:ring-offset-surface-color"
                  role="article"
                  aria-labelledby="step-3-title"
                >
                  <Cluster gap="md" align="start">
                    <div
                      className="relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-accent-color text-white font-semibold text-lg"
                      aria-label="Step 3"
                    >
                      3
                    </div>
                    <Stack gap="xs">
                      <div>
                        <p className="text-micro text-accent-color font-medium uppercase tracking-caps mb-1">Report Generation</p>
                        <h3 id="step-3-title" className="text-h3 text-text-primary font-sans">Export Defensible Reports</h3>
                      </div>
                      <p className="text-text-secondary text-label leading-ui">
                        PDF output with complete methodology disclosure. Designed for listing presentations, LOI negotiations, and lender documentation.
                      </p>
                    </Stack>
                  </Cluster>
                </div>
              </Stack>
            </div>
          </div>
        </PageContainer>
      </Section>

      {/* Trust Signals Section */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="xl">
            <Stack gap="xs" className="text-center max-w-3xl mx-auto">
              <h2 className="font-serif text-h2 text-text-primary">
                Institutional-grade infrastructure
              </h2>
              <p className="text-body-lg text-text-secondary leading-body-relaxed">
                Built for credibility at every stage of the transaction lifecycle
              </p>
            </Stack>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Institutional Trust */}
              <Stack gap="xs" className="border-l-2 border-accent-color/60 pl-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-accent-color" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-h3 text-text-primary font-sans">Institutional Trust</h3>
                </div>

                <Stack gap="xs" className="text-sm">
                  <p className="text-text-secondary/90 leading-relaxed">
                    Licensed data sourced from IBBA quarterly market reports covering main street M&A transactions. Methodology independently reviewed by institutional buyers and M&A advisory firms.
                  </p>

                  <div className="pl-4 border-l border-text-secondary/30">
                    <p className="text-text-secondary/80 text-xs mb-1">Data Provenance:</p>
                    <p className="text-text-secondary/70 text-xs leading-relaxed">
                      Transaction multiples derived from 20,000+ closed deals. Industry classifications align with NAICS taxonomy. Market data updated quarterly to reflect current conditions.
                    </p>
                  </div>

                  <div className="pl-4 border-l border-text-secondary/30">
                    <p className="text-text-secondary/80 text-xs mb-1">Professional Standards:</p>
                    <p className="text-text-secondary/70 text-xs leading-relaxed">
                      Valuation approach consistent with NACVA and ASA guidelines for small business appraisal. Methodology documentation available for third-party review.
                    </p>
                  </div>
                </Stack>

                <Link href="/about" className="text-accent-color text-sm hover:underline mt-2">Learn more →</Link>
              </Stack>

              {/* Operational Trust */}
              <Stack gap="xs" className="border-l-2 border-accent-color/60 pl-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-accent-color" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-h3 text-text-primary font-sans">Operational Trust</h3>
                </div>

                <Stack gap="xs" className="text-sm">
                  <p className="text-text-secondary/90 leading-relaxed">
                    Valuation calculations independently reproducible. Complete methodology documentation enables verification by accounting firms, legal counsel, and financial advisors.
                  </p>

                  <div className="pl-4 border-l border-text-secondary/30">
                    <p className="text-text-secondary/80 text-xs mb-1">Calculation Transparency:</p>
                    <p className="text-text-secondary/70 text-xs leading-relaxed">
                      All risk adjustments and multiple selections disclosed in output reports. Assumptions explicitly stated. No proprietary black-box calculations.
                    </p>
                  </div>

                  <div className="pl-4 border-l border-text-secondary/30">
                    <p className="text-text-secondary/80 text-xs mb-1">Track Record:</p>
                    <p className="text-text-secondary/70 text-xs leading-relaxed">
                      Anonymised case studies from 500+ broker valuations. Used in LOI negotiations and SBA lending documentation.
                    </p>
                  </div>
                </Stack>

                <Link href="/case-studies" className="text-accent-color text-sm hover:underline mt-2">View case studies →</Link>
              </Stack>

              {/* Technical Trust */}
              <Stack gap="xs" className="border-l-2 border-accent-color/60 pl-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-accent-color" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-h3 text-text-primary font-sans">Technical Trust</h3>
                </div>

                <Stack gap="xs" className="text-sm">
                  <p className="text-text-secondary/90 leading-relaxed">
                    SOC 2 Type II compliance in progress. Third-party security audits conducted annually. Infrastructure designed for institutional data handling requirements.
                  </p>

                  <div className="pl-4 border-l border-text-secondary/30">
                    <p className="text-text-secondary/80 text-xs mb-1">Data Security:</p>
                    <ul className="text-text-secondary/70 text-xs space-y-0.5">
                      <li>• AES-256 encryption at rest</li>
                      <li>• TLS 1.3 for data in transit</li>
                      <li>• Role-based access controls</li>
                      <li>• Comprehensive audit logging</li>
                    </ul>
                  </div>

                  <div className="pl-4 border-l border-text-secondary/30">
                    <p className="text-text-secondary/80 text-xs mb-1">Compliance Readiness:</p>
                    <p className="text-text-secondary/70 text-xs leading-relaxed">
                      Data retention policies align with financial services standards. Regular penetration testing and vulnerability assessments.
                    </p>
                  </div>
                </Stack>

                <Link href="/security" className="text-accent-color text-sm hover:underline mt-2">Security documentation →</Link>
              </Stack>

              {/* Relational Trust */}
              <Stack gap="xs" className="border-l-2 border-accent-color/60 pl-6">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-accent-color" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-h3 text-text-primary font-sans">Relational Trust</h3>
                </div>

                <Stack gap="xs" className="text-sm">
                  <p className="text-text-secondary/90 leading-relaxed">
                    Founded by former M&A advisors with transaction experience across professional services, manufacturing, and SaaS sectors. Direct support from our team for complex valuations.
                  </p>

                  <div className="pl-4 border-l border-text-secondary/30">
                    <p className="text-text-secondary/80 text-xs mb-1">Pricing Model:</p>
                    <p className="text-text-secondary/70 text-xs leading-relaxed">
                      Transparent fee structure with no hidden charges. Free tier for basic valuations. Enterprise pricing for high-volume broker firms.
                    </p>
                  </div>

                  <div className="pl-4 border-l border-text-secondary/30">
                    <p className="text-text-secondary/80 text-xs mb-1">Professional Network:</p>
                    <p className="text-text-secondary/70 text-xs leading-relaxed">
                      Advisor relationships with IBBA member firms, regional investment banks, and SBA preferred lenders. Methodology refined through practitioner feedback.
                    </p>
                  </div>
                </Stack>

                <Link href="/team" className="text-accent-color text-sm hover:underline mt-2">Meet the team →</Link>
              </Stack>
            </div>

            {/* Partner Logos */}
            <div className="pt-8 border-t border-text-secondary/20">
              <p className="text-center text-sm text-text-secondary/60 mb-6">Trusted data sources and partners</p>
              <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale mb-6">
                <div className="text-text-secondary font-semibold text-lg" aria-label="IBBA Partner">IBBA</div>
                <div className="text-text-secondary font-semibold text-lg" aria-label="Market Data Provider">BizBuySell</div>
                <div className="text-text-secondary font-semibold text-lg" aria-label="Valuation Standards">NACVA</div>
              </div>
              <p className="text-center text-xs text-text-secondary/50">
                Market data sourced from licensed IBBA quarterly reports and DealStats transaction database. Industry multiples reviewed and updated quarterly.
              </p>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Risk-Adjusted Methodology */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="xl">
            <Stack gap="sm">
              <h2 className="font-serif text-h2 text-text-primary max-w-2xl">
                Risk factors banks and buyers actually evaluate
              </h2>
              <p className="text-body-lg text-text-secondary/90 max-w-2xl leading-body-relaxed">
                Base multiples adjusted for the same dimensions institutional buyers scrutinize during due diligence. Each factor quantified based on historical transaction discounts and lending risk premiums.
              </p>
            </Stack>

            <div className="grid md:grid-cols-2 gap-6">
              <Stack gap="xs" className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5 hover:bg-text-secondary/10 transition-colors">
                <h3 className="text-h3 text-text-primary font-sans">Customer Concentration</h3>
                <p className="text-text-secondary/90 leading-body text-label">
                  Revenue dependency on top 3 clients. Multiples adjusted downward when {'>'}30% of revenue from single customer. Mirrors SBA lending concentration limits.
                </p>
                <div className="pt-2 border-t border-text-secondary/20">
                  <p className="text-micro text-text-secondary/70 mb-1 leading-ui">Multiple Adjustment Range:</p>
                  <p className="text-label text-accent-color font-semibold tracking-ui">-0.3x to -1.2x SDE</p>
                </div>
              </Stack>

              <Stack gap="xs" className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5 hover:bg-text-secondary/10 transition-colors">
                <h3 className="text-h3 text-text-primary font-sans">Owner Dependency</h3>
                <p className="text-text-secondary/90 leading-body text-label">
                  Transferability of operations without current owner. Evaluates documented processes, management depth, and systems. Critical for SBA 7(a) loan approval.
                </p>
                <div className="pt-2 border-t border-text-secondary/20">
                  <p className="text-micro text-text-secondary/70 mb-1 leading-ui">Multiple Adjustment Range:</p>
                  <p className="text-label text-accent-color font-semibold tracking-ui">-0.2x to -1.0x SDE</p>
                </div>
              </Stack>

              <Stack gap="xs" className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5 hover:bg-text-secondary/10 transition-colors">
                <h3 className="text-h3 text-text-primary font-sans">Revenue Trajectory</h3>
                <p className="text-text-secondary/90 leading-body text-label">
                  3-year revenue trend and stability. Declining revenue receives lower multiples; consistent growth above industry average commands premiums. Assessed using CAGR methodology.
                </p>
                <div className="pt-2 border-t border-text-secondary/20">
                  <p className="text-micro text-text-secondary/70 mb-1 leading-ui">Multiple Adjustment Range:</p>
                  <p className="text-label text-accent-color font-semibold tracking-ui">-0.5x to +0.4x SDE</p>
                </div>
              </Stack>

              <Stack gap="xs" className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5 hover:bg-text-secondary/10 transition-colors">
                <h3 className="text-h3 text-text-primary font-sans">Recurring Revenue Mix</h3>
                <p className="text-text-secondary/90 leading-body text-label">
                  Percentage of revenue under contract or subscription. Predictable cash flow justifies higher multiples. Includes maintenance contracts, retainers, and SaaS subscriptions.
                </p>
                <div className="pt-2 border-t border-text-secondary/20">
                  <p className="text-micro text-text-secondary/70 mb-1 leading-ui">Multiple Adjustment Range:</p>
                  <p className="text-label text-accent-color font-semibold tracking-ui">+0.2x to +0.8x SDE</p>
                </div>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Final CTA Section */}
      <Section variant="hero">
        <PageContainer>
          <div className="border-y border-text-secondary/20 py-16">
            <Stack gap="lg" className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-h2 text-text-primary">
                Stop defending arbitrary numbers in listing conversations
              </h2>
              <p className="text-body-lg text-text-secondary leading-body-relaxed">
                Walk into every seller meeting with transaction-backed valuations. Risk-adjusted multiples from 20,000+ closed deals, not guesswork.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/valuation"
                  className="group inline-flex items-center justify-center px-8 h-12 bg-accent-color text-white font-semibold rounded-lg transition-all duration-200 hover:bg-[#E6A238] hover:-translate-y-0.5 active:scale-[0.97] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color"
                  aria-label="Get your first defensible valuation"
                >
                  Get Your Defensible Valuation
                  <svg
                    className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              <p className="text-label text-text-secondary/60 leading-ui">Free. No signup required. Export PDF reports immediately.</p>
            </Stack>
          </div>
        </PageContainer>
      </Section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

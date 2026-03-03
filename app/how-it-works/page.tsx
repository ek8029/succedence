import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'How It Works | SDE Business Valuation Method | Succedence',
  description:
    'See how Succedence calculates business valuations using the SDE method, IBBA transaction data, and risk-adjusted multiples. Transparent, defensible pricing for brokers.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-surface-color">
      {/* Header */}
      <Section variant="hero">
        <PageContainer>
          <Stack gap="md" className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-text-primary leading-tight tracking-tight">
              How it works
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Three-step process to generate defensible business valuations in under 60 seconds.
            </p>
          </Stack>
        </PageContainer>
      </Section>

      {/* Methodology Section with ID anchor */}
      <Section variant="default" withBorder="top" id="methodology">
        <PageContainer>
          <Stack gap="xl">
            <Stack gap="xs" className="max-w-3xl">
              <h2 className="font-serif text-4xl font-bold text-text-primary tracking-tight">
                Valuation methodology
              </h2>
              <p className="text-lg text-text-secondary">
                SDE multiples from IBBA market data, adjusted for the risk factors banks and buyers actually evaluate.
              </p>
            </Stack>

            <div className="grid lg:grid-cols-2 gap-16">
              <Stack gap="xs">
                <h3 className="text-sm font-semibold text-accent-color uppercase tracking-wide">Calculation basis</h3>
                <h4 className="font-serif text-2xl text-text-primary font-bold">Seller's Discretionary Earnings</h4>
                <p className="text-text-secondary/90 leading-relaxed">
                  SDE represents total financial benefit to a working owner: net profit plus owner compensation, benefits, and discretionary expenses. Industry standard for main street businesses under $5M.
                </p>
                <p className="text-text-secondary/90 leading-relaxed">
                  <span className="text-accent-color font-mono">Valuation = SDE × Industry Multiple × Risk Adjustment</span>
                </p>
              </Stack>

              <Stack gap="xs">
                <h3 className="text-sm font-semibold text-accent-color uppercase tracking-wide">Industry multiples</h3>
                <h4 className="font-serif text-2xl text-text-primary font-bold">Transaction-backed ranges</h4>
                <p className="text-text-secondary/90 leading-relaxed">
                  50+ industry categories with multiple ranges derived from IBBA market data and DealStats closed transactions. Updated quarterly.
                </p>
                <p className="text-sm text-text-secondary/70">
                  Example: Professional services (2.5-3.5×), SaaS businesses (3.0-4.5×), restaurants (1.5-2.5×)
                </p>
              </Stack>

              <div>
                <Stack gap="xs" className="mb-6">
                  <h3 className="text-sm font-semibold text-accent-color uppercase tracking-wide">Risk adjustments</h3>
                  <h4 className="font-serif text-2xl text-text-primary font-bold">Six evaluation dimensions</h4>
                </Stack>
                <Stack gap="sm">
                  <div className="border-l-2 border-accent-color/40 pl-4">
                    <p className="text-text-primary font-medium">Customer concentration</p>
                    <p className="text-sm text-text-secondary/70">Top customer revenue dependency</p>
                  </div>
                  <div className="border-l-2 border-accent-color/40 pl-4">
                    <p className="text-text-primary font-medium">Owner involvement</p>
                    <p className="text-sm text-text-secondary/70">Hours worked, specialized skills required</p>
                  </div>
                  <div className="border-l-2 border-accent-color/40 pl-4">
                    <p className="text-text-primary font-medium">Revenue trajectory</p>
                    <p className="text-sm text-text-secondary/70">Growth, stability, or decline trends</p>
                  </div>
                  <div className="border-l-2 border-accent-color/40 pl-4">
                    <p className="text-text-primary font-medium">Recurring revenue mix</p>
                    <p className="text-sm text-text-secondary/70">Contracts, subscriptions, retention rates</p>
                  </div>
                  <div className="border-l-2 border-accent-color/40 pl-4">
                    <p className="text-text-primary font-medium">Business maturity</p>
                    <p className="text-sm text-text-secondary/70">Years established, market position</p>
                  </div>
                  <div className="border-l-2 border-accent-color/40 pl-4">
                    <p className="text-text-primary font-medium">Asset/lease structure</p>
                    <p className="text-sm text-text-secondary/70">Real estate, equipment, lease terms</p>
                  </div>
                </Stack>
              </div>

              <Stack gap="xs">
                <h3 className="text-sm font-semibold text-accent-color uppercase tracking-wide">Output format</h3>
                <h4 className="font-serif text-2xl text-text-primary font-bold">Ranges, not point estimates</h4>
                <p className="text-text-secondary/90 leading-relaxed">
                  Low/mid/high valuation range accounts for negotiation dynamics, deal structure variables (asset vs. stock sale), and financing terms (seller note, earnout provisions).
                </p>
                <p className="text-sm text-text-secondary/70">
                  Single-number valuations create false precision. Ranges reflect market reality.
                </p>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Data Sources */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="font-serif text-4xl font-bold text-text-primary tracking-tight">
              Data sources and update cadence
            </h2>

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
              <Stack gap="xs">
                <h3 className="text-lg font-semibold text-text-primary">IBBA Market Pulse Reports</h3>
                <p className="text-text-secondary/90 text-sm leading-relaxed">
                  International Business Brokers Association quarterly transaction surveys covering main street deal activity
                </p>
                <p className="text-xs text-text-secondary/70">Published quarterly • Last update: Q4 2024</p>
              </Stack>

              <Stack gap="xs">
                <h3 className="text-lg font-semibold text-text-primary">DealStats Database</h3>
                <p className="text-text-secondary/90 text-sm leading-relaxed">
                  Transaction comps database with 40,000+ closed deals, filterable by industry and size
                </p>
                <p className="text-xs text-text-secondary/70">Continuous updates • Subscription access</p>
              </Stack>

              <Stack gap="xs">
                <h3 className="text-lg font-semibold text-text-primary">Industry-specific surveys</h3>
                <p className="text-text-secondary/90 text-sm leading-relaxed">
                  Sector benchmarking studies from trade associations and private equity research
                </p>
                <p className="text-xs text-text-secondary/70">Varies by industry</p>
              </Stack>

              <Stack gap="xs">
                <h3 className="text-lg font-semibold text-text-primary">Multiple refresh cycle</h3>
                <p className="text-text-secondary/90 text-sm leading-relaxed">
                  Industry multiples updated quarterly to reflect current market conditions and deal flow
                </p>
                <p className="text-xs text-text-secondary/70">Next scheduled update: April 2025</p>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* CTA */}
      <Section variant="default">
        <PageContainer>
          <div className="border-t border-text-secondary/20 pt-16">
            <Stack gap="md" className="max-w-2xl">
              <h2 className="font-serif text-4xl font-bold text-text-primary tracking-tight">
                Test the methodology on your pipeline
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                See how your current listings compare to IBBA multiples. Run valuations for businesses you're actively pricing.
              </p>
              <div>
                <Link
                  href="/valuation"
                  className="group inline-flex items-center justify-center px-8 h-12 bg-accent-color text-white font-semibold rounded-lg transition-all duration-200 hover:bg-[#E6A238] hover:-translate-y-0.5 active:scale-[0.97] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color"
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
            </Stack>
          </div>
        </PageContainer>
      </Section>

      <Footer />
    </div>
  );
}

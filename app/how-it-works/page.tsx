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
    <div className="min-h-screen bg-deep-navy">
      {/* Header */}
      <Section variant="hero">
        <PageContainer>
          <Stack gap="md" className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-6xl text-warm-white leading-tight">
              Valuation methodology
            </h1>
            <p className="text-xl text-off-white/80 leading-relaxed">
              SDE multiples from IBBA market data, adjusted for the risk factors banks and buyers actually evaluate.
            </p>
          </Stack>
        </PageContainer>
      </Section>

      {/* Methodology Section */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <div className="grid lg:grid-cols-2 gap-16">
            <Stack gap="xs">
              <h2 className="text-sm font-semibold text-amber uppercase tracking-wide">Calculation basis</h2>
              <h3 className="font-serif text-3xl text-warm-white">Seller's Discretionary Earnings</h3>
              <p className="text-off-white/80 leading-relaxed">
                SDE represents total financial benefit to a working owner: net profit plus owner compensation, benefits, and discretionary expenses. Industry standard for main street businesses under $5M.
              </p>
              <p className="text-off-white/80 leading-relaxed">
                <span className="text-amber font-mono">Valuation = SDE × Industry Multiple × Risk Adjustment</span>
              </p>
            </Stack>

            <Stack gap="xs">
              <h2 className="text-sm font-semibold text-amber uppercase tracking-wide">Industry multiples</h2>
              <h3 className="font-serif text-3xl text-warm-white">Transaction-backed ranges</h3>
              <p className="text-off-white/80 leading-relaxed">
                50+ industry categories with multiple ranges derived from IBBA market data and DealStats closed transactions. Updated quarterly.
              </p>
              <p className="text-sm text-gray">
                Example: Professional services (2.5-3.5×), SaaS businesses (3.0-4.5×), restaurants (1.5-2.5×)
              </p>
            </Stack>

            <div>
              <Stack gap="xs" className="mb-6">
                <h2 className="text-sm font-semibold text-amber uppercase tracking-wide">Risk adjustments</h2>
                <h3 className="font-serif text-3xl text-warm-white">Six evaluation dimensions</h3>
              </Stack>
              <Stack gap="sm">
                <div className="border-l-2 border-slate/40 pl-4">
                  <p className="text-off-white font-medium">Customer concentration</p>
                  <p className="text-sm text-gray">Top customer revenue dependency</p>
                </div>
                <div className="border-l-2 border-slate/40 pl-4">
                  <p className="text-off-white font-medium">Owner involvement</p>
                  <p className="text-sm text-gray">Hours worked, specialized skills required</p>
                </div>
                <div className="border-l-2 border-slate/40 pl-4">
                  <p className="text-off-white font-medium">Revenue trajectory</p>
                  <p className="text-sm text-gray">Growth, stability, or decline trends</p>
                </div>
                <div className="border-l-2 border-slate/40 pl-4">
                  <p className="text-off-white font-medium">Recurring revenue mix</p>
                  <p className="text-sm text-gray">Contracts, subscriptions, retention rates</p>
                </div>
                <div className="border-l-2 border-slate/40 pl-4">
                  <p className="text-off-white font-medium">Business maturity</p>
                  <p className="text-sm text-gray">Years established, market position</p>
                </div>
                <div className="border-l-2 border-slate/40 pl-4">
                  <p className="text-off-white font-medium">Asset/lease structure</p>
                  <p className="text-sm text-gray">Real estate, equipment, lease terms</p>
                </div>
              </Stack>
            </div>

            <Stack gap="xs">
              <h2 className="text-sm font-semibold text-amber uppercase tracking-wide">Output format</h2>
              <h3 className="font-serif text-3xl text-warm-white">Ranges, not point estimates</h3>
              <p className="text-off-white/80 leading-relaxed">
                Low/mid/high valuation range accounts for negotiation dynamics, deal structure variables (asset vs. stock sale), and financing terms (seller note, earnout provisions).
              </p>
              <p className="text-sm text-gray">
                Single-number valuations create false precision. Ranges reflect market reality.
              </p>
            </Stack>
          </div>
        </PageContainer>
      </Section>

      {/* Data Sources */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="font-serif text-4xl text-warm-white">
              Data sources and update cadence
            </h2>

            <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
              <Stack gap="xs">
                <h3 className="text-lg font-semibold text-warm-white">IBBA Market Pulse Reports</h3>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  International Business Brokers Association quarterly transaction surveys covering main street deal activity
                </p>
                <p className="text-xs text-gray">Published quarterly • Last update: Q4 2024</p>
              </Stack>

              <Stack gap="xs">
                <h3 className="text-lg font-semibold text-warm-white">DealStats Database</h3>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  Transaction comps database with 40,000+ closed deals, filterable by industry and size
                </p>
                <p className="text-xs text-gray">Continuous updates • Subscription access</p>
              </Stack>

              <Stack gap="xs">
                <h3 className="text-lg font-semibold text-warm-white">Industry-specific surveys</h3>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  Sector benchmarking studies from trade associations and private equity research
                </p>
                <p className="text-xs text-gray">Varies by industry</p>
              </Stack>

              <Stack gap="xs">
                <h3 className="text-lg font-semibold text-warm-white">Multiple refresh cycle</h3>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  Industry multiples updated quarterly to reflect current market conditions and deal flow
                </p>
                <p className="text-xs text-gray">Next scheduled update: April 2025</p>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* CTA */}
      <Section variant="default">
        <PageContainer>
          <div className="border-t border-slate/40 pt-16">
            <Stack gap="md" className="max-w-2xl">
              <h2 className="font-serif text-4xl text-warm-white">
                Test the methodology on your pipeline
              </h2>
              <p className="text-lg text-off-white/80 leading-relaxed">
                See how your current listings compare to IBBA multiples. Run valuations for businesses you're actively pricing.
              </p>
              <div>
                <Link
                  href="/valuation"
                  className="inline-block px-8 py-4 bg-amber text-navy-dark font-medium transition-all hover:bg-amber-light"
                >
                  Price a Business
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

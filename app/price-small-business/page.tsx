import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'Business Valuation for Sellers | SDE Multiples | Succedence',
  description:
    'Value your business before broker conversations. SDE-based valuations using IBBA transaction multiples and risk adjustments.',
  openGraph: {
    title: 'Business Valuation for Sellers | Succedence',
    description: 'SDE multiples from IBBA market data. Understand pricing before listing conversations.',
    type: 'website',
  },
};

export default function PriceSmallBusinessPage() {
  return (
    <div className="min-h-screen bg-deep-navy">
      <div className="relative">
        {/* Hero Section */}
        <Section variant="hero">
          <PageContainer>
            <div className="max-w-3xl">
              <Stack gap="lg">
                <Stack gap="sm">
                  <h1 className="font-serif text-5xl md:text-6xl text-warm-white leading-tight">
                    Value your business before talking to brokers
                  </h1>
                  <p className="text-xl text-off-white/90 leading-relaxed">
                    SDE-based valuation using IBBA transaction multiples. Understand market pricing before listing conversations.
                  </p>
                </Stack>

                <Link
                  href="/valuation"
                  className="inline-block px-8 py-4 bg-amber text-navy-dark font-medium transition-all hover:bg-amber-light"
                >
                  Calculate Valuation
                </Link>
              </Stack>
            </div>
          </PageContainer>
        </Section>

        {/* What you'll see */}
        <Section variant="default" withBorder="top">
          <PageContainer>
            <Stack gap="lg">
              <h2 className="font-serif text-4xl text-warm-white">
                SDE multiples adjusted for business-specific risks
              </h2>

              <div className="grid md:grid-cols-3 gap-x-16 gap-y-8">
                <Stack gap="xs">
                  <h3 className="text-sm font-semibold text-amber uppercase tracking-wide">Valuation range</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    Low, mid, high estimates based on industry multiples from IBBA market data
                  </p>
                </Stack>

                <Stack gap="xs">
                  <h3 className="text-sm font-semibold text-amber uppercase tracking-wide">Risk adjustments</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    Customer concentration, owner dependency, revenue trends, and other factors that affect pricing
                  </p>
                </Stack>

                <Stack gap="xs">
                  <h3 className="text-sm font-semibold text-amber uppercase tracking-wide">Deal quality score</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    Objective assessment of how buyers evaluate your business (0-100 scale)
                  </p>
                </Stack>

                <Stack gap="xs">
                  <h3 className="text-sm font-semibold text-amber uppercase tracking-wide">Industry benchmarks</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    Compare your multiple to typical ranges for businesses in your sector
                  </p>
                </Stack>

                <Stack gap="xs">
                  <h3 className="text-sm font-semibold text-amber uppercase tracking-wide">Rationale summary</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    Plain-English explanation of the valuation factors and calculation methodology
                  </p>
                </Stack>

                <Stack gap="xs">
                  <h3 className="text-sm font-semibold text-amber uppercase tracking-wide">Export options</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    PDF report or copy-paste summary for broker discussions
                  </p>
                </Stack>
              </div>
            </Stack>
          </PageContainer>
        </Section>

        {/* Use cases */}
        <Section variant="default" withBorder="top">
          <PageContainer>
            <div className="grid lg:grid-cols-2 gap-16">
              <Stack gap="xs">
                <h2 className="font-serif text-3xl text-warm-white">Before listing</h2>
                <p className="text-off-white/80 leading-relaxed">
                  Understand market pricing before broker conversations. Compare their suggested listing price to data-backed multiples. Use this as your baseline for negotiating commission structures.
                </p>
              </Stack>

              <Stack gap="xs">
                <h2 className="font-serif text-3xl text-warm-white">Exit planning</h2>
                <p className="text-off-white/80 leading-relaxed">
                  Benchmark your business value annually. Identify which factors hurt your multiple (customer concentration, owner dependency) and improve them before selling. Track progress over time.
                </p>
              </Stack>

              <Stack gap="xs">
                <h2 className="font-serif text-3xl text-warm-white">Buyer discussions</h2>
                <p className="text-off-white/80 leading-relaxed">
                  Reference industry multiples and risk factors when buyers propose offers. Understand which aspects of your business they'll negotiate on. Justify your asking price with transaction data.
                </p>
              </Stack>

              <Stack gap="xs">
                <h2 className="font-serif text-3xl text-warm-white">Partnership buyouts</h2>
                <p className="text-off-white/80 leading-relaxed">
                  Establish fair market value for internal ownership changes. Use SDE multiples as neutral third-party data point. Avoid disputes with transaction-backed pricing.
                </p>
              </Stack>
            </div>
          </PageContainer>
        </Section>

        {/* Final CTA */}
        <Section variant="default" withBorder="top">
          <PageContainer>
            <div className="max-w-2xl">
              <Stack gap="md">
                <h2 className="font-serif text-4xl text-warm-white">
                  Run your valuation
                </h2>
                <p className="text-lg text-off-white/80 leading-relaxed">
                  Annual revenue, SDE, and industry classification. Results in the same window.
                </p>
                <Link
                  href="/valuation"
                  className="inline-block px-8 py-4 bg-amber text-navy-dark font-medium transition-all hover:bg-amber-light"
                >
                  Calculate Valuation
                </Link>
              </Stack>
            </div>
          </PageContainer>
        </Section>

        <Footer />
      </div>
    </div>
  );
}

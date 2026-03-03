import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';
import Cluster from '@/components/layout/Cluster';

export const metadata: Metadata = {
  title: 'Free Business Valuation Tool for Brokers | Succedence',
  description: 'Price any Main Street business in under 60 seconds. SDE-based methodology, IBBA transaction data, risk-adjusted multiples. Free for business brokers and sellers.',
  openGraph: {
    title: 'Free Business Valuation Tool for Brokers | Succedence',
    description: 'Price any Main Street business in under 60 seconds. SDE-based methodology with IBBA transaction data.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-deep-navy">
      {/* Hero Section */}
      <Section variant="hero">
        <PageContainer>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <Stack gap="lg">
              <Stack gap="md">
                <h1 className="font-serif text-5xl lg:text-6xl text-warm-white leading-[1.1]">
                  Price main street businesses with transaction-backed multiples
                </h1>

                <p className="text-xl text-off-white/90 leading-relaxed max-w-xl">
                  Walk into listing conversations with defensible valuations. SDE multiples from IBBA market data, adjusted for risk factors you actually care about.
                </p>
              </Stack>

              <Cluster gap="xs" wrap>
                <Link
                  href="/valuation"
                  className="px-8 py-4 bg-amber text-navy-dark font-medium transition-all hover:bg-amber-light"
                >
                  Run a Valuation
                </Link>
                <Link
                  href="/how-it-works"
                  className="px-8 py-4 border border-silver/30 text-off-white hover:border-silver/60 transition-all"
                >
                  See the Methodology
                </Link>
              </Cluster>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate/40">
                <div>
                  <div className="text-2xl font-mono font-semibold text-amber">50+</div>
                  <div className="text-sm text-gray">Industries</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-semibold text-amber">IBBA</div>
                  <div className="text-sm text-gray">Data source</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-semibold text-amber">SDE</div>
                  <div className="text-sm text-gray">Methodology</div>
                </div>
              </div>
            </Stack>

            {/* Right: Process steps */}
            <Stack gap="sm">
              <Cluster gap="xs" align="start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-amber/40 text-amber font-mono text-lg">
                  01
                </div>
                <Stack gap="xs">
                  <h3 className="text-lg font-semibold text-warm-white">Input financials</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    Industry classification, annual revenue, normalized SDE. Optional risk factors for tighter ranges.
                  </p>
                </Stack>
              </Cluster>

              <Cluster gap="xs" align="start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-amber/40 text-amber font-mono text-lg">
                  02
                </div>
                <Stack gap="xs">
                  <h3 className="text-lg font-semibold text-warm-white">Review valuation range</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    Low/mid/high estimates with applied multiples, risk adjustments, and deal quality scoring.
                  </p>
                </Stack>
              </Cluster>

              <Cluster gap="xs" align="start">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-amber/40 text-amber font-mono text-lg">
                  03
                </div>
                <Stack gap="xs">
                  <h3 className="text-lg font-semibold text-warm-white">Export for client discussions</h3>
                  <p className="text-off-white/80 text-sm leading-relaxed">
                    PDF reports or plain-text rationale. Built for listing presentations.
                  </p>
                </Stack>
              </Cluster>
            </Stack>
          </div>
        </PageContainer>
      </Section>

      {/* Data Sources */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="xl">
            <Stack gap="xs">
              <h2 className="font-serif text-4xl text-warm-white max-w-2xl">
                Transaction data you can cite in client conversations
              </h2>
              <p className="text-lg text-off-white/70 max-w-2xl">
                Every multiple comes from closed deals, not guesswork.
              </p>
            </Stack>

            <div className="grid md:grid-cols-2 gap-12">
              <Stack gap="xs" className="border-l-2 border-amber/60 pl-6">
                <h3 className="text-xl font-semibold text-warm-white">IBBA market data</h3>
                <p className="text-off-white/80 leading-relaxed">
                  Multiples derived from the International Business Brokers Association quarterly market reports. Main street transaction data across 50+ industry categories.
                </p>
                <p className="text-sm text-gray">Updated: Q4 2024</p>
              </Stack>

              <Stack gap="xs" className="border-l-2 border-amber/60 pl-6">
                <h3 className="text-xl font-semibold text-warm-white">Risk-adjusted methodology</h3>
                <p className="text-off-white/80 leading-relaxed">
                  Base multiples adjusted for customer concentration, owner involvement, revenue trajectory, and recurring revenue mix. The same factors banks evaluate.
                </p>
                <p className="text-sm text-gray">6 risk dimensions</p>
              </Stack>

              <Stack gap="xs" className="border-l-2 border-amber/60 pl-6">
                <h3 className="text-xl font-semibold text-warm-white">Deal quality scoring</h3>
                <p className="text-off-white/80 leading-relaxed">
                  Objective assessment of business attractiveness from a buyer's perspective. Flags concentration risks, pricing anomalies, and structural issues.
                </p>
                <p className="text-sm text-gray">0-100 scale</p>
              </Stack>

              <Stack gap="xs" className="border-l-2 border-amber/60 pl-6">
                <h3 className="text-xl font-semibold text-warm-white">Export-ready output</h3>
                <p className="text-off-white/80 leading-relaxed">
                  PDF reports and plain-text summaries. Copy the valuation rationale directly into listing presentations or seller emails.
                </p>
                <p className="text-sm text-gray">No branding watermarks</p>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Output components */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="font-serif text-4xl text-warm-white">
              Everything exported in plain text or PDF
            </h2>

            <div className="grid md:grid-cols-3 gap-x-16 gap-y-8">
              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-amber uppercase tracking-wide">Valuation Range</h4>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  Low, mid, high estimates with applied SDE multiples and risk adjustments shown
                </p>
              </Stack>

              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-amber uppercase tracking-wide">Risk Breakdown</h4>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  Each risk factor (customer concentration, owner dependency, etc.) with impact on multiple
                </p>
              </Stack>

              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-amber uppercase tracking-wide">Deal Quality Score</h4>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  0-100 assessment of business attractiveness from a buyer's perspective
                </p>
              </Stack>

              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-amber uppercase tracking-wide">Broker Summary</h4>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  Copy-paste rationale paragraph for seller conversations or listing presentations
                </p>
              </Stack>

              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-amber uppercase tracking-wide">PDF Reports</h4>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  Clean export with no watermarks. Use in listing packages or CIMs
                </p>
              </Stack>

              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-amber uppercase tracking-wide">Methodology Notes</h4>
                <p className="text-off-white/80 text-sm leading-relaxed">
                  Transparent calculation logic and data sources you can reference
                </p>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Final CTA Section */}
      <Section variant="hero">
        <PageContainer>
          <div className="border-t border-b border-slate/40 py-16">
            <Stack gap="md" className="max-w-3xl">
              <h2 className="font-serif text-4xl lg:text-5xl text-warm-white leading-tight">
                Stop guessing at listing prices
              </h2>
              <p className="text-xl text-off-white/80 leading-relaxed">
                Walk into every seller conversation with data-backed valuations. Industry multiples, risk adjustments, deal quality scoring.
              </p>
              <div>
                <Link
                  href="/valuation"
                  className="inline-block px-8 py-4 bg-amber text-navy-dark font-medium transition-all hover:bg-amber-light"
                >
                  Run Your First Valuation
                </Link>
              </div>
            </Stack>
          </div>
        </PageContainer>
      </Section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

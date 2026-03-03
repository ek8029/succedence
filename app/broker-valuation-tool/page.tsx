import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';
import Cluster from '@/components/layout/Cluster';

export const metadata: Metadata = {
  title: 'Business Valuation Tool for Brokers | Fast, Defensible Pricing | Succedence',
  description:
    'The only valuation tool built specifically for business brokers. Transparent SDE methodology, IBBA-sourced multiples, and professional PDF output. Price your next listing in under 60 seconds.',
  openGraph: {
    title: 'Business Valuation Tool for Brokers | Succedence',
    description: 'Consistent, defensible business valuations for brokers. SDE-based methodology with documented rationale.',
    type: 'website',
  },
};

export default function BrokerValuationToolPage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        {/* Hero Section */}
        <Section variant="hero">
          <PageContainer>
            <Stack gap="lg" className="text-center items-center">
              <span className="px-6 py-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-full text-sm font-medium tracking-wide">
                FOR BUSINESS BROKERS
              </span>

              <Stack gap="sm" className="max-w-3xl">
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-warm-white leading-tight">
                  The Business Valuation Tool
                  <span className="block text-blue-400">Brokers Actually Use</span>
                </h1>

                <p className="text-lg sm:text-xl text-platinum/90 leading-relaxed">
                  Stop reinventing valuations for every listing. Get consistent, defensible pricing in under a minute.
                </p>
              </Stack>

              <Stack gap="sm" className="items-center">
                <Link
                  href="/valuation"
                  className="inline-flex items-center justify-center px-12 py-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-xl"
                >
                  Try It Free →
                </Link>

                <p className="text-sm text-silver/60">
                  Used by brokers pricing $500K–$5M businesses • No signup required
                </p>
              </Stack>
            </Stack>
          </PageContainer>
        </Section>

        {/* Broker Pain Points */}
        <Section variant="tight">
          <PageContainer>
            <div className="grid md:grid-cols-2 gap-8 md:auto-rows-fr">
              {/* Problems */}
              <Stack gap="sm" className="glass p-8 rounded-lg border border-red-500/30">
                <Cluster gap="xs" align="center">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-warm-white">Without This Tool</h3>
                </Cluster>
                <Stack gap="xs">
                  <Cluster gap="xs" align="start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-silver/80">Inconsistent pricing across listings</span>
                  </Cluster>
                  <Cluster gap="xs" align="start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-silver/80">Hours spent building Excel models</span>
                  </Cluster>
                  <Cluster gap="xs" align="start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-silver/80">Hard to defend pricing to sellers</span>
                  </Cluster>
                  <Cluster gap="xs" align="start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-silver/80">No documentation of methodology</span>
                  </Cluster>
                </Stack>
              </Stack>

              {/* Solutions */}
              <Stack gap="sm" className="glass p-8 rounded-lg border border-blue-500/30">
                <Cluster gap="xs" align="center">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-semibold text-warm-white">With This Tool</h3>
                </Cluster>
                <Stack gap="xs">
                  <Cluster gap="xs" align="start">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-silver/80">Consistent, repeatable methodology</span>
                  </Cluster>
                  <Cluster gap="xs" align="start">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-silver/80">Results in under 60 seconds</span>
                  </Cluster>
                  <Cluster gap="xs" align="start">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-silver/80">Documented rationale you can share</span>
                  </Cluster>
                  <Cluster gap="xs" align="start">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-silver/80">Professional PDF reports for sellers</span>
                  </Cluster>
                </Stack>
              </Stack>
            </div>
          </PageContainer>
        </Section>

        {/* Output Sample */}
        <Section variant="tight">
          <PageContainer>
            <Stack gap="md">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white text-center">
                What You Get
              </h2>
              <Stack gap="md" className="glass p-8 rounded-lg border border-gold/20">
                <div className="grid md:grid-cols-2 gap-8">
                  <Stack gap="xs">
                    <h4 className="font-semibold text-warm-white">Valuation Range</h4>
                    <Stack gap="xs" className="text-silver/80">
                      <Cluster justify="between">
                        <span>Low:</span>
                        <span className="font-mono text-blue-400">$850K</span>
                      </Cluster>
                      <Cluster justify="between">
                        <span>Mid:</span>
                        <span className="font-mono text-blue-400">$1.2M</span>
                      </Cluster>
                      <Cluster justify="between">
                        <span>High:</span>
                        <span className="font-mono text-blue-400">$1.5M</span>
                      </Cluster>
                    </Stack>
                  </Stack>
                  <Stack gap="xs">
                    <h4 className="font-semibold text-warm-white">Deal Quality Score</h4>
                    <div className="text-4xl font-bold text-blue-400">7.2<span className="text-xl text-silver/60">/10</span></div>
                    <p className="text-sm text-silver/70">Above average marketability</p>
                  </Stack>
                </div>
                <Stack gap="xs" className="border-t border-gold/20 pt-6">
                  <h4 className="font-semibold text-warm-white">Broker Rationale</h4>
                  <p className="text-silver/80 leading-relaxed text-sm italic">
                    "This restaurant shows strong fundamentals with $400K SDE on $1.2M revenue. The mid-range valuation of $1.2M (3.0x SDE multiple) reflects typical pricing for established restaurants with stable cash flow. Risk adjustments account for moderate owner involvement and industry-standard customer concentration..."
                  </p>
                </Stack>
              </Stack>
            </Stack>
          </PageContainer>
        </Section>

        {/* Objections */}
        <Section variant="tight">
          <PageContainer>
            <Stack gap="md">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white text-center">
                Common Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-8 md:auto-rows-fr">
                <Stack gap="xs" className="glass p-6 rounded-lg border border-gold/20">
                  <h4 className="text-lg font-semibold text-warm-white">How is this different from Excel?</h4>
                  <p className="text-silver/80 text-sm">
                    Risk-adjusted multiples, automated deal scoring, and client-ready output. No formulas to maintain or update.
                  </p>
                </Stack>
                <Stack gap="xs" className="glass p-6 rounded-lg border border-gold/20">
                  <h4 className="text-lg font-semibold text-warm-white">Will this replace my judgment?</h4>
                  <p className="text-silver/80 text-sm">
                    No. It gives you a documented starting point based on market data. You still apply your expertise and local knowledge.
                  </p>
                </Stack>
                <Stack gap="xs" className="glass p-6 rounded-lg border border-gold/20">
                  <h4 className="text-lg font-semibold text-warm-white">Is this for serious deals?</h4>
                  <p className="text-silver/80 text-sm">
                    Yes. Used by brokers pricing $500K–$5M Main Street businesses. Professional-grade methodology and output.
                  </p>
                </Stack>
                <Stack gap="xs" className="glass p-6 rounded-lg border border-gold/20">
                  <h4 className="text-lg font-semibold text-warm-white">What's the catch?</h4>
                  <p className="text-silver/80 text-sm">
                    No catch. Free valuations with no limits. Optional paid features like PDF export and advanced analytics.
                  </p>
                </Stack>
              </div>
            </Stack>
          </PageContainer>
        </Section>

        {/* Pricing Transparency */}
        <Section variant="tight">
          <PageContainer>
            <Stack gap="sm" className="glass p-8 rounded-lg border border-gold/20 text-center items-center">
              <h3 className="text-2xl font-semibold text-warm-white">Pricing Transparency</h3>
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl">
                <Stack gap="xs">
                  <div className="text-3xl font-bold text-blue-400">Free</div>
                  <div className="text-sm text-silver/80">Unlimited valuations</div>
                </Stack>
                <Stack gap="xs">
                  <div className="text-3xl font-bold text-blue-400">$19</div>
                  <div className="text-sm text-silver/80">PDF exports (optional)</div>
                </Stack>
                <Stack gap="xs">
                  <div className="text-3xl font-bold text-blue-400">$49</div>
                  <div className="text-sm text-silver/80">Pro features (optional)</div>
                </Stack>
              </div>
              <p className="text-sm text-silver/60">
                Start free. Upgrade only when you need advanced features.
              </p>
            </Stack>
          </PageContainer>
        </Section>

        {/* Final CTA */}
        <Section variant="tight">
          <PageContainer>
            <Stack gap="md" className="glass p-12 rounded-lg border border-gold/20 text-center items-center">
              <Stack gap="xs" className="max-w-2xl">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-warm-white">
                  Try It on Your Next Listing
                </h2>
                <p className="text-lg text-platinum/80">
                  See how fast you can generate a defensible valuation. No signup required.
                </p>
              </Stack>
              <Link
                href="/valuation"
                className="inline-flex items-center justify-center px-10 py-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg"
              >
                Run a Free Valuation
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Stack>
          </PageContainer>
        </Section>

        <Footer />
      </div>
    </div>
  );
}

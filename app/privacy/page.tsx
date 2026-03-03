import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Section from '@/components/layout/Section';
import PageContainer from '@/components/layout/PageContainer';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'Privacy Policy | Succedence',
  description: 'Succedence privacy policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  const lastUpdated = 'February 2026';

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90" />
      <div className="absolute inset-0 bg-noise opacity-10" />

      <div className="relative z-10">
        <Section variant="default">
          <PageContainer className="max-w-3xl">
            <Stack gap="lg">
              <div>
                <Link href="/" className="text-silver/60 hover:text-gold transition-colors text-sm">
                  ← Back to Home
                </Link>
              </div>

              <Stack gap="xs">
                <h1 className="font-serif text-4xl font-bold text-warm-white">Privacy Policy</h1>
                <p className="text-silver/60 text-sm">Last updated: {lastUpdated}</p>
              </Stack>

              <div className="prose prose-invert max-w-none space-y-10">

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">1. Who We Are</h2>
              <p className="text-silver/80 leading-relaxed">
                Succedence (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates Succedence.com, a business valuation
                and marketplace platform for brokers, buyers, and sellers of small businesses. This policy explains
                how we collect and use data when you visit our site or use our tools.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">2. Information We Collect</h2>
              <div className="space-y-4 text-silver/80">
                <div>
                  <h3 className="text-warm-white font-medium mb-2">Information you provide directly</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                    <li>Account registration details (name, email, password)</li>
                    <li>Business financial data entered into the valuation tool (revenue, SDE, EBITDA)</li>
                    <li>Business details (industry, location, employee count, year established)</li>
                    <li>Profile information (role, company, specializations for brokers)</li>
                    <li>Communications you send us via contact forms or email</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-warm-white font-medium mb-2">Information collected automatically</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed">
                    <li>IP address and general location (city/region level)</li>
                    <li>Browser type and device information</li>
                    <li>Pages visited, time on page, and navigation paths</li>
                    <li>Anonymous session identifiers (for free-tier valuation tracking)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-silver/80 text-sm leading-relaxed">
                <li>To operate and provide the valuation tool and marketplace features</li>
                <li>To generate your business valuation results and store your history (if you have an account)</li>
                <li>To send match alerts, digest emails, and product updates (you can unsubscribe anytime)</li>
                <li>To process payments and manage your subscription via Stripe</li>
                <li>To improve our valuation models and product based on aggregated, anonymized usage patterns</li>
                <li>To prevent abuse and enforce our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">4. Valuation Data Specifically</h2>
              <p className="text-silver/80 leading-relaxed text-sm">
                Business financial data you enter into the valuation tool (revenue, SDE, EBITDA, etc.) is used
                solely to calculate and return your valuation results. We do not sell, share, or expose individual
                business financial data to third parties.
              </p>
              <p className="text-silver/80 leading-relaxed text-sm mt-3">
                Anonymous, aggregated data (e.g., &quot;landscaping businesses in this SDE range trade at X multiple&quot;)
                may be used for market research and to improve our valuation models. No individual business
                is identifiable from this aggregated data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">5. Data Sharing</h2>
              <p className="text-silver/80 leading-relaxed text-sm mb-3">
                We do not sell your personal data. We share data only with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-silver/80 text-sm leading-relaxed">
                <li>
                  <strong className="text-warm-white">Supabase</strong> — our database and authentication provider
                </li>
                <li>
                  <strong className="text-warm-white">Stripe</strong> — payment processing (billing data only)
                </li>
                <li>
                  <strong className="text-warm-white">Resend</strong> — transactional email delivery
                </li>
                <li>
                  <strong className="text-warm-white">Upstash</strong> — background job processing
                </li>
                <li>
                  <strong className="text-warm-white">OpenAI</strong> — AI analysis features (when enabled); no financial data is shared for training
                </li>
                <li>Law enforcement or regulatory bodies when legally required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">6. Cookies and Tracking</h2>
              <p className="text-silver/80 leading-relaxed text-sm">
                We use essential cookies for authentication and session management. We may use analytics tools to
                understand how our product is used. We do not use third-party advertising cookies or sell
                behavioral data to advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">7. Data Retention</h2>
              <p className="text-silver/80 leading-relaxed text-sm">
                Account data is retained as long as your account is active. You may request deletion of your
                account and associated data at any time by emailing us. Anonymous valuation records may be
                retained in aggregated form for market analysis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">8. Your Rights</h2>
              <p className="text-silver/80 leading-relaxed text-sm mb-3">
                Depending on your jurisdiction, you may have rights including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-silver/80 text-sm leading-relaxed">
                <li>Access to the personal data we hold about you</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li>Portability of your data in a machine-readable format</li>
                <li>Opt-out of marketing emails at any time (unsubscribe link in every email)</li>
              </ul>
              <p className="text-silver/80 text-sm mt-3">
                To exercise any of these rights, contact us at{' '}
                <a href="mailto:privacy@succedence.com" className="text-gold hover:underline">
                  privacy@succedence.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">9. Security</h2>
              <p className="text-silver/80 leading-relaxed text-sm">
                We use industry-standard security practices including encrypted connections (HTTPS), row-level
                security on our database, and secure authentication. No method of transmission over the internet
                is 100% secure; we cannot guarantee absolute security but take reasonable precautions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">10. Changes to This Policy</h2>
              <p className="text-silver/80 leading-relaxed text-sm">
                We may update this policy as our product evolves. We will notify registered users of material
                changes via email. Continued use of the platform after changes constitutes acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-warm-white mb-4">11. Contact</h2>
              <p className="text-silver/80 leading-relaxed text-sm">
                Questions about this policy? Reach us at{' '}
                <a href="mailto:privacy@succedence.com" className="text-gold hover:underline">
                  privacy@succedence.com
                </a>{' '}
                or via our{' '}
                <Link href="/contact" className="text-gold hover:underline">
                  contact page
                </Link>.
              </p>
            </section>
              </div>
            </Stack>
          </PageContainer>
        </Section>

        <Footer />
      </div>
    </div>
  );
}

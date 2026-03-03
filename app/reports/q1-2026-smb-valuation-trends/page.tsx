import type { Metadata } from 'next';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'Q1 2026 SMB Valuation Trends Report | Succedence',
  description:
    'Quarterly analysis of small business valuation trends, SDE multiple movements, and deal activity across Main Street industries. Based on transaction data from Q1 2026.',
  openGraph: {
    title: 'Q1 2026 SMB Valuation Trends Report',
    description:
      'How are small business valuations trending in Q1 2026? Key data on SDE multiples, deal volume, and which industries are heating up.',
    type: 'article',
  },
};

// Q1 2026 data — update each quarter
const QUARTER = 'Q1 2026';
const PUBLISH_DATE = 'February 2026';

const HEADLINE_STATS = [
  { label: 'Median SDE Multiple (all industries)', value: '2.8x', change: '+0.1x', trend: 'up' },
  { label: 'Average Days on Market', value: '194 days', change: '−12 days', trend: 'up' },
  { label: 'Sale Price / Asking Price Ratio', value: '91%', change: '+1%', trend: 'up' },
  { label: 'Deals Using Seller Financing', value: '63%', change: '+3%', trend: 'up' },
];

const INDUSTRY_TRENDS = [
  { industry: 'Home Services (HVAC, Plumbing, Pest Control)', trend: 'hot', multiple: '3.0–4.5x', notes: 'Recurring service contracts driving premium multiples. Strong buyer demand from roll-up acquirers.' },
  { industry: 'SaaS / IT Services / MSP', trend: 'hot', multiple: '3.5–7.0x', notes: 'Recurring revenue and remote operability continue to command premium multiples despite broader tech slowdown.' },
  { industry: 'Healthcare (Dental, Vet, Home Health)', trend: 'hot', multiple: '2.5–5.0x', notes: 'PE-backed DSO rollups sustaining demand for dental practices. Veterinary seeing similar platform acquisition activity.' },
  { industry: 'E-Commerce / Amazon FBA', trend: 'cooling', multiple: '2.5–4.5x', notes: 'Multiple compression from peak levels. Aggregators pulling back. Deals still closing but at lower multiples than 2021–2022.' },
  { industry: 'Full-Service Restaurants / Bars', trend: 'soft', multiple: '1.5–2.8x', notes: 'Labor costs and lease renewals remain headwinds. Buyers cautious. Strong operators still closing at mid-range multiples.' },
  { industry: 'General Retail', trend: 'soft', multiple: '1.5–3.0x', notes: 'E-commerce competition suppressing multiples. Location-dependent businesses face leasing uncertainty.' },
  { industry: 'Manufacturing / Machine Shops', trend: 'stable', multiple: '3.0–5.5x', notes: 'Reshoring tailwinds supporting demand. Precision manufacturing in particular seeing institutional buyer interest.' },
  { industry: 'Staffing & Recruiting', trend: 'stable', multiple: '2.0–4.0x', notes: 'Steady demand. Multiples stable after normalizing from post-COVID hiring surge premiums.' },
];

function TrendBadge({ trend }: { trend: string }) {
  const styles = {
    hot:     'text-green-400 bg-green-400/10 border-green-400/20',
    cooling: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    soft:    'text-red-400 bg-red-400/10 border-red-400/20',
    stable:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  }[trend] ?? 'text-silver/60 bg-white/5 border-white/10';

  const label = trend.charAt(0).toUpperCase() + trend.slice(1);
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded border font-medium ${styles}`}>
      {label}
    </span>
  );
}

export default function Q1ReportPage() {
  return (
    <div className="min-h-screen bg-midnight text-warm-white">
      {/* Hero Header */}
      <Section variant="hero">
        <PageContainer>
          <Stack gap="lg">
            <nav className="text-sm text-silver/60">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/reports" className="hover:text-gold transition-colors">Reports</Link>
              <span className="mx-2">/</span>
              <span className="text-silver/80">{QUARTER} SMB Valuation Trends</span>
            </nav>

            <Stack gap="sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-gold bg-gold/10 border border-gold/20 rounded px-3 py-1">
                  Quarterly Report
                </span>
                <span className="text-xs text-silver/60">{PUBLISH_DATE}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-warm-white leading-tight">
                {QUARTER} SMB Valuation Trends Report
              </h1>
              <p className="text-lg text-silver/80 max-w-2xl">
                A quarterly snapshot of small business valuation activity across Main Street industries —
                covering SDE multiple trends, deal volume, and which sectors are heating up or cooling down
                heading into Q2 2026.
              </p>
            </Stack>
          </Stack>
        </PageContainer>
      </Section>

      {/* Methodology note */}
      <Section variant="tight">
        <PageContainer>
          <div className="glass rounded-luxury border border-white/5 p-4 text-xs text-silver/60 leading-relaxed">
            <strong className="text-silver/80">Data & methodology:</strong> This report aggregates publicly
            reported transaction data from BizBuySell Insight Reports, IBBA Market Pulse surveys, and
            Succedence&apos;s internal valuation database. SDE multiples represent the median ratio of
            sale price to normalized SDE for closed transactions. All data is for Main Street businesses
            (under $5M in revenue). Results are indicative, not exhaustive.
          </div>
        </PageContainer>
      </Section>

      {/* Headline stats */}
      <Section variant="default">
        <PageContainer>
          <Stack gap="md">
            <h2 className="text-2xl font-bold text-warm-white">{QUARTER} Headline Numbers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HEADLINE_STATS.map(stat => (
                <div key={stat.label} className="glass rounded-luxury border border-white/5 p-4 text-center">
                  <p className="text-silver/60 text-xs mb-2 leading-tight">{stat.label}</p>
                  <p className="text-2xl font-bold text-warm-white mb-1">{stat.value}</p>
                  <p className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change} vs. Q4 2025
                  </p>
                </div>
              ))}
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Executive summary */}
      <Section variant="default">
        <PageContainer>
          <Stack gap="md">
            <h2 className="text-2xl font-bold text-warm-white">Executive Summary</h2>
            <Stack gap="sm" className="text-silver/80 leading-relaxed">
              <p>
                The Main Street M&amp;A market entered Q1 2026 with cautious optimism. SBA lending activity
                remained steady following the Federal Reserve&apos;s rate stabilization, making 7(a) loan
                financing accessible for qualified buyers at all-in rates that pencil out for businesses
                with strong cash flow. The median SDE multiple ticked up 0.1x to 2.8x, reflecting continued
                strong demand for quality businesses in service and healthcare sectors.
              </p>
              <p>
                The clearest trend in Q1 is the widening gap between &quot;premium&quot; and &quot;average&quot;
                businesses within the same industry. A well-run HVAC company with recurring maintenance
                contracts, multiple crews, and clean books can fetch 4.0–4.5x SDE. A similar-sized owner-
                operated shop with no systems and all customer relationships tied to the owner is lucky to
                get 2.5x. Buyers have become more sophisticated — especially those with PE or roll-up
                backing — and the premium for deal-ready businesses has never been higher.
              </p>
              <p>
                Home services (HVAC, pest control, plumbing) continued to be the hottest sector, driven by
                roll-up acquisition activity from PE-backed platforms. Healthcare — particularly dental and
                veterinary practices — saw consistent institutional demand. SaaS and MSP businesses maintained
                premium multiples despite broader technology sector headwinds. Restaurants and general retail
                continued to underperform, weighed down by labor costs and lease uncertainty.
              </p>
            </Stack>
          </Stack>
        </PageContainer>
      </Section>

      {/* Industry trends table */}
      <Section variant="default">
        <PageContainer>
          <Stack gap="md">
            <h2 className="text-2xl font-bold text-warm-white">Industry Trends by Sector</h2>
            <Stack gap="xs">
              {INDUSTRY_TRENDS.map(row => (
                <div key={row.industry} className="glass rounded-luxury border border-white/5 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-warm-white font-medium text-sm">{row.industry}</h3>
                      <TrendBadge trend={row.trend} />
                    </div>
                    <span className="text-gold font-semibold text-sm whitespace-nowrap">{row.multiple}</span>
                  </div>
                  <p className="text-silver/70 text-xs leading-relaxed">{row.notes}</p>
                </div>
              ))}
            </Stack>
          </Stack>
        </PageContainer>
      </Section>

      {/* What buyers are paying for */}
      <Section variant="default">
        <PageContainer>
          <Stack gap="md">
            <h2 className="text-2xl font-bold text-warm-white">What Buyers Are Paying Premiums For</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Recurring revenue with contracts', premium: '+0.3–0.8x', detail: 'Signed maintenance contracts, subscription arrangements, or retainer-based revenue. Predictability justifies a meaningful premium over project-based businesses.' },
                { title: 'Documented systems and trained staff', premium: '+0.2–0.5x', detail: "Businesses with SOPs, employee handbooks, and multiple trained employees. Buyers aren't just buying cash flow — they're buying a business they can actually run." },
                { title: 'Diversified customer base', premium: '+0.2–0.4x', detail: 'No single customer exceeding 10–15% of revenue. Concentration risk is the #1 concern SBA lenders flag in underwriting.' },
                { title: 'Clean, tax-return-supported financials', premium: '+0.1–0.3x', detail: "P&Ls that reconcile with tax returns and have minimal gray-area add-backs. Deals with questionable books get discounted — or don't close at all." },
                { title: 'Transferable customer relationships', premium: '+0.2–0.4x', detail: 'Established brand, Google reviews, referral network, or franchise affiliation. Businesses where customers return for the brand, not just the owner.' },
                { title: 'Growth trajectory (even modest)', premium: '+0.2–0.5x', detail: "Even 5–10% annual revenue growth signals health. Declining businesses — even if profitable today — face multiple compression and skeptical buyers." },
              ].map(item => (
                <div key={item.title} className="glass rounded-luxury border border-white/5 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-warm-white font-semibold text-sm leading-tight">{item.title}</h3>
                    <span className="text-green-400 text-sm font-bold ml-3 whitespace-nowrap">{item.premium}</span>
                  </div>
                  <p className="text-silver/70 text-xs leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Deal structure trends */}
      <Section variant="default">
        <PageContainer>
          <Stack gap="md">
            <h2 className="text-2xl font-bold text-warm-white">Deal Structure Trends</h2>
            <div className="glass rounded-luxury border border-white/5 p-6">
              <Stack gap="sm" className="text-silver/80 leading-relaxed text-sm">
                <p>
                  <strong className="text-warm-white">Seller financing is at a multi-year high (63% of deals).</strong> With
                  buyers increasingly using seller notes to bridge valuation gaps, sellers who are willing to
                  carry 10–20% of the purchase price are seeing shorter marketing periods and fewer deal failures
                  at close.
                </p>
                <p>
                  <strong className="text-warm-white">SBA 7(a) remains the dominant financing vehicle for deals under $5M.</strong> Rates
                  stabilized in Q1, with effective all-in rates for 10-year term loans landing in the 9.5–11%
                  range. At these rates, a business needs roughly $1.25 in SDE for every $1 in annual debt
                  service to pass SBA underwriting — buyers and brokers should run debt service coverage
                  calculations before pricing a deal.
                </p>
                <p>
                  <strong className="text-warm-white">Earn-outs are more common in uncertain industries.</strong> Restaurants, retail,
                  and project-based businesses are increasingly structured with earn-out components tied to
                  revenue performance. This lets sellers get closer to their asking price while protecting
                  buyers against downside risk in volatile sectors.
                </p>
                <p>
                  <strong className="text-warm-white">Training and transition periods are lengthening.</strong> Buyers are negotiating
                  longer seller transition periods — from 60 to 90–120 days — especially when the seller is
                  deeply embedded in customer relationships. This is becoming a standard ask, not a special
                  concession.
                </p>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Outlook */}
      <Section variant="default">
        <PageContainer>
          <Stack gap="md">
            <h2 className="text-2xl font-bold text-warm-white">Q2 2026 Outlook</h2>
            <Stack gap="sm" className="text-silver/80 leading-relaxed">
              <p>
                The pipeline of businesses coming to market in Q2 looks healthy. Baby Boomer business owners
                continue to exit at elevated rates — the demographic tailwind that has driven Main Street deal
                volume for the past several years remains intact. SBA lending conditions are stable. Buyer
                demand, particularly from search fund investors and first-time acquisitions, continues to
                grow.
              </p>
              <p>
                The risk on the horizon is interest rate sensitivity. Any upward movement in rates creates
                meaningful pressure on deal math, particularly for buyers relying heavily on SBA 7(a)
                financing. Brokers pricing listings in Q2 should stress-test valuations against a 100–150bps
                rate increase scenario to ensure deals remain bankable.
              </p>
              <p>
                Sector-wise, home services and healthcare will continue to outperform. Watch for increasing
                roll-up activity in automotive repair and pest control — both are attracting consolidation
                capital that will push multiples in those sectors upward. Restaurants will remain challenging
                until labor markets ease further.
              </p>
            </Stack>
          </Stack>
        </PageContainer>
      </Section>

      {/* CTA */}
      <Section variant="default">
        <PageContainer>
          <div className="glass rounded-luxury border border-gold/20 p-8 text-center">
            <Stack gap="md" className="items-center">
              <h2 className="text-2xl font-bold text-warm-white">
                See where your business falls in these ranges
              </h2>
              <p className="text-silver/70 max-w-md">
                Run a free, risk-adjusted valuation using {QUARTER} industry multiples.
                Takes under two minutes and requires no account.
              </p>
              <Link
                href="/valuation"
                className="inline-block px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-colors"
              >
                Run a Free Valuation →
              </Link>
            </Stack>
          </div>
        </PageContainer>
      </Section>

      {/* Related */}
      <Section variant="default">
        <PageContainer>
          <Stack gap="md">
            <h2 className="text-xl font-bold text-warm-white">Related resources</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { href: '/blog/sde-multiples-by-industry', title: 'SDE Multiples by Industry 2026', desc: 'Full reference table for 48 industries.' },
                { href: '/blog/how-to-value-a-small-business', title: 'How to Value a Small Business', desc: 'Step-by-step guide to small business valuation.' },
                { href: '/blog/business-valuation-for-brokers', title: 'Valuation for Brokers', desc: 'The complete workflow for pricing a listing.' },
              ].map(r => (
                <Link key={r.href} href={r.href} className="glass rounded-luxury border border-white/5 p-4 hover:border-gold/30 transition-colors group block">
                  <h3 className="text-warm-white font-semibold mb-1 group-hover:text-gold transition-colors text-sm">{r.title}</h3>
                  <p className="text-silver/60 text-xs leading-relaxed">{r.desc}</p>
                </Link>
              ))}
            </div>
          </Stack>
        </PageContainer>
      </Section>
    </div>
  );
}

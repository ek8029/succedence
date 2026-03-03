import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'How to Value a Small Business in 2026 | Complete Guide | Succedence',
  description:
    'Learn the four main methods for valuing a small business: SDE multiple, EBITDA multiple, DCF, and asset-based. Understand which method applies to your deal and how to calculate a defensible number.',
  openGraph: {
    title: 'How to Value a Small Business in 2026 | Complete Guide',
    description: 'A practical guide to business valuation methods for brokers, buyers, and sellers of Main Street businesses.',
    type: 'article',
  },
};

export default function HowToValueSmallBusinessPage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90" />
      <div className="absolute inset-0 bg-noise opacity-10" />

      <div className="relative z-10">
        <Section variant="default">
          <PageContainer className="max-w-3xl">
            <Stack gap="lg">
              <div>
                <Link href="/valuation" className="text-gold hover:underline text-sm">← Free Valuation Tool</Link>
                <span className="text-silver/40 text-sm mx-2">·</span>
                <Link href="/blog/sde-multiples-by-industry" className="text-silver/60 hover:text-gold text-sm">SDE Multiples by Industry</Link>
              </div>

              <Stack gap="sm">
                <div>
                  <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-medium">VALUATION GUIDE</span>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl font-bold text-warm-white leading-tight">
                  How to Value a Small Business in 2026
                </h1>
                <p className="text-xl text-silver/80 leading-relaxed">
                  A practical guide to the four main valuation methods — and which one to use for your deal.
                </p>
                <p className="text-silver/50 text-sm">Updated February 2026 · 12 min read</p>
              </Stack>

              <Stack gap="md" className="prose-custom">

                <p className="text-silver/80 leading-relaxed text-lg">
                  Valuing a small business is part science, part art. The science is the math: multiples, cash flows, assets.
                  The art is knowing which method to apply, which adjustments to make, and how to present a number that
                  a seller will accept and a buyer will pay. Get it wrong and the deal falls apart. Get it right and you
                  close faster, with fewer surprises.
                </p>

                <p className="text-silver/80 leading-relaxed">
                  This guide covers the four main approaches used for Main Street and lower middle-market businesses
                  ($250K–$10M in transaction value), with concrete examples and the thresholds that determine which
                  method applies to your deal.
                </p>

                <div className="glass p-6 rounded-luxury border border-gold/20">
                  <p className="text-gold font-semibold">Quick Answer</p>
                  <p className="text-silver/80 text-sm leading-relaxed">
                    For most small businesses (under $5M in asking price), the SDE multiple method is the right
                    starting point. Get an instant SDE-based valuation using our{' '}
                    <Link href="/valuation" className="text-gold hover:underline">free valuation calculator</Link>.
                  </p>
                </div>

                <h2 className="font-serif text-2xl font-bold text-warm-white">The Four Valuation Methods</h2>

                <Stack gap="sm">
                  <h3 className="text-xl font-semibold text-warm-white">1. SDE Multiple (Seller's Discretionary Earnings)</h3>
                  <p className="text-silver/80 leading-relaxed">
                    The SDE method is the dominant approach for Main Street businesses — anything with one to a few owners,
                    under about $5M in revenue, where the owner actively works in the business. It answers the question:
                    what is the total financial benefit to a working owner who buys this business?
                  </p>
                  <p className="text-silver/80 leading-relaxed">
                    <strong className="text-warm-white">SDE = Net profit + owner salary + owner benefits + depreciation + amortization + one-time non-recurring expenses</strong>
                  </p>
                  <p className="text-silver/80 leading-relaxed">
                    Once you have SDE, you multiply it by an industry-specific multiple. Industry multiples for Main Street
                    businesses typically range from 1.5x to 4.5x SDE. The multiple reflects risk: how reliably will that
                    SDE continue after the sale?
                  </p>
                </Stack>

                <div className="glass p-5 rounded-luxury border border-white/10">
                  <p className="text-warm-white font-semibold">Example: HVAC Company</p>
                  <Stack gap="xs" className="text-silver/80 text-sm">
                    <div className="flex justify-between"><span>Revenue</span><span className="font-mono text-warm-white">$1,200,000</span></div>
                    <div className="flex justify-between"><span>Net profit (reported)</span><span className="font-mono text-warm-white">$85,000</span></div>
                    <div className="flex justify-between"><span>+ Owner salary</span><span className="font-mono text-warm-white">$95,000</span></div>
                    <div className="flex justify-between"><span>+ Owner health insurance</span><span className="font-mono text-warm-white">$18,000</span></div>
                    <div className="flex justify-between"><span>+ Non-recurring legal expense</span><span className="font-mono text-warm-white">$12,000</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-2 font-semibold"><span className="text-gold">SDE</span><span className="font-mono text-gold">$210,000</span></div>
                    <div className="flex justify-between"><span>Industry multiple (HVAC)</span><span className="font-mono text-warm-white">3.0x–3.5x</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-2 font-semibold"><span className="text-gold">Valuation Range</span><span className="font-mono text-gold">$630K–$735K</span></div>
                  </Stack>
                </div>

                <p className="text-silver/80 leading-relaxed">
                  See{' '}
                  <Link href="/blog/sde-multiples-by-industry" className="text-gold hover:underline">
                    SDE multiples by industry
                  </Link>{' '}
                  for a full table of industry-specific ranges sourced from IBBA transaction data.
                </p>

                <Stack gap="sm">
                  <h3 className="text-xl font-semibold text-warm-white">2. EBITDA Multiple</h3>
                  <p className="text-silver/80 leading-relaxed">
                    EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) is the preferred metric
                    for businesses that have professional management layers — where the owner doesn't work day-to-day
                    or where there's a CEO separate from the owner. EBITDA excludes the owner's personal compensation
                    distortions, making it more comparable across businesses of different ownership structures.
                  </p>
                  <p className="text-silver/80 leading-relaxed">
                    EBITDA multiples for lower middle-market businesses ($1M–$10M in EBITDA) range from 4x to 8x,
                    with significant variation by industry and growth trajectory. SaaS businesses can command 6x–12x
                    EBITDA; traditional manufacturing might be 3.5x–5x.
                  </p>
                  <p className="text-silver/80 leading-relaxed">
                    <strong className="text-warm-white">When to use EBITDA:</strong> When the business has revenue over
                    $2M, has manager-level employees who don't need replacing by the buyer, or when the seller is
                    passive and compensation is at market rate. If SDE and EBITDA are close in magnitude, EBITDA
                    is often the cleaner metric.
                  </p>
                </Stack>

                <Stack gap="sm">
                  <h3 className="text-xl font-semibold text-warm-white">3. Discounted Cash Flow (DCF)</h3>
                  <p className="text-silver/80 leading-relaxed">
                    DCF projects future free cash flows and discounts them back to present value using a required rate
                    of return (discount rate). It's theoretically the most rigorous method — it directly models the
                    time value of money and growth trajectory.
                  </p>
                  <p className="text-silver/80 leading-relaxed">
                    In practice, DCF is rarely used as the primary method for Main Street deals because:
                  </p>
                  <ul className="space-y-2 text-silver/80 text-sm ml-4">
                    <li className="flex gap-2"><span className="text-silver/40 mt-1">→</span><span>Small businesses lack the predictable, documented cash flows needed for reliable projections</span></li>
                    <li className="flex gap-2"><span className="text-silver/40 mt-1">→</span><span>Discount rate selection is highly subjective (10%? 20%? 30%?) and dramatically swings the output</span></li>
                    <li className="flex gap-2"><span className="text-silver/40 mt-1">→</span><span>Sellers can't verify or challenge the math, creating negotiation friction</span></li>
                  </ul>
                  <p className="text-silver/80 leading-relaxed">
                    <strong className="text-warm-white">When DCF is useful:</strong> As a cross-check for fast-growing businesses
                    where a multiple of current earnings understates value, or for acquisitions with strong recurring
                    revenue and multi-year contracts.
                  </p>
                </Stack>

                <Stack gap="sm">
                  <h3 className="text-xl font-semibold text-warm-white">4. Asset-Based Valuation</h3>
                  <p className="text-silver/80 leading-relaxed">
                    Asset-based valuation looks at the liquidation or replacement value of the business's assets:
                    inventory, equipment (FF&amp;E), real estate, accounts receivable, minus liabilities. It sets
                    a floor — no rational buyer should pay less than what the assets are worth independently.
                  </p>
                  <p className="text-silver/80 leading-relaxed">
                    <strong className="text-warm-white">When asset-based is primary:</strong> For capital-intensive businesses
                    with minimal earnings (auto repair shops, equipment rentals, manufacturers with heavy machinery),
                    distressed businesses, or any case where the going-concern value is below asset value. Most
                    Main Street deals include some asset floor; inventory and FF&amp;E are added to the multiple-based
                    valuation as separate line items.
                  </p>
                </Stack>

                <h2 className="font-serif text-2xl font-bold text-warm-white">Which Method Should You Use?</h2>

                <div className="glass rounded-luxury border border-white/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-silver/60 font-medium">Business Type</th>
                        <th className="text-left p-4 text-silver/60 font-medium">Primary Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        ['Owner-operator, under $5M revenue', 'SDE multiple'],
                        ['$1M+ revenue, management in place', 'EBITDA multiple'],
                        ['SaaS / recurring revenue, high growth', 'Revenue or EBITDA multiple'],
                        ['Fast-growing with predictable contracts', 'DCF as cross-check'],
                        ['Capital-intensive, low margins', 'Asset-based + SDE multiple'],
                        ['Distressed / no earnings', 'Asset-based only'],
                      ].map(([type, method]) => (
                        <tr key={type}>
                          <td className="p-4 text-silver/80">{type}</td>
                          <td className="p-4 text-gold font-medium">{method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h2 className="font-serif text-2xl font-bold text-warm-white">Risk Adjustments: How Multiples Move</h2>

                <p className="text-silver/80 leading-relaxed">
                  The base multiple is the industry starting point. Specific business characteristics adjust it
                  up or down. Understanding these adjustments is how brokers defend their pricing to skeptical sellers
                  and how buyers identify deals worth pursuing.
                </p>

                <Stack gap="xs">
                  {[
                    { factor: 'Customer Concentration', desc: 'If 30%+ of revenue comes from one client, the business is exposed to customer-specific risk. Most buyers will discount 0.25x–0.5x. Over 50% concentration can kill deals entirely.', dir: 'down' },
                    { factor: 'Owner Dependency', desc: 'If the owner works 60+ hours/week and is the primary relationship holder, technician, or salesperson, the multiple falls. A fully systematized business with documented processes commands a premium.', dir: 'down' },
                    { factor: 'Revenue Trend', desc: 'Growing revenue (10%+ CAGR over 3 years) justifies a 0.25x–0.5x premium. Flat revenue is neutral. Declining revenue is a significant discount — buyers are pricing in continued deterioration.', dir: 'both' },
                    { factor: 'Recurring Revenue', desc: 'Recurring or contractual revenue (maintenance contracts, subscriptions, retainers) dramatically reduces earnings uncertainty. Over 50% recurring can justify 0.5x–1.0x premium.', dir: 'up' },
                    { factor: 'Business Age & Track Record', desc: 'Businesses under 3 years lack a demonstrable track record. Discount 0.25x. Businesses over 10 years with stable earnings demonstrate durability — slight premium.', dir: 'both' },
                    { factor: 'Industry Volatility', desc: 'Restaurants, retail, and seasonal businesses carry higher uncertainty than home services or professional practices. Volatile industries trade at the lower end of their multiple range.', dir: 'down' },
                  ].map(({ factor, desc, dir }) => (
                    <div key={factor} className="flex gap-4 items-start glass p-4 rounded-luxury border border-white/5">
                      <span className={`mt-0.5 text-lg ${dir === 'up' ? 'text-green-400' : dir === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {dir === 'up' ? '↑' : dir === 'down' ? '↓' : '↕'}
                      </span>
                      <div>
                        <p className="text-warm-white font-medium">{factor}</p>
                        <p className="text-silver/70 text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </Stack>

                <h2 className="font-serif text-2xl font-bold text-warm-white">The Normalization Process</h2>

                <Stack gap="sm">
                  <p className="text-silver/80 leading-relaxed">
                    Before you apply any multiple, you must normalize the financials. Raw tax returns and P&Ls
                    are not the same as SDE. Sellers routinely run personal expenses through the business —
                    vehicle leases, family health insurance, travel, meals, the owner's child on payroll, a
                    company phone for a spouse. All of these are legitimate add-backs.
                  </p>

                  <p className="text-silver/80 leading-relaxed">
                    Common add-backs:
                  </p>
                  <ul className="space-y-1 text-silver/80 text-sm ml-4">
                    {[
                      'Owner salary and payroll taxes',
                      'Owner health, dental, life, and disability insurance',
                      'Personal vehicle expenses run through the business',
                      'One-time legal, consulting, or accounting fees',
                      'Non-cash charges: depreciation, amortization',
                      'Interest on business loans (not acquiring these)',
                      'Family member compensation above market rate',
                      'Home office allocated to business',
                    ].map(item => (
                      <li key={item} className="flex gap-2"><span className="text-silver/40">+</span><span>{item}</span></li>
                    ))}
                  </ul>

                  <p className="text-silver/80 leading-relaxed">
                    The buyer and seller will disagree on some add-backs — that's normal. Quality of Earnings (QoE)
                    analysis by a third-party accountant resolves disputes for transactions over $500K.
                  </p>
                </Stack>

                <h2 className="font-serif text-2xl font-bold text-warm-white">What a Professional Valuation Looks Like</h2>

                <Stack gap="sm">
                  <p className="text-silver/80 leading-relaxed">
                    A defensible valuation for a broker presentation should include:
                  </p>
                  <ul className="space-y-2 text-silver/80 text-sm ml-4">
                    {[
                      'Normalized SDE calculation with each add-back itemized and sourced',
                      'Industry multiple range with sourcing (IBBA, DealStats, comparables)',
                      'Specific risk adjustments applied — each with a stated rationale and magnitude',
                      'Low / mid / high range — not a single point estimate',
                      'Deal quality score or assessment synthesizing risk factors',
                      'Broker rationale paragraph suitable for a listing presentation',
                    ].map(item => (
                      <li key={item} className="flex gap-2"><span className="text-gold">✓</span><span>{item}</span></li>
                    ))}
                  </ul>
                </Stack>

                <div className="glass p-6 rounded-luxury border border-gold/30 text-center">
                  <p className="text-warm-white font-semibold">Get a Complete Valuation in 60 Seconds</p>
                  <p className="text-silver/70 text-sm">
                    Succedence generates all of the above automatically — SDE calculation, risk adjustments, deal
                    quality score, and broker rationale — for 50+ industries using IBBA transaction data.
                  </p>
                  <Link
                    href="/valuation"
                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-luxury hover:bg-blue-700 transition-colors"
                  >
                    Try the Free Valuation Tool →
                  </Link>
                </div>

                <h2 className="font-serif text-2xl font-bold text-warm-white">Common Valuation Mistakes</h2>

                <Stack gap="xs">
                  {[
                    { title: 'Using a single point instead of a range', body: 'Markets don\'t clear at a specific number — they clear in ranges. Presenting a single price signals false precision and invites pushback. Use low/mid/high.' },
                    { title: 'Applying the wrong multiple for the business size', body: 'A $50K SDE landscaping company and a $500K SDE landscaping company do not trade at the same multiple. Size matters. Larger deals attract more buyers and command a premium.' },
                    { title: 'Skipping the normalization', body: 'Using reported net income without add-backs dramatically understates SDE and produces a valuation that insults the seller. Always normalize first.' },
                    { title: 'Ignoring industry-specific risks', body: 'Applying a general services multiple to a food truck fleet or a heavily licensed healthcare practice misses material industry-specific risk. Use industry-specific data.' },
                    { title: 'Not having a documented rationale', body: 'A number without a methodology is just an opinion. Brokers who can\'t explain exactly how they arrived at a price will lose listings to brokers who can.' },
                  ].map(({ title, body }) => (
                    <div key={title} className="glass p-4 rounded-luxury border border-white/5">
                      <p className="text-warm-white font-medium">✗ {title}</p>
                      <p className="text-silver/70 text-sm leading-relaxed">{body}</p>
                    </div>
                  ))}
                </Stack>

                <h2 className="font-serif text-2xl font-bold text-warm-white">Frequently Asked Questions</h2>

                <Stack gap="sm">
                  {[
                    { q: 'What is a typical multiple for a small business?', a: 'For Main Street businesses, SDE multiples typically range from 1.5x to 4.5x. Home services (HVAC, plumbing, landscaping) often trade at 2.5x–4.0x. Restaurants at 1.5x–2.5x. Professional practices (accounting, dental) at 0.8x–1.5x revenue or 3x–5x SDE. See our full SDE multiples by industry table for current ranges.' },
                    { q: 'Do I need a certified appraiser?', a: 'For most Main Street deals, a broker-prepared or tool-assisted valuation is sufficient for negotiation purposes. A certified business appraiser (CBV, CVA, or CBA designation) is typically warranted for transactions over $2M, estate planning, shareholder disputes, or litigation.' },
                    { q: 'What multiple does my business deserve?', a: 'Start with the industry baseline, then assess your specific business against the six risk factors above. A well-systematized business with growing recurring revenue, diversified customers, and documented processes deserves the top of the range. A high-owner-dependency business with one large customer deserves the bottom.' },
                    { q: 'How long does a business valuation take?', a: 'A rough SDE-based estimate can be done in minutes with the right tool. A formal Quality of Earnings analysis by a third-party accountant takes 2–4 weeks and costs $3,000–$10,000 for smaller deals, more for complex businesses.' },
                  ].map(({ q, a }) => (
                    <div key={q}>
                      <h3 className="text-warm-white font-semibold">{q}</h3>
                      <p className="text-silver/70 text-sm leading-relaxed">{a}</p>
                    </div>
                  ))}
                </Stack>

                <Stack gap="sm" className="border-t border-white/10 pt-8">
                  <p className="text-silver/60 text-sm font-medium">Related Resources</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { href: '/blog/what-is-sde', label: 'What Is SDE? A Plain-English Guide' },
                      { href: '/blog/sde-multiples-by-industry', label: 'SDE Multiples by Industry (2026)' },
                      { href: '/blog/business-valuation-for-brokers', label: 'Business Valuation for Brokers' },
                      { href: '/valuation', label: 'Free Valuation Calculator' },
                    ].map(({ href, label }) => (
                      <Link key={href} href={href} className="glass p-3 rounded-luxury border border-white/10 text-gold hover:border-gold/30 transition-colors text-sm">
                        {label} →
                      </Link>
                    ))}
                  </div>
                </Stack>

              </Stack>
            </Stack>
          </PageContainer>
        </Section>
        <Footer />
      </div>
    </div>
  );
}

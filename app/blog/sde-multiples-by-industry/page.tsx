import type { Metadata } from 'next';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'SDE Multiples by Industry 2026 | Succedence',
  description:
    'Comprehensive table of SDE (Seller\'s Discretionary Earnings) multiples by industry for small business valuation. Data covers 48 industries from IBBA transaction comps.',
  openGraph: {
    title: 'SDE Multiples by Industry 2026',
    description:
      'Free reference table of SDE multiples for 48 industries. Used by business brokers to value Main Street businesses under $5M.',
    type: 'article',
  },
};

// Pulled directly from lib/valuation/industry-multiples.ts — keep in sync
const INDUSTRY_TABLE = [
  // ── SERVICE BUSINESSES ──────────────────────────────────────────
  { category: 'Service', name: 'Accounting & Tax Services',        sde: [1.0, 1.25, 1.5],  volatility: 'Low'    },
  { category: 'Service', name: 'Insurance Agency',                  sde: [1.5, 2.0,  2.5],  volatility: 'Low'    },
  { category: 'Service', name: 'Marketing & Advertising Agency',    sde: [2.0, 3.0,  4.5],  volatility: 'Medium' },
  { category: 'Service', name: 'Professional Services',             sde: [2.0, 2.5,  3.5],  volatility: 'Low'    },
  { category: 'Service', name: 'Staffing & Recruiting',             sde: [2.0, 3.0,  4.0],  volatility: 'Medium' },

  // ── TRADES & HOME SERVICES ───────────────────────────────────────
  { category: 'Trades & Home Services', name: 'Auto Repair & Service',          sde: [1.8, 2.5, 3.2], volatility: 'Low'    },
  { category: 'Trades & Home Services', name: 'Cleaning & Janitorial Services', sde: [1.5, 2.2, 3.0], volatility: 'Low'    },
  { category: 'Trades & Home Services', name: 'Electrical Services',             sde: [2.0, 2.8, 3.5], volatility: 'Low'    },
  { category: 'Trades & Home Services', name: 'HVAC Services',                   sde: [2.5, 3.0, 4.0], volatility: 'Low'    },
  { category: 'Trades & Home Services', name: 'Landscaping & Lawn Care',         sde: [1.5, 2.0, 3.0], volatility: 'Medium' },
  { category: 'Trades & Home Services', name: 'Pest Control Services',           sde: [2.5, 3.5, 4.5], volatility: 'Low'    },
  { category: 'Trades & Home Services', name: 'Plumbing Services',               sde: [2.0, 2.8, 3.5], volatility: 'Low'    },
  { category: 'Trades & Home Services', name: 'Roofing Contractor',              sde: [1.8, 2.5, 3.5], volatility: 'Medium' },

  // ── CONSTRUCTION ─────────────────────────────────────────────────
  { category: 'Construction', name: 'General Construction',       sde: [1.8, 2.5, 3.5], volatility: 'High'   },
  { category: 'Construction', name: 'Specialty Trade Contractor', sde: [2.0, 2.8, 3.8], volatility: 'Medium' },

  // ── MANUFACTURING ────────────────────────────────────────────────
  { category: 'Manufacturing', name: 'Food Manufacturing',                    sde: [2.0, 3.0, 4.5], volatility: 'Medium' },
  { category: 'Manufacturing', name: 'Manufacturing (General)',               sde: [2.5, 3.5, 5.0], volatility: 'Medium' },
  { category: 'Manufacturing', name: 'Precision Manufacturing / Machine Shop', sde: [3.0, 4.0, 5.5], volatility: 'Medium' },

  // ── RETAIL ───────────────────────────────────────────────────────
  { category: 'Retail', name: 'Convenience Store', sde: [1.5, 2.0, 2.8], volatility: 'Low'    },
  { category: 'Retail', name: 'Liquor Store',       sde: [2.0, 2.8, 3.5], volatility: 'Low'    },
  { category: 'Retail', name: 'Retail Store',       sde: [1.5, 2.2, 3.0], volatility: 'Medium' },

  // ── FOOD & BEVERAGE ──────────────────────────────────────────────
  { category: 'Food & Beverage', name: 'Bar / Nightclub',          sde: [1.5, 2.2, 3.0], volatility: 'High'   },
  { category: 'Food & Beverage', name: 'Catering Services',        sde: [1.5, 2.2, 3.0], volatility: 'Medium' },
  { category: 'Food & Beverage', name: 'Coffee Shop / Cafe',       sde: [1.5, 2.0, 2.8], volatility: 'Medium' },
  { category: 'Food & Beverage', name: 'Fast Food / QSR',          sde: [2.0, 2.5, 3.2], volatility: 'Medium' },
  { category: 'Food & Beverage', name: 'Full-Service Restaurant',  sde: [1.5, 2.0, 2.8], volatility: 'High'   },
  { category: 'Food & Beverage', name: 'Restaurant Franchise',     sde: [2.5, 3.0, 4.0], volatility: 'Medium' },

  // ── HEALTHCARE ───────────────────────────────────────────────────
  { category: 'Healthcare', name: 'Dental Practice',     sde: [2.0, 2.8, 3.8], volatility: 'Low' },
  { category: 'Healthcare', name: 'Home Health Care',    sde: [2.5, 3.5, 5.0], volatility: 'Low' },
  { category: 'Healthcare', name: 'Medical Practice',    sde: [1.8, 2.5, 3.5], volatility: 'Low' },
  { category: 'Healthcare', name: 'Pharmacy / Drug Store', sde: [2.0, 2.8, 3.5], volatility: 'Low' },
  { category: 'Healthcare', name: 'Veterinary Practice', sde: [2.0, 3.0, 4.0], volatility: 'Low' },

  // ── TECHNOLOGY ───────────────────────────────────────────────────
  { category: 'Technology', name: 'IT Services / MSP',       sde: [2.5, 3.5, 5.0], volatility: 'Medium' },
  { category: 'Technology', name: 'SaaS / Software',         sde: [3.0, 4.5, 7.0], volatility: 'Medium' },
  { category: 'Technology', name: 'Web Development Agency',  sde: [2.0, 3.0, 4.0], volatility: 'Medium' },

  // ── E-COMMERCE ───────────────────────────────────────────────────
  { category: 'E-Commerce', name: 'Amazon FBA Business',  sde: [2.5, 3.5, 5.0], volatility: 'High'   },
  { category: 'E-Commerce', name: 'E-Commerce Business',  sde: [2.0, 3.0, 4.5], volatility: 'Medium' },

  // ── LOGISTICS & TRANSPORTATION ───────────────────────────────────
  { category: 'Logistics', name: 'Courier / Delivery Service', sde: [1.8, 2.5, 3.5], volatility: 'Medium' },
  { category: 'Logistics', name: 'Trucking / Freight',          sde: [2.0, 3.0, 4.0], volatility: 'Medium' },

  // ── HOSPITALITY ──────────────────────────────────────────────────
  { category: 'Hospitality', name: 'Bed & Breakfast',  sde: [2.0, 3.0, 4.0], volatility: 'Medium' },
  { category: 'Hospitality', name: 'Hotel / Motel',    sde: [3.0, 4.5, 6.0], volatility: 'Medium' },

  // ── PERSONAL SERVICES ────────────────────────────────────────────
  { category: 'Personal Services', name: 'Daycare / Child Care Center',    sde: [2.0, 2.8, 3.5], volatility: 'Low' },
  { category: 'Personal Services', name: 'Gym / Fitness Center',           sde: [1.8, 2.5, 3.5], volatility: 'Medium' },
  { category: 'Personal Services', name: 'Salon / Spa',                    sde: [1.5, 2.2, 3.0], volatility: 'Low'   },
  { category: 'Personal Services', name: 'Tutoring / Education Services',  sde: [2.0, 2.8, 3.8], volatility: 'Low'   },

  // ── DISTRIBUTION & WHOLESALE ─────────────────────────────────────
  { category: 'Distribution', name: 'Distribution / Wholesale', sde: [2.0, 3.0, 4.0], volatility: 'Medium' },

  // ── PRINTING & SIGNAGE ───────────────────────────────────────────
  { category: 'Printing & Signage', name: 'Printing / Graphics', sde: [1.8, 2.5, 3.5], volatility: 'Medium' },
  { category: 'Printing & Signage', name: 'Sign Shop',            sde: [2.0, 2.8, 3.8], volatility: 'Low'    },
];

const CATEGORIES = Array.from(new Set(INDUSTRY_TABLE.map(r => r.category)));

function VolatilityBadge({ v }: { v: string }) {
  const color =
    v === 'Low'    ? 'text-green-400 bg-green-400/10 border-green-400/20' :
    v === 'Medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                     'text-red-400 bg-red-400/10 border-red-400/20';
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded border font-medium ${color}`}>
      {v}
    </span>
  );
}

export default function SdeMultiplesPage() {
  return (
    <div className="min-h-screen bg-midnight text-warm-white">
      <Section variant="default">
        <PageContainer className="max-w-4xl">
          <Stack gap="lg">
            <Stack gap="sm">
              <nav className="text-sm text-silver/60">
                <Link href="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-silver/80">SDE Multiples by Industry</span>
              </nav>

              <div>
                <span className="text-xs font-medium text-gold bg-gold/10 border border-gold/20 rounded px-3 py-1">
                  Updated Q1 2026
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-warm-white leading-tight">
                SDE Multiples by Industry 2026
              </h1>
              <p className="text-lg text-silver/80 max-w-2xl">
                Reference table of Seller&apos;s Discretionary Earnings (SDE) multiples for 48 industries.
                Use these ranges to quickly estimate a business&apos;s value before running a full analysis.
                Data sourced from IBBA transaction comps and BizBuySell market data.
              </p>
            </Stack>

            <div className="glass rounded-luxury border border-white/5 p-6">
              <Stack gap="sm">
                <h2 className="text-xl font-semibold text-warm-white">What is an SDE multiple?</h2>
                <p className="text-silver/80 text-sm leading-relaxed">
                  An SDE multiple is the number you multiply by Seller&apos;s Discretionary Earnings to estimate
                  the selling price of a small business. If a business earns $200,000 in SDE and comparable
                  businesses in that industry sell at a 3.0x multiple, the estimated value is $600,000.
                </p>
                <p className="text-silver/80 text-sm leading-relaxed">
                  The <strong className="text-warm-white">mid</strong> multiple represents an average-condition
                  business in that sector. The <strong className="text-warm-white">low</strong> end reflects
                  distress, high owner-dependency, or declining trends. The{' '}
                  <strong className="text-warm-white">high</strong> end applies to well-run businesses with
                  recurring revenue, multiple employees, and clean books.
                </p>
              </Stack>
            </div>

            <Stack gap="lg">
              {CATEGORIES.map(cat => {
                const rows = INDUSTRY_TABLE.filter(r => r.category === cat);
                return (
                  <div key={cat}>
                    <h2 className="text-lg font-semibold text-warm-white border-b border-white/10 pb-2">
                      {cat}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-silver/60 text-xs uppercase tracking-wide">
                            <th className="text-left py-2 pr-4 font-medium">Industry</th>
                            <th className="text-center py-2 px-3 font-medium">Low</th>
                            <th className="text-center py-2 px-3 font-medium">Mid</th>
                            <th className="text-center py-2 px-3 font-medium">High</th>
                            <th className="text-center py-2 pl-3 font-medium">Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => (
                            <tr
                              key={row.name}
                              className={`border-t ${i === 0 ? 'border-white/10' : 'border-white/5'} hover:bg-white/[0.02] transition-colors`}
                            >
                              <td className="py-2.5 pr-4 text-warm-white">{row.name}</td>
                              <td className="py-2.5 px-3 text-center text-silver/70">{row.sde[0].toFixed(1)}x</td>
                              <td className="py-2.5 px-3 text-center font-semibold text-gold">{row.sde[1].toFixed(1)}x</td>
                              <td className="py-2.5 px-3 text-center text-silver/70">{row.sde[2].toFixed(1)}x</td>
                              <td className="py-2.5 pl-3 text-center">
                                <VolatilityBadge v={row.volatility} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </Stack>

            <Stack gap="sm">
              <h2 className="text-2xl font-bold text-warm-white">What drives multiples higher or lower?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass rounded-luxury border border-green-500/20 p-5">
                  <h3 className="text-green-400 font-semibold text-sm uppercase tracking-wide">Factors that push multiples up</h3>
                  <ul className="space-y-2 text-sm text-silver/80">
                    <li className="flex gap-2"><span className="text-green-400 mt-0.5">+</span>High percentage of recurring revenue (contracts, subscriptions)</li>
                    <li className="flex gap-2"><span className="text-green-400 mt-0.5">+</span>Low owner dependency — business runs without the owner</li>
                    <li className="flex gap-2"><span className="text-green-400 mt-0.5">+</span>Diversified customer base (no single customer &gt;15% of revenue)</li>
                    <li className="flex gap-2"><span className="text-green-400 mt-0.5">+</span>Consistent or growing revenue trend over 3+ years</li>
                    <li className="flex gap-2"><span className="text-green-400 mt-0.5">+</span>Documented systems and trained staff in place</li>
                    <li className="flex gap-2"><span className="text-green-400 mt-0.5">+</span>Established brand, licenses, or certifications with barriers to entry</li>
                  </ul>
                </div>
                <div className="glass rounded-luxury border border-red-500/20 p-5">
                  <h3 className="text-red-400 font-semibold text-sm uppercase tracking-wide">Factors that push multiples down</h3>
                  <ul className="space-y-2 text-sm text-silver/80">
                    <li className="flex gap-2"><span className="text-red-400 mt-0.5">−</span>Owner works 60+ hours/week and handles all key relationships</li>
                    <li className="flex gap-2"><span className="text-red-400 mt-0.5">−</span>Single customer accounts for &gt;30% of revenue</li>
                    <li className="flex gap-2"><span className="text-red-400 mt-0.5">−</span>Revenue declining or flat for 2+ consecutive years</li>
                    <li className="flex gap-2"><span className="text-red-400 mt-0.5">−</span>Cash-heavy business with inconsistent books</li>
                    <li className="flex gap-2"><span className="text-red-400 mt-0.5">−</span>Lease expiring soon with no renewal guarantee</li>
                    <li className="flex gap-2"><span className="text-red-400 mt-0.5">−</span>Project-based revenue with no backlog or pipeline</li>
                  </ul>
                </div>
              </div>
            </Stack>

            <Stack gap="sm">
              <h2 className="text-2xl font-bold text-warm-white">How SDE size affects the multiple</h2>
              <p className="text-silver/80">
                Beyond industry, the absolute size of the SDE changes the applicable multiple. Larger businesses
                attract institutional buyers who pay premiums. Micro-businesses (&lt;$50K SDE) face steep discounts
                because the buyer pool is thin and financing is difficult.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm glass rounded-luxury border border-white/5">
                  <thead>
                    <tr className="text-silver/60 text-xs uppercase tracking-wide border-b border-white/10">
                      <th className="text-left py-3 px-4 font-medium">SDE Range</th>
                      <th className="text-left py-3 px-4 font-medium">Buyer Type</th>
                      <th className="text-center py-3 px-4 font-medium">Multiple Adjustment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['< $50K',          'Individual (lifestyle buyer)',        '−0.4x (micro business discount)'],
                      ['$50K – $100K',    'Individual / owner-operator',         '−0.2x (small business discount)'],
                      ['$100K – $250K',   'Owner-operator (SBA eligible)',        'Base multiple'],
                      ['$250K – $500K',   'Serious buyer, search fund',          '+0.2x (medium business premium)'],
                      ['$500K – $1M',     'Search fund, small PE',               '+0.35x (large business premium)'],
                      ['> $1M',           'PE firm, strategic acquirer',         '+0.5x (institutional premium)'],
                    ].map(([range, buyer, adj], i) => (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-warm-white font-medium">{range}</td>
                        <td className="py-3 px-4 text-silver/70">{buyer}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={adj.startsWith('+') ? 'text-green-400' : adj.startsWith('−') ? 'text-red-400' : 'text-silver/70'}>
                            {adj}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Stack>

            <div className="glass rounded-luxury border border-white/5 p-5">
              <p className="text-silver/60 text-xs leading-relaxed">
                <strong className="text-silver/80">Disclaimer:</strong> These multiples are averages derived
                from publicly reported transaction data and broker market surveys. Individual businesses may
                sell significantly above or below these ranges depending on business quality, location, buyer
                demand, and deal structure. This table is intended as a starting point, not a substitute for
                a full valuation. Consult a qualified business broker or appraiser for major decisions.
              </p>
            </div>

            <div className="glass rounded-luxury border border-gold/20 p-8 text-center">
              <Stack gap="sm">
                <h2 className="text-2xl font-bold text-warm-white">
                  Get a risk-adjusted valuation for your business
                </h2>
                <p className="text-silver/70 max-w-xl mx-auto">
                  Our free tool applies the right industry multiple and automatically adjusts for owner hours,
                  customer concentration, recurring revenue, and SDE size — not just a simple multiplication.
                </p>
                <Link
                  href="/valuation"
                  className="inline-block px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-colors"
                >
                  Run a Free Valuation →
                </Link>
              </Stack>
            </div>

            <Stack gap="xs">
              <h2 className="text-xl font-bold text-warm-white">Related resources</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { href: '/blog/what-is-sde', title: 'What Is SDE?', desc: 'Full explainer on Seller\'s Discretionary Earnings — the most important number in a small business sale.' },
                  { href: '/blog/how-to-value-a-small-business', title: 'How to Value a Small Business', desc: 'Step-by-step guide to the four valuation methods used by brokers and buyers.' },
                  { href: '/blog/business-valuation-for-brokers', title: 'Business Valuation for Brokers', desc: 'How brokers use SDE multiples, normalization, and risk scoring to price listings accurately.' },
                ].map(r => (
                  <Link key={r.href} href={r.href} className="glass rounded-luxury border border-white/5 p-4 hover:border-gold/30 transition-colors group block">
                    <h3 className="text-warm-white font-semibold group-hover:text-gold transition-colors text-sm">{r.title}</h3>
                    <p className="text-silver/60 text-xs leading-relaxed">{r.desc}</p>
                  </Link>
                ))}
              </div>
            </Stack>
          </Stack>
        </PageContainer>
      </Section>
    </div>
  );
}

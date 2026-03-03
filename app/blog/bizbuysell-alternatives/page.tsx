import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BizBuySell Alternatives in 2026 | Succedence',
  description:
    'Comparing BizBuySell, BizQuest, DealStream, and Succedence for business buyers and brokers. What each platform does well, where they fall short, and when to use each.',
  openGraph: {
    title: 'BizBuySell Alternatives in 2026: An Honest Comparison',
    description:
      'A feature-by-feature comparison of the top small business acquisition platforms — including free alternatives with built-in valuation tools.',
    type: 'article',
  },
};

const PLATFORMS = [
  {
    name: 'BizBuySell',
    tagline: 'Largest listing database',
    pros: ['Largest inventory of listings in the US', 'High buyer traffic — established brand', 'Basic market data reports', 'Broker directory'],
    cons: ['No built-in valuation tool', 'Listing quality is highly variable', 'No deal quality scoring', 'Paid subscription required to list'],
    bestFor: 'Brokers who want broad exposure and high-traffic buyer reach',
    pricing: 'Paid (broker plans start ~$70/mo)',
    valuation: false,
    free: false,
  },
  {
    name: 'BizQuest',
    tagline: 'BizBuySell sister site',
    pros: ['Owned by same parent company as BizBuySell', 'Cheaper listing fees', 'Cross-listed on BizBuySell automatically'],
    cons: ['Lower traffic than BizBuySell', 'No valuation tools', 'Minimal filtering/search tools', 'Mostly duplicate inventory'],
    bestFor: 'Brokers who want cross-listing coverage at lower cost',
    pricing: 'Paid (lower than BizBuySell)',
    valuation: false,
    free: false,
  },
  {
    name: 'DealStream',
    tagline: 'Deal-flow platform for M&A',
    pros: ['Investor/acquirer focus (not just buyers)', 'CRM and NDA workflow tools', 'Good for lower-middle market deals'],
    cons: ['Small listing inventory', 'Less useful for Main Street (&lt;$1M) deals', 'Expensive for solo brokers', 'Steep learning curve'],
    bestFor: 'Brokers handling $1M+ deals and wanting M&A-style workflow tools',
    pricing: 'Paid (premium SaaS pricing)',
    valuation: false,
    free: false,
  },
  {
    name: 'Succedence',
    tagline: 'Valuation-first acquisition platform',
    pros: ['Free built-in SDE valuation calculator', 'Risk-adjusted multiples for 48+ industries', 'Deal quality score & broker rationale output', 'Works from pasted listing URLs', 'No account required to run a valuation'],
    cons: ['Newer platform — smaller listing inventory', 'Still building out marketplace features', 'No dedicated CRM or NDA workflow (yet)'],
    bestFor: 'Brokers who want to price listings accurately and buyers who want to verify if a deal is fairly priced',
    pricing: 'Free tier available; paid plans for saved valuations',
    valuation: true,
    free: true,
  },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function BizBuySellAlternativesPage() {
  return (
    <div className="min-h-screen bg-midnight text-warm-white">
      {/* Hero */}
      <section className="pt-16 pb-10 px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-silver/60 mb-6">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-silver/80">BizBuySell Alternatives</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-warm-white mb-4 leading-tight">
            BizBuySell Alternatives in 2026: An Honest Comparison
          </h1>
          <p className="text-lg text-silver/80 max-w-2xl">
            BizBuySell is the dominant platform for small business listings — but it&apos;s not the only
            option, and for buyers and brokers who need valuation tools built in, it&apos;s not the
            best option. Here&apos;s a full breakdown.
          </p>
        </div>
      </section>

      {/* Who this is for */}
      <section className="px-6 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-luxury border border-white/5 p-6">
            <h2 className="text-warm-white font-semibold mb-3">Who this comparison is for</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-silver/80">
              <div>
                <p className="font-medium text-warm-white mb-1">Business buyers searching for deals</p>
                <p>You want to find quality listings and quickly verify whether asking prices are reasonable — without needing a broker or a spreadsheet.</p>
              </div>
              <div>
                <p className="font-medium text-warm-white mb-1">Business brokers listing client businesses</p>
                <p>You want maximum buyer exposure and tools that help you price listings accurately and defend valuations to sellers and buyers alike.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The core problem with listing platforms */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-warm-white mb-4">
            The core problem with most listing platforms
          </h2>
          <p className="text-silver/80 leading-relaxed mb-4">
            BizBuySell and most of its alternatives are <em>listing directories</em> — they help you
            find a business for sale, but they don&apos;t help you determine if it&apos;s fairly priced.
            You see an asking price and financial summary, and you&apos;re on your own to evaluate it.
          </p>
          <p className="text-silver/80 leading-relaxed mb-4">
            This creates a major information asymmetry. Sellers (or their brokers) set asking prices
            based on what they want to net, not always on what the market will bear. Buyers who
            don&apos;t have valuation expertise overpay. Brokers who can&apos;t quickly run a
            first-look valuation lose listings to competitors who show up with numbers.
          </p>
          <p className="text-silver/80 leading-relaxed">
            The ideal platform combines deal discovery with instant valuation — so you know
            if a deal is worth pursuing before you invest time in an NDA and due diligence.
          </p>
        </div>
      </section>

      {/* Platform cards */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-warm-white mb-6">Platform-by-platform breakdown</h2>
          <div className="space-y-6">
            {PLATFORMS.map(p => (
              <div
                key={p.name}
                className={`glass rounded-luxury border p-6 ${p.name === 'Succedence' ? 'border-gold/30' : 'border-white/5'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-xl font-bold ${p.name === 'Succedence' ? 'text-gold' : 'text-warm-white'}`}>
                        {p.name}
                      </h3>
                      {p.valuation && (
                        <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded font-medium">
                          Built-in valuation
                        </span>
                      )}
                      {p.free && (
                        <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-medium">
                          Free tier
                        </span>
                      )}
                    </div>
                    <p className="text-silver/60 text-sm">{p.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-silver/60 text-xs">{p.pricing}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-2">Strengths</p>
                    <ul className="space-y-1.5">
                      {p.pros.map(pro => (
                        <li key={pro} className="flex gap-2 text-sm text-silver/80">
                          <CheckIcon />
                          <span dangerouslySetInnerHTML={{ __html: pro }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-2">Limitations</p>
                    <ul className="space-y-1.5">
                      {p.cons.map(con => (
                        <li key={con} className="flex gap-2 text-sm text-silver/80">
                          <XIcon />
                          <span dangerouslySetInnerHTML={{ __html: con }} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2.5">
                  <p className="text-silver/70 text-xs">
                    <span className="text-warm-white font-medium">Best for: </span>{p.bestFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-warm-white mb-6">Feature comparison at a glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm glass rounded-luxury border border-white/5">
              <thead>
                <tr className="text-silver/60 text-xs uppercase tracking-wide border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-3 font-medium">BizBuySell</th>
                  <th className="text-center py-3 px-3 font-medium">BizQuest</th>
                  <th className="text-center py-3 px-3 font-medium">DealStream</th>
                  <th className="text-center py-3 px-3 font-medium text-gold">Succedence</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Large listing inventory',           true,  true,  false, false],
                  ['High buyer traffic',                true,  true,  false, false],
                  ['Free to use (core features)',       false, false, false, true ],
                  ['Built-in SDE valuation tool',       false, false, false, true ],
                  ['Risk-adjusted multiples',           false, false, false, true ],
                  ['Deal quality scoring',              false, false, false, true ],
                  ['Broker rationale output',           false, false, false, true ],
                  ['Paste URL to analyze a listing',   false, false, false, true ],
                  ['NDA / workflow tools',              false, false, true,  false],
                  ['M&A / mid-market focus',            false, false, true,  false],
                ].map(([feature, bb, bq, ds, sc], i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 text-silver/80">{feature}</td>
                    {[bb, bq, ds, sc].map((has, j) => (
                      <td key={j} className={`py-2.5 px-3 text-center ${j === 3 ? 'bg-gold/[0.03]' : ''}`}>
                        {has ? (
                          <span className="text-green-400 font-bold">✓</span>
                        ) : (
                          <span className="text-silver/30">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How to use them together */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-warm-white mb-4">You don&apos;t have to choose just one</h2>
          <p className="text-silver/80 leading-relaxed mb-5">
            The most effective buyers and brokers use multiple platforms together:
          </p>
          <div className="space-y-4">
            {[
              {
                title: 'For buyers: Find on BizBuySell, value on Succedence',
                body: "BizBuySell has the largest inventory. Once you find a listing that looks interesting, paste the URL into Succedence's valuation tool to get an independent SDE-based estimate. If the asking price is within range, proceed. If it's 40% above market, pass or negotiate before you invest in due diligence.",
              },
              {
                title: 'For brokers: Price on Succedence, list on BizBuySell',
                body: "Run a Succedence valuation before your initial seller meeting. Walk in with a documented, risk-adjusted range. Once you have the listing, post on BizBuySell for buyer traffic. Use the Succedence Broker Rationale output as your listing narrative to attract more qualified buyers.",
              },
              {
                title: 'For brokers handling larger deals: Add DealStream for M&A exposure',
                body: "If the deal is $1M+ in SDE and could attract a strategic acquirer or PE-backed buyer, DealStream gives you access to that buyer universe. Use Succedence for the initial valuation, and DealStream for deal marketing and NDA/LOI workflow.",
              },
            ].map((item, i) => (
              <div key={i} className="glass rounded-luxury border border-white/5 p-5">
                <h3 className="text-warm-white font-semibold mb-2">{item.title}</h3>
                <p className="text-silver/80 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-luxury border border-gold/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-warm-white mb-3">
              Try Succedence&apos;s valuation tool — free
            </h2>
            <p className="text-silver/70 mb-6 max-w-md mx-auto">
              No account required. Enter financials manually or paste a listing URL.
              Get an industry-specific, risk-adjusted valuation in under two minutes.
            </p>
            <Link
              href="/valuation"
              className="inline-block px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-colors"
            >
              Run a Free Valuation →
            </Link>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-warm-white mb-4">Related resources</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { href: '/blog/how-to-value-a-small-business', title: 'How to Value a Small Business', desc: 'Four valuation methods explained with examples.' },
              { href: '/blog/sde-multiples-by-industry', title: 'SDE Multiples by Industry 2026', desc: 'Reference table for 48 industries.' },
              { href: '/blog/business-valuation-for-brokers', title: 'Valuation for Brokers', desc: 'The complete broker workflow for pricing a listing.' },
            ].map(r => (
              <Link key={r.href} href={r.href} className="glass rounded-luxury border border-white/5 p-4 hover:border-gold/30 transition-colors group block">
                <h3 className="text-warm-white font-semibold mb-1 group-hover:text-gold transition-colors text-sm">{r.title}</h3>
                <p className="text-silver/60 text-xs leading-relaxed">{r.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

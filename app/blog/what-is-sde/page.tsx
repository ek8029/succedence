import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "What Is SDE (Seller's Discretionary Earnings)? | Succedence",
  description:
    "Plain-English explanation of Seller's Discretionary Earnings (SDE) — what it is, how to calculate it, what gets added back, and why it's the #1 metric for valuing small businesses under $5M.",
  openGraph: {
    title: "What Is SDE? Seller's Discretionary Earnings Explained",
    description:
      "SDE is the single most important number when valuing a small business. Here's exactly what it includes, how to calculate it, and why buyers and brokers rely on it.",
    type: 'article',
  },
};

export default function WhatIsSdePage() {
  return (
    <div className="min-h-screen bg-midnight text-warm-white">
      {/* Hero */}
      <section className="pt-16 pb-10 px-6">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-silver/60 mb-6">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-silver/80">What Is SDE?</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-warm-white mb-4 leading-tight">
            What Is SDE? Seller&apos;s Discretionary Earnings Explained
          </h1>
          <p className="text-lg text-silver/80">
            If you&apos;re buying or selling a small business, SDE is the single most important number
            you&apos;ll encounter. Here&apos;s exactly what it means, how to calculate it, and why it matters.
          </p>
        </div>
      </section>

      {/* Quick answer box */}
      <section className="px-6 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="glass rounded-luxury border border-gold/20 p-6">
            <p className="text-sm font-semibold text-gold uppercase tracking-wide mb-2">Quick Answer</p>
            <p className="text-warm-white font-medium leading-relaxed">
              <strong>SDE (Seller&apos;s Discretionary Earnings)</strong> is the total economic benefit an
              owner-operator receives from a business in one year. It equals net profit plus the owner&apos;s
              salary plus any personal or one-time expenses the owner ran through the business.
            </p>
            <p className="text-silver/70 text-sm mt-3 leading-relaxed">
              Most Main Street businesses under $5M in revenue are valued as a multiple of SDE — typically
              between 1.5x and 4.5x depending on industry and business quality.
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="px-6 pb-16">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* The formula */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">The SDE formula</h2>
            <div className="glass rounded-luxury border border-white/10 p-6 font-mono text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-silver/80">Net profit (after tax)</span>
                  <span className="text-warm-white">$XXX,XXX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/80">+ Owner&apos;s salary &amp; benefits</span>
                  <span className="text-green-400">+ $XXX,XXX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/80">+ Depreciation &amp; amortization</span>
                  <span className="text-green-400">+ $XX,XXX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/80">+ Interest expense</span>
                  <span className="text-green-400">+ $XX,XXX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/80">+ One-time / non-recurring expenses</span>
                  <span className="text-green-400">+ $XX,XXX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/80">+ Personal expenses run through business</span>
                  <span className="text-green-400">+ $XX,XXX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/80">− Non-recurring income</span>
                  <span className="text-red-400">− $XX,XXX</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-bold">
                  <span className="text-warm-white">= SDE</span>
                  <span className="text-gold">$XXX,XXX</span>
                </div>
              </div>
            </div>
          </section>

          {/* SDE vs EBITDA */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">SDE vs. EBITDA — what&apos;s the difference?</h2>
            <p className="text-silver/80 leading-relaxed mb-4">
              Both metrics strip out non-cash and financing charges, but they serve different audiences:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm glass rounded-luxury border border-white/5">
                <thead>
                  <tr className="text-silver/60 text-xs uppercase tracking-wide border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium">Metric</th>
                    <th className="text-left py-3 px-4 font-medium">Adds back owner salary?</th>
                    <th className="text-left py-3 px-4 font-medium">Used for…</th>
                    <th className="text-left py-3 px-4 font-medium">Typical business size</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/5">
                    <td className="py-3 px-4 text-warm-white font-semibold">SDE</td>
                    <td className="py-3 px-4 text-green-400">Yes</td>
                    <td className="py-3 px-4 text-silver/80">Owner-operated businesses, Main Street M&amp;A</td>
                    <td className="py-3 px-4 text-silver/80">&lt; $5M revenue</td>
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="py-3 px-4 text-warm-white font-semibold">EBITDA</td>
                    <td className="py-3 px-4 text-red-400">No</td>
                    <td className="py-3 px-4 text-silver/80">Mid-market M&amp;A, PE acquisitions</td>
                    <td className="py-3 px-4 text-silver/80">$5M–$100M+ revenue</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-silver/70 text-sm mt-4 leading-relaxed">
              The key difference: SDE assumes a single owner-operator who is the primary employee. EBITDA
              assumes a management team is already in place and the new owner doesn&apos;t need to work in
              the business. For most businesses sold through a broker, SDE is the right metric.
            </p>
          </section>

          {/* Common add-backs */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">Common SDE add-backs</h2>
            <p className="text-silver/80 leading-relaxed mb-5">
              An &quot;add-back&quot; is any expense that gets added back to net profit because it either
              (a) doesn&apos;t reflect the true cost of running the business, or (b) is personal spending
              that happened to flow through the business P&amp;L. The process of identifying these is
              called <em>normalization</em>.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { cat: 'Compensation', items: ["Owner's salary, wages, and payroll taxes", "Owner's health insurance & life insurance premiums", "Owner's retirement contributions (401k, SEP-IRA)", "Compensation paid to family members above market rate"] },
                { cat: 'One-Time Expenses', items: ['Legal fees for one-time disputes or transactions', 'Moving or relocation costs', 'Non-recurring repairs (fire damage, flood, etc.)', 'One-time consulting fees or project costs'] },
                { cat: 'Personal Expenses', items: ['Personal vehicle expenses run through the business', 'Personal travel, meals, entertainment', 'Personal phone or home office (partial)', 'Charitable donations made by the business'] },
                { cat: 'Financing & Non-Cash', items: ['Interest on business loans (financing structure)', 'Depreciation and amortization', 'Amortization of goodwill', 'Deferred revenue adjustments'] },
              ].map(group => (
                <div key={group.cat} className="glass rounded-luxury border border-white/5 p-4">
                  <h3 className="text-gold font-semibold text-sm mb-3">{group.cat}</h3>
                  <ul className="space-y-1.5">
                    {group.items.map(item => (
                      <li key={item} className="flex gap-2 text-sm text-silver/80">
                        <span className="text-gold/60 mt-0.5 shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Worked example */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">Worked example</h2>
            <p className="text-silver/80 leading-relaxed mb-5">
              A plumbing company has a net profit of $48,000 on $620,000 in revenue. That looks like a
              thin-margin, low-value business — until you normalize the books:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm glass rounded-luxury border border-white/5">
                <thead>
                  <tr className="text-silver/60 text-xs uppercase tracking-wide border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium">Item</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Why added back</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Net profit (as filed)', '$48,000', 'Starting point'],
                    ["Owner's salary", '+$95,000', 'New owner replaces this labor'],
                    ["Owner's health insurance", '+$14,400', 'Personal benefit'],
                    ['Personal truck (100%)', '+$18,000', 'Used personally'],
                    ['Meals & entertainment', '+$8,200', 'Largely personal'],
                    ['Non-recurring legal fee', '+$12,000', 'One-time dispute'],
                    ['Depreciation (equipment)', '+$22,000', 'Non-cash charge'],
                  ].map(([item, amt, reason], i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="py-2.5 px-4 text-warm-white">{item}</td>
                      <td className={`py-2.5 px-4 text-right font-medium ${amt.startsWith('+') ? 'text-green-400' : 'text-warm-white'}`}>{amt}</td>
                      <td className="py-2.5 px-4 text-silver/60 text-xs">{reason}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/10 bg-gold/5">
                    <td className="py-3 px-4 text-warm-white font-bold">= Normalized SDE</td>
                    <td className="py-3 px-4 text-right text-gold font-bold text-base">$217,600</td>
                    <td className="py-3 px-4 text-silver/60 text-xs">True owner benefit</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-silver/70 text-sm mt-4 leading-relaxed">
              At a 2.8x mid-market multiple for plumbing, this business is worth approximately{' '}
              <strong className="text-warm-white">$610,000</strong> — far above what the raw net profit
              would suggest. This is why normalization is the most important step in any business sale.
            </p>
          </section>

          {/* Why it matters for buyers */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">Why SDE matters for buyers</h2>
            <p className="text-silver/80 leading-relaxed mb-4">
              As a buyer, SDE tells you what you&apos;re really acquiring: the ability to pay yourself a
              full-time salary and still profit. When you evaluate a deal, compare the SDE to:
            </p>
            <ul className="space-y-3 text-silver/80">
              <li className="flex gap-3">
                <span className="text-gold shrink-0 font-bold">1.</span>
                <span><strong className="text-warm-white">The asking price.</strong> Divide asking price by SDE to get the implied multiple. Compare it to industry norms in the table above.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold shrink-0 font-bold">2.</span>
                <span><strong className="text-warm-white">Your required salary.</strong> If SDE is $180,000 but you need $150,000 just to live, there&apos;s only $30,000 left for debt service — verify the deal still works financially.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold shrink-0 font-bold">3.</span>
                <span><strong className="text-warm-white">SBA loan payments.</strong> A typical SBA 7(a) loan requires 1.25x debt service coverage. At 90% financing on a $600K deal, annual payments are roughly $80K — meaning you need at least $100K in SDE.</span>
              </li>
            </ul>
          </section>

          {/* Common mistakes */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">Common mistakes when calculating SDE</h2>
            <div className="space-y-4">
              {[
                { title: 'Adding back a market-rate salary as a full add-back', body: "If the business requires a full-time manager and you're replacing the owner as that manager, the add-back should be the owner's above-market salary, not their entire comp. A business paying the owner $250K when a qualified manager earns $80K should only add back $170K." },
                { title: 'Not removing non-recurring income', body: "A one-time contract, insurance settlement, or asset sale can inflate a single year's earnings. These should be removed before calculating SDE, just like one-time expenses." },
                { title: 'Using a single year of SDE', body: 'Buyers and lenders typically want to see 3 years of normalized financials. A single great year might not represent the business\'s true earning power. Use a weighted average if revenue trends are inconsistent.' },
                { title: 'Forgetting working capital adjustments', body: 'SDE measures profit, not cash flow. If the business carries significant inventory or has long receivable cycles, a buyer may need to inject working capital at close — this should factor into the purchase price negotiation.' },
              ].map((item, i) => (
                <div key={i} className="glass rounded-luxury border border-white/5 p-5">
                  <h3 className="text-warm-white font-semibold mb-2">
                    <span className="text-red-400 mr-2">×</span>{item.title}
                  </h3>
                  <p className="text-silver/70 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="glass rounded-luxury border border-gold/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-warm-white mb-3">
              Calculate SDE and value your business — free
            </h2>
            <p className="text-silver/70 mb-6 max-w-md mx-auto">
              Enter your revenue and expenses and our tool normalizes the numbers, applies the right
              industry multiple, and shows you a detailed valuation breakdown.
            </p>
            <Link
              href="/valuation"
              className="inline-block px-8 py-3 bg-gold text-midnight font-semibold rounded-luxury hover:bg-gold/90 transition-colors"
            >
              Run a Free Valuation →
            </Link>
          </div>

          {/* Related */}
          <div>
            <h2 className="text-xl font-bold text-warm-white mb-4">Related resources</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { href: '/blog/sde-multiples-by-industry', title: 'SDE Multiples by Industry 2026', desc: 'Reference table of SDE multiples for 48 industries.' },
                { href: '/blog/how-to-value-a-small-business', title: 'How to Value a Small Business', desc: 'Step-by-step guide to all four valuation methods.' },
                { href: '/blog/business-valuation-for-brokers', title: 'Business Valuation for Brokers', desc: 'How brokers use SDE multiples to price listings accurately.' },
                { href: '/blog/bizbuysell-alternatives', title: 'BizBuySell Alternatives', desc: 'How Succedence differs from traditional listing platforms.' },
              ].map(r => (
                <Link key={r.href} href={r.href} className="glass rounded-luxury border border-white/5 p-4 hover:border-gold/30 transition-colors group block">
                  <h3 className="text-warm-white font-semibold mb-1 group-hover:text-gold transition-colors text-sm">{r.title}</h3>
                  <p className="text-silver/60 text-xs leading-relaxed">{r.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

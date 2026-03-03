import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Business Valuation for Brokers: The Complete Workflow | Succedence',
  description:
    'How business brokers use SDE normalization, industry multiples, and risk scoring to value listings accurately and close deals faster. Includes a free valuation tool built for brokers.',
  openGraph: {
    title: 'Business Valuation for Brokers: The Complete Workflow',
    description:
      'A step-by-step breakdown of how brokers value small businesses — from normalizing financials to presenting a defensible asking price.',
    type: 'article',
  },
};

export default function ValuationForBrokersPage() {
  return (
    <div className="min-h-screen bg-midnight text-warm-white">
      {/* Hero */}
      <section className="pt-16 pb-10 px-6">
        <div className="max-w-3xl mx-auto">
          <nav className="text-sm text-silver/60 mb-6">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-silver/80">Business Valuation for Brokers</span>
          </nav>

          <div className="inline-block text-xs font-medium text-gold bg-gold/10 border border-gold/20 rounded px-3 py-1 mb-4">
            Broker Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-warm-white mb-4 leading-tight">
            Business Valuation for Brokers: The Complete Workflow
          </h1>
          <p className="text-lg text-silver/80">
            Accurate valuation is the most important thing a broker does. It&apos;s what earns seller
            trust, attracts qualified buyers, and prevents deals from falling apart at due diligence.
            Here&apos;s the full process — from first call to defensible asking price.
          </p>
        </div>
      </section>

      <div className="px-6 pb-16">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* Why valuation is the broker's core skill */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">Why valuation is the broker&apos;s core skill</h2>
            <p className="text-silver/80 leading-relaxed mb-4">
              Overpriced listings sit. Underpriced listings close fast but leave commission — and seller
              goodwill — on the table. The broker who consistently prices listings within 10–15% of final
              sale price builds a reputation that generates referrals. The broker who doesn&apos;t
              churns through listings and loses mandates to competitors.
            </p>
            <p className="text-silver/80 leading-relaxed">
              Most sellers have an inflated sense of what their business is worth. Part of the broker&apos;s
              job is education — showing sellers what the market will actually pay, backed by data and a
              clear methodology. A well-documented valuation also inoculates against re-trading: if the
              buyer tries to lower the offer post-LOI, the broker has the analysis to defend the price.
            </p>
          </section>

          {/* The 5-step workflow */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-6">The 5-step broker valuation workflow</h2>
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Collect 3 years of financials',
                  body: "Request three years of P&Ls, tax returns, and the most recent interim statement. Tax returns are the gold standard — they're harder to inflate and lenders require them anyway. Cross-reference revenue on the returns against the P&L. If they don't match, ask why.",
                  tip: 'Red flag: Revenue on P&L is 20%+ above tax return. This is common in cash-heavy businesses and will create problems in SBA underwriting.'
                },
                {
                  step: '2',
                  title: 'Normalize the financials (calculate SDE)',
                  body: "Add back the owner's salary, benefits, personal expenses, one-time costs, and non-cash charges to get to true Seller's Discretionary Earnings. Document every add-back with supporting detail — a well-prepared recast keeps the deal alive when buyers question the numbers.",
                  tip: 'Best practice: Build a Recast P&L table showing each line item, the add-back amount, and the justification. This is what sophisticated buyers and SBA lenders want to see.'
                },
                {
                  step: '3',
                  title: 'Select the right valuation method',
                  body: 'For most Main Street businesses under $5M in revenue, SDE × industry multiple is the correct method. EBITDA multiples apply when the business is large enough to have a management team in place. Revenue multiples are a sanity check, not a primary method.',
                  tip: 'Exception: Asset-heavy businesses (manufacturing, trucking) may be valued partly on replacement cost of assets. Always value assets separately and add to the income-based value.'
                },
                {
                  step: '4',
                  title: 'Apply risk adjustments',
                  body: "The industry multiple gives you a starting point — not an answer. Adjust for owner dependency, customer concentration, lease terms, revenue trend, and recurring revenue percentage. Each factor can move the multiple by 0.2–0.5x in either direction. Document these adjustments so you can explain them to the seller and defend them to buyers.",
                  tip: 'The most common deal-killers: customer concentration >30% in one account, and owner working 60+ hours/week with no documented systems.'
                },
                {
                  step: '5',
                  title: 'Present the valuation with a range and confidence level',
                  body: "Don't give sellers a single number — give them a range (low, mid, high) and explain what has to be true to achieve each endpoint. This sets realistic expectations, avoids anchor bias, and makes the conversation about market conditions rather than the broker's opinion.",
                  tip: 'Framing: \"Based on the comps, businesses like yours typically sell between X and Y. To hit the high end, buyers will need to see Z.\" This shifts the seller\'s focus from price to what they control.'
                },
              ].map(item => (
                <div key={item.step} className="glass rounded-luxury border border-white/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-gold font-bold text-sm">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="text-warm-white font-semibold mb-2">{item.title}</h3>
                      <p className="text-silver/80 text-sm leading-relaxed mb-3">{item.body}</p>
                      <div className="bg-gold/5 border border-gold/15 rounded-lg px-4 py-2.5">
                        <p className="text-silver/70 text-xs leading-relaxed">
                          <span className="text-gold font-semibold">Broker tip: </span>{item.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Common industries brokers deal with */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">Multiple ranges by deal type</h2>
            <p className="text-silver/80 leading-relaxed mb-5">
              Not all businesses trade in the same multiple band. Here&apos;s a quick reference by deal
              type — the ranges that matter most in the Main Street and lower-middle market:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm glass rounded-luxury border border-white/5">
                <thead>
                  <tr className="text-silver/60 text-xs uppercase tracking-wide border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium">Deal Type</th>
                    <th className="text-center py-3 px-4 font-medium">Typical SDE Multiple</th>
                    <th className="text-left py-3 px-4 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Owner-operated service business', '2.0x – 3.5x', 'Most common in broker portfolios'],
                    ['Franchise resale (established)', '2.5x – 4.0x', 'Brand recognition reduces risk'],
                    ['Recurring revenue / contracts', '3.0x – 5.0x', 'Higher multiple justified by predictability'],
                    ['Restaurants (full-service)', '1.5x – 2.8x', 'High labor, high volatility'],
                    ['Healthcare practice', '2.0x – 4.0x', 'Licensing/referral network has real value'],
                    ['SaaS / tech business', '3.0x – 7.0x', 'Multiples can exceed this range at scale'],
                    ['Retail / brick-and-mortar', '1.5x – 3.0x', 'E-commerce headwinds keep multiples low'],
                  ].map(([type, range, note], i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 text-warm-white">{type}</td>
                      <td className="py-3 px-4 text-center text-gold font-medium">{range}</td>
                      <td className="py-3 px-4 text-silver/60 text-xs">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-silver/60 text-xs mt-3">
              For a complete table across 48 industries, see our{' '}
              <Link href="/blog/sde-multiples-by-industry" className="text-gold hover:underline">
                SDE multiples by industry reference →
              </Link>
            </p>
          </section>

          {/* How to handle seller pushback */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">How to handle seller pushback on valuation</h2>
            <p className="text-silver/80 leading-relaxed mb-5">
              Almost every seller believes their business is worth more than the market says. Here&apos;s
              how to have that conversation without losing the listing:
            </p>
            <div className="space-y-4">
              {[
                {
                  scenario: "\"I've put 20 years into this business\"",
                  response: "Acknowledge the emotional reality, then redirect to what buyers pay for: future earnings, not past effort. \"The good news is that 20 years of clean operations and loyal customers is exactly what gets you to the high end of the range. Let me show you what that looks like.\""
                },
                {
                  scenario: "\"My neighbor sold his business for 5x\"",
                  response: "Ask for details. Comparable sales are often misremembered or involve different industries, deal structures, or financial profiles. \"That's possible — what industry was he in? Was that 5x SDE or 5x revenue? The structure matters a lot.\""
                },
                {
                  scenario: "\"An online calculator said $X\"",
                  response: "Online calculators use revenue multiples or generic multipliers that ignore risk factors. Walk them through the risk-adjusted SDE calculation. The data usually speaks for itself when presented clearly."
                },
                {
                  scenario: "\"I need to net $X to retire\"",
                  response: "This is a needs-based negotiation, not a market-based one. Separate the two: \"I understand. Let's look at what the market will realistically support and then figure out if there's a deal structure — earn-out, seller financing — that could bridge that gap.\""
                },
              ].map((item, i) => (
                <div key={i} className="glass rounded-luxury border border-white/5 p-5">
                  <p className="text-gold text-sm font-medium mb-2 italic">&ldquo;{item.scenario}&rdquo;</p>
                  <p className="text-silver/80 text-sm leading-relaxed">{item.response}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How Succedence helps */}
          <section>
            <h2 className="text-2xl font-bold text-warm-white mb-4">How Succedence fits into a broker&apos;s workflow</h2>
            <p className="text-silver/80 leading-relaxed mb-5">
              Succedence is a free valuation tool built specifically for Main Street business valuation.
              It&apos;s not a generic business calculator — it uses industry-specific SDE multiples,
              risk-factor adjustments, and a deal quality scoring system designed around how brokers
              actually think about deals.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: '⚡', title: 'Instant first-look valuation', body: 'Enter basic financials and get a risk-adjusted range in seconds — useful in the first seller conversation before you commit to a full engagement.' },
                { icon: '📊', title: 'Broker Rationale output', body: "The valuation includes a plain-English summary you can share with sellers explaining exactly why the business is valued where it is — in language sellers understand." },
                { icon: '🎯', title: 'Deal Quality Score', body: 'A 0–100 score flags the deal\'s strengths and weaknesses before you list it. Identify issues early — customer concentration, owner dependency — so you can address them proactively.' },
                { icon: '🔗', title: 'Works from listing URLs', body: 'Paste a BizBuySell or BizQuest listing URL and the tool auto-populates the valuation form — useful for evaluating inbound buyer referrals or comping listings quickly.' },
              ].map(item => (
                <div key={item.title} className="glass rounded-luxury border border-white/5 p-5">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="text-warm-white font-semibold mb-1 text-sm">{item.title}</h3>
                  <p className="text-silver/70 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="glass rounded-luxury border border-gold/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-warm-white mb-3">
              Free valuation tool for business brokers
            </h2>
            <p className="text-silver/70 mb-6 max-w-md mx-auto">
              No account required. Run a complete, risk-adjusted valuation in under two minutes —
              including a Broker Rationale you can share with sellers.
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
                { href: '/blog/sde-multiples-by-industry', title: 'SDE Multiples by Industry 2026', desc: 'Quick reference table for 48 industries.' },
                { href: '/blog/what-is-sde', title: 'What Is SDE?', desc: "Complete explainer on Seller's Discretionary Earnings." },
                { href: '/blog/how-to-value-a-small-business', title: 'How to Value a Small Business', desc: 'Full guide to all four valuation methods.' },
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

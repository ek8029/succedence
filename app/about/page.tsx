import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'How It Works | Succedence',
  description: 'Technical documentation of the Succedence valuation algorithm, risk adjustment methodology, and data sources.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-color">
      <Section variant="hero">
        <PageContainer>
          <Stack gap="xl">
            <Stack gap="md" className="max-w-3xl">
              <h1 className="text-hero-mobile lg:text-hero text-text-primary">
                How Succedence Works
              </h1>
              <p className="text-body-lg text-text-secondary">
                Technical documentation of our valuation algorithm, industry multiples, and risk adjustment methodology. No fluff—just the actual implementation.
              </p>
            </Stack>
          </Stack>
        </PageContainer>
      </Section>

      {/* Core Valuation Algorithm */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Core Valuation Algorithm</h2>

            <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
              <Stack gap="md">
                <h3 className="text-h3 text-text-primary">Five-Step Process</h3>

                <div className="space-y-4">
                  <div className="border-l-2 border-accent-color pl-4">
                    <h4 className="text-h4 text-text-primary mb-2">1. Industry Classification</h4>
                    <p className="text-text-secondary text-label">
                      Maps business to one of 50+ predefined industries with NAICS codes. Falls back to "general_business" if unmatched.
                    </p>
                    <p className="text-micro text-text-secondary/70 mt-2">
                      Implementation: <code className="text-accent-color">/lib/valuation/industry-multiples.ts</code>
                    </p>
                  </div>

                  <div className="border-l-2 border-accent-color pl-4">
                    <h4 className="text-h4 text-text-primary mb-2">2. Financial Normalization</h4>
                    <p className="text-text-secondary text-label">
                      Converts raw financials to normalized SDE using: <code className="text-accent-color">SDE = EBITDA + Owner Salary + Owner Benefits + Discretionary Expenses</code>
                    </p>
                    <p className="text-micro text-text-secondary/70 mt-2">
                      Owner salary estimated by revenue tier when not provided ($50K to $200K range based on business size).
                    </p>
                    <p className="text-micro text-text-secondary/70 mt-1">
                      Implementation: <code className="text-accent-color">/lib/valuation/financial-normalization.ts</code>
                    </p>
                  </div>

                  <div className="border-l-2 border-accent-color pl-4">
                    <h4 className="text-h4 text-text-primary mb-2">3. Risk Adjustments</h4>
                    <p className="text-text-secondary text-label">
                      Applies 8 independent risk factors with documented adjustment ranges. Total adjustment capped at ±1.0x.
                    </p>
                    <p className="text-micro text-text-secondary/70 mt-2">
                      Implementation: <code className="text-accent-color">/lib/valuation/risk-adjustments.ts</code>
                    </p>
                  </div>

                  <div className="border-l-2 border-accent-color pl-4">
                    <h4 className="text-h4 text-text-primary mb-2">4. Multiple Application</h4>
                    <p className="text-text-secondary text-label">
                      Applies adjusted industry multiples to normalized financials. Generates low/mid/high range using industry volatility.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent-color pl-4">
                    <h4 className="text-h4 text-text-primary mb-2">5. Tangible Asset Addition</h4>
                    <p className="text-text-secondary text-label">
                      Adds inventory + FF&amp;E (fixtures, furniture, equipment) to multiple-based valuation for total enterprise value.
                    </p>
                  </div>
                </div>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Industry Multiples */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Industry Multiples Database</h2>

            <p className="text-body text-text-secondary max-w-3xl">
              We maintain hardcoded multiples for 50+ industries based on BizBuySell and IBBA market data. These are static values updated quarterly, not live data feeds.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-text-secondary/20 rounded-lg p-4">
                <h4 className="text-h4 text-text-primary mb-3">Example: HVAC Services</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">SDE Multiple:</span>
                    <span className="text-accent-color font-semibold">2.5x - 4.0x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">EBITDA Multiple:</span>
                    <span className="text-accent-color font-semibold">3.5x - 6.0x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Revenue Multiple:</span>
                    <span className="text-accent-color font-semibold">0.5x - 1.0x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Volatility:</span>
                    <span className="text-text-secondary">Medium</span>
                  </div>
                </div>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <h4 className="text-h4 text-text-primary mb-3">Example: SaaS/Software</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">SDE Multiple:</span>
                    <span className="text-accent-color font-semibold">3.0x - 7.0x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">EBITDA Multiple:</span>
                    <span className="text-accent-color font-semibold">5.0x - 12.0x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Revenue Multiple:</span>
                    <span className="text-accent-color font-semibold">2.0x - 8.0x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Volatility:</span>
                    <span className="text-text-secondary">High</span>
                  </div>
                </div>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <h4 className="text-h4 text-text-primary mb-3">Example: Coffee Shop</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">SDE Multiple:</span>
                    <span className="text-accent-color font-semibold">1.5x - 2.8x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">EBITDA Multiple:</span>
                    <span className="text-accent-color font-semibold">2.5x - 4.5x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Revenue Multiple:</span>
                    <span className="text-accent-color font-semibold">0.35x - 0.7x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Volatility:</span>
                    <span className="text-text-secondary">Medium</span>
                  </div>
                </div>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <h4 className="text-h4 text-text-primary mb-3">Example: Professional Services</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">SDE Multiple:</span>
                    <span className="text-accent-color font-semibold">2.0x - 3.5x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">EBITDA Multiple:</span>
                    <span className="text-accent-color font-semibold">3.0x - 5.5x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Revenue Multiple:</span>
                    <span className="text-accent-color font-semibold">0.4x - 0.9x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Volatility:</span>
                    <span className="text-text-secondary">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Risk Adjustment Table */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Risk Adjustment Factors</h2>

            <p className="text-body text-text-secondary max-w-3xl">
              Eight independent factors that adjust base multiples. These reflect actual discount rates observed in transaction data and SBA lending criteria.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-text-secondary/20">
                    <th className="text-left py-3 px-4 text-h4 text-text-primary">Factor</th>
                    <th className="text-left py-3 px-4 text-h4 text-text-primary">Range</th>
                    <th className="text-left py-3 px-4 text-h4 text-text-primary">Multiple Impact</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4 text-text-secondary">Customer Concentration</td>
                    <td className="py-3 px-4 text-text-secondary">0-100% (top 3 customers)</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">-0.5x to +0.1x</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4 text-text-secondary">Revenue Growth Trend</td>
                    <td className="py-3 px-4 text-text-secondary">Declining to +25% CAGR</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">-0.45x to +0.35x</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4 text-text-secondary">Owner Dependency</td>
                    <td className="py-3 px-4 text-text-secondary">60+ hrs/week to &lt;20 hrs</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">-0.4x to +0.3x</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4 text-text-secondary">Recurring Revenue</td>
                    <td className="py-3 px-4 text-text-secondary">0-100%</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">-0.1x to +0.4x</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4 text-text-secondary">Lease Risk</td>
                    <td className="py-3 px-4 text-text-secondary">&lt;1 year to 10+ years remaining</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">-0.45x to +0.2x</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4 text-text-secondary">Business Age</td>
                    <td className="py-3 px-4 text-text-secondary">&lt;3 years to 20+ years</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">-0.3x to +0.2x</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4 text-text-secondary">Employee Count</td>
                    <td className="py-3 px-4 text-text-secondary">Solo operator to 15+ employees</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">-0.1x to +0.15x</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4 text-text-secondary">Rent as % Revenue</td>
                    <td className="py-3 px-4 text-text-secondary">&gt;15% to &lt;5%</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">-0.2x to +0.1x</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-accent-color/30 bg-accent-color/10 rounded-lg p-4">
              <p className="text-label text-text-secondary">
                <strong className="text-text-primary">SDE Size Premium/Discount:</strong> Additional adjustment based on business scale. Ranges from -0.4x (&lt;$50K SDE micro-businesses) to +0.5x (&gt;$1M SDE institutional quality). Total cumulative adjustment capped at ±1.0x.
              </p>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Deal Quality Scoring */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Deal Quality Scoring</h2>

            <p className="text-body text-text-secondary max-w-3xl">
              Six-factor weighted model that generates A-F grades (0-100 scale). Used for buyer matching and listing quality assessment.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-text-secondary/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-h4 text-text-primary">Pricing Fairness</h4>
                  <span className="text-accent-color font-semibold">25%</span>
                </div>
                <p className="text-text-secondary text-label">Asking price vs. calculated mid valuation</p>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-h4 text-text-primary">Financial Trajectory</h4>
                  <span className="text-accent-color font-semibold">20%</span>
                </div>
                <p className="text-text-secondary text-label">Revenue growth trend + recurring revenue bonus</p>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-h4 text-text-primary">Concentration Risk</h4>
                  <span className="text-accent-color font-semibold">15%</span>
                </div>
                <p className="text-text-secondary text-label">Customer diversification (inverted scoring)</p>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-h4 text-text-primary">Operational Risk</h4>
                  <span className="text-accent-color font-semibold">15%</span>
                </div>
                <p className="text-text-secondary text-label">Owner hours, employee count, business age</p>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-h4 text-text-primary">Documentation Quality</h4>
                  <span className="text-accent-color font-semibold">10%</span>
                </div>
                <p className="text-text-secondary text-label">Completeness of provided data</p>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-h4 text-text-primary">Valuation Alignment</h4>
                  <span className="text-accent-color font-semibold">15%</span>
                </div>
                <p className="text-text-secondary text-label">Asking price position within range</p>
              </div>
            </div>

            <div className="border border-text-secondary/20 rounded-lg p-4">
              <h4 className="text-h4 text-text-primary mb-3">Grade Thresholds</h4>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className="border border-accent-color/30 bg-accent-color/10 rounded p-2">
                  <div className="text-h3 text-text-primary">A</div>
                  <div className="text-text-secondary text-micro">≥85</div>
                </div>
                <div className="border border-text-secondary/30 rounded p-2">
                  <div className="text-h3 text-text-primary">B</div>
                  <div className="text-text-secondary text-micro">70-84</div>
                </div>
                <div className="border border-text-secondary/30 rounded p-2">
                  <div className="text-h3 text-text-primary">C</div>
                  <div className="text-text-secondary text-micro">55-69</div>
                </div>
                <div className="border border-text-secondary/30 rounded p-2">
                  <div className="text-h3 text-text-primary">D</div>
                  <div className="text-text-secondary text-micro">40-54</div>
                </div>
                <div className="border border-text-secondary/30 rounded p-2">
                  <div className="text-h3 text-text-primary">F</div>
                  <div className="text-text-secondary text-micro">&lt;40</div>
                </div>
              </div>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* What's NOT Included */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Limitations & Disclaimers</h2>

            <div className="border border-text-secondary/20 rounded-lg p-6">
              <Stack gap="md">
                <p className="text-body text-text-secondary">
                  To be clear about what Succedence is <strong className="text-text-primary">NOT</strong>:
                </p>

                <ul className="space-y-2 text-text-secondary text-label">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">Not a certified appraisal:</strong> This is an algorithmic estimate, not a professional business appraisal compliant with USPAP standards.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">Not live market data:</strong> Industry multiples are hardcoded from quarterly IBBA/BizBuySell reports. Updated quarterly, not real-time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">Not machine learning:</strong> Pure rule-based algorithm with documented adjustment ranges. No black-box AI in core valuation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">No web scraping:</strong> URL parsing from listing platforms is currently a placeholder. Requires manual data entry.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">Confidence reduction:</strong> Scores automatically reduced when data is incomplete (revenue-only method: -25 points, insufficient risk factors: -20 points).</span>
                  </li>
                </ul>

                <p className="text-label text-text-secondary/80 pt-4 border-t border-text-secondary/20">
                  All methodology code is available in <code className="text-accent-color">/lib/valuation/</code> directory. Calculations are independently reproducible.
                </p>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* CTA */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <div className="text-center max-w-2xl mx-auto">
            <Stack gap="md">
              <h2 className="text-h2 text-text-primary">Try the valuation engine</h2>
              <p className="text-body text-text-secondary">
                Free tier: 1 anonymous valuation. No signup required.
              </p>
              <Link
                href="/valuation"
                className="group inline-flex items-center justify-center px-8 h-12 bg-accent-color text-white font-semibold rounded-lg transition-all duration-200 hover:bg-[#E6A238] hover:-translate-y-0.5 active:scale-[0.97] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color"
              >
                Get Your Valuation
                <svg
                  className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Stack>
          </div>
        </PageContainer>
      </Section>

      <Footer />
    </div>
  );
}

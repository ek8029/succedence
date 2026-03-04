import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'Usage Examples | Succedence',
  description: 'Real examples of Succedence valuations, platform usage patterns, and matching algorithm results.',
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-surface-color">
      <Section variant="hero">
        <PageContainer>
          <Stack gap="xl">
            <Stack gap="md" className="max-w-3xl">
              <h1 className="text-hero-mobile lg:text-hero text-text-primary">
                Platform Usage Examples
              </h1>
              <p className="text-body-lg text-text-secondary">
                Real examples from the codebase showing how valuations are calculated, listings are matched, and the platform is used. No fabricated testimonials—just actual implementation patterns.
              </p>
            </Stack>
          </Stack>
        </PageContainer>
      </Section>

      {/* Sample Valuations */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Sample Valuations from Test Data</h2>

            <p className="text-body text-text-secondary max-w-3xl">
              These are actual test cases included in the codebase (<code className="text-accent-color">app/admin/import-listings/page.tsx</code>). They demonstrate how the valuation engine processes different business types.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Coffee Shop Example */}
              <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
                <Stack gap="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-h3 text-text-primary">Example Coffee Shop</h3>
                      <p className="text-label text-text-secondary">Food Service • Austin, TX</p>
                    </div>
                    <div className="text-right">
                      <div className="text-micro text-text-secondary">Asking Price</div>
                      <div className="text-h4 text-accent-color">$50,000</div>
                    </div>
                  </div>

                  <div className="border-t border-text-secondary/20 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-micro text-text-secondary/70">Annual Revenue</div>
                        <div className="text-label text-text-primary font-semibold">$250,000</div>
                      </div>
                      <div>
                        <div className="text-micro text-text-secondary/70">Normalized SDE</div>
                        <div className="text-label text-text-primary font-semibold">$180,000</div>
                      </div>
                      <div>
                        <div className="text-micro text-text-secondary/70">Year Established</div>
                        <div className="text-label text-text-primary font-semibold">2018</div>
                      </div>
                      <div>
                        <div className="text-micro text-text-secondary/70">Business Age</div>
                        <div className="text-label text-text-primary font-semibold">6 years</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-text-secondary/20 pt-4">
                    <h4 className="text-h4 text-text-primary mb-2">Valuation Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Industry Multiple (Coffee Shop):</span>
                        <span className="text-accent-color font-semibold">1.5x - 2.8x SDE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Base Valuation Range:</span>
                        <span className="text-text-primary font-semibold">$270K - $504K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Asking vs. Low:</span>
                        <span className="text-red-400 font-semibold">-81% (underpriced)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-text-secondary/20 pt-4">
                    <p className="text-micro text-text-secondary/70">
                      <strong className="text-text-primary">Analysis:</strong> Asking price significantly below calculated range. Potential asset sale or distressed situation. SDE appears high relative to revenue (72% margin unusual for coffee shop).
                    </p>
                  </div>
                </Stack>
              </div>

              {/* Restaurant Example */}
              <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
                <Stack gap="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-h3 text-text-primary">Example Restaurant</h3>
                      <p className="text-label text-text-secondary">Full-Service Dining • Dallas, TX</p>
                    </div>
                    <div className="text-right">
                      <div className="text-micro text-text-secondary">Asking Price</div>
                      <div className="text-h4 text-accent-color">$80,000</div>
                    </div>
                  </div>

                  <div className="border-t border-text-secondary/20 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-micro text-text-secondary/70">Annual Revenue</div>
                        <div className="text-label text-text-primary font-semibold">$500,000</div>
                      </div>
                      <div>
                        <div className="text-micro text-text-secondary/70">Normalized SDE</div>
                        <div className="text-label text-text-primary font-semibold">$400,000</div>
                      </div>
                      <div>
                        <div className="text-micro text-text-secondary/70">Year Established</div>
                        <div className="text-label text-text-primary font-semibold">2015</div>
                      </div>
                      <div>
                        <div className="text-micro text-text-secondary/70">Business Age</div>
                        <div className="text-label text-text-primary font-semibold">9 years</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-text-secondary/20 pt-4">
                    <h4 className="text-h4 text-text-primary mb-2">Valuation Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Industry Multiple (Restaurant):</span>
                        <span className="text-accent-color font-semibold">1.8x - 3.2x SDE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Base Valuation Range:</span>
                        <span className="text-text-primary font-semibold">$720K - $1.28M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Asking vs. Low:</span>
                        <span className="text-red-400 font-semibold">-89% (severely underpriced)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-text-secondary/20 pt-4">
                    <p className="text-micro text-text-secondary/70">
                      <strong className="text-text-primary">Analysis:</strong> Extremely high SDE margin (80% of revenue) is unrealistic for full-service dining. Likely data error or asset-only sale. Normal restaurant SDE margins: 10-20%.
                    </p>
                  </div>
                </Stack>
              </div>
            </div>

            <div className="border border-accent-color/30 bg-accent-color/10 rounded-lg p-4">
              <p className="text-label text-text-secondary">
                <strong className="text-text-primary">Note:</strong> These are test cases with intentionally unrealistic financials to validate edge case handling. Real-world valuations would flag these margin inconsistencies in the confidence scoring.
              </p>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Buyer Matching Algorithm */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Buyer-Listing Matching Algorithm</h2>

            <p className="text-body text-text-secondary max-w-3xl">
              Our matching engine runs nightly (<code className="text-accent-color">/api/match/run</code>) to score buyer preferences against listings. Matches require ≥40 points to be stored.
            </p>

            <div className="border border-text-secondary/20 rounded-lg p-6">
              <h3 className="text-h3 text-text-primary mb-4">Scoring Breakdown (100-point scale)</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-text-secondary/20">
                  <div className="flex-1">
                    <div className="text-label text-text-primary">Industry Match</div>
                    <div className="text-micro text-text-secondary/70">Listing industry in buyer's preferred industries</div>
                  </div>
                  <div className="text-accent-color font-semibold text-h4">+40</div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-text-secondary/20">
                  <div className="flex-1">
                    <div className="text-label text-text-primary">State Match</div>
                    <div className="text-micro text-text-secondary/70">Listing state in buyer's target states</div>
                  </div>
                  <div className="text-accent-color font-semibold text-h4">+15</div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-text-secondary/20">
                  <div className="flex-1">
                    <div className="text-label text-text-primary">Revenue Meets Minimum</div>
                    <div className="text-micro text-text-secondary/70">Annual revenue ≥ buyer's minimum requirement</div>
                  </div>
                  <div className="text-accent-color font-semibold text-h4">+15</div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-text-secondary/20">
                  <div className="flex-1">
                    <div className="text-label text-text-primary">EBITDA/SDE Meets Minimum</div>
                    <div className="text-micro text-text-secondary/70">Cash flow ≥ buyer's minimum earnings requirement</div>
                  </div>
                  <div className="text-accent-color font-semibold text-h4">+10</div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-text-secondary/20">
                  <div className="flex-1">
                    <div className="text-label text-text-primary">Owner Hours Acceptable</div>
                    <div className="text-micro text-text-secondary/70">Weekly hours ≤ buyer's maximum acceptable commitment</div>
                  </div>
                  <div className="text-accent-color font-semibold text-h4">+10</div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-text-secondary/20">
                  <div className="flex-1">
                    <div className="text-label text-text-primary">Price Within Budget</div>
                    <div className="text-micro text-text-secondary/70">Asking price ≤ buyer's maximum budget</div>
                  </div>
                  <div className="text-accent-color font-semibold text-h4">+10</div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-text-secondary/20">
                  <div className="flex-1">
                    <div className="text-label text-text-primary">Keyword Matches</div>
                    <div className="text-micro text-text-secondary/70">Buyer's search keywords found in listing description</div>
                  </div>
                  <div className="text-accent-color font-semibold text-h4">+5 each (max +20)</div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="text-label text-text-primary">Freshness Bonus</div>
                    <div className="text-micro text-text-secondary/70">Listing created within last 14 days</div>
                  </div>
                  <div className="text-accent-color font-semibold text-h4">+10</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-text-secondary/20 rounded-lg p-4">
                <h4 className="text-h4 text-text-primary mb-2">Example: Strong Match (Score: 90)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Industry match (HVAC in preferred list)</span>
                    <span className="text-accent-color">+40</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>State match (Texas)</span>
                    <span className="text-accent-color">+15</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Revenue exceeds minimum ($500K{'>'} $250K)</span>
                    <span className="text-accent-color">+15</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Price within budget ($300K{'<'} $500K max)</span>
                    <span className="text-accent-color">+10</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Freshness (listed 5 days ago)</span>
                    <span className="text-accent-color">+10</span>
                  </div>
                  <div className="flex justify-between font-semibold text-text-primary pt-2 border-t border-text-secondary/20">
                    <span>Total Score</span>
                    <span className="text-accent-color">90</span>
                  </div>
                </div>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-4">
                <h4 className="text-h4 text-text-primary mb-2">Example: Weak Match (Score: 25 - Not Stored)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Industry mismatch (0 points)</span>
                    <span className="text-red-400">+0</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>State match (California)</span>
                    <span className="text-accent-color">+15</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Price within budget</span>
                    <span className="text-accent-color">+10</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Revenue below minimum (0 points)</span>
                    <span className="text-red-400">+0</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Stale listing (45 days old, 0 points)</span>
                    <span className="text-red-400">+0</span>
                  </div>
                  <div className="flex justify-between font-semibold text-text-primary pt-2 border-t border-text-secondary/20">
                    <span>Total Score</span>
                    <span className="text-red-400">25 (rejected)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-accent-color/30 bg-accent-color/10 rounded-lg p-4">
              <p className="text-label text-text-secondary">
                <strong className="text-text-primary">Threshold:</strong> Only matches scoring ≥40 are stored in the database and shown to buyers. This prevents noise from low-quality matches.
              </p>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Platform Usage Limits */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Actual Usage Limits & Plan Tiers</h2>

            <p className="text-body text-text-secondary max-w-3xl">
              Real quota enforcement from <code className="text-accent-color">/lib/utils/plan-limitations.ts</code>. These are not marketing numbers—they're enforced at API level with violation logging.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-text-secondary/20">
                    <th className="text-left py-3 px-4 text-h4 text-text-primary">Feature</th>
                    <th className="text-center py-3 px-4 text-h4 text-text-primary">Free</th>
                    <th className="text-center py-3 px-4 text-h4 text-text-primary">Beta</th>
                    <th className="text-center py-3 px-4 text-h4 text-text-primary">Starter</th>
                    <th className="text-center py-3 px-4 text-h4 text-text-primary">Professional</th>
                    <th className="text-center py-3 px-4 text-h4 text-text-primary">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-center">
                  <tr className="border-b border-text-secondary/20">
                    <td className="text-left py-3 px-4 text-text-secondary">Daily Analyses</td>
                    <td className="py-3 px-4 text-text-primary">2</td>
                    <td className="py-3 px-4 text-text-primary">20</td>
                    <td className="py-3 px-4 text-text-primary">10</td>
                    <td className="py-3 px-4 text-text-primary">50</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">Unlimited</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="text-left py-3 px-4 text-text-secondary">Monthly Analyses</td>
                    <td className="py-3 px-4 text-text-primary">10</td>
                    <td className="py-3 px-4 text-text-primary">100</td>
                    <td className="py-3 px-4 text-text-primary">50</td>
                    <td className="py-3 px-4 text-text-primary">500</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">Unlimited</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="text-left py-3 px-4 text-text-secondary">Questions per Hour</td>
                    <td className="py-3 px-4 text-text-primary">2</td>
                    <td className="py-3 px-4 text-text-primary">10</td>
                    <td className="py-3 px-4 text-text-primary">5</td>
                    <td className="py-3 px-4 text-text-primary">20</td>
                    <td className="py-3 px-4 text-text-primary">50</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="text-left py-3 px-4 text-text-secondary">Follow-ups (each type)</td>
                    <td className="py-3 px-4 text-text-primary">2</td>
                    <td className="py-3 px-4 text-text-primary">5</td>
                    <td className="py-3 px-4 text-text-primary">10</td>
                    <td className="py-3 px-4 text-text-primary">50</td>
                    <td className="py-3 px-4 text-accent-color font-semibold">Unlimited</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="text-left py-3 px-4 text-text-secondary">PDF Export</td>
                    <td className="py-3 px-4 text-red-400">✗</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="text-left py-3 px-4 text-text-secondary">Advanced Metrics</td>
                    <td className="py-3 px-4 text-red-400">✗</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                    <td className="py-3 px-4 text-red-400">✗</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                  </tr>
                  <tr>
                    <td className="text-left py-3 px-4 text-text-secondary">Conversation History</td>
                    <td className="py-3 px-4 text-red-400">✗</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                    <td className="py-3 px-4 text-accent-color">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-text-secondary/20 rounded-lg p-4">
              <Stack gap="sm">
                <h4 className="text-h4 text-text-primary">Usage Tracking Implementation</h4>
                <ul className="space-y-2 text-text-secondary text-label">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">Database-backed:</strong> Uses RPC function <code className="text-accent-color">get_user_current_usage</code> for quota checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">Fallback mode:</strong> In-memory tracking if database RPC unavailable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">Violation logging:</strong> All limit-exceeded events logged to <code className="text-accent-color">usage_violations</code> table with IP + user agent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">Cost tracking:</strong> ~$0.06 per follow-up question calculated and stored daily</span>
                  </li>
                </ul>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* What We're NOT Showing */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">What's Not Included Here</h2>

            <div className="border border-text-secondary/20 rounded-lg p-6">
              <Stack gap="md">
                <p className="text-body text-text-secondary">
                  To be transparent about what this page does <strong className="text-text-primary">NOT</strong> contain:
                </p>

                <ul className="space-y-2 text-text-secondary text-label">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">No customer testimonials:</strong> We haven't fabricated reviews or success stories. User feedback is collected but not yet published.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">No transaction closure data:</strong> We don't track whether valuations led to actual deals. Platform focuses on valuation accuracy, not deal facilitation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">No ROI claims:</strong> We can't demonstrate that our valuations increase sale prices or reduce time-to-close. That would require longitudinal tracking we haven't implemented.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-color mt-1">•</span>
                    <span><strong className="text-text-primary">No third-party validation:</strong> While methodology aligns with IBBA/NACVA standards, we haven't pursued formal certification or endorsement.</span>
                  </li>
                </ul>

                <p className="text-label text-text-secondary/80 pt-4 border-t border-text-secondary/20">
                  This page shows actual code examples and implementation details. When we have real case studies with user permission, we'll add them here.
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
              <h2 className="text-h2 text-text-primary">Try the platform yourself</h2>
              <p className="text-body text-text-secondary">
                Free tier: 2 daily analyses, 10 monthly. See the algorithm in action.
              </p>
              <Link
                href="/valuation"
                className="group inline-flex items-center justify-center px-8 h-12 bg-accent-color text-white font-semibold rounded-lg transition-all duration-200 hover:bg-[#E6A238] hover:-translate-y-0.5 active:scale-[0.97] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color"
              >
                Get Started
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

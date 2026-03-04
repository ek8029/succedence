import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: 'Security Documentation | Succedence',
  description: 'Technical documentation of Succedence security implementation: authentication, authorization, data protection, and API security.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-surface-color">
      <Section variant="hero">
        <PageContainer>
          <Stack gap="xl">
            <Stack gap="md" className="max-w-3xl">
              <h1 className="text-hero-mobile lg:text-hero text-text-primary">
                Security Implementation
              </h1>
              <p className="text-body-lg text-text-secondary">
                Technical documentation of actual security measures implemented in the Succedence platform. No marketing claims—just the code-level protections in place.
              </p>
            </Stack>
          </Stack>
        </PageContainer>
      </Section>

      {/* Authentication */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Authentication & Session Management</h2>

            <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
              <Stack gap="md">
                <div>
                  <h3 className="text-h3 text-text-primary mb-2">Supabase Auth</h3>
                  <p className="text-body text-text-secondary">
                    Primary authentication layer using Supabase Auth service with email/password and OAuth providers.
                  </p>
                  <p className="text-micro text-text-secondary/70 mt-2">
                    Implementation: <code className="text-accent-color">/middleware.ts</code>, <code className="text-accent-color">/lib/supabase/client.ts</code>
                  </p>
                </div>

                <div className="border-t border-text-secondary/20 pt-4">
                  <h4 className="text-h4 text-text-primary mb-3">Session Handling</h4>
                  <ul className="space-y-2 text-text-secondary text-label">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Token storage:</strong> Supabase Auth tokens stored in HTTP-only cookies (not localStorage)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Server-side validation:</strong> Middleware validates session on every protected route request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Service role key:</strong> Admin operations use separate service role key with elevated privileges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Anon key:</strong> User-level API calls use anonymous key with row-level security enforcement</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-text-secondary/20 pt-4">
                  <h4 className="text-h4 text-text-primary mb-3">Route Protection</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-label text-accent-color mb-2">Public Routes (No Auth Required)</div>
                      <ul className="space-y-1 text-text-secondary">
                        <li>• <code className="text-text-primary">/</code> (homepage)</li>
                        <li>• <code className="text-text-primary">/valuation</code> (free tool)</li>
                        <li>• <code className="text-text-primary">/pricing</code></li>
                        <li>• <code className="text-text-primary">/how-it-works</code></li>
                        <li>• <code className="text-text-primary">/brokers</code></li>
                        <li>• <code className="text-text-primary">/blog/*</code></li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-label text-accent-color mb-2">Protected Routes (Auth Required)</div>
                      <ul className="space-y-1 text-text-secondary">
                        <li>• <code className="text-text-primary">/dashboard</code></li>
                        <li>• <code className="text-text-primary">/profile</code></li>
                        <li>• <code className="text-text-primary">/preferences</code></li>
                        <li>• <code className="text-text-primary">/matches</code></li>
                        <li>• <code className="text-text-primary">/saved-listings</code></li>
                        <li>• <code className="text-text-primary">/listings/*/edit</code></li>
                        <li>• <code className="text-text-primary">/admin</code> (email whitelist)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Authorization & Access Control */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Authorization & Role-Based Access Control</h2>

            <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
              <Stack gap="md">
                <h3 className="text-h3 text-text-primary">User Roles</h3>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="border border-text-secondary/20 rounded-lg p-4">
                    <h4 className="text-h4 text-text-primary mb-2">Buyer</h4>
                    <ul className="space-y-1 text-micro text-text-secondary">
                      <li>• Browse listings</li>
                      <li>• Save favorites</li>
                      <li>• Receive matches</li>
                      <li>• Contact sellers</li>
                    </ul>
                  </div>

                  <div className="border border-text-secondary/20 rounded-lg p-4">
                    <h4 className="text-h4 text-text-primary mb-2">Seller</h4>
                    <ul className="space-y-1 text-micro text-text-secondary">
                      <li>• Create listings</li>
                      <li>• Edit own listings</li>
                      <li>• View inquiries</li>
                      <li>• Respond to buyers</li>
                    </ul>
                  </div>

                  <div className="border border-text-secondary/20 rounded-lg p-4">
                    <h4 className="text-h4 text-text-primary mb-2">Broker</h4>
                    <ul className="space-y-1 text-micro text-text-secondary">
                      <li>• All seller permissions</li>
                      <li>• Public profile</li>
                      <li>• Client management</li>
                      <li>• Bulk operations</li>
                    </ul>
                  </div>

                  <div className="border border-accent-color/30 bg-accent-color/10 rounded-lg p-4">
                    <h4 className="text-h4 text-text-primary mb-2">Admin</h4>
                    <ul className="space-y-1 text-micro text-text-secondary">
                      <li>• User management</li>
                      <li>• Listing moderation</li>
                      <li>• Usage analytics</li>
                      <li>• Plan changes</li>
                      <li>• Import tools</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-text-secondary/20 pt-4">
                  <h4 className="text-h4 text-text-primary mb-3">Admin Access Control</h4>
                  <p className="text-text-secondary text-label mb-2">
                    Admin routes protected by hardcoded email whitelist in middleware:
                  </p>
                  <div className="bg-surface-color border border-text-secondary/20 rounded p-3 font-mono text-sm">
                    <code className="text-accent-color">
                      const ADMIN_EMAILS = ['evank8029@gmail.com', 'succedence@gmail.com']
                    </code>
                  </div>
                  <p className="text-micro text-text-secondary/70 mt-2">
                    Location: <code className="text-accent-color">/middleware.ts:25-28</code>
                  </p>
                </div>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* API Security */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">API Security & Rate Limiting</h2>

            <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
              <Stack gap="md">
                <h3 className="text-h3 text-text-primary">Plan-Based Usage Enforcement</h3>
                <p className="text-body text-text-secondary">
                  All AI and analysis endpoints enforce quota limits based on user plan. Violations are logged to database with IP address and user agent.
                </p>
                <p className="text-micro text-text-secondary/70">
                  Implementation: <code className="text-accent-color">/lib/middleware/usage-security.ts</code>
                </p>

                <div className="border-t border-text-secondary/20 pt-4">
                  <h4 className="text-h4 text-text-primary mb-3">Security Checks</h4>
                  <ul className="space-y-2 text-text-secondary text-label">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">✓</span>
                      <span><strong className="text-text-primary">IP address logging:</strong> Captures x-forwarded-for and x-real-ip headers for audit trail</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">✓</span>
                      <span><strong className="text-text-primary">User agent tracking:</strong> Records client type for abuse detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">✓</span>
                      <span><strong className="text-text-primary">Authentication verification:</strong> Validates Supabase session before quota checks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">✓</span>
                      <span><strong className="text-text-primary">Plan-based access control:</strong> Rejects requests exceeding plan limits with 429 status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">✓</span>
                      <span><strong className="text-text-primary">Usage violation logging:</strong> All limit-exceeded events stored in <code className="text-accent-color">usage_violations</code> table</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-text-secondary/20 pt-4">
                  <h4 className="text-h4 text-text-primary mb-3">Cron Job Protection</h4>
                  <p className="text-text-secondary text-label mb-2">
                    Background jobs (nightly matching, digest emails) protected by secret header:
                  </p>
                  <div className="bg-surface-color border border-text-secondary/20 rounded p-3 space-y-2">
                    <div className="text-sm text-text-secondary">
                      <span className="text-accent-color">Header Required:</span> <code className="text-text-primary">x-cron-secret: [CRON_SECRET]</code>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <span className="text-accent-color">Endpoints Protected:</span>
                    </div>
                    <ul className="text-micro text-text-secondary ml-4 space-y-1">
                      <li>• <code className="text-text-primary">/api/match/run</code> (nightly matching engine)</li>
                      <li>• <code className="text-text-primary">/api/cron/daily-tasks</code> (batch operations)</li>
                      <li>• <code className="text-text-primary">/api/cron/upgrade-expired-trials</code> (plan management)</li>
                    </ul>
                  </div>
                  <p className="text-micro text-text-secondary/70 mt-2">
                    Development bypass: <code className="text-accent-color">DEV_BYPASS_AUTH=true</code> (development only, not in production)
                  </p>
                </div>

                <div className="border-t border-text-secondary/20 pt-4">
                  <h4 className="text-h4 text-text-primary mb-3">HTTP Security Headers</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="border border-text-secondary/20 rounded p-3">
                      <div className="text-label text-accent-color mb-1">X-Content-Type-Options</div>
                      <div className="text-text-secondary text-micro">Prevents MIME type sniffing</div>
                    </div>
                    <div className="border border-text-secondary/20 rounded p-3">
                      <div className="text-label text-accent-color mb-1">X-Frame-Options</div>
                      <div className="text-text-secondary text-micro">Prevents clickjacking attacks</div>
                    </div>
                    <div className="border border-text-secondary/20 rounded p-3">
                      <div className="text-label text-accent-color mb-1">X-XSS-Protection</div>
                      <div className="text-text-secondary text-micro">Browser XSS filtering enabled</div>
                    </div>
                    <div className="border border-text-secondary/20 rounded p-3">
                      <div className="text-label text-accent-color mb-1">Strict-Transport-Security</div>
                      <div className="text-text-secondary text-micro">HTTPS enforcement (planned)</div>
                    </div>
                  </div>
                </div>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Data Protection */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Data Protection & Privacy</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
                <Stack gap="sm">
                  <h3 className="text-h3 text-text-primary">Database Security</h3>
                  <ul className="space-y-2 text-text-secondary text-label">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Supabase Row-Level Security:</strong> Database-level access control policies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Encrypted at rest:</strong> Supabase handles encryption (AES-256)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">TLS in transit:</strong> All database connections encrypted (TLS 1.2+)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Credential rotation:</strong> Service keys stored in environment variables</span>
                    </li>
                  </ul>
                </Stack>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
                <Stack gap="sm">
                  <h3 className="text-h3 text-text-primary">User Data Handling</h3>
                  <ul className="space-y-2 text-text-secondary text-label">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Minimal data collection:</strong> Email, name, phone (optional), company (optional)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Financial data:</strong> Not stored long-term; used for calculation then discarded</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Valuation history:</strong> Stored with user consent for report regeneration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Anonymous usage:</strong> Free tier tracks IP + user agent (no PII required)</span>
                    </li>
                  </ul>
                </Stack>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
                <Stack gap="sm">
                  <h3 className="text-h3 text-text-primary">Third-Party Services</h3>
                  <ul className="space-y-2 text-text-secondary text-label">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Supabase:</strong> Database, auth, storage (SOC 2 Type II)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">OpenAI:</strong> AI analysis features (optional, user-initiated)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Stripe:</strong> Payment processing (PCI DSS compliant)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Vercel:</strong> Hosting platform (ISO 27001)</span>
                    </li>
                  </ul>
                </Stack>
              </div>

              <div className="border border-text-secondary/20 rounded-lg p-6 bg-text-secondary/5">
                <Stack gap="sm">
                  <h3 className="text-h3 text-text-primary">Audit Logging</h3>
                  <ul className="space-y-2 text-text-secondary text-label">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Usage violations:</strong> IP, timestamp, violation type, user agent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Authentication events:</strong> Login, logout, password reset tracked by Supabase</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Admin actions:</strong> User role changes, plan modifications logged</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-color mt-1">•</span>
                      <span><strong className="text-text-primary">Daily usage:</strong> Analysis count, cost tracking stored per user</span>
                    </li>
                  </ul>
                </Stack>
              </div>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* What's NOT Implemented */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Current Limitations & Roadmap</h2>

            <div className="border border-text-secondary/20 rounded-lg p-6">
              <Stack gap="md">
                <p className="text-body text-text-secondary">
                  Transparency about security features <strong className="text-text-primary">NOT</strong> currently implemented:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-h4 text-text-primary mb-2">Not Yet Implemented</h4>
                    <ul className="space-y-2 text-text-secondary text-label">
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span><strong className="text-text-primary">SOC 2 Type II compliance:</strong> Mentioned on homepage as "in progress" but not certified</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span><strong className="text-text-primary">Penetration testing:</strong> No formal third-party security audits conducted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span><strong className="text-text-primary">GDPR compliance tooling:</strong> No automated data export or deletion workflows</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span><strong className="text-text-primary">Two-factor authentication:</strong> Only email/password or OAuth currently supported</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span><strong className="text-text-primary">WAF (Web Application Firewall):</strong> No dedicated DDoS or bot protection layer</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-h4 text-text-primary mb-2">On Roadmap</h4>
                    <ul className="space-y-2 text-text-secondary text-label">
                      <li className="flex items-start gap-2">
                        <span className="text-accent-color mt-1">⧗</span>
                        <span><strong className="text-text-primary">CSP headers:</strong> Content Security Policy to prevent XSS injection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-color mt-1">⧗</span>
                        <span><strong className="text-text-primary">Enhanced rate limiting:</strong> Per-endpoint granular throttling beyond plan limits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-color mt-1">⧗</span>
                        <span><strong className="text-text-primary">Anomaly detection:</strong> Automated flagging of unusual usage patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-color mt-1">⧗</span>
                        <span><strong className="text-text-primary">Encrypted field-level storage:</strong> Additional encryption layer for sensitive financial data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent-color mt-1">⧗</span>
                        <span><strong className="text-text-primary">Automated vulnerability scanning:</strong> Regular dependency audits and SAST integration</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Stack>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Environment Variables */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Required Environment Variables</h2>

            <p className="text-body text-text-secondary max-w-3xl">
              Documentation of sensitive configuration required for deployment. All values stored in <code className="text-accent-color">.env.local</code> (not committed to git).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-text-secondary/20">
                    <th className="text-left py-3 px-4 text-h4 text-text-primary">Variable</th>
                    <th className="text-left py-3 px-4 text-h4 text-text-primary">Purpose</th>
                    <th className="text-left py-3 px-4 text-h4 text-text-primary">Required</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4"><code className="text-accent-color">NEXT_PUBLIC_SUPABASE_URL</code></td>
                    <td className="py-3 px-4 text-text-secondary">Supabase project URL</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4"><code className="text-accent-color">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></td>
                    <td className="py-3 px-4 text-text-secondary">Public API key (client-side)</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4"><code className="text-accent-color">SUPABASE_SERVICE_ROLE_KEY</code></td>
                    <td className="py-3 px-4 text-text-secondary">Admin operations (server-side only)</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4"><code className="text-accent-color">OPENAI_API_KEY</code></td>
                    <td className="py-3 px-4 text-text-secondary">AI analysis features</td>
                    <td className="py-3 px-4 text-accent-color">Optional</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4"><code className="text-accent-color">STRIPE_SECRET_KEY</code></td>
                    <td className="py-3 px-4 text-text-secondary">Payment processing</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4"><code className="text-accent-color">STRIPE_WEBHOOK_SECRET</code></td>
                    <td className="py-3 px-4 text-text-secondary">Webhook signature verification</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4"><code className="text-accent-color">CRON_SECRET</code></td>
                    <td className="py-3 px-4 text-text-secondary">Cron job authentication</td>
                    <td className="py-3 px-4 text-red-400 font-semibold">Yes</td>
                  </tr>
                  <tr className="border-b border-text-secondary/20">
                    <td className="py-3 px-4"><code className="text-accent-color">AI_FEATURES_ENABLED</code></td>
                    <td className="py-3 px-4 text-text-secondary">Toggle AI functionality</td>
                    <td className="py-3 px-4 text-accent-color">Optional</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4"><code className="text-accent-color">DEV_BYPASS_AUTH</code></td>
                    <td className="py-3 px-4 text-text-secondary">Development mode (NEVER in production)</td>
                    <td className="py-3 px-4 text-text-secondary">Dev only</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-red-400/30 bg-red-400/10 rounded-lg p-4">
              <p className="text-label text-text-primary">
                <strong>Security Warning:</strong> Service role key and Stripe secret have full database access and payment authority. Never expose in client-side code or commit to version control.
              </p>
            </div>
          </Stack>
        </PageContainer>
      </Section>

      {/* Reporting Security Issues */}
      <Section variant="default" withBorder="top">
        <PageContainer>
          <Stack gap="lg">
            <h2 className="text-h2 text-text-primary">Reporting Security Vulnerabilities</h2>

            <div className="border border-text-secondary/20 rounded-lg p-6">
              <Stack gap="md">
                <p className="text-body text-text-secondary">
                  If you discover a security vulnerability in Succedence, please report it responsibly:
                </p>

                <div className="bg-surface-color border border-text-secondary/20 rounded-lg p-4">
                  <h4 className="text-h4 text-text-primary mb-2">Contact</h4>
                  <p className="text-label text-text-secondary">
                    Email: <a href="mailto:evank8029@gmail.com" className="text-accent-color hover:underline">evank8029@gmail.com</a>
                  </p>
                  <p className="text-micro text-text-secondary/70 mt-2">
                    We'll acknowledge receipt within 48 hours and provide a timeline for resolution.
                  </p>
                </div>

                <div>
                  <h4 className="text-h4 text-text-primary mb-2">Please Include</h4>
                  <ul className="space-y-1 text-text-secondary text-label">
                    <li>• Description of the vulnerability</li>
                    <li>• Steps to reproduce</li>
                    <li>• Potential impact assessment</li>
                    <li>• Suggested remediation (if applicable)</li>
                  </ul>
                </div>
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
              <h2 className="text-h2 text-text-primary">Questions about our security?</h2>
              <p className="text-body text-text-secondary">
                Contact us for enterprise security documentation or compliance questionnaires.
              </p>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center px-8 h-12 bg-accent-color text-white font-semibold rounded-lg transition-all duration-200 hover:bg-[#E6A238] hover:-translate-y-0.5 active:scale-[0.97] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color"
              >
                Contact Us
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

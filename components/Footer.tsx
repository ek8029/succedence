import Link from 'next/link';
import PageContainer from './layout/PageContainer';
import Section from './layout/Section';
import Stack from './layout/Stack';

export default function Footer() {
  return (
    <footer className="bg-surface-color border-t border-text-secondary/20">
      <Section variant="default">
        <PageContainer>
          <Stack gap="xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {/* Tool */}
              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-accent-color uppercase tracking-wide">Tool</h4>
                <Stack gap="xs" as="ul">
                  <li>
                    <Link href="/valuation" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Run valuation
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works#methodology" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Methodology
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Pricing
                    </Link>
                  </li>
                </Stack>
              </Stack>

              {/* For */}
              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-accent-color uppercase tracking-wide">For</h4>
                <Stack gap="xs" as="ul">
                  <li>
                    <Link href="/broker-valuation-tool" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Brokers
                    </Link>
                  </li>
                  <li>
                    <Link href="/price-small-business" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Sellers
                    </Link>
                  </li>
                  <li>
                    <Link href="/browse" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Buyers
                    </Link>
                  </li>
                </Stack>
              </Stack>

              {/* Marketplace */}
              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-accent-color uppercase tracking-wide">Marketplace</h4>
                <Stack gap="xs" as="ul">
                  <li>
                    <Link href="/browse" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Browse listings
                    </Link>
                  </li>
                  <li>
                    <Link href="/brokers" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Find brokers
                    </Link>
                  </li>
                </Stack>
              </Stack>

              {/* Account */}
              <Stack gap="xs">
                <h4 className="text-sm font-semibold text-accent-color uppercase tracking-wide">Account</h4>
                <Stack gap="xs" as="ul">
                  <li>
                    <Link href="/login" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-text-secondary/80 hover:text-text-primary transition-colors text-sm">
                      Contact
                    </Link>
                  </li>
                </Stack>
              </Stack>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-text-secondary/20">
              {/* Positioning Statement */}
              <div className="mb-6">
                <p className="text-text-secondary/70 text-sm leading-relaxed max-w-3xl">
                  Succedence provides transaction-backed valuation infrastructure for SMB acquisitions. Industry multiples derived from IBBA market data and 20,000+ closed transactions. Data updated quarterly.
                </p>
                <p className="text-text-secondary/60 text-xs mt-2">
                  Last data update: Q4 2024 • Next scheduled update: Q1 2025
                </p>
              </div>

              {/* Copyright and Legal Links */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-text-secondary/70 text-sm">
                  © {new Date().getFullYear()} Succedence Inc. All rights reserved.
                </div>
                <div className="flex gap-6 text-sm">
                  <Link href="/privacy" className="text-text-secondary/70 hover:text-text-primary transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="text-text-secondary/70 hover:text-text-primary transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/data-sources" className="text-text-secondary/70 hover:text-text-primary transition-colors">
                    Data Sources
                  </Link>
                </div>
              </div>
            </div>
          </Stack>
        </PageContainer>
      </Section>
    </footer>
  );
}
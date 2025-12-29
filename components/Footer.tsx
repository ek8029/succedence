'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-midnight border-t border-gold/20">
      {/* Footer Links */}
      <div className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Product */}
            <div>
              <h4 className="text-warm-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/valuation" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    Valuation Tool
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Users */}
            <div>
              <h4 className="text-warm-white font-semibold mb-4">For You</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/broker-valuation-tool" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    For Brokers
                  </Link>
                </li>
                <li>
                  <Link href="/browse" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    For Buyers
                  </Link>
                </li>
                <li>
                  <Link href="/price-small-business" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    For Sellers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-warm-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/browse" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    Browse Businesses
                  </Link>
                </li>
                <li>
                  <Link href="/brokers" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    Find Brokers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-warm-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-silver/70 hover:text-gold transition-colors text-sm">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gold/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-silver/60 text-sm">
              © {new Date().getFullYear()} Succedence. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-silver/60 hover:text-gold transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-silver/60 hover:text-gold transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
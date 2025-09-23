'use client';

import React from 'react';
import EmailCopyButton from '@/components/EmailCopyButton';

export default function Footer() {
  return (
    <footer className="mt-16 py-16 bg-brand-darker border-t-2 border-gold/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-warm-white mb-8 tracking-refined">Connect with Succedence</h3>
          <p className="text-lg text-platinum/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Follow our journey and stay updated on the latest business acquisition opportunities and platform developments.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/succedence"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn Company Page
            </a>

            {/* Twitter/X */}
            <a
              href="https://x.com/SuccedenceSMB"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow @SuccedenceSMB
            </a>

            {/* Email */}
            <EmailCopyButton
              email="founder@succedence.com"
              showEmail={true}
            />
          </div>

          <div className="text-sm text-neutral-400 border-t border-gold/10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <a href="/terms" className="text-gold hover:text-warm-white transition-colors">Terms of Service</a>
              <span className="hidden sm:inline text-neutral-600">•</span>
              <span className="text-gold">AI Disclaimer: Not Financial Advice</span>
            </div>
            <p>&copy; 2025 Succedence. All rights reserved. Built for discerning business professionals.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
'use client';

import React from 'react';
import EmailCopyButton from '@/components/EmailCopyButton';

export default function ConnectCTA() {
  return (
    <section className="relative w-full border-t border-gold/30 bg-gradient-to-b from-[#0f141a] via-[#0f141a] to-[#0f141a]">
      {/* Full width background treatment */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f141a] via-[#0f141a] to-[#0f141a] pointer-events-none" aria-hidden />

      <div className="relative w-full max-w-none px-6 lg:px-8 py-16 lg:py-20 not-prose">
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-semibold tracking-tight text-warm-white mb-6">
            Connect with Succedence
          </h2>
          <p className="mt-4 text-center text-base md:text-lg opacity-90 text-platinum/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Follow our journey and stay updated on the latest business acquisition opportunities and platform developments.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/succedence"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl px-5 py-3 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300 text-gold hover:bg-gold/10"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium">LinkedIn Company Page</span>
            </a>

            {/* X/Twitter */}
            <a
              href="https://x.com/SuccedenceSMB"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl px-5 py-3 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300 text-gold hover:bg-gold/10"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-sm font-medium">Follow @SuccedenceSMB</span>
            </a>

            {/* Email */}
            <EmailCopyButton
              email="founder@succedence.com"
              showEmail={true}
            />
          </div>

          {/* Footer row under the section */}
          <div className="border-t border-white/10 pt-6">
            <ul className="flex items-center justify-center gap-6 text-sm opacity-80 mb-4">
              <li><a href="/terms" className="hover:opacity-100 text-gold hover:text-warm-white transition-colors">Terms of Service</a></li>
              <li>•</li>
              <li><span className="text-gold">AI Disclaimer: Not Financial Advice</span></li>
            </ul>
            <p className="text-center text-xs opacity-70 text-neutral-400">
              © 2025 Succedence. All rights reserved. Built for discerning business professionals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
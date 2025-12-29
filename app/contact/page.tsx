'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        {/* Header */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 max-w-5xl">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-warm-white mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-platinum/80 max-w-2xl mx-auto">
              Get in touch with the Succedence team
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 md:auto-rows-fr">
            {/* Email */}
            <div className="glass p-8 rounded-lg border border-gold/20 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-warm-white">Email</h3>
              </div>
              <p className="text-silver/80 mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:support@succedence.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                support@succedence.com
              </a>
            </div>

            {/* LinkedIn */}
            <div className="glass p-8 rounded-lg border border-gold/20 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-warm-white">LinkedIn</h3>
              </div>
              <p className="text-silver/80 mb-4">
                Connect with us on LinkedIn for updates and news.
              </p>
              <a
                href="https://linkedin.com/company/succedence"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                linkedin.com/company/succedence
              </a>
            </div>

            {/* X (Twitter) */}
            <div className="glass p-8 rounded-lg border border-gold/20 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-warm-white">X (Twitter)</h3>
              </div>
              <p className="text-silver/80 mb-4">
                Follow us on X for real-time updates and insights.
              </p>
              <a
                href="https://x.com/succedence"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                @succedence
              </a>
            </div>

            {/* General Inquiries */}
            <div className="glass p-8 rounded-lg border border-gold/20 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-warm-white">Support</h3>
              </div>
              <p className="text-silver/80 mb-4">
                For general inquiries, technical support, or partnership opportunities.
              </p>
              <a
                href="mailto:support@succedence.com"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Send us a message
              </a>
            </div>
          </div>
        </section>

        {/* Company Info */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-16 max-w-5xl">
          <div className="glass p-8 rounded-lg border border-gold/20 text-center">
            <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">
              Succedence
            </h2>
            <p className="text-silver/80 max-w-2xl mx-auto">
              Helping business owners and brokers make informed decisions with professional-grade valuation tools.
            </p>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

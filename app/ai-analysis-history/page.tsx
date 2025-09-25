'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function AIAnalysisHistoryPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Authentication Required</h1>
          <Link href="/auth" className="btn-primary px-8 py-3 font-medium hover-lift">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="container-professional pb-16 page-content flex-grow">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl text-white font-medium mb-6 font-serif">
              AI Analysis History
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Review your past AI-generated business insights and analyses
            </p>
          </div>

          <div className="text-center py-12">
            <h2 className="text-2xl text-white font-medium mb-4">Feature Coming Soon</h2>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto leading-relaxed">
              AI analysis history will be available in a future update.
            </p>
            <Link
              href="/browse"
              className="bg-neutral-800/40 backdrop-blur-sm border border-gold/20 rounded-luxury px-6 py-2.5 text-sm text-white text-center font-medium hover:bg-neutral-700/50 transition-all duration-200 whitespace-nowrap min-h-[40px] flex items-center justify-center mx-auto"
            >
              Browse Listings
            </Link>
          </div>
        </div>

        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
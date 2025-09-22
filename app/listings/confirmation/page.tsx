'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [listingId, setListingId] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(true);

  useEffect(() => {
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    setListingId(id);
    setIsDraft(status === 'draft');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional pb-16 page-content-large">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-16 mt-24">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-heading text-white font-medium mb-6">
              {isDraft ? 'Draft Saved Successfully!' : 'Listing Submitted for Review!'}
            </h1>

            <div className="max-w-2xl mx-auto">
              {isDraft ? (
                <div className="space-y-4">
                  <p className="text-xl text-neutral-400 leading-relaxed">
                    Your business listing has been saved as a draft. You can continue editing it anytime and submit it for review when you&apos;re ready.
                  </p>
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-6 mt-8">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-blue-300 font-medium mb-2">Next Steps</h3>
                        <ul className="text-blue-200 text-sm space-y-1">
                          <li>• Complete any missing information in your draft</li>
                          <li>• Add high-quality photos of your business</li>
                          <li>• Review all details for accuracy</li>
                          <li>• Submit for review when ready</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xl text-neutral-400 leading-relaxed">
                    Thank you for submitting your business listing! Our team will review your submission and get back to you within 24-48 hours.
                  </p>
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-6 mt-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-green-300 font-medium">What Happens Next?</h3>
                      </div>
                      <ul className="text-green-200 text-sm space-y-2 text-left max-w-md mx-auto">
                        <li>• Our team reviews your listing details</li>
                        <li>• We verify business information and photos</li>
                        <li>• You&apos;ll receive an email notification once approved</li>
                        <li>• Your listing goes live for potential buyers to see</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollAnimation>

        {/* Action Buttons */}
        <ScrollAnimation direction="up" delay={50}>
          <div className="max-w-lg mx-auto space-y-4">
            {isDraft && listingId && (
              <Link
                href={`/listings/${listingId}/edit`}
                className="btn-primary w-full text-center py-4 font-medium hover-lift block"
              >
                Continue Editing Draft
              </Link>
            )}

            <Link
              href="/profile"
              className="glass w-full text-center py-4 font-medium text-white hover-lift border border-neutral-600 block"
            >
              View My Listings
            </Link>

            <Link
              href="/"
              className="glass w-full text-center py-4 font-medium text-white hover-lift border border-neutral-600 block"
            >
              Return to Homepage
            </Link>
          </div>
        </ScrollAnimation>

        {/* Additional Information */}
        <ScrollAnimation direction="up" delay={100}>
          <div className="max-w-4xl mx-auto mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 border border-gold/30 rounded-luxury">
                <h3 className="text-xl text-white font-medium mb-4">Need Help?</h3>
                <p className="text-neutral-400 text-sm mb-6">
                  Have questions about your listing or the review process? Our support team is here to help.
                </p>
                <Link
                  href="/contact"
                  className="text-gold hover:text-gold-light font-medium transition-colors"
                >
                  Contact Support →
                </Link>
              </div>

              <div className="glass p-8 border border-gold/30 rounded-luxury">
                <h3 className="text-xl text-white font-medium mb-4">Browse Other Listings</h3>
                <p className="text-neutral-400 text-sm mb-6">
                  While you wait, explore other businesses available for acquisition on our platform.
                </p>
                <Link
                  href="/browse"
                  className="text-gold hover:text-gold-light font-medium transition-colors"
                >
                  Browse Listings →
                </Link>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
      <Footer />
    </div>
  );
}

export default function ListingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading...</div>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
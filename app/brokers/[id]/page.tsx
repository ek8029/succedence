'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
import { BrokerProfile } from '@/lib/types';

export default function BrokerProfilePage() {
  const params = useParams();
  const [broker, setBroker] = useState<BrokerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchBroker(params.id as string);
    }
  }, [params.id]);

  const fetchBroker = async (id: string) => {
    try {
      const response = await fetch(`/api/brokers/${id}`);

      if (!response.ok) {
        setError('Broker profile not found or not available');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setBroker(data.broker);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching broker:', error);
      setError('Failed to load broker profile');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading broker profile...</div>
        </div>
      </div>
    );
  }

  if (error || !broker) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Profile Not Available</h1>
          <p className="text-neutral-400 mb-8">{error || 'Broker profile not found'}</p>
          <Link href="/browse" className="btn-primary btn-lg font-medium hover-lift">
            Browse Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional page-content-large">
        <ScrollAnimation direction="fade">
          <div className="max-w-4xl mx-auto mt-32 mb-20">
            {/* Header Section */}
            <div className="glass p-8 border border-gold/30 rounded-luxury mb-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {broker.headshotUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={broker.headshotUrl}
                      alt={broker.displayName}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gold/30"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-4xl text-white font-medium mb-2">{broker.displayName}</h1>

                  {broker.company && (
                    <p className="text-xl text-gold mb-4">{broker.company}</p>
                  )}

                  {broker.licenseNumber && (
                    <p className="text-sm text-neutral-400 mb-4">License: {broker.licenseNumber}</p>
                  )}

                  <div className="flex flex-wrap gap-4 mb-4">
                    {broker.email && (
                      <a href={`mailto:${broker.email}`} className="text-white hover:text-gold transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {broker.email}
                      </a>
                    )}

                    {broker.phone && (
                      <a href={`tel:${broker.phone}`} className="text-white hover:text-gold transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {broker.phone}
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {broker.websiteUrl && (
                      <a
                        href={broker.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Visit Website →
                      </a>
                    )}

                    {broker.linkedinUrl && (
                      <a
                        href={broker.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {broker.bio && (
              <ScrollAnimation direction="up" delay={50}>
                <div className="glass p-8 border border-gold/20 rounded-luxury mb-8">
                  <h2 className="text-2xl text-white font-medium mb-4">About</h2>
                  <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{broker.bio}</p>
                </div>
              </ScrollAnimation>
            )}

            {/* Details Grid */}
            <ScrollAnimation direction="up" delay={100}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Work Areas */}
                {broker.workAreas && broker.workAreas.length > 0 && (
                  <div className="glass p-6 border border-gold/20 rounded-luxury">
                    <h3 className="text-xl text-white font-medium mb-4">Work Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {broker.workAreas.map((area, idx) => (
                        <span key={idx} className="status-badge status-info">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties */}
                {broker.specialties && broker.specialties.length > 0 && (
                  <div className="glass p-6 border border-gold/20 rounded-luxury">
                    <h3 className="text-xl text-white font-medium mb-4">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {broker.specialties.map((specialty, idx) => (
                        <span key={idx} className="status-badge status-pending">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {broker.yearsExperience && broker.yearsExperience > 0 && (
                  <div className="glass p-6 border border-gold/20 rounded-luxury">
                    <h3 className="text-xl text-white font-medium mb-4">Experience</h3>
                    <p className="text-3xl text-gold font-semibold">
                      {broker.yearsExperience} {broker.yearsExperience === 1 ? 'Year' : 'Years'}
                    </p>
                    <p className="text-neutral-400 mt-1">in business brokerage</p>
                  </div>
                )}
              </div>
            </ScrollAnimation>

            {/* Custom Sections */}
            {broker.customSections && Object.keys(broker.customSections).length > 0 && (
              <ScrollAnimation direction="up" delay={150}>
                <div className="space-y-6">
                  {Object.entries(broker.customSections as Record<string, any>).map(([key, value]) => (
                    <div key={key} className="glass p-6 border border-gold/20 rounded-luxury">
                      <h3 className="text-xl text-white font-medium mb-3 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <div className="text-neutral-300 leading-relaxed">
                        {typeof value === 'string' ? (
                          <p className="whitespace-pre-wrap">{value}</p>
                        ) : (
                          <pre className="bg-charcoal/50 p-4 rounded overflow-auto">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollAnimation>
            )}

            {/* Back Link */}
            <ScrollAnimation direction="up" delay={200}>
              <div className="text-center mt-12">
                <Link href="/browse" className="btn-secondary px-8 py-3 font-medium">
                  ← Browse Listings
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </ScrollAnimation>
      </div>
      <Footer />
    </div>
  );
}

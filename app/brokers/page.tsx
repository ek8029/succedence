'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
import { BrokerProfile } from '@/lib/types';

export default function BrokersDirectoryPage() {
  const [brokers, setBrokers] = useState<BrokerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      const response = await fetch('/api/brokers');
      if (!response.ok) {
        throw new Error('Failed to fetch brokers');
      }

      const data = await response.json();
      setBrokers(data.brokers || []);
    } catch (err) {
      console.error('Error fetching brokers:', err);
      setError('Failed to load brokers');
    } finally {
      setLoading(false);
    }
  };

  // Get unique specialties from all brokers
  const allSpecialties = Array.from(
    new Set(
      brokers
        .flatMap(broker => broker.specialties || [])
        .filter(Boolean)
    )
  ).sort();

  // Filter brokers based on search and specialty
  const filteredBrokers = brokers.filter(broker => {
    const matchesSearch = !searchQuery ||
      broker.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broker.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broker.bio?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = !selectedSpecialty ||
      broker.specialties?.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading brokers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Error</h1>
          <p className="text-neutral-400 mb-8">{error}</p>
          <Link href="/" className="btn-primary btn-lg font-medium hover-lift">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional page-content-large">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-32">
            <h1 className="text-heading text-white font-medium mb-6">Find Expert Business Brokers</h1>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto mb-12">
              Connect with experienced business brokers who can help you navigate your acquisition or sale.
            </p>
          </div>
        </ScrollAnimation>

        {/* Search and Filter */}
        <ScrollAnimation direction="up" delay={50}>
          <div className="max-w-4xl mx-auto mb-12">
            <div className="glass p-6 border border-gold/30 rounded-luxury">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-neutral-300 mb-2">
                    Search Brokers
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, company, or bio..."
                    className="form-control w-full"
                  />
                </div>

                {/* Specialty Filter */}
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-neutral-300 mb-2">
                    Filter by Specialty
                  </label>
                  <select
                    id="specialty"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="form-control w-full"
                  >
                    <option value="">All Specialties</option>
                    {allSpecialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-neutral-400">
                Showing {filteredBrokers.length} of {brokers.length} brokers
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Brokers Grid */}
        <ScrollAnimation direction="up" delay={100}>
          <div className="max-w-7xl mx-auto">
            {filteredBrokers.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-neutral-400 text-lg mb-4">
                  {searchQuery || selectedSpecialty ? 'No brokers match your filters' : 'No brokers available'}
                </div>
                {(searchQuery || selectedSpecialty) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSpecialty('');
                    }}
                    className="btn-secondary px-6 py-3 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {filteredBrokers.map((broker) => (
                  <div
                    key={broker.id}
                    className="glass p-6 border border-gold/20 rounded-luxury hover:border-gold/40 transition-all hover-lift h-full flex flex-col"
                  >
                    {/* Broker Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {broker.headshotUrl ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold/30 flex-shrink-0">
                          <Image
                            src={broker.headshotUrl}
                            alt={broker.displayName}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center border-2 border-gold/30 flex-shrink-0">
                          <span className="text-3xl text-neutral-500">{broker.displayName.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-white mb-1 truncate">
                          {broker.displayName}
                        </h3>
                        {broker.company && (
                          <p className="text-gold font-medium text-sm truncate">{broker.company}</p>
                        )}
                        {broker.yearsExperience && broker.yearsExperience > 0 && (
                          <p className="text-neutral-400 text-xs mt-1">
                            {broker.yearsExperience} years experience
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {broker.bio && (
                      <p className="text-neutral-300 text-sm mb-4 line-clamp-3 flex-1">
                        {broker.bio}
                      </p>
                    )}

                    {/* Specialties */}
                    {broker.specialties && broker.specialties.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {broker.specialties.slice(0, 3).map((specialty, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-3 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                          {broker.specialties.length > 3 && (
                            <span className="text-xs px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full">
                              +{broker.specialties.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Work Areas */}
                    {broker.workAreas && broker.workAreas.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-neutral-400 mb-1">Work Areas:</div>
                        <div className="text-sm text-neutral-300">
                          {broker.workAreas.slice(0, 2).join(', ')}
                          {broker.workAreas.length > 2 && ` +${broker.workAreas.length - 2}`}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {broker.phone && (
                        <a
                          href={`tel:${broker.phone}`}
                          className="flex items-center text-sm text-neutral-400 hover:text-gold transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {broker.phone}
                        </a>
                      )}
                      {broker.email && (
                        <a
                          href={`mailto:${broker.email}`}
                          className="flex items-center text-sm text-neutral-400 hover:text-gold transition-colors truncate"
                        >
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{broker.email}</span>
                        </a>
                      )}
                    </div>

                    {/* View Profile Button */}
                    <div className="mt-auto pt-4 border-t border-gold/10">
                      <Link
                        href={`/brokers/${broker.id}`}
                        className="block text-center btn-primary w-full py-2.5 text-sm font-medium"
                      >
                        View Full Profile →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollAnimation>
      </div>
      <Footer />
    </div>
  );
}

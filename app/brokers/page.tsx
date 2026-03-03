'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import PageContainer from '@/components/layout/PageContainer';
import Section from '@/components/layout/Section';
import Stack from '@/components/layout/Stack';
import Cluster from '@/components/layout/Cluster';
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

  const allSpecialties = Array.from(
    new Set(
      brokers
        .flatMap(broker => broker.specialties || [])
        .filter(Boolean)
    )
  ).sort();

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
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <Stack gap="xs" className="text-center">
          <div className="w-16 h-16 border-2 border-off-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xl text-off-white font-medium">Loading brokers...</div>
        </Stack>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <Stack gap="md" className="text-center">
          <h1 className="text-2xl text-warm-white font-medium">Error</h1>
          <p className="text-off-white/70">{error}</p>
          <Link href="/" className="px-8 py-4 bg-amber text-navy-dark font-medium transition-all hover:bg-amber-light">
            Return home
          </Link>
        </Stack>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-navy">
      <div className="relative">
        {/* Header */}
        <Section variant="hero">
          <PageContainer>
            <div className="max-w-3xl">
              <Stack gap="sm">
                <h1 className="font-serif text-5xl md:text-6xl text-warm-white leading-tight">
                  Broker directory
                </h1>
                <p className="text-xl text-off-white/80 leading-relaxed">
                  Experienced business brokers covering main street M&A transactions. Search by industry specialty and geographic focus.
                </p>
              </Stack>
            </div>
          </PageContainer>
        </Section>

        {/* Search and Filter */}
        {brokers.length > 0 && (
          <Section variant="tight">
            <PageContainer>
              <div className="border border-slate/40 bg-navy-light p-8">
                <Stack gap="xs">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Stack gap="xs">
                      <label htmlFor="search" className="block text-sm font-semibold text-amber uppercase tracking-wide">
                        Search
                      </label>
                      <input
                        type="text"
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Name, company, or specialty..."
                        className="w-full px-4 py-3 bg-deep-navy border border-slate/40 text-off-white placeholder-gray focus:border-amber focus:outline-none"
                      />
                    </Stack>

                    <Stack gap="xs">
                      <label htmlFor="specialty" className="block text-sm font-semibold text-amber uppercase tracking-wide">
                        Filter by specialty
                      </label>
                      <select
                        id="specialty"
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full px-4 py-3 bg-deep-navy border border-slate/40 text-off-white focus:border-amber focus:outline-none"
                      >
                        <option value="">All specialties</option>
                        {allSpecialties.map(specialty => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </Stack>
                  </div>

                  <div className="text-sm text-gray">
                    {filteredBrokers.length} of {brokers.length} brokers
                  </div>
                </Stack>
              </div>
            </PageContainer>
          </Section>
        )}

        {/* Brokers Grid or Empty State */}
        <Section variant="default" withBorder="top">
          <PageContainer>
            {filteredBrokers.length === 0 ? (
              <div className="max-w-2xl">
                {searchQuery || selectedSpecialty ? (
                  <Stack gap="md">
                    <h2 className="font-serif text-3xl text-warm-white">No matches</h2>
                    <p className="text-off-white/80">
                      No brokers match your current filters. Try adjusting your search criteria.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedSpecialty('');
                      }}
                      className="px-8 py-4 border border-slate/40 text-off-white hover:border-amber transition-all"
                    >
                      Clear filters
                    </button>
                  </Stack>
                ) : (
                  <Stack gap="lg">
                    <Stack gap="sm">
                      <h2 className="font-serif text-3xl text-warm-white">
                        Launching Q2 2025
                      </h2>
                      <p className="text-off-white/80 leading-relaxed">
                        Building a curated directory of business brokers with verified transaction histories. Filter by industry expertise, deal size range, and location.
                      </p>
                    </Stack>
                    <Stack gap="xs" className="text-sm text-off-white/70">
                      <p>• Verified transaction records from IBBA members</p>
                      <p>• Industry specialization tags (SaaS, professional services, manufacturing, etc.)</p>
                      <p>• Geographic coverage and local market knowledge</p>
                      <p>• Average deal size and typical client profile</p>
                    </Stack>
                    <Link
                      href="/valuation"
                      className="inline-block px-8 py-4 bg-amber text-navy-dark font-medium transition-all hover:bg-amber-light"
                    >
                      Run a Valuation
                    </Link>
                  </Stack>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBrokers.map((broker) => (
                  <div
                    key={broker.id}
                    className="border border-slate/40 bg-navy-light p-6 hover:border-amber/60 transition-all flex flex-col"
                  >
                    <Stack gap="xs" className="flex-1">
                      <Cluster gap="xs" align="start">
                        {broker.headshotUrl ? (
                          <div className="w-16 h-16 overflow-hidden border border-amber/40 flex-shrink-0">
                            <Image
                              src={broker.headshotUrl}
                              alt={broker.displayName}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-charcoal flex items-center justify-center border border-amber/40 flex-shrink-0">
                            <span className="text-2xl text-gray">{broker.displayName.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-warm-white truncate">
                            {broker.displayName}
                          </h3>
                          {broker.company && (
                            <p className="text-amber font-medium text-sm truncate">{broker.company}</p>
                          )}
                          {broker.yearsExperience && broker.yearsExperience > 0 && (
                            <p className="text-gray text-xs">
                              {broker.yearsExperience} years
                            </p>
                          )}
                        </div>
                      </Cluster>

                      {broker.bio && (
                        <p className="text-off-white/70 text-sm line-clamp-3">
                          {broker.bio}
                        </p>
                      )}

                      {broker.specialties && broker.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {broker.specialties.slice(0, 3).map((specialty, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-3 py-1 bg-amber/20 text-amber border border-amber/40"
                            >
                              {specialty}
                            </span>
                          ))}
                          {broker.specialties.length > 3 && (
                            <span className="text-xs px-3 py-1 bg-charcoal text-gray">
                              +{broker.specialties.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {broker.workAreas && broker.workAreas.length > 0 && (
                        <Stack gap="xs">
                          <div className="text-xs text-gray uppercase tracking-wide">Work areas</div>
                          <div className="text-sm text-off-white/70">
                            {broker.workAreas.slice(0, 2).join(', ')}
                            {broker.workAreas.length > 2 && ` +${broker.workAreas.length - 2}`}
                          </div>
                        </Stack>
                      )}

                      <Stack gap="xs">
                        {broker.phone && (
                          <a
                            href={`tel:${broker.phone}`}
                            className="flex items-center text-sm text-off-white/60 hover:text-amber transition-colors"
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
                            className="flex items-center text-sm text-off-white/60 hover:text-amber transition-colors truncate"
                          >
                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{broker.email}</span>
                          </a>
                        )}
                      </Stack>

                      <div className="pt-4 border-t border-slate/40">
                        <Link
                          href={`/brokers/${broker.id}`}
                          className="block text-center px-4 py-2.5 bg-amber text-navy-dark font-medium text-sm hover:bg-amber-light transition-all"
                        >
                          View profile
                        </Link>
                      </div>
                    </Stack>
                  </div>
                ))}
              </div>
            )}
          </PageContainer>
        </Section>

        <Footer />
      </div>
    </div>
  );
}

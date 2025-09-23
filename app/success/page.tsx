'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';

interface SuccessStory {
  id: string;
  title: string;
  quote: string;
  clientName: string;
  clientTitle: string;
  industry: string;
  dealSize: string;
  dealType: 'acquisition' | 'sale';
  completedDate: string;
  featured: boolean;
}

// Mock data with 20+ success stories across diverse industries
const mockStories: SuccessStory[] = [
  {
    id: '1',
    title: 'Strategic Tech Acquisition Completed in 60 Days',
    quote: 'Succedence streamlined our acquisition process beautifully. The AI insights were invaluable for our due diligence.',
    clientName: 'Sarah Chen',
    clientTitle: 'Managing Partner, Venture Capital',
    industry: 'Technology',
    dealSize: '$12.5M',
    dealType: 'acquisition',
    completedDate: '2024-03-15',
    featured: true
  },
  {
    id: '2',
    title: 'Fintech Platform Sale Exceeded Expectations',
    quote: 'The platform\'s security and professionalism gave us confidence throughout the entire transaction process.',
    clientName: 'Marcus Rodriguez',
    clientTitle: 'CEO, Tech Acquisition Corp',
    industry: 'Finance',
    dealSize: '$8.2M',
    dealType: 'sale',
    completedDate: '2024-02-28',
    featured: true
  },
  {
    id: '3',
    title: 'SaaS Platform Strategic Exit',
    quote: 'Found the perfect strategic buyer for our company. The network quality is exceptional.',
    clientName: 'Jennifer Park',
    clientTitle: 'Founder, SaaS Platform',
    industry: 'Technology',
    dealSize: '$15.7M',
    dealType: 'sale',
    completedDate: '2024-01-20',
    featured: true
  },
  {
    id: '4',
    title: 'Healthcare Practice Acquisition',
    quote: 'Succedence connected us with the right seller quickly. The process was transparent and professional.',
    clientName: 'Dr. Michael Thompson',
    clientTitle: 'Medical Group Partner',
    industry: 'Healthcare',
    dealSize: '$3.8M',
    dealType: 'acquisition',
    completedDate: '2024-04-10',
    featured: false
  },
  {
    id: '5',
    title: 'Manufacturing Business Expansion',
    quote: 'The detailed financial analysis tools helped us make an informed decision about our acquisition.',
    clientName: 'Lisa Wang',
    clientTitle: 'Investment Director',
    industry: 'Manufacturing',
    dealSize: '$22.1M',
    dealType: 'acquisition',
    completedDate: '2024-03-05',
    featured: false
  },
  {
    id: '6',
    title: 'E-commerce Brand Portfolio Sale',
    quote: 'Sold our portfolio of brands through Succedence. The buyer vetting process was thorough and professional.',
    clientName: 'Robert Kim',
    clientTitle: 'Founder, E-commerce Holdings',
    industry: 'Retail',
    dealSize: '$6.9M',
    dealType: 'sale',
    completedDate: '2024-02-14',
    featured: false
  },
  {
    id: '7',
    title: 'Real Estate Development Company Sale',
    quote: 'The platform made it easy to showcase our company to qualified buyers. Closed above asking price.',
    clientName: 'Amanda Foster',
    clientTitle: 'CEO, Foster Development',
    industry: 'Real Estate',
    dealSize: '$18.3M',
    dealType: 'sale',
    completedDate: '2024-01-08',
    featured: false
  },
  {
    id: '8',
    title: 'Food & Beverage Chain Acquisition',
    quote: 'Found three excellent acquisition targets through Succedence. The quality of listings is outstanding.',
    clientName: 'James Mitchell',
    clientTitle: 'Managing Partner, Restaurant Group',
    industry: 'Food & Beverage',
    dealSize: '$4.5M',
    dealType: 'acquisition',
    completedDate: '2024-04-22',
    featured: false
  },
  {
    id: '9',
    title: 'Medical Device Startup Sale',
    quote: 'Closed our Series A exit through Succedence in record time. The buyer matching was incredibly accurate.',
    clientName: 'Dr. Elena Vasquez',
    clientTitle: 'CTO, MedTech Innovations',
    industry: 'Healthcare',
    dealSize: '$9.3M',
    dealType: 'sale',
    completedDate: '2024-05-18',
    featured: false
  },
  {
    id: '10',
    title: 'Construction Company Strategic Acquisition',
    quote: 'The due diligence platform saved us months of work. Everything was organized and accessible.',
    clientName: 'Thomas Clarke',
    clientTitle: 'CEO, Regional Construction Group',
    industry: 'Construction',
    dealSize: '$14.2M',
    dealType: 'acquisition',
    completedDate: '2024-03-30',
    featured: false
  },
  {
    id: '11',
    title: 'Renewable Energy Portfolio Sale',
    quote: 'Succedence understood our ESG requirements perfectly. Connected us with values-aligned buyers.',
    clientName: 'Maria Santos',
    clientTitle: 'Managing Director, Green Energy Partners',
    industry: 'Energy',
    dealSize: '$31.5M',
    dealType: 'sale',
    completedDate: '2024-06-12',
    featured: false
  },
  {
    id: '12',
    title: 'Logistics Software Company Acquisition',
    quote: 'The AI-powered valuation insights helped us structure a competitive offer that won the deal.',
    clientName: 'Kevin Chen',
    clientTitle: 'Director of Corporate Development',
    industry: 'Technology',
    dealSize: '$7.8M',
    dealType: 'acquisition',
    completedDate: '2024-04-05',
    featured: false
  },
  {
    id: '13',
    title: 'Boutique Investment Firm Sale',
    quote: 'Sold our wealth management practice to a larger firm. The transition support was exceptional.',
    clientName: 'Patricia Williams',
    clientTitle: 'Senior Partner, Williams & Associates',
    industry: 'Finance',
    dealSize: '$5.4M',
    dealType: 'sale',
    completedDate: '2024-07-08',
    featured: false
  },
  {
    id: '14',
    title: 'Aerospace Component Manufacturer Acquisition',
    quote: 'Found a strategic fit that enhanced our supply chain. The technical due diligence was thorough.',
    clientName: 'Robert Martinez',
    clientTitle: 'VP of Strategy, AeroCorp Industries',
    industry: 'Aerospace',
    dealSize: '$19.7M',
    dealType: 'acquisition',
    completedDate: '2024-05-25',
    featured: false
  },
  {
    id: '15',
    title: 'Digital Marketing Agency Sale',
    quote: 'The platform\'s marketing reach helped us find multiple qualified buyers for competitive bidding.',
    clientName: 'Ashley Turner',
    clientTitle: 'Founder, Digital Solutions Agency',
    industry: 'Marketing',
    dealSize: '$3.2M',
    dealType: 'sale',
    completedDate: '2024-06-30',
    featured: false
  },
  {
    id: '16',
    title: 'Pharmaceutical Research Lab Acquisition',
    quote: 'Acquired cutting-edge IP through Succedence. The regulatory compliance tracking was invaluable.',
    clientName: 'Dr. Jonathan Reed',
    clientTitle: 'Chief Scientific Officer, BioPharm Corp',
    industry: 'Pharmaceuticals',
    dealSize: '$26.8M',
    dealType: 'acquisition',
    completedDate: '2024-08-14',
    featured: false
  },
  {
    id: '17',
    title: 'Entertainment Production Company Sale',
    quote: 'Sold our content library and production assets. The creative industry expertise was impressive.',
    clientName: 'David Kim',
    clientTitle: 'Executive Producer, Creative Studios',
    industry: 'Entertainment',
    dealSize: '$11.6M',
    dealType: 'sale',
    completedDate: '2024-07-22',
    featured: false
  },
  {
    id: '18',
    title: 'Cybersecurity Firm Strategic Merger',
    quote: 'Merged with a complementary security firm. The integration planning tools were excellent.',
    clientName: 'Rachel Foster',
    clientTitle: 'CEO, CyberDefense Solutions',
    industry: 'Technology',
    dealSize: '$13.9M',
    dealType: 'sale',
    completedDate: '2024-08-03',
    featured: false
  },
  {
    id: '19',
    title: 'Automotive Parts Distributor Acquisition',
    quote: 'Expanded our distribution network across three states. The market analysis was spot-on.',
    clientName: 'Michael Torres',
    clientTitle: 'Regional Manager, AutoParts Distribution',
    industry: 'Automotive',
    dealSize: '$8.7M',
    dealType: 'acquisition',
    completedDate: '2024-09-01',
    featured: false
  },
  {
    id: '20',
    title: 'Educational Technology Platform Sale',
    quote: 'Found a buyer who shared our mission for accessible education. The cultural fit was perfect.',
    clientName: 'Dr. Sarah Johnson',
    clientTitle: 'Founder, EduTech Innovations',
    industry: 'Education',
    dealSize: '$6.1M',
    dealType: 'sale',
    completedDate: '2024-08-27',
    featured: false
  }
];

export default function SuccessPage() {
  const [stories] = useState<SuccessStory[]>(mockStories);
  const [filteredStories, setFilteredStories] = useState<SuccessStory[]>(mockStories);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedDealType, setSelectedDealType] = useState<string>('all');
  const [loading] = useState(false);

  const industries = Array.from(new Set(mockStories.map(story => story.industry))).sort();

  useEffect(() => {
    let filtered = [...stories];

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(story => story.industry === selectedIndustry);
    }

    if (selectedDealType !== 'all') {
      filtered = filtered.filter(story => story.dealType === selectedDealType);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());

    setFilteredStories(filtered);
  }, [stories, selectedIndustry, selectedDealType]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-white font-medium">Loading success stories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container mx-auto px-8 pb-20 max-w-7xl page-content">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-24">
            <h1 className="text-heading text-white font-medium mb-6">Success Stories</h1>
            <p className="text-2xl text-neutral-400 leading-relaxed max-w-4xl mx-auto">
              Real results from sophisticated investors and business owners who achieved their goals through Succedence
            </p>
            <div className="mt-12">
              <Link href="/" className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                ← Return to Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        {/* Filters */}
        <div className="glass p-12 mb-16 tier-premium">
          <div className="text-center mb-10">
            <h2 className="text-2xl text-white font-medium mb-4">Filter Success Stories</h2>
            <p className="text-neutral-400">Find stories by industry and deal type</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <label className="form-label">Industry</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="form-control w-full"
              >
                <option value="all">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="form-label">Deal Type</label>
              <select
                value={selectedDealType}
                onChange={(e) => setSelectedDealType(e.target.value)}
                className="form-control w-full"
              >
                <option value="all">All Deal Types</option>
                <option value="acquisition">Acquisitions</option>
                <option value="sale">Sales</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedIndustry('all');
                  setSelectedDealType('all');
                }}
                className="w-full px-3 py-2 text-sm font-medium text-neutral-400 hover:text-white border border-neutral-600 rounded transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-12 fade-in">
          <p className="text-lg text-neutral-300 text-center">
            Showing <span className="text-gold font-semibold text-financial">{filteredStories.length}</span> {filteredStories.length !== 1 ? 'success stories' : 'success story'}
          </p>
        </div>

        {/* Featured Stories */}
        {selectedIndustry === 'all' && selectedDealType === 'all' && (
          <div className="mb-20">
            <ScrollAnimation direction="fade">
              <h2 className="text-3xl text-white font-medium mb-12 text-center">Featured Success Stories</h2>
            </ScrollAnimation>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {filteredStories.filter(story => story.featured).map((story, index) => (
                <ScrollAnimation key={story.id} direction="up" delay={index * 100}>
                  <div className="glass p-20 hover-lift h-full">
                    <div className="mb-16">
                      <div className="text-8xl mb-8 text-gold">&ldquo;</div>
                      <p className="text-2xl text-neutral-300 leading-relaxed italic mb-8">
                        {story.quote}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500">Deal Size:</span>
                          <span className="text-gold font-bold text-financial">{story.dealSize}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500">Industry:</span>
                          <span className="text-neutral-300">{story.industry}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-500">Type:</span>
                          <span className="text-neutral-300 capitalize">{story.dealType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-10 border-gold/30">
                      <div className="text-white font-medium text-xl">{story.clientName}</div>
                      <div className="text-neutral-500 text-lg">{story.clientTitle}</div>
                      <div className="text-neutral-600 text-sm mt-2">{formatDate(story.completedDate)}</div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        )}

        {/* All Stories Grid */}
        <div>
          <ScrollAnimation direction="fade">
            <h2 className="text-3xl text-white font-medium mb-12 text-center">
              {selectedIndustry === 'all' && selectedDealType === 'all' ? 'All Success Stories' : 'Filtered Results'}
            </h2>
          </ScrollAnimation>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredStories.map((story, index) => (
              <ScrollAnimation key={story.id} direction="up" delay={index * 50} className="h-full">
                <div className="metric-card p-8 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="status-badge status-main text-xs">
                        {story.industry}
                      </span>
                      <span className={`status-badge text-xs ${story.dealType === 'acquisition' ? 'status-starter' : 'status-approved'}`}>
                        {story.dealType === 'acquisition' ? 'ACQUIRED' : 'SOLD'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-gold font-bold text-lg text-financial">{story.dealSize}</div>
                      <div className="text-neutral-500 text-sm">{formatDate(story.completedDate)}</div>
                    </div>
                  </div>

                  <h3 className="text-xl text-white font-semibold mb-4 leading-tight">
                    {story.title}
                  </h3>

                  <p className="text-neutral-300 mb-6 leading-relaxed italic flex-grow">
                    &ldquo;{story.quote}&rdquo;
                  </p>

                  <div className="border-t border-neutral-700 pt-6">
                    <div className="text-white font-medium">{story.clientName}</div>
                    <div className="text-neutral-500 text-sm">{story.clientTitle}</div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-24 fade-in">
            <div className="glass w-32 h-32 rounded flex items-center justify-center mx-auto mb-8 border border-gold">
              <svg className="w-16 h-16 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl text-white font-semibold mb-4">No success stories found</h3>
            <p className="text-lg text-neutral-400 max-w-md mx-auto">Try adjusting your filters or check back later for new success stories.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-24 mb-16">
          <ScrollAnimation direction="fade">
            <div className="glass p-16 text-center tier-premium">
              <h2 className="text-3xl text-white font-medium mb-6">
                Ready to Write Your Success Story?
              </h2>
              <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
                Join the sophisticated investors and business owners who have achieved their goals through Succedence.
              </p>
              <div className="flex gap-6 justify-center">
                <Link href="/browse" className="btn-primary px-12 py-4 text-lg font-medium focus-ring hover-lift">
                  Browse Opportunities
                </Link>
                <Link href="/auth" className="btn-success px-12 py-4 text-lg font-medium focus-ring hover-lift">
                  Get Started
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
      <Footer />
    </div>
  );
}
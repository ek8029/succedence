'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  fullStory?: string;
  challenges?: string[];
  solutions?: string[];
  timeline?: { phase: string; duration: string; description: string }[];
  results?: { metric: string; value: string; description: string }[];
  clientImage?: string;
}

export default function SuccessStoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<SuccessStory | null>(null);
  const [loading, setLoading] = useState(true);

  const storyId = params.id as string;

  // Enhanced mock data with full story details
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
      featured: true,
      fullStory: 'Our venture capital firm was looking to acquire a promising AI-driven analytics platform that aligned with our portfolio strategy. Traditional deal sourcing was taking months without yielding quality opportunities that met our specific criteria.',
      challenges: [
        'Limited access to pre-screened technology companies',
        'Lengthy due diligence processes with incomplete information',
        'Difficulty connecting with serious sellers',
        'Competing with larger firms for premium opportunities'
      ],
      solutions: [
        'Succedence\'s AI-powered matching connected us with pre-qualified tech companies',
        'Comprehensive data rooms provided detailed financial and operational metrics',
        'Verified seller credentials ensured we engaged with decision-makers',
        'Exclusive access to premium listings gave us first-mover advantage'
      ],
      timeline: [
        { phase: 'Discovery', duration: '1 week', description: 'Found and shortlisted 3 potential acquisition targets' },
        { phase: 'Initial Contact', duration: '1 week', description: 'Connected with founders and initiated preliminary discussions' },
        { phase: 'Due Diligence', duration: '3 weeks', description: 'Comprehensive review using Succedence\'s data room' },
        { phase: 'Negotiation', duration: '2 weeks', description: 'Terms negotiation facilitated through the platform' },
        { phase: 'Closing', duration: '1 week', description: 'Legal documentation and fund transfer completion' }
      ],
      results: [
        { metric: 'Time to Close', value: '60 days', description: '40% faster than traditional sourcing' },
        { metric: 'Deal Quality Score', value: '9.2/10', description: 'Exceeded investment committee expectations' },
        { metric: 'Due Diligence Efficiency', value: '65%', description: 'Reduction in information gathering time' },
        { metric: 'ROI Projection', value: '3.2x', description: 'Expected return over 5-year holding period' }
      ]
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
      featured: true,
      fullStory: 'After building our fintech platform for 6 years, we decided it was time for a strategic exit. We needed a sophisticated marketplace that could connect us with qualified financial services buyers while maintaining confidentiality during the process.',
      challenges: [
        'Maintaining business operations while managing sale process',
        'Finding buyers with fintech industry expertise',
        'Ensuring data security during due diligence',
        'Achieving valuation that reflected true company potential'
      ],
      solutions: [
        'Succedence\'s secure platform allowed seamless operation continuation',
        'Targeted outreach to verified fintech-focused acquirers',
        'Bank-grade security protocols protected sensitive financial data',
        'AI-powered valuation tools supported premium pricing strategy'
      ],
      timeline: [
        { phase: 'Preparation', duration: '2 weeks', description: 'Prepared comprehensive information package' },
        { phase: 'Marketing', duration: '3 weeks', description: 'Selective outreach to qualified buyers' },
        { phase: 'Evaluation', duration: '4 weeks', description: 'Multiple buyer presentations and evaluations' },
        { phase: 'Negotiation', duration: '2 weeks', description: 'Terms negotiation with selected buyer' },
        { phase: 'Completion', duration: '1 week', description: 'Final documentation and transaction close' }
      ],
      results: [
        { metric: 'Sale Price', value: '$8.2M', description: '15% above initial expectations' },
        { metric: 'Business Continuity', value: '100%', description: 'Zero operational disruption during sale' },
        { metric: 'Buyer Quality', value: 'Premium', description: 'Strategic acquirer with strong fintech portfolio' },
        { metric: 'Process Efficiency', value: '12 weeks', description: 'Completed 30% faster than industry average' }
      ]
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
      featured: true,
      fullStory: 'As a SaaS founder, I built a specialized project management platform over 8 years. When I decided to pursue a strategic exit, I needed access to buyers who understood the SaaS business model and could see the long-term value of our customer base and technology.',
      challenges: [
        'Finding strategic buyers versus financial buyers',
        'Accurately valuing recurring revenue and customer lifetime value',
        'Managing competitive buyer process while running the business',
        'Ensuring cultural fit with acquiring organization'
      ],
      solutions: [
        'Succedence connected us with strategic tech acquirers actively seeking SaaS platforms',
        'Platform analytics helped articulate our SaaS metrics and growth potential',
        'Streamlined process allowed focus on business operations',
        'Buyer profiles included company culture and integration approach information'
      ],
      timeline: [
        { phase: 'Market Analysis', duration: '1 week', description: 'Analyzed comparable SaaS transactions and valuations' },
        { phase: 'Buyer Identification', duration: '2 weeks', description: 'Identified and contacted strategic acquirers' },
        { phase: 'Competitive Process', duration: '5 weeks', description: 'Managed multiple buyer evaluations and bids' },
        { phase: 'Final Selection', duration: '2 weeks', description: 'Selected buyer based on price and strategic fit' },
        { phase: 'Transaction Close', duration: '2 weeks', description: 'Completed legal and financial closing process' }
      ],
      results: [
        { metric: 'Final Valuation', value: '$15.7M', description: '4.2x annual recurring revenue multiple' },
        { metric: 'Strategic Fit', value: 'Excellent', description: 'Buyer integrated platform into existing product suite' },
        { metric: 'Team Retention', value: '95%', description: 'Nearly all team members joined acquiring company' },
        { metric: 'Customer Continuity', value: '100%', description: 'Seamless transition with zero customer churn' }
      ]
    }
  ];

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const foundStory = mockStories.find(s => s.id === storyId);
      if (foundStory) {
        setStory(foundStory);
      } else {
        router.push('/success');
      }
      setLoading(false);
    };

    fetchStory();
  }, [storyId, router]);

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
          <div className="text-lg text-white font-medium">Loading success story...</div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Story Not Found</h1>
          <Link href="/success" className="btn-primary px-8 py-3 font-medium hover-lift">
            Back to Success Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container mx-auto px-8 py-16 max-w-5xl">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="mb-12">
            <Link href="/success" className="glass px-6 py-3 font-medium text-white hover-lift transition-all border border-neutral-600 inline-block mb-8">
              ← Back to Success Stories
            </Link>

            <div className="flex flex-wrap gap-4 mb-6">
              <span className="status-badge status-main">{story.industry}</span>
              <span className={`status-badge ${story.dealType === 'acquisition' ? 'status-starter' : 'status-approved'}`}>
                {story.dealType === 'acquisition' ? 'ACQUISITION' : 'SALE'}
              </span>
              {story.featured && <span className="status-badge bg-gold text-black">FEATURED</span>}
            </div>

            <h1 className="text-heading text-white font-medium mb-6">{story.title}</h1>

            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="glass p-6 text-center">
                <div className="text-3xl text-gold font-bold mb-2">{story.dealSize}</div>
                <div className="text-neutral-400">Deal Size</div>
              </div>
              <div className="glass p-6 text-center">
                <div className="text-xl text-white font-semibold mb-2">{formatDate(story.completedDate)}</div>
                <div className="text-neutral-400">Completed</div>
              </div>
              <div className="glass p-6 text-center">
                <div className="text-xl text-white font-semibold mb-2">{story.industry}</div>
                <div className="text-neutral-400">Industry</div>
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Hero Quote */}
        <ScrollAnimation direction="up" delay={100}>
          <div className="glass p-12 mb-16 tier-premium">
            <div className="text-center">
              <div className="text-6xl text-gold mb-6">&ldquo;</div>
              <p className="text-2xl text-neutral-300 leading-relaxed italic mb-8 max-w-3xl mx-auto">
                {story.quote}
              </p>
              <div className="border-t border-gold/30 pt-8">
                <div className="text-xl text-white font-semibold">{story.clientName}</div>
                <div className="text-lg text-neutral-400">{story.clientTitle}</div>
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Full Story */}
        {story.fullStory && (
          <ScrollAnimation direction="up" delay={150}>
            <div className="glass p-12 mb-16">
              <h2 className="text-3xl text-white font-medium mb-8">The Full Story</h2>
              <p className="text-lg text-neutral-300 leading-relaxed">
                {story.fullStory}
              </p>
            </div>
          </ScrollAnimation>
        )}

        {/* Challenges & Solutions */}
        {story.challenges && story.solutions && (
          <ScrollAnimation direction="up" delay={200}>
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              <div className="glass p-8">
                <h3 className="text-2xl text-white font-medium mb-6 flex items-center">
                  <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Challenges Faced
                </h3>
                <ul className="space-y-4">
                  {story.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <span className="text-neutral-300 leading-relaxed">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass p-8">
                <h3 className="text-2xl text-white font-medium mb-6 flex items-center">
                  <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How Succedence Helped
                </h3>
                <ul className="space-y-4">
                  {story.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <span className="text-neutral-300 leading-relaxed">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollAnimation>
        )}

        {/* Timeline */}
        {story.timeline && (
          <ScrollAnimation direction="up" delay={250}>
            <div className="glass p-12 mb-16">
              <h3 className="text-3xl text-white font-medium mb-10 text-center">Transaction Timeline</h3>
              <div className="space-y-8">
                {story.timeline.map((phase, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex flex-col items-center mr-8">
                      <div className="w-4 h-4 bg-gold rounded-full"></div>
                      {index < story.timeline!.length - 1 && <div className="w-0.5 h-16 bg-neutral-600 mt-2"></div>}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <h4 className="text-xl text-white font-semibold">{phase.phase}</h4>
                        <span className="status-badge bg-neutral-700 text-neutral-300">{phase.duration}</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimation>
        )}

        {/* Results */}
        {story.results && (
          <ScrollAnimation direction="up" delay={300}>
            <div className="glass p-12 mb-16">
              <h3 className="text-3xl text-white font-medium mb-10 text-center">Key Results</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {story.results.map((result, index) => (
                  <div key={index} className="bg-neutral-900/50 border border-neutral-600 p-6 text-center">
                    <div className="text-2xl text-gold font-bold mb-2">{result.value}</div>
                    <div className="text-lg text-white font-semibold mb-2">{result.metric}</div>
                    <div className="text-sm text-neutral-400">{result.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimation>
        )}

        {/* Call to Action */}
        <ScrollAnimation direction="fade" delay={350}>
          <div className="glass p-12 text-center tier-premium">
            <h3 className="text-2xl text-white font-medium mb-6">
              Ready to Create Your Own Success Story?
            </h3>
            <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
              Join {story.clientName} and hundreds of other sophisticated investors and business owners who have achieved their goals through Succedence.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/browse" className="btn-primary px-8 py-3 font-medium hover-lift">
                Browse Opportunities
              </Link>
              <Link href="/auth" className="glass px-8 py-3 font-medium text-white hover-lift border border-neutral-600">
                Get Started Today
              </Link>
            </div>
          </div>
        </ScrollAnimation>
      </div>
      <Footer />
    </div>
  );
}
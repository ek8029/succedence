'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';

interface AIHistoryItem {
  id: string;
  user_id: string;
  listing_id: string;
  analysis_type: string;
  analysis_data: any;
  created_at: string;
  updated_at: string;
  listings: {
    id: string;
    title: string;
    industry: string;
    city: string;
    state: string;
    price: number | null;
    revenue: number | null;
    status: string;
  };
}

interface ListingSummary {
  listing: {
    id: string;
    title: string;
    industry: string;
    city: string;
    state: string;
    price: number | null;
    revenue: number | null;
    status: string;
  };
  analysisTypes: string[];
  totalAnalyses: number;
  lastAnalysisAt: string;
}

export default function AIAnalysisHistoryPage() {
  const { user } = useAuth();
  const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
  const [listingSummary, setListingSummary] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [filterType, setFilterType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAIHistory = async (pageNum: number = 1, analysisType: string = '') => {
    try {
      setLoading(true);
      let url = `/api/ai/history?page=${pageNum}&limit=20`;
      if (analysisType) {
        url += `&analysisType=${analysisType}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAiHistory(data.aiHistory);
        setListingSummary(data.listingSummary);
        setTotalPages(data.pagination.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching AI history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAIHistory(1, filterType);
    }
  }, [user, filterType]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAnalysisTypeIcon = (type: string) => {
    // No emojis - clean text-only approach
    return '';
  };

  const getAnalysisTypeName = (type: string) => {
    switch (type) {
      case 'business_analysis':
        return 'Business Analysis';
      case 'buyer_match':
        return 'Buyer Match';
      case 'due_diligence':
        return 'Due Diligence';
      case 'market_intelligence':
        return 'Market Intelligence';
      case 'smart_buybox':
        return 'Smart BuyBox';
      default:
        return type;
    }
  };

  const getAnalysisPreview = (analysisData: any, type: string) => {
    switch (type) {
      case 'business_analysis':
        return `Score: ${analysisData.overallScore}/100 | ${analysisData.recommendation?.toUpperCase()} | ${analysisData.summary?.substring(0, 100)}...`;
      case 'buyer_match':
        return `Match Score: ${analysisData.score}/100 | ${analysisData.recommendation?.substring(0, 100)}...`;
      case 'due_diligence':
        return `${analysisData.financial?.length || 0} financial items | ${analysisData.legal?.length || 0} legal items`;
      case 'market_intelligence':
        return analysisData.marketConditions?.substring(0, 100) + '...';
      default:
        return 'AI analysis completed';
    }
  };

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
          {/* Header */}
          <ScrollAnimation direction="fade">
            <div className="text-center mb-16">
              <h1 className="text-4xl lg:text-5xl text-white font-medium mb-6 font-serif">
                AI Analysis History
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Review your past AI-generated business insights and analyses
              </p>
            </div>
          </ScrollAnimation>

          {/* Controls */}
          <div className="glass p-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <label className="text-white font-medium text-sm">View:</label>
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-4 py-2.5 text-sm rounded-luxury transition-all duration-200 min-w-[120px] min-h-[40px] flex items-center justify-center font-medium ${
                    viewMode === 'summary'
                      ? 'bg-gold text-midnight'
                      : 'bg-neutral-800/40 backdrop-blur-sm border border-gold/20 text-white hover:bg-neutral-700/50'
                  }`}
                >
                  By Listing
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2.5 text-sm rounded-luxury transition-all duration-200 min-w-[120px] min-h-[40px] flex items-center justify-center font-medium ${
                    viewMode === 'detailed'
                      ? 'bg-gold text-midnight'
                      : 'bg-neutral-800/40 backdrop-blur-sm border border-gold/20 text-white hover:bg-neutral-700/50'
                  }`}
                >
                  All Analyses
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-white font-medium text-sm">Filter:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-neutral-800/40 backdrop-blur-sm border border-gold/20 rounded-luxury px-4 py-2.5 text-sm text-white font-medium min-w-[140px] min-h-[40px]"
                >
                  <option value="" className="bg-charcoal">All Types</option>
                  <option value="business_analysis" className="bg-charcoal">Business Analysis</option>
                  <option value="buyer_match" className="bg-charcoal">Buyer Match</option>
                  <option value="due_diligence" className="bg-charcoal">Due Diligence</option>
                  <option value="market_intelligence" className="bg-charcoal">Market Intelligence</option>
                  <option value="smart_buybox" className="bg-charcoal">Smart BuyBox</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollAnimation direction="up" delay={100}>
            <div className="mt-8">
              {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-xl text-white font-medium">Loading AI history...</div>
              </div>
            ) : (viewMode === 'summary' ? listingSummary : aiHistory).length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-2xl text-white font-medium mb-4">No AI Analyses Yet</h2>
                <p className="text-neutral-400 mb-6 max-w-md mx-auto leading-relaxed">
                  Start exploring business opportunities and generate AI insights to see your history here.
                </p>
                <Link
                  href="/browse"
                  className="bg-neutral-800/40 backdrop-blur-sm border border-gold/20 rounded-luxury px-6 py-2.5 text-sm text-white text-center font-medium hover:bg-neutral-700/50 transition-all duration-200 whitespace-nowrap min-h-[40px] flex items-center justify-center mx-auto"
                >
                  Browse Listings
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {viewMode === 'summary' ? (
                  // Summary view - grouped by listing in grid layout
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listingSummary.map((summary, index) => (
                      <div key={index} className="glass p-6 h-fit">
                        <div className="mb-4">
                          <Link
                            href={`/listings/${summary.listing.id}`}
                            className="text-lg text-white font-medium hover:text-gold transition-colors block mb-2"
                          >
                            {summary.listing.title}
                          </Link>
                          <div className="text-neutral-400 text-sm mb-3">
                            {summary.listing.industry} • {summary.listing.city}, {summary.listing.state}
                          </div>
                          <div className="text-neutral-400 text-sm mb-3">
                            {formatCurrency(summary.listing.price)}
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium text-sm">{summary.totalAnalyses} analyses</div>
                            <div className="text-neutral-400 text-xs">Last: {formatDate(summary.lastAnalysisAt)}</div>
                          </div>
                        </div>

                        <div className="bg-navy/30 rounded-lg p-3">
                          <div className="text-xs text-gold font-medium mb-2">Available AI Analyses:</div>
                          <div className="flex flex-wrap gap-1">
                            {summary.analysisTypes.map((type, typeIndex) => (
                              <span
                                key={typeIndex}
                                className="text-xs bg-gold/10 text-gold px-2 py-1 rounded border border-gold/20"
                              >
                                {getAnalysisTypeName(type)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Detailed view - all analyses in grid layout
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiHistory.map((analysis) => (
                      <div key={analysis.id} className="glass p-6 h-fit">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base text-white font-medium">
                              {getAnalysisTypeName(analysis.analysis_type)}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-400 block mb-3">
                            {formatDate(analysis.created_at)}
                          </span>

                          <Link
                            href={`/listings/${analysis.listing_id}`}
                            className="text-white hover:text-gold transition-colors font-medium block mb-2"
                          >
                            {analysis.listings.title}
                          </Link>
                          <div className="text-neutral-400 text-sm mb-3">
                            {analysis.listings.industry} • {analysis.listings.city}, {analysis.listings.state}
                          </div>

                          <div className="text-sm text-neutral-300 mb-4 line-clamp-3">
                            {getAnalysisPreview(analysis.analysis_data, analysis.analysis_type)}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/listings/${analysis.listing_id}`}
                            className="bg-neutral-800/40 backdrop-blur-sm border border-gold/20 rounded-luxury px-3 py-2 text-xs text-white text-center font-medium hover:bg-neutral-700/50 transition-all duration-200 whitespace-nowrap min-h-[32px] flex items-center justify-center"
                          >
                            View Listing
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      onClick={() => fetchAIHistory(page - 1, filterType)}
                      disabled={page <= 1}
                      className="bg-neutral-800/40 backdrop-blur-sm border border-gold/20 rounded-luxury px-4 py-2.5 text-sm text-white text-center font-medium hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap min-h-[40px] flex items-center justify-center"
                    >
                      Previous
                    </button>
                    <span className="text-white text-sm font-medium px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => fetchAIHistory(page + 1, filterType)}
                      disabled={page >= totalPages}
                      className="bg-neutral-800/40 backdrop-blur-sm border border-gold/20 rounded-luxury px-4 py-2.5 text-sm text-white text-center font-medium hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap min-h-[40px] flex items-center justify-center"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          </ScrollAnimation>
        </div>

        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
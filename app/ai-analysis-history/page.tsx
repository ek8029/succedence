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
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIHistoryItem | null>(null);

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
          <ScrollAnimation direction="up" delay={50}>
            <div className="glass p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <label className="text-white font-medium">View:</label>
                  <button
                    onClick={() => setViewMode('summary')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      viewMode === 'summary'
                        ? 'bg-gold text-midnight font-medium'
                        : 'glass text-white hover:bg-neutral-700/50'
                    }`}
                  >
                    By Listing
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      viewMode === 'detailed'
                        ? 'bg-gold text-midnight font-medium'
                        : 'glass text-white hover:bg-neutral-700/50'
                    }`}
                  >
                    All Analyses
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-white font-medium">Filter:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="glass px-3 py-1 text-sm text-white bg-transparent border border-gold/20 rounded"
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
          </ScrollAnimation>

          {/* Content */}
          <ScrollAnimation direction="up" delay={100}>
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-xl text-white font-medium">Loading AI history...</div>
              </div>
            ) : (viewMode === 'summary' ? listingSummary : aiHistory).length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🤖</div>
                <h2 className="text-2xl text-white font-medium mb-4">No AI Analyses Yet</h2>
                <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                  Start exploring business opportunities and generate AI insights to see your history here.
                </p>
                <Link
                  href="/browse"
                  className="btn-primary px-8 py-3 font-medium hover-lift"
                >
                  Browse Listings
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {viewMode === 'summary' ? (
                  // Summary view - grouped by listing
                  listingSummary.map((summary, index) => (
                    <div key={index} className="glass p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link
                            href={`/listings/${summary.listing.id}`}
                            className="text-xl text-white font-medium hover:text-gold transition-colors"
                          >
                            {summary.listing.title}
                          </Link>
                          <div className="text-neutral-400 text-sm mt-1">
                            {summary.listing.industry} • {summary.listing.city}, {summary.listing.state} • {formatCurrency(summary.listing.price)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{summary.totalAnalyses} analyses</div>
                          <div className="text-neutral-400 text-sm">Last: {formatDate(summary.lastAnalysisAt)}</div>
                        </div>
                      </div>

                      <div className="bg-navy/30 rounded-lg p-4">
                        <div className="text-sm text-gold font-medium mb-3">Available AI Analyses:</div>
                        <div className="flex flex-wrap gap-2">
                          {summary.analysisTypes.map((type, typeIndex) => (
                            <span
                              key={typeIndex}
                              className="text-xs bg-gold/10 text-gold px-3 py-1 rounded border border-gold/20"
                            >
                              {getAnalysisTypeName(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Detailed view - all analyses
                  aiHistory.map((analysis) => (
                    <div key={analysis.id} className="glass p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg text-white font-medium">
                              {getAnalysisTypeName(analysis.analysis_type)}
                            </span>
                            <span className="text-sm text-neutral-400">
                              {formatDate(analysis.created_at)}
                            </span>
                          </div>

                          <Link
                            href={`/listings/${analysis.listing_id}`}
                            className="text-white hover:text-gold transition-colors font-medium"
                          >
                            {analysis.listings.title}
                          </Link>
                          <div className="text-neutral-400 text-sm">
                            {analysis.listings.industry} • {analysis.listings.city}, {analysis.listings.state}
                          </div>

                          <div className="mt-3 text-sm text-neutral-300">
                            {getAnalysisPreview(analysis.analysis_data, analysis.analysis_type)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => setSelectedAnalysis(analysis)}
                            className="glass px-3 py-1 text-xs text-white hover:bg-neutral-700/50 transition-colors rounded border border-gold/20"
                          >
                            View Analysis
                          </button>
                          <Link
                            href={`/listings/${analysis.listing_id}`}
                            className="glass px-3 py-1 text-xs text-white hover:bg-neutral-700/50 transition-colors rounded border border-gold/20"
                          >
                            View Listing
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12">
                    <button
                      onClick={() => fetchAIHistory(page - 1, filterType)}
                      disabled={page <= 1}
                      className="glass px-3 py-1 text-sm text-white hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded border border-gold/20"
                    >
                      Previous
                    </button>
                    <span className="text-white text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => fetchAIHistory(page + 1, filterType)}
                      disabled={page >= totalPages}
                      className="glass px-3 py-1 text-sm text-white hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded border border-gold/20"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </ScrollAnimation>
        </div>
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl text-white font-medium mb-2">
                  {getAnalysisTypeName(selectedAnalysis.analysis_type)}
                </h2>
                <p className="text-neutral-400">
                  {selectedAnalysis.listings.title} • {formatDate(selectedAnalysis.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="text-neutral-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-navy/30 rounded-lg p-6">
              <pre className="whitespace-pre-wrap text-sm text-white font-mono">
                {JSON.stringify(selectedAnalysis.analysis_data, null, 2)}
              </pre>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="btn-primary px-8 py-3 font-medium hover-lift"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
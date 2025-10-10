'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Match {
  id: string
  score: number
  reasons: string[]
  createdAt: string
  listing: {
    id: string
    title: string
    description: string
    industry: string
    city: string
    state: string
    revenue?: number
    price?: number
    source: string
  }
}

interface MatchesResponse {
  matches: Match[]
  pagination: {
    total: number
    hasMore: boolean
  }
}

export default function MyMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch('/api/matches?limit=10')

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Matches fetch failed:', { status: response.status, errorData })

          // Handle specific error cases
          if (response.status === 401) {
            throw new Error('Please sign in to view your matches')
          } else if (response.status === 404) {
            throw new Error('Matches feature not available')
          } else {
            throw new Error(errorData.error || 'Failed to fetch matches')
          }
        }

        const data: MatchesResponse = await response.json()
        setMatches(data.matches || [])
      } catch (err) {
        console.error('Error fetching matches:', err)
        setError(err instanceof Error ? err.message : 'Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30'
    return 'bg-orange-500/20 border-orange-500/30'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Basic Match'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Highly aligned with your preferences and criteria'
    if (score >= 60) return 'Well-matched to several of your key requirements'
    if (score >= 40) return 'Meets some of your acquisition preferences'
    return 'Limited alignment but may still be of interest'
  }

  const enhanceReasonExplanation = (reason: string) => {
    const explanations: { [key: string]: string } = {
      // Industry
      'Perfect industry match': 'This business operates in one of your preferred industries',
      'Established industry sector': 'Well-established industry with proven market demand',
      'Open to all industries': 'You haven\'t specified industry preferences, so all sectors are considered',

      // Location
      'Preferred location': 'Located in one of your target geographic regions',
      'Business-friendly state': 'Located in a state known for favorable business conditions',
      'Open to all locations': 'You haven\'t specified location preferences, so all regions are included',

      // Revenue
      'Well exceeds revenue target': 'Significantly higher revenue than your minimum requirement',
      'Exceeds revenue target': 'Revenue substantially above your target threshold',
      'Meets revenue requirement': 'Revenue meets or exceeds your minimum threshold',
      'Strong revenue base': 'Established revenue stream indicating business stability',
      'Solid revenue': 'Healthy revenue demonstrating market traction',
      'Moderate revenue': 'Reasonable revenue level for the business size',
      'Revenue information available': 'Financial data is provided for your evaluation',

      // Price Value
      'Exceptional value': 'Outstanding price-to-revenue ratio and within budget',
      'Excellent deal': 'Highly favorable pricing relative to revenue',
      'Great value': 'Strong value proposition with good price-to-revenue ratio',
      'Good pricing': 'Fair market pricing within your budget',
      'Fair pricing': 'Reasonably priced for the business metrics',
      'Within price range': 'Asking price is within your maximum budget',
      'Within budget': 'Price falls within your specified range',

      // Profitability
      'Excellent margins (>25%)': 'Exceptional profitability with margins over 25%',
      'Strong margins (20-25%)': 'Very strong profit margins of 20-25%',
      'Good margins (15-20%)': 'Healthy profit margins of 15-20%',
      'Solid margins (10-15%)': 'Good profitability with 10-15% margins',
      'Average margins (5-10%)': 'Acceptable profit margins in the 5-10% range',
      'Profitable business': 'Generates positive profit margins',

      // Owner Time
      'Well below time capacity': 'Requires significantly less time than you have available',
      'Comfortable time fit': 'Time commitment fits well within your availability',
      'Matches time availability': 'Owner hours align with your time capacity',
      'Minimal owner involvement': 'Very limited time commitment required',
      'Part-time commitment': 'Can be managed on a part-time basis',
      'Moderate time required': 'Reasonable time commitment expected',

      // Business Maturity
      'Major enterprise ($10M+)': 'Large, established enterprise with $10M+ in revenue',
      'Large business ($5-10M)': 'Substantial business with $5-10M annual revenue',
      'Established business ($2-5M)': 'Well-established business generating $2-5M annually',
      'Mid-sized business ($1-2M)': 'Growing business with $1-2M in revenue',
      'Growing business ($500K-1M)': 'Expanding business with $500K-1M revenue',
      'Small business ($250K-500K)': 'Small business opportunity with $250K-500K revenue',

      // Listing Quality
      'recently updated, complete financials': 'Recently updated with comprehensive financial data',
      'Recently updated, complete financials': 'Fresh listing with full financial information',
      'updated this month, complete financials': 'Current listing with complete data',
      'updated this month, good data quality': 'Recent update with solid information',
      'updated this quarter, good data quality': 'Reasonably current with good information'
    }

    // Handle keyword matches
    if (reason.includes('keyword') || reason.includes('Key terms')) {
      return 'Contains your preferred search terms in the listing'
    }

    // Handle growth potential
    if (reason.includes('high-growth industry')) {
      return 'Operating in a rapidly expanding market sector'
    }

    return explanations[reason] || reason
  }

  if (loading) {
    return (
      <div className="glass p-6">
        <h3 className="text-xl font-medium text-white mb-4">My Matches</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-neutral-700 rounded mb-2"></div>
              <div className="h-3 bg-neutral-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass p-6">
        <h3 className="text-xl font-medium text-white mb-4">My Matches</h3>
        <div className="text-red-400 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="glass p-6 border border-gold/30 rounded-luxury">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-white">My Matches</h3>
        {matches.length > 0 && (
          <span className="text-sm text-neutral-400">
            Top {matches.length} matches
          </span>
        )}
      </div>

      {/* Matching system explanation */}
      <div className="mb-6 p-4 bg-gradient-to-r from-neutral-900/40 to-neutral-800/40 border border-neutral-700 rounded-lg">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="text-white font-medium mb-2">How Match Percentages Work</h4>
            <div className="text-sm text-neutral-400 space-y-1">
              <p className="mb-2">Each listing is scored 0-10 points across 10 categories (max 100%):</p>
              <p>• <strong className="text-neutral-300">Industry Alignment</strong>: How well the industry matches your preferences</p>
              <p>• <strong className="text-neutral-300">Location Fit</strong>: Geographic alignment with your target areas</p>
              <p>• <strong className="text-neutral-300">Revenue Alignment</strong>: How revenue compares to your targets</p>
              <p>• <strong className="text-neutral-300">Price Value</strong>: Deal quality and budget compatibility</p>
              <p>• <strong className="text-neutral-300">Profitability Strength</strong>: Margins and financial health</p>
              <p>• <strong className="text-neutral-300">Owner Time Fit</strong>: Time commitment vs. your availability</p>
              <p>• <strong className="text-neutral-300">Business Maturity</strong>: Size, stability, and establishment</p>
              <p>• <strong className="text-neutral-300">Listing Quality</strong>: Data completeness and freshness</p>
              <p>• <strong className="text-neutral-300">Keyword Relevance</strong>: Matches with your search terms</p>
              <p>• <strong className="text-neutral-300">Growth Potential</strong>: Industry trends and efficiency</p>
            </div>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-neutral-400 mb-4">
            No matches found yet
          </div>
          <p className="text-sm text-neutral-500">
            Update your preferences to start receiving personalized listing matches
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border border-gold/20 rounded-luxury p-6 hover:border-gold/40 transition-colors bg-neutral-900/20"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link
                    href={`/listings/${match.listing.id}`}
                    className="text-white font-medium hover:text-gold transition-colors line-clamp-1 text-lg"
                  >
                    {match.listing.title}
                  </Link>
                  <div className="text-sm text-neutral-400 mt-2">
                    {match.listing.industry} • {match.listing.city}, {match.listing.state}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded border ${getScoreBadgeColor(match.score)} mb-1`}>
                    <span className={`text-sm font-medium ${getScoreColor(match.score)}`}>
                      {match.score}%
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {getScoreLabel(match.score)}
                  </div>
                </div>
              </div>

              {/* Score explanation */}
              <div className="mb-4 p-3 bg-neutral-900/30 rounded text-sm text-neutral-400">
                <span className="italic">{getScoreDescription(match.score)}</span>
              </div>

              {/* Enhanced reasons display */}
              <div className="mb-4">
                <div className="text-sm text-neutral-500 mb-3 font-medium">Why this matches your criteria:</div>
                <div className="space-y-2">
                  {match.reasons.slice(0, expandedMatch === match.id ? match.reasons.length : 3).map((reason, index) => (
                    <div
                      key={index}
                      className="text-sm p-3 bg-neutral-800/50 border border-neutral-700 rounded flex items-start gap-2"
                    >
                      <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
                      <div>
                        <div className="text-neutral-300 font-medium">{reason}</div>
                        <div className="text-neutral-500 mt-1 text-xs">{enhanceReasonExplanation(reason)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {match.reasons.length > 3 && (
                  <button
                    onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                    className="text-sm text-gold hover:text-gold-light mt-3 font-medium"
                  >
                    {expandedMatch === match.id
                      ? '↑ Show less'
                      : `↓ Show ${match.reasons.length - 3} more reasons`
                    }
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center text-sm border-t border-neutral-700 pt-4 mt-2">
                <div className="text-neutral-400">
                  {match.listing.revenue && (
                    <span>Revenue: {formatCurrency(match.listing.revenue)}</span>
                  )}
                  {match.listing.revenue && match.listing.price && (
                    <span className="mx-2">•</span>
                  )}
                  {match.listing.price && (
                    <span>Price: {formatCurrency(match.listing.price)}</span>
                  )}
                </div>
                <Link
                  href={`/listings/${match.listing.id}`}
                  className="text-gold hover:text-gold-light font-medium transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}

          {matches.length >= 10 && (
            <div className="text-center pt-4">
              <Link
                href="/matches"
                className="text-gold hover:text-gold-light font-medium transition-colors"
              >
                View All Matches →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
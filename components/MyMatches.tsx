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
      'Industry match': 'This business operates in one of your preferred industries',
      'State match': 'Located in one of your target geographic regions',
      'Meets min revenue': 'Revenue meets or exceeds your minimum threshold',
      'Within price range': 'Asking price is within your maximum budget',
      'Owner hours match': 'Current owner time commitment aligns with your availability',
      'Recently updated': 'Fresh listing with current information',
      'Open to all industries': 'You haven\'t specified industry preferences, so all sectors are considered',
      'Open to all locations': 'You haven\'t specified location preferences, so all regions are included',
      'Revenue information available': 'Financial data is provided for your evaluation',
      'Meets min ebitda': 'EBITDA meets your minimum profitability requirements',
      'Meets min gross_profit': 'Gross profit meets your minimum requirements',
      'Meets min net_income': 'Net income meets your minimum requirements'
    }

    // Handle keyword matches
    if (reason.startsWith('Keyword:')) {
      const keyword = reason.replace('Keyword: ', '')
      return `Contains your search term "${keyword}" in the listing details`
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
    <div className="glass p-6">
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
          <div className="text-gold text-lg">🎯</div>
          <div>
            <h4 className="text-white font-medium mb-2">How Match Percentages Work</h4>
            <div className="text-sm text-neutral-400 space-y-1">
              <p>• <strong className="text-neutral-300">Base Score (25%)</strong>: All active listings start with this foundation</p>
              <p>• <strong className="text-neutral-300">Industry Match (40%)</strong>: Perfect alignment with your industry preferences</p>
              <p>• <strong className="text-neutral-300">Location Match (15%)</strong>: Located in your target geographic areas</p>
              <p>• <strong className="text-neutral-300">Financial Criteria (15%)</strong>: Meets your revenue and profitability requirements</p>
              <p>• <strong className="text-neutral-300">Additional Factors</strong>: Owner time commitment, listing freshness, keywords, and price range</p>
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
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <Link
                    href={`/listings/${match.listing.id}`}
                    className="text-white font-medium hover:text-gold transition-colors line-clamp-1"
                  >
                    {match.listing.title}
                  </Link>
                  <div className="text-sm text-neutral-400 mt-1">
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
              <div className="mb-3 p-2 bg-neutral-900/30 rounded text-xs text-neutral-400">
                💡 <span className="italic">{getScoreDescription(match.score)}</span>
              </div>

              {/* Enhanced reasons display */}
              <div className="mb-3">
                <div className="text-xs text-neutral-500 mb-2 font-medium">Why this matches your criteria:</div>
                <div className="space-y-1">
                  {match.reasons.slice(0, expandedMatch === match.id ? match.reasons.length : 3).map((reason, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 bg-neutral-800/50 border border-neutral-700 rounded flex items-start gap-2"
                    >
                      <span className="text-green-400 flex-shrink-0 mt-0.5">✓</span>
                      <div>
                        <div className="text-neutral-300 font-medium">{reason}</div>
                        <div className="text-neutral-500 mt-0.5">{enhanceReasonExplanation(reason)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {match.reasons.length > 3 && (
                  <button
                    onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                    className="text-xs text-gold hover:text-gold-light mt-2 font-medium"
                  >
                    {expandedMatch === match.id
                      ? '↑ Show less'
                      : `↓ Show ${match.reasons.length - 3} more reasons`
                    }
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center text-sm border-t border-neutral-700 pt-3">
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
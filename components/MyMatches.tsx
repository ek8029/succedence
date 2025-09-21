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

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch('/api/matches?limit=10')

        if (!response.ok) {
          throw new Error('Failed to fetch matches')
        }

        const data: MatchesResponse = await response.json()
        setMatches(data.matches)
      } catch (err) {
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-white">My Matches</h3>
        {matches.length > 0 && (
          <span className="text-sm text-neutral-400">
            Top {matches.length} matches
          </span>
        )}
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
                <div className={`px-2 py-1 rounded border ${getScoreBadgeColor(match.score)}`}>
                  <span className={`text-sm font-medium ${getScoreColor(match.score)}`}>
                    {match.score}%
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {match.reasons.slice(0, 3).map((reason, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-neutral-800 text-neutral-300 rounded"
                  >
                    {reason}
                  </span>
                ))}
                {match.reasons.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-neutral-800 text-neutral-400 rounded">
                    +{match.reasons.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
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
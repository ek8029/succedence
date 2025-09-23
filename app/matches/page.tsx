'use client'

import { useAuth } from '@/contexts/AuthContext'
import MyMatches from '@/components/MyMatches'
import Link from 'next/link'

export default function MatchesPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-midnight to-charcoal">
        <div className="container-professional py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-700 rounded mb-4 w-64"></div>
            <div className="h-4 bg-neutral-800 rounded mb-8 w-96"></div>
            <div className="glass p-6">
              <div className="h-6 bg-neutral-700 rounded mb-4 w-48"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-neutral-800 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-midnight to-charcoal">
        <div className="container-professional py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Access Required</h1>
            <p className="text-neutral-400 mb-8">
              Please sign in to view your personalized business matches.
            </p>
            <Link
              href="/auth"
              className="btn-primary px-8 py-3 font-semibold text-sm focus-ring hover-lift"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight to-charcoal">
      <div className="container-professional py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Matches</h1>
          <p className="text-neutral-400">
            Discover businesses that align with your investment preferences and acquisition criteria.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link
            href="/preferences"
            className="btn-secondary px-6 py-2 text-sm font-medium focus-ring hover-lift"
          >
            Update Preferences
          </Link>
          <Link
            href="/browse"
            className="text-gold hover:text-gold-light font-medium text-sm transition-colors flex items-center gap-2"
          >
            Browse All Opportunities →
          </Link>
        </div>

        {/* Matches Component */}
        <MyMatches />
      </div>
    </div>
  )
}
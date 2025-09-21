// ===================================================================
// Matching Engine - Server-side only
// ===================================================================

import { createServiceClient } from '@/lib/supabase/server'

// ===================================================================
// SCORING WEIGHTS (Constants)
// ===================================================================
const SCORING_WEIGHTS = {
  INDUSTRY_MATCH: 40,
  STATE_MATCH: 15,
  REVENUE_GATE: 15,
  METRIC_GATE: 10,
  OWNER_HOURS: 10,
  PRICE_CEILING: 10,
  KEYWORD_HIT: 5,
  KEYWORD_MAX: 20,
  FRESHNESS_BONUS: 10,
} as const

// Minimum score threshold for storing matches
export const MATCH_THRESHOLD = 40

// ===================================================================
// TYPES
// ===================================================================
interface UserPreferences {
  industries?: string[]
  states?: string[]
  min_revenue?: number
  metric_type?: string
  min_metric?: number
  owner_hours_max?: number
  price_max?: number
  keywords?: string[]
  alert_frequency?: 'instant' | 'daily' | 'weekly' | 'never'
}

interface Listing {
  id: string
  title: string
  description: string
  industry: string
  state: string
  revenue?: number
  ebitda?: number
  metric_type?: string
  owner_hours?: number
  price?: number
  updated_at: string
}

interface MatchResult {
  score: number
  reasons: string[]
}

// ===================================================================
// CORE SCORING FUNCTION
// ===================================================================
export function computeListingScore(
  preferences: UserPreferences,
  listing: Listing
): MatchResult {
  let score = 0
  const reasons: string[] = []

  // Industry overlap (+40 if listing.industry in prefs.industries)
  if (preferences.industries?.includes(listing.industry)) {
    score += SCORING_WEIGHTS.INDUSTRY_MATCH
    reasons.push('Industry match')
  }

  // State overlap (+15 if listing.state in prefs.states)
  if (preferences.states?.includes(listing.state)) {
    score += SCORING_WEIGHTS.STATE_MATCH
    reasons.push('State match')
  }

  // Revenue gate (+15 if listing.revenue >= prefs.min_revenue)
  if (
    preferences.min_revenue &&
    listing.revenue &&
    listing.revenue >= preferences.min_revenue
  ) {
    score += SCORING_WEIGHTS.REVENUE_GATE
    reasons.push('Meets min revenue')
  }

  // Metric gate (+10 if metric type matches and value meets threshold)
  if (
    preferences.metric_type &&
    preferences.min_metric &&
    listing.metric_type === preferences.metric_type &&
    listing.ebitda &&
    listing.ebitda >= preferences.min_metric
  ) {
    score += SCORING_WEIGHTS.METRIC_GATE
    reasons.push(`Meets min ${preferences.metric_type}`)
  }

  // Owner hours (+10 if listing.owner_hours <= prefs.owner_hours_max)
  if (
    preferences.owner_hours_max &&
    listing.owner_hours &&
    listing.owner_hours <= preferences.owner_hours_max
  ) {
    score += SCORING_WEIGHTS.OWNER_HOURS
    reasons.push('Owner hours match')
  }

  // Price ceiling (+10 if listing.price <= prefs.price_max)
  if (
    preferences.price_max &&
    listing.price &&
    listing.price <= preferences.price_max
  ) {
    score += SCORING_WEIGHTS.PRICE_CEILING
    reasons.push('Within price range')
  }

  // Keyword hits (+5 per hit, cap +20)
  if (preferences.keywords?.length) {
    const searchText = `${listing.title} ${listing.description}`.toLowerCase()
    let keywordHits = 0

    for (const keyword of preferences.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        keywordHits++
        reasons.push(`Keyword: ${keyword}`)
      }
    }

    const keywordScore = Math.min(
      keywordHits * SCORING_WEIGHTS.KEYWORD_HIT,
      SCORING_WEIGHTS.KEYWORD_MAX
    )
    score += keywordScore
  }

  // Freshness bonus (+10 if listing updated within last 14 days)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const listingDate = new Date(listing.updated_at)

  if (listingDate >= fourteenDaysAgo) {
    score += SCORING_WEIGHTS.FRESHNESS_BONUS
    reasons.push('Recently updated')
  }

  return { score, reasons }
}

// ===================================================================
// BATCH MATCHING FUNCTION
// ===================================================================
export async function matchUserToListings(
  userId: string,
  since?: string | Date
): Promise<number> {
  const supabase = createServiceClient()
  let matchesUpserted = 0

  try {
    // Fetch user preferences
    const { data: preferencesData, error: prefsError } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (prefsError || !preferencesData) {
      console.log(`No preferences found for user ${userId}, skipping matching`)
      return 0
    }

    // Build listing query
    let listingQuery = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')

    // Apply since filter if provided
    if (since) {
      const sinceDate = typeof since === 'string' ? since : since.toISOString()
      listingQuery = listingQuery.gte('updated_at', sinceDate)
    }

    const { data: listings, error: listingsError } = await listingQuery.returns<Listing[]>()

    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
      return 0
    }

    if (!listings?.length) {
      console.log('No active listings found')
      return 0
    }

    // Process each listing
    const matchesToUpsert = []

    for (const listing of listings) {
      const { score, reasons } = computeListingScore(preferencesData, listing)

      // Only store matches that meet the threshold
      if (score >= MATCH_THRESHOLD) {
        matchesToUpsert.push({
          user_id: userId,
          listing_id: listing.id,
          score,
          reasons_json: reasons,
          updated_at: new Date().toISOString()
        })
      }
    }

    // Batch upsert matches
    if (matchesToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('matches')
        .upsert(matchesToUpsert as any, {
          onConflict: 'user_id,listing_id',
          ignoreDuplicates: false
        })

      if (upsertError) {
        console.error('Error upserting matches:', upsertError)
        return 0
      }

      matchesUpserted = matchesToUpsert.length
    }

    console.log(`User ${userId}: processed ${listings.length} listings, upserted ${matchesUpserted} matches`)
    return matchesUpserted

  } catch (error) {
    console.error(`Error in matchUserToListings for user ${userId}:`, error)
    return 0
  }
}

// ===================================================================
// ALERTS DIGEST PREPARATION
// ===================================================================
export async function prepareDigests(forDate: string | Date): Promise<{
  usersProcessed: number
  digestsCreated: number
}> {
  const supabase = createServiceClient()
  let usersProcessed = 0
  let digestsCreated = 0

  try {
    const targetDate = typeof forDate === 'string' ? forDate : forDate.toISOString().split('T')[0]

    // Get users with alert preferences
    const { data: users, error: usersError } = await supabase
      .from('preferences')
      .select('user_id, alert_frequency')
      .in('alert_frequency', ['daily', 'weekly', 'instant'])
      .returns<{user_id: string; alert_frequency: string}[]>()

    if (usersError) {
      console.error('Error fetching users with alert preferences:', usersError)
      return { usersProcessed: 0, digestsCreated: 0 }
    }

    if (!users?.length) {
      console.log('No users with alert preferences found')
      return { usersProcessed: 0, digestsCreated: 0 }
    }

    for (const user of users) {
      usersProcessed++

      // Determine the lookback window based on frequency
      const lookbackDays = user.alert_frequency === 'daily' ? 1 :
                          user.alert_frequency === 'weekly' ? 7 : 1

      const sinceDate = new Date(targetDate)
      sinceDate.setDate(sinceDate.getDate() - lookbackDays)

      // Find new matches since the previous digest window
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('listing_id')
        .eq('user_id', user.user_id)
        .gte('created_at', sinceDate.toISOString())
        .order('score', { ascending: false })
        .limit(50) // Max 50 listings per digest
        .returns<{listing_id: string}[]>()

      if (matchesError) {
        console.error(`Error fetching matches for user ${user.user_id}:`, matchesError)
        continue
      }

      if (matches?.length) {
        const listingIds = matches.map(m => m.listing_id)

        // Upsert digest alert
        const { error: alertError } = await supabase
          .from('alerts')
          .upsert({
            user_id: user.user_id,
            digest_date: targetDate,
            type: 'digest',
            listing_ids: listingIds,
            updated_at: new Date().toISOString()
          } as any, {
            onConflict: 'user_id,digest_date,type',
            ignoreDuplicates: false
          })

        if (alertError) {
          console.error(`Error creating digest for user ${user.user_id}:`, alertError)
        } else {
          digestsCreated++
          console.log(`Created digest for user ${user.user_id} with ${listingIds.length} listings`)
        }
      }
    }

    console.log(`Prepared digests: ${usersProcessed} users processed, ${digestsCreated} digests created`)
    return { usersProcessed, digestsCreated }

  } catch (error) {
    console.error('Error in prepareDigests:', error)
    return { usersProcessed: 0, digestsCreated: 0 }
  }
}
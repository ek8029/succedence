// ===================================================================
// Matching Engine - Server-side only
// ===================================================================

import { createBackgroundServiceClient } from '@/lib/supabase/server'

// ===================================================================
// GRADUATED SCORING SYSTEM (10 Categories, 0-10 points each = 100 max)
// ===================================================================
// Each category is scored 0-10 for better differentiation and nuanced matching
// This prevents score clustering and provides meaningful differences between listings

const SCORING_CATEGORIES = {
  INDUSTRY: 'Industry Alignment',
  LOCATION: 'Location Fit',
  REVENUE: 'Revenue Alignment',
  PRICE_VALUE: 'Price Value',
  PROFITABILITY: 'Profitability Strength',
  OWNER_TIME: 'Owner Time Fit',
  BUSINESS_MATURITY: 'Business Maturity',
  LISTING_QUALITY: 'Listing Quality',
  KEYWORD_RELEVANCE: 'Keyword Relevance',
  GROWTH_POTENTIAL: 'Growth Potential'
} as const

// Minimum score threshold for storing matches (out of 100)
export const MATCH_THRESHOLD = 30

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
// HELPER FUNCTIONS FOR GRADUATED SCORING
// ===================================================================

// Score industry alignment (0-10)
function scoreIndustry(preferences: UserPreferences, listing: Listing): { score: number; reason?: string } {
  if (preferences.industries?.includes(listing.industry)) {
    return { score: 10, reason: 'Perfect industry match' }
  }

  if (!preferences.industries?.length) {
    // No preference - score based on industry quality with more variation
    const premiumIndustries = ['Technology', 'SaaS', 'Healthcare', 'AI/ML']
    const establishedIndustries = ['Finance', 'Manufacturing', 'Real Estate', 'E-commerce', 'Professional Services']
    const stableIndustries = ['Retail', 'Food & Beverage', 'Hospitality', 'Construction']

    if (premiumIndustries.some(ind => listing.industry.includes(ind))) {
      return { score: 7.5, reason: 'High-demand industry sector' }
    }
    if (establishedIndustries.includes(listing.industry)) {
      return { score: 6.2, reason: 'Established industry sector' }
    }
    if (stableIndustries.includes(listing.industry)) {
      return { score: 5.1, reason: 'Stable industry sector' }
    }
    return { score: 4.3, reason: 'Open to all industries' }
  }

  // Could add related industry logic here
  return { score: 1.8, reason: 'Different industry sector' }
}

// Score location fit (0-10)
function scoreLocation(preferences: UserPreferences, listing: Listing): { score: number; reason?: string } {
  if (preferences.states?.includes(listing.state)) {
    return { score: 10, reason: 'Preferred location' }
  }

  if (!preferences.states?.length) {
    // No preference - score based on business-friendly states with variation
    const tier1States = ['Texas', 'Florida', 'Delaware', 'Nevada']
    const tier2States = ['Tennessee', 'Wyoming', 'North Carolina', 'Arizona', 'Utah']
    const tier3States = ['Georgia', 'Colorado', 'Washington', 'Virginia', 'Indiana']

    if (tier1States.includes(listing.state)) {
      return { score: 7.3, reason: 'Premier business state' }
    }
    if (tier2States.includes(listing.state)) {
      return { score: 6.4, reason: 'Business-friendly state' }
    }
    if (tier3States.includes(listing.state)) {
      return { score: 5.7, reason: 'Good business climate' }
    }
    return { score: 4.9, reason: 'Open to all locations' }
  }

  // Could add adjacent state/region logic here
  return { score: 1.5, reason: 'Outside preferred area' }
}

// Score revenue alignment (0-10)
function scoreRevenue(preferences: UserPreferences, listing: Listing): { score: number; reason?: string } {
  if (!listing.revenue) {
    return { score: 2.8, reason: 'Revenue data unavailable' }
  }

  if (!preferences.min_revenue) {
    // No preference - score based on revenue with fine-grained variation
    if (listing.revenue >= 10000000) return { score: 8.7, reason: 'Major revenue base ($10M+)' }
    if (listing.revenue >= 5000000) return { score: 8.1, reason: 'Strong revenue base ($5M+)' }
    if (listing.revenue >= 2000000) return { score: 7.4, reason: 'Solid revenue ($2M+)' }
    if (listing.revenue >= 1000000) return { score: 6.8, reason: 'Good revenue ($1M+)' }
    if (listing.revenue >= 500000) return { score: 6.1, reason: 'Moderate revenue ($500K+)' }
    if (listing.revenue >= 250000) return { score: 5.5, reason: 'Acceptable revenue ($250K+)' }
    if (listing.revenue >= 100000) return { score: 4.7, reason: 'Small revenue base ($100K+)' }
    return { score: 3.9, reason: 'Revenue information available' }
  }

  // Score based on how well it meets preference with granular bands
  const ratio = listing.revenue / preferences.min_revenue

  if (ratio >= 3) return { score: 10, reason: 'Triples revenue target' }
  if (ratio >= 2) return { score: 9.5, reason: 'Well exceeds revenue target' }
  if (ratio >= 1.5) return { score: 8.8, reason: 'Exceeds revenue target' }
  if (ratio >= 1.2) return { score: 8.2, reason: 'Above revenue target' }
  if (ratio >= 1) return { score: 7.6, reason: 'Meets revenue requirement' }
  if (ratio >= 0.9) return { score: 6.4, reason: 'Near revenue target' }
  if (ratio >= 0.8) return { score: 5.1, reason: 'Close to revenue target' }
  if (ratio >= 0.6) return { score: 3.7, reason: 'Below revenue target' }
  if (ratio >= 0.4) return { score: 2.3, reason: 'Well below target' }
  return { score: 1.2, reason: 'Significantly below target' }
}

// Score price value (0-10)
function scorePriceValue(preferences: UserPreferences, listing: Listing): { score: number; reason?: string } {
  if (!listing.price) {
    return { score: 4.1, reason: 'Price not disclosed' }
  }

  const withinBudget = !preferences.price_max || listing.price <= preferences.price_max

  // Calculate price-to-revenue ratio if possible
  if (listing.revenue && listing.revenue > 0) {
    const ratio = listing.price / listing.revenue

    if (ratio < 1 && withinBudget) return { score: 10, reason: 'Outstanding bargain' }
    if (ratio < 1.5 && withinBudget) return { score: 9.6, reason: 'Exceptional value' }
    if (ratio < 2 && withinBudget) return { score: 8.9, reason: 'Excellent deal' }
    if (ratio < 2.5 && withinBudget) return { score: 8.1, reason: 'Great value' }
    if (ratio < 3 && withinBudget) return { score: 7.3, reason: 'Good pricing' }
    if (ratio < 3.5 && withinBudget) return { score: 6.7, reason: 'Fair pricing' }
    if (ratio < 4 && withinBudget) return { score: 5.9, reason: 'Reasonable pricing' }
    if (withinBudget) return { score: 5.2, reason: 'Within budget' }
    if (ratio < 2.5) return { score: 4.3, reason: 'Good value but over budget' }
    if (ratio < 4) return { score: 3.1, reason: 'Fair value but over budget' }
    return { score: 1.8, reason: 'Over budget' }
  }

  // No revenue data - just check budget with granular variation
  if (withinBudget) {
    if (!preferences.price_max) return { score: 6.2, reason: 'Price disclosed, no budget set' }
    const budgetRatio = listing.price / preferences.price_max
    if (budgetRatio < 0.7) return { score: 7.4, reason: 'Well within budget' }
    if (budgetRatio < 0.9) return { score: 6.8, reason: 'Within price range' }
    return { score: 6.1, reason: 'At budget limit' }
  }
  if (preferences.price_max && listing.price <= preferences.price_max * 1.1) {
    return { score: 4.6, reason: 'Slightly over budget' }
  }
  if (preferences.price_max && listing.price <= preferences.price_max * 1.3) {
    return { score: 3.2, reason: 'Over budget' }
  }
  return { score: 1.9, reason: 'Significantly over budget' }
}

// Score profitability (0-10)
function scoreProfitability(preferences: UserPreferences, listing: Listing): { score: number; reason?: string } {
  if (!listing.ebitda || !listing.revenue || listing.revenue === 0) {
    return { score: 3.7, reason: 'Profitability data unavailable' }
  }

  const margin = (listing.ebitda / listing.revenue) * 100

  // Check if meets minimum requirement
  const meetsMin = !preferences.min_metric ||
                   !preferences.metric_type ||
                   listing.ebitda >= preferences.min_metric

  // Fine-grained margin scoring
  if (margin > 30 && meetsMin) return { score: 10, reason: 'Exceptional margins (>30%)' }
  if (margin > 25 && meetsMin) return { score: 9.4, reason: 'Excellent margins (25-30%)' }
  if (margin > 20 && meetsMin) return { score: 8.7, reason: 'Strong margins (20-25%)' }
  if (margin > 17 && meetsMin) return { score: 8.1, reason: 'Very good margins (17-20%)' }
  if (margin > 15 && meetsMin) return { score: 7.6, reason: 'Good margins (15-17%)' }
  if (margin > 12 && meetsMin) return { score: 7.0, reason: 'Solid margins (12-15%)' }
  if (margin > 10 && meetsMin) return { score: 6.5, reason: 'Healthy margins (10-12%)' }
  if (margin > 7 && meetsMin) return { score: 5.9, reason: 'Average margins (7-10%)' }
  if (margin > 5 && meetsMin) return { score: 5.3, reason: 'Modest margins (5-7%)' }
  if (margin > 3 && meetsMin) return { score: 4.8, reason: 'Low margins (3-5%)' }
  if (margin > 0 && meetsMin) return { score: 4.2, reason: 'Minimal profitability' }
  if (!meetsMin) return { score: 2.7, reason: 'Below profitability target' }
  return { score: 1.9, reason: 'Unprofitable' }
}

// Score owner time fit (0-10)
function scoreOwnerTime(preferences: UserPreferences, listing: Listing): { score: number; reason?: string } {
  if (!listing.owner_hours) {
    return { score: 4.8, reason: 'Owner time not specified' }
  }

  if (!preferences.owner_hours_max) {
    // No preference - score based on time commitment with variation
    if (listing.owner_hours < 5) return { score: 8.6, reason: 'Nearly passive income' }
    if (listing.owner_hours < 10) return { score: 7.9, reason: 'Minimal owner involvement' }
    if (listing.owner_hours < 15) return { score: 7.3, reason: 'Light time commitment' }
    if (listing.owner_hours < 20) return { score: 6.7, reason: 'Part-time commitment' }
    if (listing.owner_hours < 30) return { score: 6.1, reason: 'Moderate time required' }
    if (listing.owner_hours < 40) return { score: 5.6, reason: 'Substantial time required' }
    if (listing.owner_hours < 50) return { score: 5.1, reason: 'Full-time commitment' }
    return { score: 4.4, reason: 'Intensive time commitment' }
  }

  // Score based on how it fits preference with granular bands
  const ratio = listing.owner_hours / preferences.owner_hours_max

  if (ratio <= 0.3) return { score: 10, reason: 'Well below time capacity' }
  if (ratio <= 0.5) return { score: 9.2, reason: 'Comfortable buffer' }
  if (ratio <= 0.7) return { score: 8.4, reason: 'Comfortable time fit' }
  if (ratio <= 0.9) return { score: 7.7, reason: 'Good time fit' }
  if (ratio <= 1.0) return { score: 7.1, reason: 'Matches time availability' }
  if (ratio <= 1.1) return { score: 5.8, reason: 'Slightly over time budget' }
  if (ratio <= 1.25) return { score: 4.3, reason: 'Over time budget' }
  if (ratio <= 1.5) return { score: 2.9, reason: 'Well over time budget' }
  return { score: 1.4, reason: 'Exceeds time capacity' }
}

// Score business maturity (0-10)
function scoreBusinessMaturity(listing: Listing): { score: number; reason?: string } {
  if (!listing.revenue) {
    return { score: 4.6, reason: 'Business size unknown' }
  }

  // Fine-grained maturity scoring based on revenue
  if (listing.revenue >= 20000000) return { score: 10, reason: 'Major enterprise ($20M+)' }
  if (listing.revenue >= 10000000) return { score: 9.5, reason: 'Large enterprise ($10-20M)' }
  if (listing.revenue >= 5000000) return { score: 8.9, reason: 'Substantial business ($5-10M)' }
  if (listing.revenue >= 3000000) return { score: 8.3, reason: 'Established business ($3-5M)' }
  if (listing.revenue >= 2000000) return { score: 7.8, reason: 'Growing business ($2-3M)' }
  if (listing.revenue >= 1000000) return { score: 7.2, reason: 'Mid-sized business ($1-2M)' }
  if (listing.revenue >= 750000) return { score: 6.7, reason: 'Developing business ($750K-1M)' }
  if (listing.revenue >= 500000) return { score: 6.1, reason: 'Small-mid business ($500K-750K)' }
  if (listing.revenue >= 250000) return { score: 5.4, reason: 'Small business ($250K-500K)' }
  if (listing.revenue >= 100000) return { score: 4.7, reason: 'Micro business ($100K-250K)' }
  return { score: 3.8, reason: 'Very small business (<$100K)' }
}

// Score listing quality (0-10)
function scoreListingQuality(listing: Listing): { score: number; reason?: string } {
  let score = 0
  let reasons: string[] = []

  // Freshness (0-4.5 points with decimal granularity)
  const daysSinceUpdate = (Date.now() - new Date(listing.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceUpdate <= 3) {
    score += 4.5
    reasons.push('just updated')
  } else if (daysSinceUpdate <= 7) {
    score += 4.1
    reasons.push('recently updated')
  } else if (daysSinceUpdate <= 14) {
    score += 3.7
    reasons.push('updated recently')
  } else if (daysSinceUpdate <= 30) {
    score += 3.2
    reasons.push('updated this month')
  } else if (daysSinceUpdate <= 60) {
    score += 2.6
    reasons.push('updated recently')
  } else if (daysSinceUpdate <= 90) {
    score += 2.1
    reasons.push('updated this quarter')
  } else if (daysSinceUpdate <= 180) {
    score += 1.4
    reasons.push('older listing')
  } else {
    score += 0.8
    reasons.push('dated listing')
  }

  // Data completeness (0-5.5 points with finer granularity)
  let completeness = 0
  if (listing.revenue) completeness += 1.8
  if (listing.ebitda) completeness += 1.8
  if (listing.price) completeness += 1.0
  if (listing.owner_hours) completeness += 0.9
  score += completeness

  if (completeness >= 5) reasons.push('complete financials')
  else if (completeness >= 3.5) reasons.push('good data quality')
  else if (completeness >= 2) reasons.push('partial information')
  else reasons.push('limited information')

  const reason = reasons.join(', ')
  return { score, reason: reason.charAt(0).toUpperCase() + reason.slice(1) }
}

// Score keyword relevance (0-10)
function scoreKeywordRelevance(preferences: UserPreferences, listing: Listing): { score: number; reason?: string } {
  if (!preferences.keywords || preferences.keywords.length === 0) {
    return { score: 4.9, reason: 'No keyword preferences set' }
  }

  const searchText = `${listing.title} ${listing.description}`.toLowerCase()
  let titleMatches = 0
  let descriptionMatches = 0
  const matchedKeywords: string[] = []

  for (const keyword of preferences.keywords) {
    const lowerKeyword = keyword.toLowerCase()
    if (listing.title.toLowerCase().includes(lowerKeyword)) {
      titleMatches++
      matchedKeywords.push(keyword)
    } else if (searchText.includes(lowerKeyword)) {
      descriptionMatches++
      matchedKeywords.push(keyword)
    }
  }

  const totalMatches = titleMatches + descriptionMatches
  const matchRatio = totalMatches / preferences.keywords.length

  // Fine-grained keyword scoring
  if (titleMatches >= 4) return { score: 10, reason: `Multiple keywords in title: ${matchedKeywords.slice(0, 4).join(', ')}` }
  if (titleMatches >= 3) return { score: 9.6, reason: `Multiple keywords in title: ${matchedKeywords.slice(0, 3).join(', ')}` }
  if (titleMatches >= 2) return { score: 9.0, reason: `Key terms in title: ${matchedKeywords.slice(0, 2).join(', ')}` }
  if (titleMatches >= 1) return { score: 8.3, reason: `Keyword in title: ${matchedKeywords[0]}` }
  if (matchRatio >= 0.9) return { score: 7.8, reason: `Almost all keywords: ${matchedKeywords.join(', ')}` }
  if (matchRatio >= 0.75) return { score: 7.2, reason: `Most keywords found: ${matchedKeywords.join(', ')}` }
  if (matchRatio >= 0.6) return { score: 6.6, reason: `Many keywords: ${matchedKeywords.join(', ')}` }
  if (matchRatio >= 0.5) return { score: 6.0, reason: `Several keywords: ${matchedKeywords.join(', ')}` }
  if (matchRatio >= 0.33) return { score: 5.1, reason: `Some keywords: ${matchedKeywords.join(', ')}` }
  if (totalMatches >= 1) return { score: 4.2, reason: `Few keywords: ${matchedKeywords.join(', ')}` }
  return { score: 1.3, reason: 'No keyword matches' }
}

// Score growth potential (0-10)
function scoreGrowthPotential(listing: Listing): { score: number; reason?: string } {
  let score = 4.5 // Base score with decimal
  const reasons: string[] = []

  // Industry growth potential with tiers
  const ultraGrowthIndustries = ['AI/ML', 'SaaS', 'Fintech', 'Biotech']
  const highGrowthIndustries = ['Technology', 'Healthcare', 'E-commerce', 'Green Energy', 'Cybersecurity']
  const moderateGrowthIndustries = ['Professional Services', 'Digital Marketing', 'Software']

  if (ultraGrowthIndustries.some(ind => listing.industry.includes(ind))) {
    score += 3.8
    reasons.push('ultra-high-growth sector')
  } else if (highGrowthIndustries.some(ind => listing.industry.includes(ind))) {
    score += 2.9
    reasons.push('high-growth industry')
  } else if (moderateGrowthIndustries.some(ind => listing.industry.includes(ind))) {
    score += 1.8
    reasons.push('growth-oriented sector')
  } else {
    score += 0.7
    reasons.push('stable industry')
  }

  // Business efficiency (revenue per owner hour if available)
  if (listing.revenue && listing.owner_hours && listing.owner_hours > 0) {
    const efficiency = listing.revenue / listing.owner_hours
    if (efficiency > 100000) {
      score += 1.7
      reasons.push('exceptional efficiency')
    } else if (efficiency > 50000) {
      score += 1.3
      reasons.push('highly efficient')
    } else if (efficiency > 25000) {
      score += 0.9
      reasons.push('good efficiency')
    } else if (efficiency > 10000) {
      score += 0.5
      reasons.push('moderate efficiency')
    }
  }

  const reason = reasons.join(', ')
  return { score: Math.min(score, 10), reason: reason.charAt(0).toUpperCase() + reason.slice(1) }
}

// ===================================================================
// CORE SCORING FUNCTION
// ===================================================================
export function computeListingScore(
  preferences: UserPreferences,
  listing: Listing
): MatchResult {
  const scores: { category: string; points: number; reason?: string }[] = []

  // 1. Industry Alignment (0-10)
  const industry = scoreIndustry(preferences, listing)
  scores.push({ category: SCORING_CATEGORIES.INDUSTRY, points: industry.score, reason: industry.reason })

  // 2. Location Fit (0-10)
  const location = scoreLocation(preferences, listing)
  scores.push({ category: SCORING_CATEGORIES.LOCATION, points: location.score, reason: location.reason })

  // 3. Revenue Alignment (0-10)
  const revenue = scoreRevenue(preferences, listing)
  scores.push({ category: SCORING_CATEGORIES.REVENUE, points: revenue.score, reason: revenue.reason })

  // 4. Price Value (0-10)
  const priceValue = scorePriceValue(preferences, listing)
  scores.push({ category: SCORING_CATEGORIES.PRICE_VALUE, points: priceValue.score, reason: priceValue.reason })

  // 5. Profitability Strength (0-10)
  const profitability = scoreProfitability(preferences, listing)
  scores.push({ category: SCORING_CATEGORIES.PROFITABILITY, points: profitability.score, reason: profitability.reason })

  // 6. Owner Time Fit (0-10)
  const ownerTime = scoreOwnerTime(preferences, listing)
  scores.push({ category: SCORING_CATEGORIES.OWNER_TIME, points: ownerTime.score, reason: ownerTime.reason })

  // 7. Business Maturity (0-10)
  const maturity = scoreBusinessMaturity(listing)
  scores.push({ category: SCORING_CATEGORIES.BUSINESS_MATURITY, points: maturity.score, reason: maturity.reason })

  // 8. Listing Quality (0-10)
  const quality = scoreListingQuality(listing)
  scores.push({ category: SCORING_CATEGORIES.LISTING_QUALITY, points: quality.score, reason: quality.reason })

  // 9. Keyword Relevance (0-10)
  const keywords = scoreKeywordRelevance(preferences, listing)
  scores.push({ category: SCORING_CATEGORIES.KEYWORD_RELEVANCE, points: keywords.score, reason: keywords.reason })

  // 10. Growth Potential (0-10)
  const growth = scoreGrowthPotential(listing)
  scores.push({ category: SCORING_CATEGORIES.GROWTH_POTENTIAL, points: growth.score, reason: growth.reason })

  // Sum all category scores
  const totalScore = scores.reduce((sum, s) => sum + s.points, 0)

  // Build detailed reasons array (only include categories scoring 6+)
  const reasons = scores
    .filter(s => s.points >= 6 && s.reason)
    .map(s => s.reason!)

  // Always cap at 100
  const finalScore = Math.min(Math.round(totalScore), 100)

  return { score: finalScore, reasons }
}

// ===================================================================
// BATCH MATCHING FUNCTION
// ===================================================================
export async function matchUserToListings(
  userId: string,
  since?: string | Date
): Promise<number> {
  const supabase = createBackgroundServiceClient()
  let matchesUpserted = 0

  try {
    // Fetch user preferences
    const { data: preferencesData, error: prefsError } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Allow matching even if no preferences exist - use empty preferences object
    const preferences = preferencesData || {}

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
      const { score, reasons } = computeListingScore(preferences, listing)

      // Only store matches that meet the threshold
      if (score >= MATCH_THRESHOLD) {
        matchesToUpsert.push({
          user_id: userId,
          listing_id: listing.id,
          score,
          reasons_json: reasons
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
  const supabase = createBackgroundServiceClient()
  let usersProcessed = 0
  let digestsCreated = 0

  try {
    const targetDate = typeof forDate === 'string' ? forDate : forDate.toISOString().split('T')[0]

    // Get users with alert preferences (excluding 'off')
    const { data: users, error: usersError } = await supabase
      .from('preferences')
      .select('user_id, alert_frequency')
      .in('alert_frequency', ['daily', 'weekly', 'instant'])
      .neq('alert_frequency', 'off')
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
            listing_ids: listingIds
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
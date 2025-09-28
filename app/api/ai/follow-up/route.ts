import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { canUseFollowUp, incrementUsage, checkRateLimit } from '@/lib/utils/database-usage-tracking'
import { analyzeBusinessSuperEnhanced } from '@/lib/ai/super-enhanced-openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, analysisType, question, previousAnalysis, conversationHistory } = body

    console.log('📝 Follow-up request received:', {
      listingId,
      analysisType,
      hasQuestion: !!question,
      hasPreviousAnalysis: !!previousAnalysis,
      conversationLength: conversationHistory?.length || 0
    })

    if (!analysisType || !question || !previousAnalysis) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get user information for plan limitations
    const supabase = createServiceClient()
    let userPlan = 'free'
    let userId = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()

        if (profile && (profile as any).plan) {
          userPlan = (profile as any).plan
        }
      }
    } catch (authError) {
      return NextResponse.json(
        { error: 'Authentication required for follow-up questions' },
        { status: 401 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    // Check rate limits first
    const rateLimitCheck = await checkRateLimit(userId, userPlan as any, request.headers.get('x-forwarded-for') || undefined, request.headers.get('user-agent') || undefined)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        {
          error: rateLimitCheck.message,
          retryAfter: rateLimitCheck.retryAfter,
          rateLimited: true
        },
        {
          status: 429,
          headers: rateLimitCheck.retryAfter ? {
            'Retry-After': rateLimitCheck.retryAfter.toString()
          } : {}
        }
      )
    }

    // Check if user can use follow-up questions for this analysis type
    const followUpCheck = await canUseFollowUp(userId, analysisType as any, userPlan as any)
    if (!followUpCheck.allowed) {
      return NextResponse.json(
        {
          error: followUpCheck.message,
          remainingQuestions: followUpCheck.remaining,
          upgradeRequired: true
        },
        { status: 429 }
      )
    }

    // Fetch listing data for context (only if it's a real listing ID)
    let listing = null
    const isGeneralAnalysis = !listingId ||
                            listingId.includes('general') ||
                            listingId.includes('market-intelligence') ||
                            listingId === 'undefined' ||
                            listingId === 'null'

    if (!isGeneralAnalysis) {
      console.log('🔍 Fetching listing data for ID:', listingId)

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(listingId)) {
        console.log('⚠️ Invalid listing ID format, treating as general analysis')
        listing = {
          title: previousAnalysis?.listingTitle || 'Analysis',
          industry: previousAnalysis?.industry || previousAnalysis?.parameters?.industry || 'General',
          listing_financials: []
        }
      } else {
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select(`
            *,
            listing_financials(*),
            listing_documents(*)
          `)
          .eq('id', listingId)
          .single()

        if (listingError || !listingData) {
          // Instead of returning error, use fallback data from previousAnalysis
          console.warn('⚠️ Could not fetch listing, using analysis data as fallback')
          listing = {
            title: previousAnalysis?.listingTitle || previousAnalysis?.businessName || 'Business',
            industry: previousAnalysis?.industry || previousAnalysis?.parameters?.industry || 'General',
            listing_financials: previousAnalysis?.financials || []
          }
        } else {
          listing = listingData
          console.log('✅ Listing found:', (listing as any).title)
        }
      }
    } else {
      // For general analyses (like market intelligence without specific listing)
      console.log('📊 General analysis - no specific listing needed')
      listing = {
        title: previousAnalysis?.listingTitle || 'General Analysis',
        industry: previousAnalysis?.industry || previousAnalysis?.parameters?.industry || 'General',
        listing_financials: []
      }
    }

    // Generate follow-up response based on analysis type
    let response: string

    try {
      switch (analysisType) {
        case 'business_analysis':
          response = await generateBusinessAnalysisFollowUp(question, previousAnalysis, listing, conversationHistory)
          break
        case 'market_intelligence':
          response = await generateMarketIntelligenceFollowUp(question, previousAnalysis, listing)
          break
        case 'due_diligence':
          response = await generateDueDiligenceFollowUp(question, previousAnalysis, listing)
          break
        case 'buyer_match':
          response = await generateBuyerMatchFollowUp(question, previousAnalysis, listing)
          break
        default:
          throw new Error(`Unsupported analysis type: ${analysisType}`)
      }

      // Increment usage tracking
      await incrementUsage(userId, 'followup', analysisType, 0.06)

      // Save follow-up to database for history (only if real listing ID)
      if (!isGeneralAnalysis) {
        try {
          await supabase.from('ai_follow_ups').insert({
            user_id: userId,
            listing_id: listingId,
            analysis_type: analysisType,
            question,
            response,
            created_at: new Date().toISOString()
          } as any)
        } catch (dbError) {
          console.warn('Failed to save follow-up to database:', dbError)
        }
      }

      return NextResponse.json({
        response,
        remainingQuestions: followUpCheck.remaining - 1,
        question,
        analysisType
      })

    } catch (analysisError) {
      console.error('Follow-up generation error:', analysisError)
      return NextResponse.json(
        { error: 'Failed to generate follow-up response' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Follow-up API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateBusinessAnalysisFollowUp(
  question: string,
  previousAnalysis: any,
  listing: any,
  conversationHistory?: any[]
): Promise<string> {
  // Build conversation context if provided
  let conversationContext = ''
  if (conversationHistory && conversationHistory.length > 0) {
    conversationContext = `\n\nPREVIOUS CONVERSATION:\n`
    conversationHistory.slice(-4).forEach((msg, index) => {
      conversationContext += `${msg.role.toUpperCase()}: ${msg.content}\n`
    })
  }

  const prompt = `
You are an expert business analyst providing follow-up insights on a business acquisition analysis.

ORIGINAL ANALYSIS SUMMARY:
- Business: ${listing.title || 'Unnamed Business'}
- Industry: ${listing.industry || 'General'}
- Revenue: $${listing.listing_financials?.[0]?.annual_revenue?.toLocaleString() || 'Unknown'}
- Overall Score: ${previousAnalysis.overallScore || 'Unknown'}/100
- Recommendation: ${previousAnalysis.recommendation || 'Unknown'}

PREVIOUS ANALYSIS KEY POINTS:
${JSON.stringify(previousAnalysis, null, 2)}${conversationContext}

USER QUESTION: "${question}"

Provide a detailed, actionable response that:
1. Directly addresses the user's question
2. References specific data from the original analysis
3. Considers previous conversation context if relevant
4. Provides additional insights or considerations
5. Suggests concrete next steps if applicable
6. Maintains professional tone suitable for M&A context

Keep response under 500 words and focus on practical value.
`

  // Use the same AI system for follow-ups to maintain consistency
  const response = await analyzeBusinessSuperEnhanced({
    ...listing,
    followUpPrompt: prompt,
    isFollowUp: true
  }, {})

  return (response as any).followUpResponse || 'I apologize, but I was unable to generate a specific follow-up response. Please try rephrasing your question.'
}

async function generateMarketIntelligenceFollowUp(
  question: string,
  previousAnalysis: any,
  listing: any
): Promise<string> {
  return `Thank you for your question about market intelligence: "${question}"

Based on the previous analysis for ${listing.title} in the ${listing.industry} sector, here are additional insights:

${question.toLowerCase().includes('competition') ?
  'Competitive analysis shows this market has moderate to high competition. Key factors to consider include market share distribution, barriers to entry, and competitive advantages of the target business.' :
  question.toLowerCase().includes('growth') ?
  'Market growth trends indicate this sector is experiencing steady expansion. Consider economic indicators, demographic shifts, and technological disruptions that could impact future performance.' :
  'Market dynamics for this business involve multiple factors including regulatory environment, customer base stability, and industry lifecycle stage. These elements significantly impact valuation and acquisition strategy.'
}

For more detailed market intelligence analysis, consider upgrading to access our full market research capabilities.`
}

async function generateDueDiligenceFollowUp(
  question: string,
  previousAnalysis: any,
  listing: any
): Promise<string> {
  return `Regarding your due diligence question: "${question}"

For ${listing.title}, here are additional considerations:

${question.toLowerCase().includes('financial') ?
  'Financial due diligence should focus on revenue quality, EBITDA sustainability, working capital requirements, and debt structure. Verify all financial statements and tax returns for the past 3-5 years.' :
  question.toLowerCase().includes('legal') ?
  'Legal due diligence requires reviewing contracts, intellectual property, regulatory compliance, pending litigation, and employment agreements. Ensure all legal documents are properly transferred.' :
  question.toLowerCase().includes('operational') ?
  'Operational due diligence involves assessing management systems, key personnel, operational processes, technology infrastructure, and supplier relationships. Identify potential operational risks and opportunities.' :
  'Due diligence for this acquisition should be comprehensive and tailored to the specific industry and business model. Focus on areas of highest risk and value impact.'
}

This analysis provides a starting point - professional due diligence should always involve qualified advisors.`
}

async function generateBuyerMatchFollowUp(
  question: string,
  previousAnalysis: any,
  listing: any
): Promise<string> {
  return `Regarding buyer compatibility: "${question}"

For the ${listing.title} opportunity, buyer fit considerations include:

${question.toLowerCase().includes('experience') ?
  'Industry experience is crucial for success. Buyers with relevant sector knowledge, operational expertise, and established networks typically achieve better integration outcomes and value creation.' :
  question.toLowerCase().includes('financing') ?
  'Financing capacity should align with the acquisition size and structure. Consider debt capacity, equity requirements, working capital needs, and potential earnout provisions based on business performance.' :
  question.toLowerCase().includes('synergy') || question.toLowerCase().includes('synergies') ?
  'Synergy potential varies by buyer type. Strategic buyers may realize operational synergies, while financial buyers focus on operational improvements and growth strategies. Quantify potential synergies realistically.' :
  'Buyer-business alignment depends on strategic fit, cultural compatibility, financial capacity, and operational expertise. The best matches often come from buyers who can add value beyond just capital.'
}

Current compatibility score: ${previousAnalysis.score || 'Not available'}%. Consider how your specific situation aligns with these factors.`
}
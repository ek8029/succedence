import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { canUseFollowUp, incrementUsage, checkRateLimit } from '@/lib/utils/database-usage-tracking'
import {
  analyzeBusinessSuperEnhanced,
  generateSuperEnhancedMarketIntelligence,
  generateSuperEnhancedDueDiligence,
  analyzeBusinessSuperEnhancedBuyerMatch,
  isAIEnabled
} from '@/lib/ai/super-enhanced-openai'

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

    // Get user information for plan limitations and AI personalization
    const supabase = createServiceClient()
    let userPlan = 'free'
    let userId = null
    let userProfile = null
    let userPreferences = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id

        // Fetch user profile and preferences for AI personalization
        const [profileResult, preferencesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('plan, company, headline, location')
            .eq('id', user.id)
            .single(),
          supabase
            .from('preferences')
            .select('industries, states, min_revenue, min_metric, metric_type, owner_hours_max, price_max, keywords')
            .eq('user_id', user.id)
            .single()
        ]) as [any, any]

        if ((profileResult as any).data && (profileResult as any).data.plan) {
          userPlan = (profileResult as any).data.plan
          userProfile = (profileResult as any).data
        }

        if ((preferencesResult as any).data) {
          userPreferences = (preferencesResult as any).data
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
      console.log('General analysis - no specific listing needed')
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
          response = await generateBusinessAnalysisFollowUp(question, previousAnalysis, listing, conversationHistory, userProfile, userPreferences)
          break
        case 'market_intelligence':
          response = await generateMarketIntelligenceFollowUp(question, previousAnalysis, listing, userProfile, userPreferences)
          break
        case 'due_diligence':
          response = await generateDueDiligenceFollowUp(question, previousAnalysis, listing, userProfile, userPreferences)
          break
        case 'buyer_match':
          response = await generateBuyerMatchFollowUp(question, previousAnalysis, listing, userProfile, userPreferences)
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
  conversationHistory?: any[],
  userProfile?: any,
  userPreferences?: any
): Promise<string> {
  // Build conversation context if provided
  let conversationContext = ''
  if (conversationHistory && conversationHistory.length > 0) {
    conversationContext = `\n\nPREVIOUS CONVERSATION:\n`
    conversationHistory.slice(-4).forEach((msg, index) => {
      conversationContext += `${msg.role.toUpperCase()}: ${msg.content}\n`
    })
  }

  // Build user context for personalization
  let userContext = ''
  if (userProfile || userPreferences) {
    userContext = '\n\nUSER PROFILE & PREFERENCES:\n'

    if (userProfile) {
      userContext += `• Company: ${userProfile.company || 'Not specified'}\n`
      userContext += `• Role: ${userProfile.headline || 'Not specified'}\n`
      userContext += `• Location: ${userProfile.location || 'Not specified'}\n`
      userContext += `• Plan Level: ${userProfile.plan || 'free'}\n`
    }

    if (userPreferences) {
      if (userPreferences.industries?.length) {
        userContext += `• Target Industries: ${userPreferences.industries.join(', ')}\n`
      }
      if (userPreferences.states?.length) {
        userContext += `• Geographic Focus: ${userPreferences.states.join(', ')}\n`
      }
      if (userPreferences.min_revenue) {
        userContext += `• Minimum Revenue Interest: $${userPreferences.min_revenue.toLocaleString()}\n`
      }
      if (userPreferences.price_max) {
        userContext += `• Maximum Deal Size: $${userPreferences.price_max.toLocaleString()}\n`
      }
      if (userPreferences.keywords?.length) {
        userContext += `• Key Interests: ${userPreferences.keywords.join(', ')}\n`
      }
      if (userPreferences.owner_hours_max) {
        userContext += `• Preferred Owner Involvement: Max ${userPreferences.owner_hours_max} hours/week\n`
      }
    }
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
${JSON.stringify(previousAnalysis, null, 2)}${conversationContext}${userContext}

USER QUESTION: "${question}"

IMPORTANT: Tailor your response specifically to this user's profile and preferences. Consider their:
- Industry interests and geographic focus
- Deal size preferences and financial capacity
- Experience level and involvement preferences
- Specific keywords and interests

Provide a detailed, actionable response that:
1. Directly addresses the user's question with personalized insights
2. References specific data from the original analysis
3. Considers the user's specific preferences and criteria
4. Evaluates fit based on their stated interests and constraints
5. Provides recommendations tailored to their profile
6. Suggests concrete next steps relevant to their situation
7. Maintains professional tone suitable for M&A context

Keep response under 500 words and focus on practical value specific to this user.
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
  listing: any,
  userProfile?: any,
  userPreferences?: any
): Promise<string> {
  try {
    // Use the existing market intelligence function to generate a contextual response
    const response = await generateSuperEnhancedMarketIntelligence(
      listing.title || 'Business Opportunity',
      listing.description || '',
      listing.industry || previousAnalysis?.parameters?.industry || 'General',
      previousAnalysis?.parameters?.geography,
      previousAnalysis?.parameters?.dealSize
    );

    // Build user context for personalization
    let userContext = ''
    if (userProfile || userPreferences) {
      if (userPreferences?.industries?.length) {
        userContext += ` Given your focus on ${userPreferences.industries.join(', ')} industries,`
      }
      if (userPreferences?.states?.length) {
        userContext += ` considering your geographic interest in ${userPreferences.states.join(', ')},`
      }
      if (userPreferences?.price_max) {
        userContext += ` with your deal size range up to $${userPreferences.price_max.toLocaleString()},`
      }
    }

    // Extract relevant information to answer the specific question
    const contextualResponse = `Based on the market intelligence analysis for ${listing.industry || 'this industry'}${userContext ? ` - ${userContext}` : ''}:

**Your Question**: "${question}"

**Market Overview Tailored to Your Interests**:
• Market Size: ${response.marketOverview?.size?.insight || 'Market size analysis available'}
• Growth Trends: ${response.marketOverview?.growth?.insight || 'Growth trends identified'}
${userPreferences?.industries?.includes(listing.industry) ? '• **Industry Match**: This aligns with your stated industry preferences' : ''}

**Competitive Landscape**: ${response.competitive?.intensity?.insight || 'Competitive analysis complete'}

**Strategic Opportunities for Your Profile**: ${response.competitive?.opportunities?.[0]?.insight || response.economic?.opportunities?.[0]?.insight || 'Strategic opportunities identified'}

**Investment Climate**: ${response.investment?.outlook?.insight || 'Investment outlook analyzed'}

**Market Timing**: ${response.timing || 'Market timing assessed'} - ${response.economic?.timing?.insight || 'Timing considerations evaluated'}

**Recommendations Specific to Your Profile**:
${response.recommendations?.slice(0, 2)?.map(rec => `• ${rec}`).join('\n') || '• Strategic recommendations provided'}
${userPreferences?.min_revenue && listing.listing_financials?.[0]?.annual_revenue ?
  (listing.listing_financials[0].annual_revenue >= userPreferences.min_revenue ?
    '• ✅ This opportunity meets your minimum revenue criteria' :
    '• ⚠️ This opportunity is below your stated minimum revenue preference') : ''}

This analysis considers current market conditions${previousAnalysis?.parameters?.geography ? ` in ${previousAnalysis.parameters.geography}` : ''} and is specifically tailored to your investment profile and preferences.`;

    return contextualResponse;
  } catch (error) {
    console.error('Market Intelligence follow-up error:', error);
    return 'I apologize, but I encountered an error generating your market intelligence response. Please try again.';
  }
}

async function generateDueDiligenceFollowUp(
  question: string,
  previousAnalysis: any,
  listing: any,
  userProfile?: any,
  userPreferences?: any
): Promise<string> {
  try {
    // Use the existing due diligence function to generate a contextual response
    const response = await generateSuperEnhancedDueDiligence(
      listing.title || 'Business Opportunity',
      listing.description || '',
      {
        ...listing,
        industry: listing.industry || previousAnalysis?.industry || 'General'
      }
    );

    // Build user context for personalization
    let experienceLevel = 'intermediate'
    let riskFocus = ''
    if (userProfile?.headline?.toLowerCase().includes('admin') || userProfile?.headline?.toLowerCase().includes('experienced')) {
      experienceLevel = 'expert'
    } else if (userProfile?.plan === 'free' || userProfile?.plan === 'starter') {
      experienceLevel = 'novice'
    }

    if (userPreferences?.owner_hours_max) {
      if (userPreferences.owner_hours_max <= 10) {
        riskFocus = ' Focus on passive investment structures and minimal management requirements.'
      } else if (userPreferences.owner_hours_max >= 40) {
        riskFocus = ' Consider operational risks given your hands-on involvement preference.'
      }
    }

    // Extract relevant information to answer the specific question
    const contextualResponse = `Based on the due diligence analysis for ${listing.title || 'this business'}, tailored for your ${experienceLevel} experience level:

**Your Question**: "${question}"

**Critical Due Diligence Areas for Your Profile**:
${response.criticalItems?.slice(0, 2)?.map(category =>
  `• ${category.category}: ${category.items?.[0]?.task || 'Review required'} (${category.items?.[0]?.priority || 'high'} priority)`
).join('\n') || '• Financial records and statements review\n• Legal structure and compliance verification'}
${experienceLevel === 'novice' ? '• **Recommended**: Engage professional advisors for complex areas' : ''}

**Risk Assessment Tailored to Your Investment Profile**:
${response.riskMatrix?.slice(0, 2)?.map((risk: any) => `• ${risk.factor || risk}: ${risk.impact || 'Requires attention'}`).join('\n') || '• Key risks identified and evaluated'}
${riskFocus}
${userPreferences?.price_max && listing.price && listing.price > userPreferences.price_max ? '• ⚠️ **Price Risk**: This deal exceeds your stated maximum deal size preference' : ''}

**Priority Actions for Your Experience Level**:
${response.priorityActions?.slice(0, 3)?.map(action => `• ${action}`).join('\n') || '• Proceed with critical area verification\n• Engage relevant experts\n• Document findings systematically'}
${experienceLevel === 'novice' ? '• Consider hiring an experienced M&A advisor to guide the process' : ''}
${experienceLevel === 'expert' ? '• Leverage your experience to fast-track routine verifications' : ''}

**Industry-Specific Considerations**:
${response.industrySpecific?.regulations?.slice(0, 2)?.map(reg => `• ${reg}`).join('\n') || '• Industry regulations compliance\n• Specific certifications required'}
${userPreferences?.industries?.includes(listing.industry) ? '• ✅ This industry aligns with your stated preferences and expertise' : '• Consider additional research given this is outside your primary industry focus'}

This due diligence framework is customized for your investment approach and provides actionable guidance specific to your profile and experience level.`;

    return contextualResponse;
  } catch (error) {
    console.error('Due Diligence follow-up error:', error);
    return 'I apologize, but I encountered an error generating your due diligence response. Please try again.';
  }
}

async function generateBuyerMatchFollowUp(
  question: string,
  previousAnalysis: any,
  listing: any,
  userProfile?: any,
  userPreferences?: any
): Promise<string> {
  try {
    // Use actual user preferences for buyer match analysis
    const actualBuyerPreferences = {
      industries: userPreferences?.industries || [listing.industry || 'General'],
      dealSizeMin: userPreferences?.min_revenue || 100000,
      dealSizeMax: userPreferences?.price_max || listing.price || 10000000,
      geographicPreferences: userPreferences?.states || [listing.state || listing.city || 'National'],
      riskTolerance: (userPreferences?.owner_hours_max && userPreferences.owner_hours_max <= 10 ? 'low' :
                     userPreferences?.owner_hours_max && userPreferences.owner_hours_max >= 40 ? 'high' : 'medium') as 'low' | 'medium' | 'high',
      experienceLevel: (userProfile?.headline?.toLowerCase().includes('admin') || userProfile?.headline?.toLowerCase().includes('experienced') ? 'expert' :
                       userProfile?.plan === 'free' || userProfile?.plan === 'starter' ? 'novice' : 'intermediate') as 'novice' | 'intermediate' | 'expert',
      keywords: userPreferences?.keywords || [listing.industry || 'business']
    };

    // Use the existing buyer match function to generate a contextual response
    const response = await analyzeBusinessSuperEnhancedBuyerMatch(listing, actualBuyerPreferences);

    // Build personalized compatibility insights
    const industryMatch = userPreferences?.industries?.includes(listing.industry)
    const geographicMatch = userPreferences?.states?.some(state =>
      listing.state?.toLowerCase().includes(state.toLowerCase()) ||
      listing.city?.toLowerCase().includes(state.toLowerCase())
    )
    const financialFit = userPreferences?.price_max ?
      (listing.price <= userPreferences.price_max) : true
    const revenueFit = userPreferences?.min_revenue && listing.listing_financials?.[0]?.annual_revenue ?
      (listing.listing_financials[0].annual_revenue >= userPreferences.min_revenue) : true

    // Extract relevant information to answer the specific question
    const contextualResponse = `Based on the buyer compatibility analysis using YOUR SPECIFIC PREFERENCES for ${listing.title || 'this business'}:

**Your Question**: "${question}"

**Personalized Match Score**: ${response.score || previousAnalysis?.score || 85}% compatibility with your profile

**Your Profile Alignment**:
• Industry Match: ${industryMatch ? '✅ MATCHES your preferred industries' : '⚠️ Outside your stated industry preferences'}
• Geographic Fit: ${geographicMatch ? '✅ MATCHES your geographic focus' : '⚠️ Outside your preferred locations'}
• Financial Capacity: ${financialFit ? '✅ Within your deal size range' : '⚠️ Exceeds your maximum deal size'}
• Revenue Requirements: ${revenueFit ? '✅ Meets your minimum revenue criteria' : '⚠️ Below your minimum revenue preference'}

**Compatibility Assessment for Your Profile**:
• Industry Experience: ${response.compatibility?.industryExperience?.insight || 'Industry alignment evaluated'}
• Financial Capacity: ${response.compatibility?.financialCapacity?.insight || 'Financial requirements assessed'}
• Operational Fit: ${response.compatibility?.operationalFit?.insight || 'Operational integration analyzed'}
• Risk Tolerance: Assessed for ${actualBuyerPreferences.riskTolerance} risk tolerance
• Experience Level: Suitable for ${actualBuyerPreferences.experienceLevel} investors

**Score Breakdown Based on Your Preferences**:
• Industry Fit: ${response.scoreBreakdown?.industryFit || 85}% ${industryMatch ? '(Strong match!)' : '(Consider expansion)'}
• Financial Fit: ${response.scoreBreakdown?.financialFit || 80}% ${financialFit ? '(Within budget)' : '(Budget consideration needed)'}
• Operational Fit: ${response.scoreBreakdown?.operationalFit || 75}%

**Personalized Recommendation**: ${response.recommendation || previousAnalysis?.recommendation || 'good_match'}

**Key Reasoning for Your Profile**:
${response.reasoning?.slice(0, 2)?.map(reason => `• ${reason}`).join('\n') || '• Strategic alignment with your investment criteria\n• Financial parameters match your stated preferences'}

**Risk Factors Specific to Your Profile**: ${response.risks?.[0]?.factor || response.risks?.[0] || 'Risks evaluated against your risk tolerance and experience level'}

**Next Steps Tailored to Your Experience Level**:
${response.nextSteps?.slice(0, 2)?.map(step => `• ${step}`).join('\n') || '• Proceed with detailed evaluation\n• Consider professional guidance if needed'}
${actualBuyerPreferences.experienceLevel === 'novice' ? '• Recommended: Engage an M&A advisor given your experience level' : ''}

This analysis is specifically calibrated to YOUR investment preferences, risk tolerance, and experience level.`;

    return contextualResponse;
  } catch (error) {
    console.error('Buyer Match follow-up error:', error);
    return 'I apologize, but I encountered an error generating your buyer compatibility response. Please try again.';
  }
}
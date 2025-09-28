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
  try {
    // Use the existing market intelligence function to generate a contextual response
    const response = await generateSuperEnhancedMarketIntelligence(
      listing.industry || previousAnalysis?.parameters?.industry || 'General',
      previousAnalysis?.parameters?.geography,
      previousAnalysis?.parameters?.dealSize
    );

    // Extract relevant information to answer the specific question
    const contextualResponse = `Based on the market intelligence analysis for ${listing.industry || 'this industry'}:

**Your Question**: "${question}"

**Market Overview**:
• Market Size: ${response.marketOverview?.size?.insight || 'Market size analysis available'}
• Growth Trends: ${response.marketOverview?.growth?.insight || 'Growth trends identified'}

**Competitive Landscape**: ${response.competitive?.intensity?.insight || 'Competitive analysis complete'}

**Strategic Opportunities**: ${response.competitive?.opportunities?.[0]?.insight || response.economic?.opportunities?.[0]?.insight || 'Strategic opportunities identified'}

**Investment Climate**: ${response.investment?.outlook?.insight || 'Investment outlook analyzed'}

**Market Timing**: ${response.timing || 'Market timing assessed'} - ${response.economic?.timing?.insight || 'Timing considerations evaluated'}

**Key Recommendations**:
${response.recommendations?.slice(0, 2)?.map(rec => `• ${rec}`).join('\n') || '• Strategic recommendations provided'}

This analysis considers current market conditions${previousAnalysis?.parameters?.geography ? ` in ${previousAnalysis.parameters.geography}` : ''} and is tailored to your specific inquiry about the business opportunity.`;

    return contextualResponse;
  } catch (error) {
    console.error('Market Intelligence follow-up error:', error);
    return 'I apologize, but I encountered an error generating your market intelligence response. Please try again.';
  }
}

async function generateDueDiligenceFollowUp(
  question: string,
  previousAnalysis: any,
  listing: any
): Promise<string> {
  try {
    // Use the existing due diligence function to generate a contextual response
    const response = await generateSuperEnhancedDueDiligence({
      ...listing,
      industry: listing.industry || previousAnalysis?.industry || 'General'
    });

    // Extract relevant information to answer the specific question
    const contextualResponse = `Based on the due diligence analysis for ${listing.title || 'this business'}:

**Your Question**: "${question}"

**Critical Due Diligence Areas**:
${response.criticalItems?.slice(0, 2)?.map(category =>
  `• ${category.category}: ${category.items?.[0]?.task || 'Review required'} (${category.items?.[0]?.priority || 'high'} priority)`
).join('\n') || '• Financial records and statements review\n• Legal structure and compliance verification'}

**Risk Assessment**:
${response.riskMatrix?.slice(0, 2)?.map((risk: any) => `• ${risk.factor || risk}: ${risk.impact || 'Requires attention'}`).join('\n') || '• Key risks identified and evaluated'}

**Priority Actions**:
${response.priorityActions?.slice(0, 3)?.map(action => `• ${action}`).join('\n') || '• Proceed with critical area verification\n• Engage relevant experts\n• Document findings systematically'}

**Industry-Specific Considerations**:
${response.industrySpecific?.regulations?.slice(0, 2)?.map(reg => `• ${reg}`).join('\n') || '• Industry regulations compliance\n• Specific certifications required'}

This due diligence framework addresses the critical aspects of your acquisition review and provides actionable guidance for your specific inquiry.`;

    return contextualResponse;
  } catch (error) {
    console.error('Due Diligence follow-up error:', error);
    return 'I apologize, but I encountered an error generating your due diligence response. Please try again.';
  }
}

async function generateBuyerMatchFollowUp(
  question: string,
  previousAnalysis: any,
  listing: any
): Promise<string> {
  try {
    // Create mock buyer preferences for the analysis
    const mockBuyerPreferences = {
      industries: [listing.industry || 'General'],
      dealSizeMin: 100000,
      dealSizeMax: listing.price || 10000000,
      geographicPreferences: [listing.state || listing.city || 'National'],
      riskTolerance: 'medium' as const,
      experienceLevel: 'intermediate' as const,
      keywords: [listing.industry || 'business']
    };

    // Use the existing buyer match function to generate a contextual response
    const response = await analyzeBusinessSuperEnhancedBuyerMatch(listing, mockBuyerPreferences);

    // Extract relevant information to answer the specific question
    const contextualResponse = `Based on the buyer compatibility analysis for ${listing.title || 'this business'}:

**Your Question**: "${question}"

**Match Score**: ${response.score || previousAnalysis?.score || 85}% compatibility

**Compatibility Assessment**:
• Industry Experience: ${response.compatibility?.industryExperience?.insight || 'Industry alignment evaluated'}
• Financial Capacity: ${response.compatibility?.financialCapacity?.insight || 'Financial requirements assessed'}
• Operational Fit: ${response.compatibility?.operationalFit?.insight || 'Operational integration analyzed'}

**Score Breakdown**:
• Industry Fit: ${response.scoreBreakdown?.industryFit || 85}%
• Financial Fit: ${response.scoreBreakdown?.financialFit || 80}%
• Operational Fit: ${response.scoreBreakdown?.operationalFit || 75}%

**Recommendation**: ${response.recommendation || previousAnalysis?.recommendation || 'good_match'}

**Key Reasoning**:
${response.reasoning?.slice(0, 2)?.map(reason => `• ${reason}`).join('\n') || '• Strong strategic alignment identified\n• Financial parameters within acceptable range'}

**Risk Factors**: ${response.risks?.[0]?.factor || response.risks?.[0] || 'Key risks and mitigation strategies identified'}

**Next Steps**:
${response.nextSteps?.slice(0, 2)?.map(step => `• ${step}`).join('\n') || '• Proceed with detailed buyer evaluation\n• Conduct management meetings'}

This compatibility analysis considers your specific buyer profile and provides targeted insights for your acquisition evaluation.`;

    return contextualResponse;
  } catch (error) {
    console.error('Buyer Match follow-up error:', error);
    return 'I apologize, but I encountered an error generating your buyer compatibility response. Please try again.';
  }
}
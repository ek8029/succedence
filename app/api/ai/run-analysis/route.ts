import { NextRequest, NextResponse } from 'next/server'
import { analyzeBusinessSuperEnhanced } from '@/lib/ai/super-enhanced-openai'
import { createServiceClient } from '@/lib/supabase/server'
import {
  setAnalysisProcessing,
  storeAnalysis,
  setAnalysisError,
  getStoredAnalysis,
  updateAnalysisProgress,
  registerPoller,
  unregisterPoller,
  retryAnalysis
} from '@/lib/utils/server-side-analysis'
import { canRunAnalysis, incrementUsage } from '@/lib/utils/database-usage-tracking'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, analysisType, parameters, pollerId, userId } = body

    if (!listingId || !analysisType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get user information for plan limitations
    const supabase = createServiceClient()
    let userPlan = 'free'
    let actualUserId = userId

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        actualUserId = user.id
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()

        if (profile && profile.plan) {
          userPlan = profile.plan as any
        }
      }
    } catch (authError) {
      console.warn('Could not get user info for plan limitations:', authError)
    }

    // Check plan limitations
    if (actualUserId) {
      const analysisCheck = await canRunAnalysis(actualUserId, userPlan as any)
      if (!analysisCheck.allowed) {
        return NextResponse.json(
          { error: analysisCheck.message },
          { status: 429 }
        )
      }
    }

    // Check if already processing or completed
    const existing = getStoredAnalysis(listingId, analysisType)
    if (existing) {
      if (existing.status === 'processing') {
        // Register this poller
        if (pollerId) {
          registerPoller(listingId, analysisType, pollerId)
        }
        return NextResponse.json({
          status: 'processing',
          message: 'Analysis already in progress',
          progress: existing.progress || 0,
          partialOutput: existing.partialOutput
        })
      }
      if (existing.status === 'completed' && existing.result) {
        // Return cached result if less than 10 minutes old
        if (Date.now() - existing.startedAt < 10 * 60 * 1000) {
          return NextResponse.json({
            status: 'completed',
            result: existing.result,
            cached: true
          })
        }
      }
      if (existing.status === 'error') {
        // Allow retry if requested
        if (retryAnalysis(listingId, analysisType)) {
          console.log(`Retrying failed analysis for ${listingId}:${analysisType}`)
        }
      }
    }

    // Increment usage tracking
    if (actualUserId) {
      await incrementUsage(actualUserId, 'analysis', analysisType, 0.15)
    }

    // Mark as processing with enhanced tracking
    setAnalysisProcessing(listingId, analysisType, actualUserId, parameters)

    // Register poller if provided
    if (pollerId) {
      registerPoller(listingId, analysisType, pollerId)
    }

    // Spawn async task that continues even if client disconnects
    // Using Promise without await so it runs independently
    Promise.resolve().then(async () => {
      try {
        updateAnalysisProgress(listingId, analysisType, 5, 'Fetching listing data...')

        // Fetch listing with comprehensive data
        const supabase = createServiceClient()
        const { data: listing, error: listingError } = await supabase
          .from('listings')
          .select(`
            *,
            listing_financials(*),
            listing_documents(*),
            user_profiles(*)
          `)
          .eq('id', listingId)
          .single()

        if (listingError || !listing) {
          setAnalysisError(listingId, analysisType, 'Listing not found')
          return
        }

        updateAnalysisProgress(listingId, analysisType, 15, 'Preparing personalized analysis...')

        // Create personalized context based on listing specifics
        const listingContext = {
          ...listing,
          industry: listing.industry || 'General Business',
          location: listing.location || 'Unknown Location',
          askingPrice: listing.asking_price || listing.price || 0,
          revenue: listing.listing_financials?.[0]?.annual_revenue || 0,
          ebitda: listing.listing_financials?.[0]?.ebitda || 0,
          employees: listing.employees || listing.number_of_employees || 0,
          yearEstablished: listing.year_established || listing.founded || null,
          businessType: listing.business_type || 'Unknown',
          ownerInvolvement: listing.owner_involvement || 'Full-time',
          reasonForSelling: listing.reason_for_selling || 'Not specified',
          parameters: parameters || {}
        }

        let result: any
        updateAnalysisProgress(listingId, analysisType, 25, 'Running AI analysis...')

        // Run the appropriate analysis with personalized context
        switch (analysisType) {
          case 'business_analysis':
            updateAnalysisProgress(listingId, analysisType, 30, 'Analyzing business fundamentals...')
            result = await analyzeBusinessSuperEnhanced(listingContext, parameters || {})
            updateAnalysisProgress(listingId, analysisType, 90, 'Finalizing business analysis...')
            break

          case 'market_intelligence':
            updateAnalysisProgress(listingId, analysisType, 30, 'Analyzing market conditions...')
            // TODO: Implement personalized market intelligence
            result = {
              message: `Market intelligence analysis for ${listingContext.industry} in ${listingContext.location}`,
              industry: listingContext.industry,
              location: listingContext.location,
              dealSize: listingContext.askingPrice,
              placeholder: true,
              parameters: parameters
            }
            updateAnalysisProgress(listingId, analysisType, 90, 'Completing market analysis...')
            break

          case 'due_diligence':
            updateAnalysisProgress(listingId, analysisType, 30, 'Creating due diligence checklist...')
            // TODO: Implement personalized due diligence
            result = {
              message: `Due diligence checklist for ${listingContext.industry} business`,
              industry: listingContext.industry,
              businessType: listingContext.businessType,
              revenue: listingContext.revenue,
              placeholder: true,
              parameters: parameters
            }
            updateAnalysisProgress(listingId, analysisType, 90, 'Finalizing checklist...')
            break

          case 'buyer_match':
            updateAnalysisProgress(listingId, analysisType, 30, 'Calculating buyer compatibility...')
            // TODO: Implement personalized buyer matching
            result = {
              message: `Buyer compatibility for ${listingContext.industry} acquisition`,
              industry: listingContext.industry,
              dealSize: listingContext.askingPrice,
              location: listingContext.location,
              placeholder: true,
              parameters: parameters
            }
            updateAnalysisProgress(listingId, analysisType, 90, 'Computing match score...')
            break

          default:
            throw new Error(`Unknown analysis type: ${analysisType}`)
        }

        updateAnalysisProgress(listingId, analysisType, 95, 'Saving results...')

        // Store the result with user and parameters
        storeAnalysis(listingId, analysisType, result, actualUserId, parameters)

        // Also save to Supabase for persistence
        try {
          await (supabase as any).from('ai_analyses').insert({
            user_id: actualUserId || 'system',
            listing_id: listingId,
            analysis_type: analysisType,
            analysis_data: result,
            created_at: new Date().toISOString()
          })
        } catch (dbError) {
          console.warn('Failed to save to database:', dbError)
        }

        updateAnalysisProgress(listingId, analysisType, 100, 'Analysis complete!')

      } catch (error) {
        console.error('Analysis error:', error)
        setAnalysisError(
          listingId,
          analysisType,
          error instanceof Error ? error.message : 'Analysis failed'
        )
      }
    })

    // Return immediately to client
    return NextResponse.json({
      status: 'processing',
      message: 'Analysis started successfully'
    })

  } catch (error) {
    console.error('Error starting analysis:', error)
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    )
  }
}

// GET endpoint to check status with enhanced polling support
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listingId')
  const analysisType = searchParams.get('analysisType')
  const pollerId = searchParams.get('pollerId')

  if (!listingId || !analysisType) {
    return NextResponse.json(
      { error: 'Missing parameters' },
      { status: 400 }
    )
  }

  // Register the poller if provided
  if (pollerId) {
    registerPoller(listingId, analysisType, pollerId)
  }

  const analysis = getStoredAnalysis(listingId, analysisType)

  if (!analysis) {
    // Check database for existing result
    try {
      const supabase = createServiceClient()
      const { data, error } = await (supabase as any)
        .from('ai_analyses')
        .select('*')
        .eq('listing_id', listingId)
        .eq('analysis_type', analysisType)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        // Cache it and return
        storeAnalysis(listingId, analysisType, data.analysis_data)
        return NextResponse.json({
          status: 'completed',
          result: data.analysis_data,
          fromDb: true,
          startedAt: new Date(data.created_at).getTime(),
          completedAt: new Date(data.created_at).getTime()
        })
      }
    } catch (dbError) {
      console.warn('Database check failed:', dbError)
    }

    return NextResponse.json({
      status: 'not_found',
      message: 'No analysis found'
    })
  }

  // Unregister poller if analysis is complete or failed
  if (pollerId && (analysis.status === 'completed' || analysis.status === 'error')) {
    unregisterPoller(listingId, analysisType, pollerId)
  }

  const response = {
    status: analysis.status,
    result: analysis.result,
    error: analysis.error,
    startedAt: analysis.startedAt,
    completedAt: analysis.completedAt,
    progress: analysis.progress || 0,
    partialOutput: analysis.partialOutput,
    retryCount: analysis.retryCount || 0
  }

  // Add retry option for failed analyses
  if (analysis.status === 'error' && (analysis.retryCount || 0) < 3) {
    response.canRetry = true
  }

  return NextResponse.json(response)
}
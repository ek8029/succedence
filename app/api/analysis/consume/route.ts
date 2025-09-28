import { NextRequest, NextResponse } from 'next/server'
import { getJob, updateJob } from '@/lib/kv'
import { analyzeBusinessSuperEnhanced } from '@/lib/ai/super-enhanced-openai'
import { createServiceClient } from '@/lib/supabase/server'

async function handler(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      console.error('Missing jobId in queue payload')
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
    }

    const job = await getJob(jobId)
    if (!job) {
      console.error(`Job not found: ${jobId}`)
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'queued') {
      console.log(`Job ${jobId} already processed (status: ${job.status})`)
      return NextResponse.json({ success: true })
    }

    // Mark as running
    await updateJob(jobId, {
      status: 'running',
      progress: 5
    })

    try {
      // Fetch listing data
      const supabase = createServiceClient()
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', job.listingId)
        .single() as { data: any; error: any }

      if (listingError || !listing) {
        throw new Error(`Failed to fetch listing: ${listingError?.message}`)
      }

      await updateJob(jobId, { progress: 15 })

      // Check for cancellation
      const currentJob = await getJob(jobId)
      if (currentJob?.cancelRequested) {
        await updateJob(jobId, {
          status: 'canceled',
          progress: 100
        })
        return NextResponse.json({ success: true })
      }

      let result: any

      // Route to appropriate analysis function
      switch (job.analysisType) {
        case 'business_analysis':
          await updateJob(jobId, {
            progress: 25,
            partialOutput: 'Starting business analysis...'
          })

          result = await analyzeBusinessSuperEnhanced(listing, job.params || {})

          await updateJob(jobId, {
            progress: 80,
            partialOutput: 'Finalizing business analysis...'
          })
          break

        case 'market_intelligence':
          await updateJob(jobId, {
            progress: 25,
            partialOutput: 'Analyzing market conditions...'
          })

          // TODO: Implement market intelligence analysis
          result = {
            message: 'Market intelligence analysis coming soon',
            industry: listing.industry,
            location: listing.location
          }

          await updateJob(jobId, {
            progress: 80,
            partialOutput: 'Completing market analysis...'
          })
          break

        case 'due_diligence':
          await updateJob(jobId, {
            progress: 25,
            partialOutput: 'Creating due diligence checklist...'
          })

          // TODO: Implement due diligence analysis
          result = {
            message: 'Due diligence analysis coming soon',
            listingId: listing.id
          }

          await updateJob(jobId, {
            progress: 80,
            partialOutput: 'Finalizing checklist...'
          })
          break

        case 'buyer_match':
          await updateJob(jobId, {
            progress: 25,
            partialOutput: 'Calculating buyer compatibility...'
          })

          // TODO: Implement buyer match analysis
          result = {
            message: 'Buyer match analysis coming soon',
            listingId: listing.id
          }

          await updateJob(jobId, {
            progress: 80,
            partialOutput: 'Computing match score...'
          })
          break

        default:
          throw new Error(`Unknown analysis type: ${job.analysisType}`)
      }

      // Final check for cancellation
      const finalJob = await getJob(jobId)
      if (finalJob?.cancelRequested) {
        await updateJob(jobId, {
          status: 'canceled',
          progress: 100
        })
        return NextResponse.json({ success: true })
      }

      // Save result and mark complete
      await updateJob(jobId, {
        status: 'succeeded',
        progress: 100,
        result,
        partialOutput: undefined // Clear partial output on completion
      })

      // Optional: Save to AI history table for compatibility
      try {
        const analysisTypeMap: Record<string, string> = {
          business_analysis: 'business_analysis',
          market_intelligence: 'market_intelligence',
          due_diligence: 'due_diligence',
          buyer_match: 'buyer_match'
        }

        await (supabase as any).from('ai_analyses').insert({
          user_id: 'system', // Use system for queue-generated analyses
          listing_id: job.listingId,
          analysis_type: analysisTypeMap[job.analysisType],
          analysis_data: result,
          created_at: new Date().toISOString()
        })
      } catch (historyError) {
        console.warn('Failed to save to ai_analyses:', historyError)
        // Don't fail the job if history save fails
      }

      console.log(`Job ${jobId} completed successfully`)

    } catch (analysisError) {
      console.error(`Analysis failed for job ${jobId}:`, analysisError)

      await updateJob(jobId, {
        status: 'failed',
        progress: 100,
        error: analysisError instanceof Error ? analysisError.message : 'Analysis failed',
        partialOutput: undefined
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in queue consumer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export POST handler directly without signature verification for now
// TODO: Add QStash signature verification in production
export const POST = handler
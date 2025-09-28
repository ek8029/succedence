import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { JobQueue } from '@/lib/services/job-queue'
import { canRunAnalysis, incrementUsage } from '@/lib/utils/database-usage-tracking'

// Import the analysis worker to ensure it starts
import '@/lib/services/analysis-worker'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting analysis request...')
    const body = await request.json()
    const { listingId, analysisType, parameters, userId } = body
    console.log('📝 Request params:', { listingId, analysisType, userId })

    if (!listingId || !analysisType) {
      console.error('❌ Missing required parameters:', { listingId, analysisType })
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get user information for plan limitations
    const supabase = createServiceClient()
    let userPlan = 'free'
    let actualUserId = userId
    let user = null

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser
      if (user) {
        actualUserId = user.id
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
      console.warn('Could not get user info for plan limitations:', authError)
    }

    // Admin bypass - check for admin role from database
    let isAdmin = false
    if (user) {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        isAdmin = profile?.role === 'admin'
      } catch (roleError) {
        console.warn('Could not check admin role:', roleError)
      }
    }

    // Check plan limitations (skip for admins)
    if (actualUserId && !isAdmin) {
      const analysisCheck = await canRunAnalysis(actualUserId, userPlan as any)
      if (!analysisCheck.allowed) {
        return NextResponse.json(
          { error: analysisCheck.message },
          { status: 429 }
        )
      }
    }

    // Check for existing jobs using job queue
    const jobQueue = JobQueue.getInstance()
    const existingJob = await jobQueue.getLatestJob(listingId, analysisType)

    if (existingJob) {
      if (existingJob.status === 'queued' || existingJob.status === 'processing') {
        return NextResponse.json({
          status: 'processing',
          jobId: existingJob.id,
          progress: existingJob.progress,
          message: existingJob.current_step || 'Analysis in progress'
        })
      }
      if (existingJob.status === 'completed' && existingJob.result) {
        // Return cached result if less than 10 minutes old
        const jobAge = Date.now() - new Date(existingJob.created_at).getTime()
        if (jobAge < 10 * 60 * 1000) {
          return NextResponse.json({
            status: 'completed',
            result: existingJob.result,
            jobId: existingJob.id,
            cached: true
          })
        }
      }
    }

    // Increment usage tracking (skip for admins)
    if (actualUserId && !isAdmin) {
      await incrementUsage(actualUserId, 'analysis', analysisType, 0.15)
    }

    // Create new job in queue
    const newJob = await jobQueue.createJob(
      listingId,
      analysisType as any,
      actualUserId,
      parameters || {}
    )

    // Background worker will pick up and process the job automatically
    console.log('✅ Job queued for background processing:', newJob.id)

    // Return job information to client
    return NextResponse.json({
      status: 'queued',
      jobId: newJob.id,
      message: 'Analysis queued for background processing'
    })

  } catch (error) {
    console.error('Error starting analysis:', error)
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    )
  }
}

// GET endpoint to check job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listingId')
  const analysisType = searchParams.get('analysisType')
  const jobId = searchParams.get('jobId')

  if (!listingId || !analysisType) {
    return NextResponse.json(
      { error: 'Missing parameters' },
      { status: 400 }
    )
  }

  const jobQueue = JobQueue.getInstance()

  // Get job status from database
  let job
  if (jobId) {
    job = await jobQueue.getJob(jobId)
  } else {
    job = await jobQueue.getLatestJob(listingId, analysisType)
  }

  if (!job) {
    return NextResponse.json({
      status: 'not_found',
      message: 'No analysis found'
    })
  }

  // Convert job status to client format
  const clientStatus = job.status === 'queued' ? 'queued' :
                      job.status === 'processing' ? 'processing' :
                      job.status === 'completed' ? 'completed' :
                      job.status === 'failed' ? 'error' : 'canceled'

  const response: any = {
    status: clientStatus,
    jobId: job.id,
    progress: job.progress,
    partialOutput: job.current_step,
    result: job.result,
    error: job.error_message,
    startedAt: job.started_at ? new Date(job.started_at).getTime() : new Date(job.created_at).getTime(),
    completedAt: job.completed_at ? new Date(job.completed_at).getTime() : undefined
  }

  return NextResponse.json(response)
}
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { findExistingJob, setJob, getJob, type Job } from '@/lib/kv'
import { enqueueJob } from '@/lib/queue'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, analysisType, params = {} } = body

    if (!listingId || !analysisType) {
      return NextResponse.json(
        { error: 'listingId and analysisType are required' },
        { status: 400 }
      )
    }

    // Validate analysisType
    const validTypes = ['business_analysis', 'market_intelligence', 'due_diligence', 'buyer_match']
    if (!validTypes.includes(analysisType)) {
      return NextResponse.json(
        { error: 'Invalid analysisType' },
        { status: 400 }
      )
    }

    // Auth check (reuse existing auth logic)
    if (process.env.NODE_ENV !== 'development') {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Check for existing in-flight job (idempotency)
    const existingJobId = await findExistingJob(listingId, analysisType)
    if (existingJobId) {
      const existingJob = await getJob(existingJobId)
      if (existingJob && ['queued', 'running'].includes(existingJob.status)) {
        return NextResponse.json({ jobId: existingJobId })
      }
    }

    // Create new job
    const jobId = nanoid()
    const job: Job = {
      id: jobId,
      listingId,
      analysisType: analysisType as Job['analysisType'],
      params,
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    // Store job in Redis
    await setJob(job)

    // Enqueue for processing
    await enqueueJob({ jobId })

    return NextResponse.json({ jobId })

  } catch (error) {
    console.error('Error starting analysis job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
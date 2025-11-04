import { NextRequest, NextResponse } from 'next/server'
import { JobQueue } from '@/lib/services/job-queue'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId parameter' },
        { status: 400 }
      )
    }

    console.log('🚫 Received cancel request for job:', jobId)

    const jobQueue = JobQueue.getInstance()

    // Get the job to verify it exists and can be cancelled
    const job = await jobQueue.getJob(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Only allow cancelling jobs that are queued or processing
    if (job.status !== 'queued' && job.status !== 'processing') {
      return NextResponse.json(
        { error: `Cannot cancel job with status: ${job.status}` },
        { status: 400 }
      )
    }

    // Cancel the job
    await jobQueue.cancelJob(jobId)

    console.log('✅ Successfully cancelled job:', jobId)

    return NextResponse.json({
      success: true,
      message: 'Analysis cancelled successfully',
      jobId
    })
  } catch (error) {
    console.error('❌ Error cancelling analysis:', error)
    return NextResponse.json(
      { error: 'Failed to cancel analysis' },
      { status: 500 }
    )
  }
}

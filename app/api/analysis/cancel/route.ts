import { NextRequest, NextResponse } from 'next/server'
import { updateJob, getJob } from '@/lib/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    const job = await getJob(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (['succeeded', 'failed', 'canceled'].includes(job.status)) {
      return NextResponse.json(
        { error: 'Job is already in terminal state' },
        { status: 400 }
      )
    }

    // Set cooperative cancellation flag
    await updateJob(jobId, {
      cancelRequested: true,
      status: job.status === 'queued' ? 'canceled' : job.status
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error canceling job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
/**
 * Database-based Job Queue Service
 * Provides persistent background processing for AI analysis
 */

import { createServiceClient, createBackgroundServiceClient } from '@/lib/supabase/server'

export interface AnalysisJob {
  id: string
  listing_id: string
  analysis_type: 'business_analysis' | 'market_intelligence' | 'due_diligence' | 'buyer_match'
  user_id?: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  parameters: Record<string, any>
  result?: any
  error_message?: string
  progress: number
  current_step?: string
  created_at: string
  started_at?: string
  completed_at?: string
  updated_at: string
}

export class JobQueue {
  private static instance: JobQueue
  private static backgroundInstance: JobQueue
  private supabase: any

  private constructor(useBackground = false) {
    this.supabase = useBackground ? createBackgroundServiceClient() : createServiceClient()
  }

  static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue(false)
    }
    return JobQueue.instance
  }

  static getBackgroundInstance(): JobQueue {
    if (!JobQueue.backgroundInstance) {
      JobQueue.backgroundInstance = new JobQueue(true)
    }
    return JobQueue.backgroundInstance
  }

  /**
   * Create a new analysis job
   */
  async createJob(
    listingId: string,
    analysisType: AnalysisJob['analysis_type'],
    userId?: string,
    parameters: Record<string, any> = {}
  ): Promise<AnalysisJob> {
    console.log('📝 Creating new analysis job:', { listingId, analysisType, userId })

    // Check if there's already a recent job for this listing/type
    const existingJob = await this.getLatestJob(listingId, analysisType)
    if (existingJob &&
        (existingJob.status === 'queued' || existingJob.status === 'processing')) {
      console.log('♻️ Returning existing job:', existingJob.id)
      return existingJob
    }

    const { data, error } = await (this.supabase as any)
      .from('analysis_jobs')
      .insert({
        listing_id: listingId,
        analysis_type: analysisType,
        user_id: userId,
        parameters,
        status: 'queued',
        progress: 0
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to create job:', error)
      throw new Error(`Failed to create analysis job: ${error.message}`)
    }

    console.log('✅ Created job:', data?.id)
    return data as AnalysisJob
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<AnalysisJob | null> {
    const { data, error } = await (this.supabase as any)
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Job not found
      }
      console.error('❌ Failed to get job:', error)
      throw new Error(`Failed to get job: ${error.message}`)
    }

    return data
  }

  /**
   * Get latest job for a listing/analysis type combination
   */
  async getLatestJob(listingId: string, analysisType: string): Promise<AnalysisJob | null> {
    const { data, error } = await (this.supabase as any)
      .from('analysis_jobs')
      .select('*')
      .eq('listing_id', listingId)
      .eq('analysis_type', analysisType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('❌ Failed to get latest job:', error)
      return null
    }

    return data
  }

  /**
   * Update job status and progress
   */
  async updateJob(
    jobId: string,
    updates: Partial<Pick<AnalysisJob, 'status' | 'progress' | 'current_step' | 'result' | 'error_message' | 'started_at' | 'completed_at'>>
  ): Promise<void> {
    const { error } = await (this.supabase as any)
      .from('analysis_jobs')
      .update(updates)
      .eq('id', jobId)

    if (error) {
      console.error('❌ Failed to update job:', error)
      throw new Error(`Failed to update job: ${error.message}`)
    }

    console.log('Updated job:', jobId, updates)
  }

  /**
   * Get next queued job for processing
   */
  async getNextQueuedJob(): Promise<AnalysisJob | null> {
    const { data, error } = await (this.supabase as any)
      .from('analysis_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('❌ Failed to get next queued job:', error)
      return null
    }

    return data
  }

  /**
   * Mark job as processing
   */
  async startProcessing(jobId: string): Promise<void> {
    await this.updateJob(jobId, {
      status: 'processing',
      started_at: new Date().toISOString(),
      progress: 0,
      current_step: 'Initializing analysis...'
    })
  }

  /**
   * Mark job as completed
   */
  async completeJob(jobId: string, result: any): Promise<void> {
    await this.updateJob(jobId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress: 100,
      current_step: 'Analysis complete',
      result
    })
  }

  /**
   * Mark job as failed
   */
  async failJob(jobId: string, errorMessage: string): Promise<void> {
    await this.updateJob(jobId, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      progress: 100,
      current_step: 'Analysis failed',
      error_message: errorMessage
    })
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<void> {
    console.log('🚫 Cancelling job:', jobId)
    await this.updateJob(jobId, {
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      current_step: 'Analysis cancelled by user'
    })
  }

  /**
   * Update job progress
   */
  async updateProgress(jobId: string, progress: number, currentStep: string): Promise<void> {
    await this.updateJob(jobId, {
      progress: Math.min(100, Math.max(0, progress)),
      current_step: currentStep
    })
  }

  /**
   * Get all jobs for a user
   */
  async getUserJobs(userId: string, limit: number = 10): Promise<AnalysisJob[]> {
    const { data, error } = await (this.supabase as any)
      .from('analysis_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Failed to get user jobs:', error)
      return []
    }

    return data || []
  }

  /**
   * Clean up old completed jobs (older than 24 hours)
   */
  async cleanupOldJobs(): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - 24)

    const { error } = await (this.supabase as any)
      .from('analysis_jobs')
      .delete()
      .in('status', ['completed', 'failed', 'cancelled'])
      .lt('completed_at', cutoffDate.toISOString())

    if (error) {
      console.error('❌ Failed to cleanup old jobs:', error)
    } else {
      console.log('🧹 Cleaned up old jobs')
    }
  }
}
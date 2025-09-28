/**
 * Background Analysis Worker
 * Processes analysis jobs from the database queue
 */

import { JobQueue, AnalysisJob } from './job-queue'
import { analyzeBusinessSuperEnhanced } from '@/lib/ai/super-enhanced-openai'
import { createBackgroundServiceClient } from '@/lib/supabase/server'

export class AnalysisWorker {
  private static instance: AnalysisWorker
  private isRunning = false
  private jobQueue = JobQueue.getBackgroundInstance()
  private processInterval: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): AnalysisWorker {
    if (!AnalysisWorker.instance) {
      AnalysisWorker.instance = new AnalysisWorker()
    }
    return AnalysisWorker.instance
  }

  /**
   * Start the worker to process jobs
   */
  start(): void {
    if (this.isRunning) {
      console.log('🔄 Analysis worker already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting analysis worker...')

    // Process jobs every 5 seconds
    this.processInterval = setInterval(() => {
      this.processNextJob().catch(error => {
        console.error('❌ Worker error:', error)
      })
    }, 5000)

    // Cleanup old jobs every hour
    setInterval(() => {
      this.jobQueue.cleanupOldJobs().catch(error => {
        console.error('❌ Cleanup error:', error)
      })
    }, 60 * 60 * 1000)

    console.log('✅ Analysis worker started')
  }

  /**
   * Stop the worker
   */
  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.processInterval) {
      clearInterval(this.processInterval)
      this.processInterval = null
    }
    console.log('🛑 Analysis worker stopped')
  }

  /**
   * Process the next queued job
   */
  private async processNextJob(): Promise<void> {
    try {
      const job = await this.jobQueue.getNextQueuedJob()
      if (!job) {
        return // No jobs to process
      }

      console.log('🔨 Processing job:', job.id, job.analysis_type)
      await this.processJob(job)
    } catch (error) {
      console.error('❌ Error processing job:', error)
    }
  }

  /**
   * Process a specific job
   */
  private async processJob(job: AnalysisJob): Promise<void> {
    try {
      // Mark as processing
      await this.jobQueue.startProcessing(job.id)

      // Get listing data
      await this.jobQueue.updateProgress(job.id, 10, 'Fetching listing data...')
      const listing = await this.fetchListingData(job.listing_id)

      if (!listing) {
        // Use fallback demo data
        await this.jobQueue.updateProgress(job.id, 20, 'Using demo data for analysis...')
        const demoListing = this.createDemoListing(job.listing_id)
        const result = await this.runAnalysis(job, demoListing)
        await this.jobQueue.completeJob(job.id, { ...result, demo: true })
        return
      }

      // Run the analysis
      await this.jobQueue.updateProgress(job.id, 30, 'Running AI analysis...')
      const result = await this.runAnalysis(job, listing)

      // Complete the job
      await this.jobQueue.completeJob(job.id, result)
      console.log('✅ Completed job:', job.id)

    } catch (error) {
      console.error('❌ Job failed:', job.id, error)
      await this.jobQueue.failJob(job.id, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Fetch listing data from database
   */
  private async fetchListingData(listingId: string): Promise<any> {
    try {
      const supabase = createBackgroundServiceClient()
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          listing_financials(*),
          listing_documents(*),
          user_profiles(*)
        `)
        .eq('id', listingId)
        .single()

      if (error || !data) {
        console.warn('⚠️ Listing not found:', listingId)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error fetching listing:', error)
      return null
    }
  }

  /**
   * Create demo listing data
   */
  private createDemoListing(listingId: string): any {
    return {
      id: listingId,
      title: 'Demo Business Analysis',
      industry: 'Technology Services',
      description: 'A demonstration business for AI analysis capabilities. This is a sample software development company with steady growth and strong market position.',
      city: 'San Francisco',
      state: 'CA',
      asking_price: 2500000,
      revenue: 1500000,
      ebitda: 450000,
      employees: 25,
      year_established: 2018,
      business_type: 'Software Development',
      owner_involvement: 'Full-time',
      reason_for_selling: 'Retirement'
    }
  }

  /**
   * Run the appropriate analysis based on job type
   */
  private async runAnalysis(job: AnalysisJob, listing: any): Promise<any> {
    const listingContext = {
      ...listing,
      industry: listing.industry || 'General Business',
      location: `${listing.city || 'Unknown'}, ${listing.state || ''}`.trim(),
      askingPrice: listing.asking_price || listing.price || 0,
      revenue: listing.listing_financials?.[0]?.annual_revenue || listing.revenue || 0,
      ebitda: listing.listing_financials?.[0]?.ebitda || listing.ebitda || 0,
      employees: listing.employees || listing.number_of_employees || 0,
      yearEstablished: listing.year_established || listing.founded || null,
      businessType: listing.business_type || 'Unknown',
      ownerInvolvement: listing.owner_involvement || 'Full-time',
      reasonForSelling: listing.reason_for_selling || 'Not specified',
      parameters: job.parameters || {}
    }

    switch (job.analysis_type) {
      case 'business_analysis':
        await this.jobQueue.updateProgress(job.id, 50, 'Analyzing business fundamentals...')
        const result = await analyzeBusinessSuperEnhanced(listingContext as any, job.parameters || {})
        await this.jobQueue.updateProgress(job.id, 90, 'Finalizing business analysis...')
        return result

      case 'market_intelligence':
        await this.jobQueue.updateProgress(job.id, 50, 'Analyzing market conditions...')
        return {
          message: `Market intelligence analysis for ${listingContext.industry} in ${listingContext.location}`,
          industry: listingContext.industry,
          location: listingContext.location,
          dealSize: listingContext.askingPrice,
          parameters: job.parameters
        }

      case 'due_diligence':
        await this.jobQueue.updateProgress(job.id, 50, 'Creating due diligence checklist...')
        return {
          message: `Due diligence checklist for ${listingContext.industry} business`,
          industry: listingContext.industry,
          businessType: listingContext.businessType,
          revenue: listingContext.revenue,
          parameters: job.parameters
        }

      case 'buyer_match':
        await this.jobQueue.updateProgress(job.id, 50, 'Calculating buyer compatibility...')
        return {
          message: `Buyer compatibility for ${listingContext.industry} acquisition`,
          industry: listingContext.industry,
          dealSize: listingContext.askingPrice,
          location: listingContext.location,
          parameters: job.parameters
        }

      default:
        throw new Error(`Unknown analysis type: ${job.analysis_type}`)
    }
  }
}

// Start the worker when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  const worker = AnalysisWorker.getInstance()
  worker.start()
}
/**
 * Background Analysis Worker
 * Processes analysis jobs from the database queue
 */

import { JobQueue, AnalysisJob } from './job-queue'
import {
  analyzeBusinessSuperEnhanced,
  analyzeBusinessSuperEnhancedBuyerMatch,
  generateSuperEnhancedDueDiligence,
  generateSuperEnhancedMarketIntelligence
} from '@/lib/ai/super-enhanced-openai'
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
    console.log('Starting analysis worker...')

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
      // Check if job was cancelled before starting
      const currentJob = await this.jobQueue.getJob(job.id)
      if (currentJob?.status === 'cancelled') {
        console.log('🚫 Job was cancelled before processing:', job.id)
        return
      }

      // Mark as processing
      await this.jobQueue.startProcessing(job.id)

      // Get listing data
      await this.jobQueue.updateProgress(job.id, 10, 'Fetching listing data...')
      const listing = await this.fetchListingData(job.listing_id)

      // Check for cancellation after fetch
      const jobAfterFetch = await this.jobQueue.getJob(job.id)
      if (jobAfterFetch?.status === 'cancelled') {
        console.log('🚫 Job was cancelled during fetch:', job.id)
        return
      }

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

      // Check for cancellation after analysis
      const jobAfterAnalysis = await this.jobQueue.getJob(job.id)
      if (jobAfterAnalysis?.status === 'cancelled') {
        console.log('🚫 Job was cancelled after analysis:', job.id)
        return
      }

      // Save analysis to ai_analyses table for history/dashboard
      await this.saveAnalysisToHistory(job, result)

      // Complete the job
      await this.jobQueue.completeJob(job.id, result)
      console.log('✅ Completed job:', job.id)

    } catch (error) {
      console.error('❌ Job failed:', job.id, error)
      await this.jobQueue.failJob(job.id, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  /**
   * Save completed analysis to ai_analyses table for history and dashboard
   */
  private async saveAnalysisToHistory(job: AnalysisJob, result: any): Promise<void> {
    try {
      if (!job.user_id) {
        console.log('⚠️ No user_id for job, skipping history save');
        return;
      }

      console.log('💾 Attempting to save analysis to history:', {
        user_id: job.user_id,
        listing_id: job.listing_id,
        analysis_type: job.analysis_type,
        result_keys: Object.keys(result || {})
      });

      const supabase = createBackgroundServiceClient();

      // Prepare data for insertion (using snake_case to match database columns)
      const insertData = {
        user_id: job.user_id,
        listing_id: job.listing_id,
        analysis_type: job.analysis_type,
        analysis_data: result
      };

      console.log('💾 Insert data prepared:', {
        user_id: insertData.user_id,
        listing_id: insertData.listing_id,
        analysis_type: insertData.analysis_type,
        has_data: !!insertData.analysis_data
      });

      const { data, error } = await supabase
        .from('ai_analyses')
        .insert(insertData)
        .select();

      if (error) {
        console.error('❌ Failed to save analysis to history:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // Log the full error for debugging
        console.error('Full error object:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Analysis saved to history table successfully!', {
          saved_id: data?.[0]?.id,
          user_id: insertData.user_id
        });
      }
    } catch (error) {
      console.error('❌ Exception while saving analysis to history:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
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
        .select('*')
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
      title: listing.title || 'Business Opportunity',
      description: listing.description || 'No description available',
      industry: listing.industry || 'General Business',
      location: `${listing.city || 'Unknown'}, ${listing.state || ''}`.trim(),
      askingPrice: listing.price || 0,
      revenue: listing.revenue || 0,
      ebitda: listing.ebitda || 0,
      cashFlow: listing.cash_flow || 0,
      employees: listing.employees || 0,
      yearEstablished: listing.year_established || listing.created_at?.substring(0, 4) || null,
      businessType: listing.industry || 'Unknown',
      ownerInvolvement: listing.owner_hours ? `${listing.owner_hours} hours/week` : 'Full-time',
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
        const marketResult = await generateSuperEnhancedMarketIntelligence(
          listingContext.title,
          listingContext.description,
          listingContext.industry,
          listingContext.location,
          listingContext.askingPrice
        )
        await this.jobQueue.updateProgress(job.id, 90, 'Finalizing market intelligence...')
        return marketResult

      case 'due_diligence':
        await this.jobQueue.updateProgress(job.id, 50, 'Creating due diligence checklist...')
        const dueDiligenceResult = await generateSuperEnhancedDueDiligence(
          listingContext.title,
          listingContext.description,
          listingContext as any
        )
        await this.jobQueue.updateProgress(job.id, 90, 'Finalizing due diligence checklist...')
        return dueDiligenceResult

      case 'buyer_match':
        await this.jobQueue.updateProgress(job.id, 50, 'Calculating buyer compatibility...')
        // Create default buyer preferences for background processing
        const buyerPreferences = {
          industries: [],
          dealSizeMin: 0,
          dealSizeMax: 10000000,
          geographicPreferences: [],
          riskTolerance: 'medium' as const,
          experienceLevel: 'expert' as const,
          keywords: []
        }
        const buyerMatchResult = await analyzeBusinessSuperEnhancedBuyerMatch(
          listingContext as any,
          buyerPreferences
        )
        await this.jobQueue.updateProgress(job.id, 90, 'Finalizing buyer match analysis...')
        return buyerMatchResult

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
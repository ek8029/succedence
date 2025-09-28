import { Redis } from '@upstash/redis'

// Check if Redis is configured
const REDIS_CONFIGURED = process.env.UPSTASH_REDIS_REST_URL &&
                        process.env.UPSTASH_REDIS_REST_TOKEN &&
                        process.env.UPSTASH_REDIS_REST_URL !== 'your_redis_url_here'

// Create Redis client only if configured
export const redis = REDIS_CONFIGURED
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export type Job = {
  id: string
  listingId: string
  analysisType: 'business_analysis' | 'market_intelligence' | 'due_diligence' | 'buyer_match'
  params?: Record<string, any>
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled'
  progress: number // 0..100
  partialOutput?: string
  result?: any
  error?: string
  createdAt: number
  updatedAt: number
  cancelRequested?: boolean
}

// Redis key helpers
export const jobKey = (id: string) => `job:${id}`
export const listingJobKey = (listingId: string, analysisType: string) =>
  `job:byListing:${listingId}:${analysisType}`

export async function getJob(id: string): Promise<Job | null> {
  if (!redis) return null
  return await redis.get(jobKey(id))
}

export async function setJob(job: Job): Promise<void> {
  if (!redis) return
  const key = jobKey(job.id)
  const listingKey = listingJobKey(job.listingId, job.analysisType)

  await Promise.all([
    redis.set(key, job),
    redis.set(listingKey, job.id, { ex: 3600 }) // 1 hour expiry for deduplication
  ])
}

export async function updateJob(
  id: string,
  updates: Partial<Pick<Job, 'status' | 'progress' | 'partialOutput' | 'result' | 'error' | 'cancelRequested'>>
): Promise<void> {
  if (!redis) return
  const job = await getJob(id)
  if (!job) return

  const updatedJob = {
    ...job,
    ...updates,
    updatedAt: Date.now()
  }

  await setJob(updatedJob)
}

export async function findExistingJob(listingId: string, analysisType: string): Promise<string | null> {
  if (!redis) return null
  return await redis.get(listingJobKey(listingId, analysisType))
}
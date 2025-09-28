import { Client } from '@upstash/qstash'

// Check if QStash is configured
const QSTASH_CONFIGURED = process.env.QSTASH_TOKEN &&
                         process.env.QSTASH_TOKEN !== 'your_qstash_token_here'

// Create QStash client only if configured
const qstash = QSTASH_CONFIGURED
  ? new Client({
      token: process.env.QSTASH_TOKEN!,
    })
  : null

export type QueuePayload = {
  jobId: string
}

export async function enqueueJob(payload: QueuePayload): Promise<void> {
  if (!qstash) {
    console.warn('QStash not configured - skipping job queue')
    return
  }

  const webhookUrl = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/analysis/consume`

  await qstash.publishJSON({
    url: webhookUrl,
    body: payload,
    // Add some delay to allow Redis write to complete
    delay: 1
  })
}
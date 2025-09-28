# Background AI Analysis Jobs - Complete Implementation

## 🎯 Problem Solved

**Fixed**: AI analyses stopping when switching browser tabs, causing "failed to analyze all analysis for AI" errors and UI resets.

**Solution**: Moved OpenAI processing to server-side background jobs using Upstash Redis + QStash queue system.

## 🏗️ Architecture

### Job Flow
1. **Client** → POST `/api/analysis/start` → Creates job in Redis → Queues for processing
2. **QStash** → POST `/api/analysis/consume` → Processes OpenAI calls server-side
3. **Client** → Polls GET `/api/analysis/status` → Gets real-time updates
4. **Client** → Auto-resumes on tab return/refresh via localStorage persistence

### Key Benefits
- ✅ **Tab-safe**: Switch tabs, close browser, refresh page - analysis continues
- ✅ **Vercel-friendly**: Uses Redis + QStash (no long-running processes)
- ✅ **Auto-resume**: UI reconnects to in-progress jobs automatically
- ✅ **Progress tracking**: Real-time progress bars and status updates
- ✅ **Error handling**: Robust retry logic and cooperative cancellation

## 📁 Files Created

### Core Infrastructure
- `lib/kv.ts` - Upstash Redis client + job management
- `lib/queue.ts` - QStash publishing helper
- `hooks/useAnalysis.ts` - React hook for client-side job management

### API Routes
- `app/api/analysis/start/route.ts` - Create and queue jobs
- `app/api/analysis/status/route.ts` - Get job status (polling endpoint)
- `app/api/analysis/cancel/route.ts` - Cancel running jobs
- `app/api/analysis/consume/route.ts` - Process jobs (QStash webhook)

### Example Component
- `components/ai/QueuedBusinessAnalysisAI.tsx` - Demo implementation

## 🔧 Environment Setup

Add to `.env.local`:

```bash
# Upstash Configuration (get from https://console.upstash.com/)
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
QSTASH_TOKEN=your_qstash_token_here

# App URL for webhooks
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 Usage Example

```tsx
import { useAnalysis } from '@/hooks/useAnalysis'

function MyComponent({ listingId }: { listingId: string }) {
  const { job, isLoading, error, start, attach, cancel } = useAnalysis()

  // Auto-attach on mount (for resume after refresh)
  useEffect(() => {
    attach(listingId, 'business_analysis')
  }, [listingId, attach])

  const handleStartAnalysis = async () => {
    await start(listingId, 'business_analysis', {
      perspective: 'business_focused',
      focusAreas: ['financial_metrics', 'operational_efficiency']
    })
  }

  const isProcessing = isLoading || (job && ['queued', 'running'].includes(job.status))

  return (
    <div>
      {/* Progress bar */}
      {job && isProcessing && (
        <div className="progress-bar">
          <div style={{ width: `${job.progress}%` }} />
          <span>{job.partialOutput || 'Processing...'}</span>
        </div>
      )}

      {/* Start button */}
      {!isProcessing && (
        <button onClick={handleStartAnalysis}>
          Start Analysis
        </button>
      )}

      {/* Cancel button */}
      {isProcessing && (
        <button onClick={cancel}>Cancel</button>
      )}

      {/* Results */}
      {job?.result && <AnalysisResults data={job.result} />}

      {/* Error display */}
      {error && <div className="error">{error}</div>}
    </div>
  )
}
```

## 🧪 Testing Scenarios

### ✅ Acceptance Tests

1. **Tab Switching**: Start analysis → switch tabs for 5+ minutes → return → job completed
2. **Page Refresh**: Start analysis → refresh page → UI resumes from current state
3. **Network Issues**: Disconnect/reconnect → polling retries with backoff
4. **Duplicate Prevention**: Multiple clicks → only one job created per (listingId, analysisType)
5. **Cancellation**: Click cancel → job stops cooperatively

### 🔍 Development Mode Features

- Job debugging info in console logs
- Job state displayed in dev components
- Request ID tracking for QStash webhooks

## 🗄️ Database Schema

Jobs are stored in Redis with TTL. Optional: saves completed results to existing `ai_analyses` table for compatibility.

**Redis Keys:**
- `job:{jobId}` - Full job object
- `job:byListing:{listingId}:{analysisType}` - Deduplication (1 hour TTL)

**Job Object:**
```typescript
type Job = {
  id: string                    // nanoid
  listingId: string            // Business listing ID
  analysisType: string         // 'business_analysis' | 'market_intelligence' | etc.
  params?: Record<string, any> // Analysis parameters
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled'
  progress: number             // 0-100
  partialOutput?: string       // Status messages during processing
  result?: any                 // Final analysis results
  error?: string               // Error message if failed
  createdAt: number           // Timestamp
  updatedAt: number           // Timestamp
  cancelRequested?: boolean   // Cooperative cancellation flag
}
```

## 📊 Monitoring

### Client-Side Logs
```
🔄 Attempt 1/5 for request: resilient-xyz
✅ Request completed successfully: abc123
⏰ Scheduling retry in 2000ms for: def456
```

### Server-Side Logs (QStash Consumer)
```
Job abc123 completed successfully
Analysis failed for job def456: OpenAI API error
🚫 Cancelled request: xyz789
```

## 🔄 Migration from Old System

### Replace Existing Components

**Before** (client-side with resilient fetch):
```tsx
const response = await fetchWithRetry('/api/ai/analyze-business', options)
```

**After** (background jobs):
```tsx
const { start, attach } = useAnalysis()
await start(listingId, 'business_analysis', params)
```

### Progressive Migration
1. Keep existing components working
2. Add new `QueuedBusinessAnalysisAI` component
3. A/B test both approaches
4. Gradually replace old components

## 🛠️ Production Deployment

### Vercel Configuration
1. Set environment variables in Vercel dashboard
2. QStash webhook automatically routes to `/api/analysis/consume`
3. Redis scales automatically with Upstash

### Monitoring & Alerts
- Monitor QStash webhook success rates
- Set up Redis memory usage alerts
- Track job completion rates and times

## 🔐 Security Notes

- QStash webhook signature verification in production
- All API routes include authentication checks
- No sensitive data in Redis job objects
- Automatic job cleanup (TTL) prevents data accumulation

## 📈 Performance

- **Polling Interval**: 0.5s → 10s exponential backoff
- **Job Timeout**: 5 minutes per analysis
- **Redis TTL**: 1 hour for completed jobs
- **Deduplication**: Prevents multiple jobs for same analysis

This implementation completely solves the tab switching problem while providing a robust, scalable foundation for all AI processing in the application.
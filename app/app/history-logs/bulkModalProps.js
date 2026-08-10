import { BatchState } from '@/lib/verification/bulkBatchState'

/**
 * Adapts a BulkVerificationController progress snapshot into the props
 * VerifyUrlModal's bulk mode expects. Extracted as a pure function (no
 * React) so it's independently testable without mounting the whole
 * Optimization Center page.
 */
export function buildBulkModalProps(progress, resultCounts, onViewDetails, onClose) {
  if (!progress) return null

  const runningUrls = [], waitingUrls = [], completedUrls = [], failedUrls = []
  for (const [url, s] of progress.urls) {
    if (s.status === 'running') runningUrls.push(url)
    else if (s.status === 'queued') waitingUrls.push(url)
    else if (s.status === 'completed') completedUrls.push(url)
    else if (s.status === 'failed') failedUrls.push(url)
  }

  const isComplete = progress.state === BatchState.COMPLETED || progress.state === BatchState.FAILED
  return {
    isComplete,
    isFailed: progress.state === BatchState.FAILED,
    total: progress.total,
    completed: progress.completed,
    failed: progress.failed,
    runningUrls, waitingUrls, completedUrls, failedUrls,
    isComputingResults: isComplete && !resultCounts,
    fixedCount: resultCounts?.fixedCount ?? 0,
    stillFailingCount: resultCounts?.stillFailingCount ?? 0,
    onViewDetails,
    onClose,
  }
}

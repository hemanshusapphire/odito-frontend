import { logger } from '@/lib/monitoring/logger'

/**
 * F4-019 §8 — frontend-only analytics for the Verification Batch migration.
 * Routed through the existing structured logger (which already has an
 * external-sink hook via setLogSink — see lib/monitoring/logger.js) rather
 * than a new analytics SDK. Every event name is prefixed `analytics:` so a
 * sink can filter these out from ordinary operational logs.
 *
 * Deliberately thin, named wrappers (not a bag-of-strings trackEvent() call
 * at each site) so call sites stay readable and the exact property shape
 * per event is documented in one place.
 */

export function trackBatchStarted({ batchId, projectId, totalUrls, dispatchedUrls }) {
  logger.info('analytics:verification_batch_started', { batchId, projectId, totalUrls, dispatchedUrls })
}

export function trackBatchCompleted({ batchId, projectId, status, totalUrls, completedUrls, failedUrls }) {
  logger.info('analytics:verification_batch_completed', { batchId, projectId, status, totalUrls, completedUrls, failedUrls })
}

export function trackBatchFailed({ batchId, projectId, reason, stage }) {
  logger.info('analytics:verification_batch_failed', { batchId, projectId, reason, stage })
}

export function trackRecoveryUsed({ batchId, projectId, isInitialResume, batchStatus }) {
  logger.info('analytics:verification_batch_recovery_used', { batchId, projectId, isInitialResume, batchStatus })
}

export function trackWebsocketReconnect({ batchId, projectId }) {
  logger.info('analytics:verification_batch_websocket_reconnect', { batchId, projectId })
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '@/lib/monitoring/logger'
import {
  trackBatchStarted,
  trackBatchCompleted,
  trackBatchFailed,
  trackRecoveryUsed,
  trackWebsocketReconnect,
} from './batchAnalytics'

// F4-019 §8: frontend-only analytics, routed through the existing
// structured logger (which already has an external-sink hook) rather than a
// new analytics SDK. These tests just prove each event carries the right
// name/shape — the logger itself is already tested elsewhere.

describe('batchAnalytics (F4-019)', () => {
  let infoSpy

  beforeEach(() => {
    infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    infoSpy.mockRestore()
  })

  it('trackBatchStarted logs analytics:verification_batch_started with the given properties', () => {
    trackBatchStarted({ batchId: 'b1', projectId: 'p1', totalUrls: 5, dispatchedUrls: 4 })
    expect(infoSpy).toHaveBeenCalledWith('analytics:verification_batch_started', {
      batchId: 'b1', projectId: 'p1', totalUrls: 5, dispatchedUrls: 4,
    })
  })

  it('trackBatchCompleted logs analytics:verification_batch_completed with status + counts', () => {
    trackBatchCompleted({ batchId: 'b1', projectId: 'p1', status: 'partial', totalUrls: 5, completedUrls: 3, failedUrls: 2 })
    expect(infoSpy).toHaveBeenCalledWith('analytics:verification_batch_completed', {
      batchId: 'b1', projectId: 'p1', status: 'partial', totalUrls: 5, completedUrls: 3, failedUrls: 2,
    })
  })

  it('trackBatchFailed logs analytics:verification_batch_failed with a reason and stage', () => {
    trackBatchFailed({ batchId: 'b1', projectId: 'p1', reason: 'network error', stage: 'start' })
    expect(infoSpy).toHaveBeenCalledWith('analytics:verification_batch_failed', {
      batchId: 'b1', projectId: 'p1', reason: 'network error', stage: 'start',
    })
  })

  it('trackRecoveryUsed logs analytics:verification_batch_recovery_used', () => {
    trackRecoveryUsed({ batchId: 'b1', projectId: 'p1', isInitialResume: true, batchStatus: 'running' })
    expect(infoSpy).toHaveBeenCalledWith('analytics:verification_batch_recovery_used', {
      batchId: 'b1', projectId: 'p1', isInitialResume: true, batchStatus: 'running',
    })
  })

  it('trackWebsocketReconnect logs analytics:verification_batch_websocket_reconnect', () => {
    trackWebsocketReconnect({ batchId: 'b1', projectId: 'p1' })
    expect(infoSpy).toHaveBeenCalledWith('analytics:verification_batch_websocket_reconnect', {
      batchId: 'b1', projectId: 'p1',
    })
  })
})

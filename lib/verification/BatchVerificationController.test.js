import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BatchVerificationController } from './BatchVerificationController'
import { BatchState } from './bulkBatchState'
import * as batchAnalytics from './batchAnalytics'

// Inlined rather than imported from '@/lib/socketService' — that module
// throws at import time if NEXT_PUBLIC_API_URL isn't set (apiConfig.js),
// which vitest's environment doesn't provide by default. Same values as
// socketService.js's own ConnectionState export.
const ConnectionState = { CONNECTED: 'connected', RECONNECTING: 'reconnecting' }

vi.mock('./batchAnalytics', () => ({
  trackBatchStarted: vi.fn(),
  trackBatchCompleted: vi.fn(),
  trackBatchFailed: vi.fn(),
  trackRecoveryUsed: vi.fn(),
  trackWebsocketReconnect: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

/** _handleConnectionStateChange never awaits _recoverFromRest (a live socket
 * callback can't be awaited by socket.io) — flush the microtask queue so a
 * test can observe the recovery fetch's effects deterministically. */
async function flushMicrotasks() {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

function fakeSocketService() {
  const handlers = {}
  let connectionStateCb = null
  return {
    joinProject: vi.fn(),
    onVerificationStarted: (cb) => { handlers.started = cb },
    onVerificationProgress: (cb) => { handlers.progress = cb },
    onVerificationCompleted: (cb) => { handlers.completed = cb },
    onVerificationFailed: (cb) => { handlers.failed = cb },
    onVerificationBatchCompleted: (cb) => { handlers.batchCompleted = cb },
    offVerificationStarted: vi.fn(),
    offVerificationProgress: vi.fn(),
    offVerificationCompleted: vi.fn(),
    offVerificationFailed: vi.fn(),
    offVerificationBatchCompleted: vi.fn(),
    onConnectionStateChange: vi.fn((cb) => { connectionStateCb = cb; return () => { connectionStateCb = null } }),
    _handlers: handlers,
    _emitConnectionState: (next) => connectionStateCb?.(next),
  }
}

function fakeApiService(overrides = {}) {
  return {
    startVerificationBatch: vi.fn().mockResolvedValue({
      success: true,
      batchId: 'batch-1',
      status: 'RUNNING',
      totalUrls: 2,
      dispatchedUrls: 2,
      runs: [
        { url: 'https://example.com/a', runId: 'run-a', dispatched: true },
        { url: 'https://example.com/b', runId: 'run-b', dispatched: true },
      ],
      rejected: [],
    }),
    getVerificationBatch: vi.fn(),
    getVerificationBatchRuns: vi.fn(),
    ...overrides,
  }
}

describe('BatchVerificationController — start() (F4-019)', () => {
  it('issues exactly ONE start request regardless of how many URLs are submitted', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const urls = ['https://example.com/a', 'https://example.com/b']
    const controller = new BatchVerificationController({ projectId: 'proj-1', urls, apiService, socketService, onUpdate: vi.fn() })

    await controller.start()

    expect(apiService.startVerificationBatch).toHaveBeenCalledTimes(1)
    expect(apiService.startVerificationBatch).toHaveBeenCalledWith('proj-1', urls)
  })

  it('marks every dispatched URL as running with its own runId, and stays RUNNING until batch-completed', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a', 'https://example.com/b'], apiService, socketService, onUpdate: vi.fn(),
    })

    await controller.start()

    expect(controller.batchId).toBe('batch-1')
    expect(controller.state).toBe(BatchState.RUNNING)
    expect(controller.urlStates.get('https://example.com/a').status).toBe('running')
    expect(controller.urlStates.get('https://example.com/a').runId).toBe('run-a')
    expect(batchAnalytics.trackBatchStarted).toHaveBeenCalledWith({
      batchId: 'batch-1', projectId: 'proj-1', totalUrls: 2, dispatchedUrls: 2,
    })
  })

  it('marks rejected URLs as failed immediately from the start response', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService({
      startVerificationBatch: vi.fn().mockResolvedValue({
        success: true, batchId: 'batch-1', totalUrls: 2, dispatchedUrls: 1,
        runs: [{ url: 'https://example.com/a', runId: 'run-a', dispatched: true }],
        rejected: [{ url: 'https://example.com/bad', reason: 'INVALID_URL', message: 'Invalid target URL' }],
      }),
    })
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a', 'https://example.com/bad'], apiService, socketService, onUpdate: vi.fn(),
    })

    await controller.start()

    expect(controller.urlStates.get('https://example.com/bad').status).toBe('failed')
    expect(controller.urlStates.get('https://example.com/bad').errorMessage).toBe('Invalid target URL')
    expect(controller.urlStates.get('https://example.com/a').status).toBe('running')
  })

  it('marks accepted-but-dispatch-failed runs (dispatched:false) as failed', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService({
      startVerificationBatch: vi.fn().mockResolvedValue({
        success: true, batchId: 'batch-1', totalUrls: 1, dispatchedUrls: 0,
        runs: [{ url: 'https://example.com/a', runId: 'run-a', dispatched: false }],
        rejected: [],
      }),
    })
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })

    await controller.start()

    expect(controller.urlStates.get('https://example.com/a').status).toBe('failed')
  })

  it('zero dispatched URLs -> finishes FAILED immediately, no batch-completed event ever needed', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService({
      startVerificationBatch: vi.fn().mockResolvedValue({
        success: true, batchId: 'batch-1', totalUrls: 1, dispatchedUrls: 0,
        runs: [{ url: 'https://example.com/a', runId: 'run-a', dispatched: false }],
        rejected: [],
      }),
    })
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })

    await controller.start()

    expect(controller.state).toBe(BatchState.FAILED)
  })

  it('a rejected start request (e.g. 409 already running) fails every URL and transitions to FAILED', async () => {
    const socketService = fakeSocketService()
    const error = Object.assign(new Error('Already running'), { status: 409 })
    const apiService = fakeApiService({ startVerificationBatch: vi.fn().mockRejectedValue(error) })
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })

    await controller.start()

    expect(controller.state).toBe(BatchState.FAILED)
    expect(controller.urlStates.get('https://example.com/a').errorMessage).toBe('Already running')
    expect(batchAnalytics.trackBatchFailed).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'proj-1', stage: 'start' })
    )
  })
})

describe('BatchVerificationController — per-page events do not decide batch completion (F4-019 §4)', () => {
  it('a verification:completed event for every URL does NOT end the batch on its own', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a', 'https://example.com/b'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._handlers.completed({ pageUrl: 'https://example.com/a', runId: 'run-a' })
    socketService._handlers.completed({ pageUrl: 'https://example.com/b', runId: 'run-b' })

    expect(controller.urlStates.get('https://example.com/a').status).toBe('completed')
    expect(controller.urlStates.get('https://example.com/b').status).toBe('completed')
    expect(controller.state).toBe(BatchState.RUNNING) // still — backend is the source of truth
  })

  it('verification:batch-completed with status "completed" finishes the batch as COMPLETED', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const onUpdate = vi.fn()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate,
    })
    await controller.start()
    socketService._handlers.completed({ pageUrl: 'https://example.com/a', runId: 'run-a' })

    socketService._handlers.batchCompleted({ batchId: 'batch-1', status: 'completed', totalUrls: 1, completedUrls: 1, failedUrls: 0 })

    expect(controller.state).toBe(BatchState.COMPLETED)
    expect(batchAnalytics.trackBatchCompleted).toHaveBeenCalledWith({
      batchId: 'batch-1', projectId: 'proj-1', status: 'completed', totalUrls: 1, completedUrls: 1, failedUrls: 0,
    })
  })

  it('verification:batch-completed with status "partial" also finishes as COMPLETED (per-URL breakdown still shows the failures)', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a', 'https://example.com/b'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._handlers.batchCompleted({ batchId: 'batch-1', status: 'partial', totalUrls: 2, completedUrls: 1, failedUrls: 1 })

    expect(controller.state).toBe(BatchState.COMPLETED)
  })

  it('verification:batch-completed with status "failed" finishes as FAILED', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._handlers.batchCompleted({ batchId: 'batch-1', status: 'failed', totalUrls: 1, completedUrls: 0, failedUrls: 1 })

    expect(controller.state).toBe(BatchState.FAILED)
  })

  it('ignores a verification:batch-completed event for a DIFFERENT batchId', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._handlers.batchCompleted({ batchId: 'some-other-batch', status: 'completed', totalUrls: 1, completedUrls: 1, failedUrls: 0 })

    expect(controller.state).toBe(BatchState.RUNNING)
  })

  it('idempotent: a second batch-completed event after already terminal does not re-fire analytics or re-transition', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._handlers.batchCompleted({ batchId: 'batch-1', status: 'completed', totalUrls: 1, completedUrls: 1, failedUrls: 0 })
    socketService._handlers.batchCompleted({ batchId: 'batch-1', status: 'completed', totalUrls: 1, completedUrls: 1, failedUrls: 0 })

    expect(controller.state).toBe(BatchState.COMPLETED)
    expect(batchAnalytics.trackBatchCompleted).toHaveBeenCalledTimes(1)
  })
})

describe('BatchVerificationController — dropped-event diagnostics (parity with legacy controller)', () => {
  let warnSpy
  let originalNodeEnv
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    originalNodeEnv = process.env.NODE_ENV
  })
  afterEach(() => {
    warnSpy.mockRestore()
    process.env.NODE_ENV = originalNodeEnv
  })

  it('logs a dev warning for an event on an untracked pageUrl', async () => {
    process.env.NODE_ENV = 'test'
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._handlers.completed({ pageUrl: 'https://example.com/unrelated', runId: 'run-a' })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('untracked pageUrl')
  })

  it('logs a dev warning for a runId mismatch and does not apply the event', async () => {
    process.env.NODE_ENV = 'test'
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._handlers.completed({ pageUrl: 'https://example.com/a', runId: 'stale-run' })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(controller.urlStates.get('https://example.com/a').status).toBe('running')
  })

  it('never warns in production', async () => {
    process.env.NODE_ENV = 'production'
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._handlers.completed({ pageUrl: 'https://example.com/unrelated', runId: 'run-a' })

    expect(warnSpy).not.toHaveBeenCalled()
  })
})

describe('BatchVerificationController — websocket reconnect recovery (F4-019 §5)', () => {
  it('the very first connect does NOT trigger a recovery fetch', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._emitConnectionState(ConnectionState.CONNECTED)

    expect(apiService.getVerificationBatch).not.toHaveBeenCalled()
  })

  it('a reconnect (disconnected -> connected) triggers exactly one REST recovery fetch', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService({
      getVerificationBatch: vi.fn().mockResolvedValue({ success: true, data: { batchId: 'batch-1', status: 'running', urls: ['https://example.com/a'] } }),
      getVerificationBatchRuns: vi.fn().mockResolvedValue({ success: true, data: [{ pageUrl: 'https://example.com/a', runId: 'run-a', status: 'running' }] }),
    })
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._emitConnectionState(ConnectionState.RECONNECTING)
    socketService._emitConnectionState(ConnectionState.CONNECTED)
    await flushMicrotasks()

    expect(apiService.getVerificationBatch).toHaveBeenCalledTimes(1)
    expect(apiService.getVerificationBatch).toHaveBeenCalledWith('batch-1')
    expect(apiService.getVerificationBatchRuns).toHaveBeenCalledTimes(1)
    expect(batchAnalytics.trackWebsocketReconnect).toHaveBeenCalledWith({ batchId: 'batch-1', projectId: 'proj-1' })
  })

  it('reconnect recovery applies the REST run statuses and finishes the batch if the REST status is already terminal', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService({
      getVerificationBatch: vi.fn().mockResolvedValue({ success: true, data: { batchId: 'batch-1', status: 'completed', urls: ['https://example.com/a'] } }),
      getVerificationBatchRuns: vi.fn().mockResolvedValue({ success: true, data: [{ pageUrl: 'https://example.com/a', runId: 'run-a', status: 'completed' }] }),
    })
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    socketService._emitConnectionState(ConnectionState.RECONNECTING)
    socketService._emitConnectionState(ConnectionState.CONNECTED)
    await flushMicrotasks()

    expect(controller.urlStates.get('https://example.com/a').status).toBe('completed')
    expect(controller.state).toBe(BatchState.COMPLETED)
  })

  it('does not recover again if the batch is already terminal', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()
    socketService._handlers.batchCompleted({ batchId: 'batch-1', status: 'completed', totalUrls: 1, completedUrls: 1, failedUrls: 0 })

    socketService._emitConnectionState(ConnectionState.RECONNECTING)
    await socketService._emitConnectionState(ConnectionState.CONNECTED)

    expect(apiService.getVerificationBatch).not.toHaveBeenCalled()
  })
})

describe('BatchVerificationController — resume() after a browser reload (F4-019 §5)', () => {
  it('seeds urlStates from the batch\'s own url list and applies run statuses', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService({
      getVerificationBatch: vi.fn().mockResolvedValue({
        success: true, data: { batchId: 'batch-1', status: 'running', urls: ['https://example.com/a', 'https://example.com/b'] },
      }),
      getVerificationBatchRuns: vi.fn().mockResolvedValue({
        success: true, data: [
          { pageUrl: 'https://example.com/a', runId: 'run-a', status: 'completed' },
          { pageUrl: 'https://example.com/b', runId: 'run-b', status: 'running' },
        ],
      }),
    })
    const controller = new BatchVerificationController({ projectId: 'proj-1', apiService, socketService, onUpdate: vi.fn() })

    await controller.resume('batch-1')

    expect(controller.batchId).toBe('batch-1')
    expect(controller.urlStates.get('https://example.com/a').status).toBe('completed')
    expect(controller.urlStates.get('https://example.com/b').status).toBe('running')
    expect(controller.state).toBe(BatchState.RUNNING)
    expect(batchAnalytics.trackRecoveryUsed).toHaveBeenCalledWith({
      batchId: 'batch-1', projectId: 'proj-1', isInitialResume: true, batchStatus: 'running',
    })
  })

  it('finishes immediately if the recovered batch is already terminal (completed while the browser was reloading)', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService({
      getVerificationBatch: vi.fn().mockResolvedValue({
        success: true, data: { batchId: 'batch-1', status: 'failed', urls: ['https://example.com/a'] },
      }),
      getVerificationBatchRuns: vi.fn().mockResolvedValue({
        success: true, data: [{ pageUrl: 'https://example.com/a', runId: 'run-a', status: 'failed', errorMessage: 'boom' }],
      }),
    })
    const controller = new BatchVerificationController({ projectId: 'proj-1', apiService, socketService, onUpdate: vi.fn() })

    await controller.resume('batch-1')

    expect(controller.state).toBe(BatchState.FAILED)
    expect(controller.urlStates.get('https://example.com/a').errorMessage).toBe('boom')
  })

  it('an expired/unknown batchId (404) finishes as FAILED without throwing', async () => {
    const socketService = fakeSocketService()
    const notFoundError = Object.assign(new Error('Verification batch not found'), { status: 404 })
    const apiService = fakeApiService({
      getVerificationBatch: vi.fn().mockRejectedValue(notFoundError),
      getVerificationBatchRuns: vi.fn().mockRejectedValue(notFoundError),
    })
    const controller = new BatchVerificationController({ projectId: 'proj-1', apiService, socketService, onUpdate: vi.fn() })

    await expect(controller.resume('expired-batch')).resolves.not.toThrow()
    expect(controller.state).toBe(BatchState.FAILED)
  })
})

describe('BatchVerificationController — snapshot shape parity with the legacy controller', () => {
  it('getSnapshot returns the same shape buildBulkModalProps expects', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate: vi.fn(),
    })
    await controller.start()

    const snapshot = controller.getSnapshot()
    expect(Object.keys(snapshot).sort()).toEqual(
      ['batchId', 'completed', 'failed', 'queued', 'running', 'state', 'total', 'urls'].sort()
    )
    expect(snapshot.urls).toBeInstanceOf(Map)
  })

  it('destroy() detaches all listeners and stops emitting further updates', async () => {
    const socketService = fakeSocketService()
    const apiService = fakeApiService()
    const onUpdate = vi.fn()
    const controller = new BatchVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService, onUpdate,
    })
    await controller.start()
    const callCountBeforeDestroy = onUpdate.mock.calls.length

    controller.destroy()
    socketService._handlers.completed({ pageUrl: 'https://example.com/a', runId: 'run-a' })

    expect(onUpdate.mock.calls.length).toBe(callCountBeforeDestroy)
  })
})

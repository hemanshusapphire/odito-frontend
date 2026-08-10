import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BulkVerificationController } from './BulkVerificationController'

function fakeSocketService() {
  const handlers = {}
  return {
    joinProject: vi.fn(),
    onVerificationStarted: (cb) => { handlers.started = cb },
    onVerificationProgress: (cb) => { handlers.progress = cb },
    onVerificationCompleted: (cb) => { handlers.completed = cb },
    onVerificationFailed: (cb) => { handlers.failed = cb },
    offVerificationStarted: vi.fn(),
    offVerificationProgress: vi.fn(),
    offVerificationCompleted: vi.fn(),
    offVerificationFailed: vi.fn(),
    _handlers: handlers,
  }
}

function fakeApiService(runId = 'run-1') {
  return { verifyUrl: vi.fn().mockResolvedValue({ success: true, data: { runId } }) }
}

// Diagnostic logging added for "modal stuck at Running forever" — a
// websocket event silently dropped by _applyEvent (unknown pageUrl or a
// runId mismatch) previously left zero trace anywhere, making the bug
// undiagnosable. These tests prove the drop is now visible in dev, and
// that normal, correctly-matching events are completely unaffected.
describe('BulkVerificationController — dropped-event diagnostics', () => {
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

  it('a matching verification:completed event is applied normally with no warning', async () => {
    process.env.NODE_ENV = 'test'
    const socketService = fakeSocketService()
    const apiService = fakeApiService('run-1')
    const controller = new BulkVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService,
      onUpdate: vi.fn(),
    })
    controller.start()
    await Promise.resolve() // let _startOne's await resolve and record runId

    socketService._handlers.completed({ pageUrl: 'https://example.com/a', runId: 'run-1' })

    expect(controller.urlStates.get('https://example.com/a').status).toBe('completed')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('logs a warning (dev) when an event arrives for a pageUrl this batch is not tracking', () => {
    process.env.NODE_ENV = 'test'
    const socketService = fakeSocketService()
    const controller = new BulkVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService: fakeApiService(), socketService,
      onUpdate: vi.fn(),
    })
    controller.start()

    socketService._handlers.completed({ pageUrl: 'https://example.com/unrelated-page', runId: 'run-1' })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const [message, details] = warnSpy.mock.calls[0]
    expect(message).toContain('untracked pageUrl')
    expect(details.payload.pageUrl).toBe('https://example.com/unrelated-page')
    expect(details.trackedUrls).toEqual(['https://example.com/a'])
  })

  it('logs a warning (dev) when an event carries a runId that does not match this batch\'s tracked run', async () => {
    process.env.NODE_ENV = 'test'
    const socketService = fakeSocketService()
    const apiService = fakeApiService('run-1')
    const controller = new BulkVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService, socketService,
      onUpdate: vi.fn(),
    })
    controller.start()
    await Promise.resolve()

    socketService._handlers.completed({ pageUrl: 'https://example.com/a', runId: 'some-other-stale-run' })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('runId mismatch')
    expect(controller.urlStates.get('https://example.com/a').status).toBe('running') // unaffected
  })

  it('never warns in production, even for a dropped event', () => {
    process.env.NODE_ENV = 'production'
    const socketService = fakeSocketService()
    const controller = new BulkVerificationController({
      projectId: 'proj-1', urls: ['https://example.com/a'], apiService: fakeApiService(), socketService,
      onUpdate: vi.fn(),
    })
    controller.start()

    socketService._handlers.completed({ pageUrl: 'https://example.com/unrelated-page', runId: 'run-1' })

    expect(warnSpy).not.toHaveBeenCalled()
  })
})

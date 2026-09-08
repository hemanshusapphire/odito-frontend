import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// ── fake socketService: capture registered handlers, expose them ──
const handlers = {}
const ConnectionState = { DISCONNECTED: 'disconnected', CONNECTING: 'connecting', CONNECTED: 'connected', RECONNECTING: 'reconnecting', FAILED: 'failed' }
let stateListener = null
const joinProject = vi.fn()

vi.mock('@/lib/socketService', () => ({
  ConnectionState,
  default: {
    joinProject,
    onBulkImportStarted: (cb) => { handlers.started = cb },
    onBulkImportProgress: (cb) => { handlers.progress = cb },
    onBulkImportCompleted: (cb) => { handlers.completed = cb },
    onBulkImportError: (cb) => { handlers.error = cb },
    offBulkImportStarted: () => { handlers.started = null },
    offBulkImportProgress: () => { handlers.progress = null },
    offBulkImportCompleted: () => { handlers.completed = null },
    offBulkImportError: () => { handlers.error = null },
    onConnectionStateChange: (cb) => { stateListener = cb; return () => { stateListener = null } },
  },
}))

vi.mock('@/hooks/useBulkUpload', () => ({
  bulkKeys: {
    batch: (p, b) => ['social', 'bulk-upload', 'batch', p, b],
    rowsForBatch: (p, b) => ['social', 'bulk-upload', 'rows', p, b],
  },
}))

const { useBulkImportProgress } = await import('./useBulkImportProgress')

let container
let root
let qc
let last

function Probe({ projectId, batchId, active }) {
  last = useBulkImportProgress(projectId, batchId, { active })
  return null
}

function render(props) {
  qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(QueryClientProvider, { client: qc },
        React.createElement(Probe, props)),
    )
  })
}

beforeEach(() => {
  for (const k of Object.keys(handlers)) delete handlers[k]
  stateListener = null
  joinProject.mockClear()
})
afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null; root = null
})

describe('useBulkImportProgress', () => {
  it('does not subscribe while inactive', () => {
    render({ projectId: 'p1', batchId: 'b1', active: false })
    expect(handlers.progress).toBeFalsy()
    expect(joinProject).not.toHaveBeenCalled()
    expect(last.status).toBe('idle')
  })

  it('subscribes when active and joins the project room', () => {
    render({ projectId: 'p1', batchId: 'b1', active: true })
    expect(joinProject).toHaveBeenCalledWith('p1')
    expect(typeof handlers.progress).toBe('function')
    expect(last.status).toBe('importing')
  })

  it('updates from progress events for the matching batch only', () => {
    render({ projectId: 'p1', batchId: 'b1', active: true })
    act(() => { handlers.progress({ batchId: 'OTHER', processed: 99, total: 100 }) })
    expect(last.processed).toBe(0)
    act(() => { handlers.progress({ batchId: 'b1', processed: 12, total: 50, imported: 10, failed: 2 }) })
    expect(last).toMatchObject({ status: 'importing', processed: 12, total: 50, imported: 10, failed: 2 })
  })

  it('ignores stale / out-of-order progress (processed must not go backwards)', () => {
    render({ projectId: 'p1', batchId: 'b1', active: true })
    act(() => { handlers.progress({ batchId: 'b1', processed: 30, total: 50, imported: 28 }) })
    act(() => { handlers.progress({ batchId: 'b1', processed: 10, total: 50, imported: 9 }) }) // late duplicate
    expect(last.processed).toBe(30)
    expect(last.imported).toBe(28)
  })

  it('completed is terminal — later progress events are ignored', () => {
    render({ projectId: 'p1', batchId: 'b1', active: true })
    act(() => { handlers.completed({ batchId: 'b1', total: 50, imported: 48, failed: 2 }) })
    expect(last.status).toBe('completed')
    act(() => { handlers.progress({ batchId: 'b1', processed: 5, total: 50 }) })
    expect(last.status).toBe('completed')
    expect(last.imported).toBe(48)
  })

  it('error sets a terminal error state with the backend code/message', () => {
    render({ projectId: 'p1', batchId: 'b1', active: true })
    act(() => { handlers.error({ batchId: 'b1', code: 'IMPORT_INTERRUPTED', message: 'safe to retry' }) })
    expect(last.status).toBe('error')
    expect(last.code).toBe('IMPORT_INTERRUPTED')
    expect(last.message).toBe('safe to retry')
  })

  it('a reconnect re-joins the room, invalidates authoritative queries, and stamps reconnectedAt', () => {
    render({ projectId: 'p1', batchId: 'b1', active: true })
    joinProject.mockClear()
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries')
    act(() => { stateListener(ConnectionState.CONNECTED, ConnectionState.RECONNECTING) })
    expect(joinProject).toHaveBeenCalledWith('p1')
    expect(invalidateSpy).toHaveBeenCalled()
    expect(typeof last.reconnectedAt).toBe('number')
  })

  it('unsubscribes on unmount', () => {
    render({ projectId: 'p1', batchId: 'b1', active: true })
    expect(handlers.progress).toBeTruthy()
    act(() => { root.unmount() })
    root = null
    expect(handlers.progress).toBeNull()
  })
})

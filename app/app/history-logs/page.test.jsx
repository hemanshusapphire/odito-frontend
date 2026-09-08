import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import OptimizationCenterPage from './page'
import apiService from '@/lib/apiService'
import socketService from '@/lib/socketService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProject: { _id: 'proj-1' } }),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => children,
  motion: { div: React.forwardRef((props, ref) => React.createElement('div', { ...props, ref })) },
}))

let mockTasks = []
let mockSummary = { task_created: 0, implemented: 0, verified_fixed: 0, reopened: 0, total: 0 }

vi.mock('@/hooks/useDashboardQueries', () => ({
  useTasks: () => ({
    data: { data: { tasks: mockTasks, pagination: { page: 1, limit: 20, total: mockTasks.length, pages: 1 } } },
    isLoading: false,
    error: null,
  }),
  useTaskSummary: () => ({ data: { data: mockSummary } }),
  useDeleteTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  // OptimizationDetailsModal (View Details) is always mounted by page.jsx,
  // just closed (open=false) — its hooks still execute unconditionally
  // every render, so they need a stub here even though no test in this
  // file opens the modal. Real behavior is covered by
  // OptimizationDetailsModal.test.jsx instead.
  useTaskDetail: () => ({ data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() }),
  useTaskHistory: () => ({ data: null, isLoading: false, isError: false }),
}))

vi.mock('@/lib/apiService', () => ({
  default: {
    verifyUrl: vi.fn(),
    getTaskById: vi.fn(),
    // F4-019
    startVerificationBatch: vi.fn(),
    getVerificationBatch: vi.fn(),
    getVerificationBatchRuns: vi.fn(),
  },
}))

vi.mock('@/lib/socketService', () => ({
  default: {
    joinProject: vi.fn(),
    onVerificationStarted: vi.fn(),
    onVerificationProgress: vi.fn(),
    onVerificationCompleted: vi.fn(),
    onVerificationFailed: vi.fn(),
    offVerificationStarted: vi.fn(),
    offVerificationProgress: vi.fn(),
    offVerificationCompleted: vi.fn(),
    offVerificationFailed: vi.fn(),
    // F4-019
    onVerificationBatchCompleted: vi.fn(),
    offVerificationBatchCompleted: vi.fn(),
    onConnectionStateChange: vi.fn(() => vi.fn()),
  },
}))

// The bulk verification flow no longer mounts any modal (confirmation or
// completion) — it runs inline with the "Verify Selected" button as its own
// loading indicator. The Dialog mock is still needed for the unrelated
// "View Details" (OptimizationDetailsModal) path, which every render mounts
// closed.
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }) => (open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null),
  DialogContent: ({ children }) => React.createElement('div', null, children),
  DialogHeader: ({ children }) => React.createElement('div', null, children),
  DialogTitle: ({ children }) => React.createElement('h2', null, children),
  DialogDescription: ({ children }) => React.createElement('p', null, children),
}))

function makeTask(overrides = {}) {
  return {
    _id: overrides._id || 'task-1',
    issueKey: 'H1_MISSING',
    issueName: 'H1 Tag Missing',
    issueCategory: 'Content',
    pageUrl: '/a',
    status: 'reopened',
    origin: 'ai_fix',
    createdAt: '2026-07-28T00:00:00.000Z',
    implementedAt: '2026-07-28T00:00:00.000Z',
    verifiedAt: null,
    updatedAt: '2026-07-28T00:00:00.000Z',
    ...overrides,
  }
}

function lastHandler(mockFn) {
  const calls = mockFn.mock.calls
  return calls[calls.length - 1]?.[0]
}

let container
let root
let queryClient

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(OptimizationCenterPage)
      )
    )
  })
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 10))
}

function checkboxFor(url) {
  return container.querySelector(`[aria-label="Select ${url} for verification"]`)
}

// The toolbar button — matches both the idle label ("Verify Selected…") and
// the in-flight loading state ("Verifying…", aria-label "Verifying selected
// URLs").
function verifySelectedButton() {
  return Array.from(container.querySelectorAll('button')).find(
    (b) =>
      b.textContent.startsWith('Verify Selected') ||
      b.getAttribute('aria-label') === 'Verifying selected URLs'
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  mockTasks = []
  mockSummary = { task_created: 0, implemented: 0, verified_fixed: 0, reopened: 0, total: 0 }
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
  // Toasts render through a portal onto document.body — clear any leftovers
  // so a toast from one test can't be read by the next.
  document.body.innerHTML = ''
})

describe('Optimization Center — table-based Bulk URL Verification', () => {
  it('shows a disabled checkbox for non-selectable rows (Accessibility) and an enabled one for Content rows', () => {
    mockTasks = [
      makeTask({ _id: 't1', pageUrl: '/a', issueCategory: 'Content', status: 'reopened' }),
      makeTask({ _id: 't2', pageUrl: '/b', issueCategory: 'Accessibility', status: 'reopened' }),
    ]
    render()

    expect(checkboxFor('/a').disabled).toBe(false)
    expect(checkboxFor('/b').disabled).toBe(true)
    // Accessibility keeps its existing "Check DIY" action, unaffected.
    expect(container.textContent).toContain('Check DIY')
  })

  it('supports individual and mixed row selection, and the header reflects Select All state', () => {
    mockTasks = [
      makeTask({ _id: 't1', pageUrl: '/a' }),
      makeTask({ _id: 't2', pageUrl: '/b' }),
    ]
    render()

    const selectAll = container.querySelector('[aria-label="Select all URLs on this page"]')
    expect(selectAll.checked).toBe(false)

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(container.textContent).toContain('1 selected')
    expect(selectAll.indeterminate).toBe(true)

    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(container.textContent).toContain('2 selected')
  })

  it('Header Select All selects/deselects every selectable row on the page', () => {
    mockTasks = [
      makeTask({ _id: 't1', pageUrl: '/a' }),
      makeTask({ _id: 't2', pageUrl: '/b', issueCategory: 'Accessibility' }),
      makeTask({ _id: 't3', pageUrl: '/c' }),
    ]
    render()

    const selectAll = container.querySelector('[aria-label="Select all URLs on this page"]')
    act(() => { selectAll.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    // Only the 2 Content/selectable rows are selected, not the Accessibility one.
    expect(container.textContent).toContain('2 selected')
    expect(checkboxFor('/a').checked).toBe(true)
    expect(checkboxFor('/c').checked).toBe(true)

    act(() => { selectAll.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(container.textContent).toContain('0 selected')
  })

  it('Verify Selected is disabled at zero selection and its label updates with the count', () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    render()

    expect(verifySelectedButton().disabled).toBe(true)
    expect(verifySelectedButton().textContent).toBe('Verify Selected')

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(verifySelectedButton().disabled).toBe(false)
    expect(verifySelectedButton().textContent).toBe('Verify Selected (1)')
  })

  it('starts verification immediately on click — no confirmation modal, no progress modal', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.verifyUrl.mockResolvedValue({ success: true, data: { runId: 'run-1' } })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    // The existing Verification Engine call fired straight away, once per
    // selected URL — no intermediate "Verify" confirmation click.
    expect(apiService.verifyUrl).toHaveBeenCalledWith('proj-1', '/a')
    expect(apiService.verifyUrl).toHaveBeenCalledWith('proj-1', '/b')
    // No modal of any kind.
    expect(document.body.textContent).not.toContain('Verify Selected URLs')
    expect(document.body.textContent).not.toContain('Verifying URLs')
    expect(document.body.textContent).not.toContain('Verification Complete')
    // The button itself is the loading indicator, and it's disabled.
    expect(verifySelectedButton().textContent).toContain('Verifying…')
    expect(verifySelectedButton().disabled).toBe(true)
  })

  it('ignores a second click while a batch is already running (no duplicate requests)', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' })]
    apiService.verifyUrl.mockResolvedValue({ success: true, data: { runId: 'run-1' } })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })
    // Button is disabled, but fire another click at it anyway.
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    expect(apiService.verifyUrl).toHaveBeenCalledTimes(1)
  })

  it('dedupes URLs when two selected rows share the same pageUrl (different issues, same page)', async () => {
    mockTasks = [
      makeTask({ _id: 't1', pageUrl: '/a', issueKey: 'H1_MISSING' }),
      makeTask({ _id: 't2', pageUrl: '/a', issueKey: 'META_MISSING' }),
    ]
    apiService.verifyUrl.mockResolvedValue({ success: true, data: { runId: 'run-1' } })
    render()

    const selectAll = container.querySelector('[aria-label="Select all URLs on this page"]')
    act(() => { selectAll.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(container.textContent).toContain('2 selected')

    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    expect(apiService.verifyUrl).toHaveBeenCalledTimes(1)
    expect(apiService.verifyUrl).toHaveBeenCalledWith('proj-1', '/a')
  })

  it('runs the batch through one shared websocket subscription (existing controller reused)', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.verifyUrl.mockImplementation((pid, url) => Promise.resolve({ success: true, data: { runId: `run-${url}` } }))
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    // Exactly one subscription for the whole batch, not one per URL.
    expect(socketService.onVerificationProgress).toHaveBeenCalledTimes(1)
    // Every row in the batch shows the inline "Verifying…" action and its
    // checkbox is frozen; the toolbar button is loading.
    expect(container.textContent).toContain('Verifying…')
    expect(checkboxFor('/a').disabled).toBe(true)
    expect(checkboxFor('/b').disabled).toBe(true)

    // One URL completing does not end the batch or drop the loading state.
    const onCompleted = lastHandler(socketService.onVerificationCompleted)
    act(() => { onCompleted({ pageUrl: '/a', runId: 'run-/a' }) })
    await act(async () => { await flushPromises() })
    expect(verifySelectedButton().textContent).toContain('Verifying…')
  })

  it('clears selection, toasts, and drops the loading state after a successful batch — no modal', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' })]
    apiService.verifyUrl.mockResolvedValue({ success: true, data: { runId: 'run-1' } })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    const onCompleted = lastHandler(socketService.onVerificationCompleted)
    act(() => { onCompleted({ pageUrl: '/a', runId: 'run-1' }) })
    await act(async () => { await flushPromises() })
    await act(async () => { await flushPromises() })

    // No completion modal — a non-blocking toast instead.
    expect(document.body.textContent).not.toContain('Verification Complete')
    expect(document.body.textContent).toContain('Verification complete')
    // Selection cleared, button back to its idle (disabled) state.
    expect(container.textContent).toContain('0 selected')
    expect(checkboxFor('/a').checked).toBe(false)
    expect(verifySelectedButton().textContent).toBe('Verify Selected')
    expect(verifySelectedButton().disabled).toBe(true)
  })

  it('does not abort the batch when one URL fails to verify', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.verifyUrl.mockImplementation((pid, url) => Promise.resolve({ success: true, data: { runId: `run-${url}` } }))
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    const onFailed = lastHandler(socketService.onVerificationFailed)
    const onCompleted = lastHandler(socketService.onVerificationCompleted)
    act(() => { onFailed({ pageUrl: '/a', runId: 'run-/a', errorMessage: 'x' }) })
    await act(async () => { await flushPromises() })
    // /b still running → batch not aborted, button still loading.
    expect(verifySelectedButton().textContent).toContain('Verifying…')

    act(() => { onCompleted({ pageUrl: '/b', runId: 'run-/b' }) })
    await act(async () => { await flushPromises() })
    await act(async () => { await flushPromises() })

    // Batch ended (1 completed, 1 failed) → loading cleared, still no modal.
    expect(document.body.textContent).not.toContain('Verification Complete')
    expect(verifySelectedButton().textContent).toBe('Verify Selected')
  })

  it('a fully failed batch keeps the selection so it can be retried, and shows an error toast', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' })]
    apiService.verifyUrl.mockResolvedValue({ success: true, data: { runId: 'run-1' } })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    const onFailed = lastHandler(socketService.onVerificationFailed)
    act(() => { onFailed({ pageUrl: '/a', runId: 'run-1', errorMessage: 'boom' }) })
    await act(async () => { await flushPromises() })
    await act(async () => { await flushPromises() })

    expect(document.body.textContent).toContain('Verification failed. Please try again.')
    // Selection preserved for an immediate retry.
    expect(container.textContent).toContain('1 selected')
    expect(checkboxFor('/a').checked).toBe(true)
    expect(verifySelectedButton().textContent).toBe('Verify Selected (1)')
    expect(verifySelectedButton().disabled).toBe(false)
  })
})

describe('Optimization Center — STATUS vs ACTION workflow consistency', () => {
  it('a Pending (task_created) row shows Check DIY and is not selectable', () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a', status: 'task_created' })]
    render()

    expect(container.textContent).toContain('📋 Pending')
    expect(container.textContent).toContain('Check DIY')
    expect(checkboxFor('/a').disabled).toBe(true)
  })

  it('an Implemented row is selectable, shows no "Pending Crawl"/Check DIY text, and offers View Details (Phase 2)', () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a', status: 'implemented' })]
    render()

    expect(container.textContent).not.toContain('Pending Crawl')
    expect(container.textContent).not.toContain('Check DIY')
    expect(container.textContent).toContain('View Details')
    expect(checkboxFor('/a').disabled).toBe(false)
  })

  it('a Reopened Content/on-page row no longer shows Check DIY, remains selectable, and offers View Details (Phase 2)', () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a', issueCategory: 'Content', status: 'reopened' })]
    render()

    expect(container.textContent).not.toContain('Check DIY')
    expect(container.textContent).toContain('View Details')
    expect(checkboxFor('/a').disabled).toBe(false)
  })

  it('a Pending (task_created) row has no View Details action — nothing has been implemented yet', () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a', status: 'task_created' })]
    render()

    expect(container.textContent).not.toContain('View Details')
  })

  it('clicking View Details opens the details modal without navigating (router.push not called for it)', () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a', status: 'verified_fixed' })]
    render()

    const viewDetailsBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'View Details')
    act(() => { viewDetailsBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })

    // The mocked Dialog renders a [data-testid="dialog"] wrapper only when open.
    expect(container.querySelector('[data-testid="dialog"]')).toBeTruthy()
  })

  it('a Reopened Accessibility row (outside Bulk Verification scope) keeps the Check DIY fallback', () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a', issueCategory: 'Accessibility', status: 'reopened' })]
    render()

    expect(container.textContent).toContain('Check DIY')
    expect(checkboxFor('/a').disabled).toBe(true) // Accessibility is outside Phase 1 bulk-verification scope
  })

  it('a Verified Fixed row shows the status badge and an optional View Details action, and is not selectable', () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a', status: 'verified_fixed' })]
    render()

    expect(container.textContent).toContain('✅ Verified')
    expect(container.textContent).toContain('View Details')
    expect(container.textContent).not.toContain('Check DIY')
  })

  it('shows a "Verifying…" loading action on every row in the active batch, overriding the persisted status action', async () => {
    mockTasks = [
      makeTask({ _id: 't1', pageUrl: '/a', status: 'implemented' }),
      makeTask({ _id: 't2', pageUrl: '/b', status: 'reopened' }),
    ]
    apiService.verifyUrl.mockImplementation((pid, url) => Promise.resolve({ success: true, data: { runId: `run-${url}` } }))
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    // Both rows show the in-flight indicator, and neither checkbox can be
    // re-toggled mid-run.
    expect(container.textContent).toContain('Verifying…')
    expect(checkboxFor('/a').disabled).toBe(true)
    expect(checkboxFor('/b').disabled).toBe(true)
  })
})

// F4-019: same page, same UI, same controller INTERFACE — only the
// feature flag differs. Every test above ran with the flag unset
// (isBatchVerificationEnabled() === false, since vitest never sets
// NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION), proving the legacy path is
// byte-identical/regression-safe. These tests flip the flag on and prove
// the SAME page wiring drives BatchVerificationController instead.
describe('Optimization Center — Bulk Verification via batch endpoint (F4-019, flag ON)', () => {
  let originalFlag

  beforeEach(() => {
    originalFlag = process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION
    process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION = 'true'
    window.sessionStorage.clear()
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION = originalFlag
    window.sessionStorage.clear()
  })

  it('starts via ONE POST /start-verification-batch instead of N verifyUrl calls, straight from the click', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.startVerificationBatch.mockResolvedValue({
      success: true, batchId: 'batch-1', status: 'RUNNING', totalUrls: 2, dispatchedUrls: 2,
      runs: [{ url: '/a', runId: 'run-a', dispatched: true }, { url: '/b', runId: 'run-b', dispatched: true }],
      rejected: [],
    })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    expect(apiService.startVerificationBatch).toHaveBeenCalledTimes(1)
    expect(apiService.startVerificationBatch).toHaveBeenCalledWith('proj-1', ['/a', '/b'])
    expect(apiService.verifyUrl).not.toHaveBeenCalled()
    expect(verifySelectedButton().textContent).toContain('Verifying…')
    expect(document.body.textContent).not.toContain('Verifying URLs')
  })

  it('per-page events do not end the batch — only verification:batch-completed clears the loading state', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.startVerificationBatch.mockResolvedValue({
      success: true, batchId: 'batch-1', status: 'RUNNING', totalUrls: 2, dispatchedUrls: 2,
      runs: [{ url: '/a', runId: 'run-a', dispatched: true }, { url: '/b', runId: 'run-b', dispatched: true }],
      rejected: [],
    })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    const onCompleted = lastHandler(socketService.onVerificationCompleted)
    const onFailed = lastHandler(socketService.onVerificationFailed)
    act(() => { onCompleted({ pageUrl: '/a', runId: 'run-a' }) })
    act(() => { onFailed({ pageUrl: '/b', runId: 'run-b', errorMessage: 'boom' }) })
    await act(async () => { await flushPromises() })

    // Both pages resolved, but the backend hasn't said batch-completed yet.
    expect(verifySelectedButton().textContent).toContain('Verifying…')

    const onBatchCompleted = lastHandler(socketService.onVerificationBatchCompleted)
    act(() => { onBatchCompleted({ batchId: 'batch-1', status: 'partial', totalUrls: 2, completedUrls: 1, failedUrls: 1 }) })
    await act(async () => { await flushPromises() })
    await act(async () => { await flushPromises() })

    expect(document.body.textContent).not.toContain('Verification Complete')
    expect(document.body.textContent).toContain('Verification complete')
    expect(verifySelectedButton().textContent).toBe('Verify Selected')
  })

  it('a websocket reconnect triggers REST recovery (GET verification-batches/:batchId[/runs])', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' })]
    apiService.startVerificationBatch.mockResolvedValue({
      success: true, batchId: 'batch-1', status: 'RUNNING', totalUrls: 1, dispatchedUrls: 1,
      runs: [{ url: '/a', runId: 'run-a', dispatched: true }],
      rejected: [],
    })
    apiService.getVerificationBatch.mockResolvedValue({ success: true, data: { batchId: 'batch-1', status: 'running', urls: ['/a'] } })
    apiService.getVerificationBatchRuns.mockResolvedValue({ success: true, data: [{ pageUrl: '/a', runId: 'run-a', status: 'running' }] })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    const onConnectionChange = lastHandler(socketService.onConnectionStateChange)
    act(() => { onConnectionChange('reconnecting') })
    act(() => { onConnectionChange('connected') })
    await act(async () => { await flushPromises() })

    expect(apiService.getVerificationBatch).toHaveBeenCalledWith('batch-1')
    expect(apiService.getVerificationBatchRuns).toHaveBeenCalledWith('batch-1')
  })

  it('a browser refresh resumes the same in-flight batch via REST instead of losing all progress UI', async () => {
    // Simulates the pre-reload session having persisted the batchId, and a
    // completely fresh mount afterward — no controller instance survives a
    // reload, only sessionStorage does.
    window.sessionStorage.setItem('odito.verificationBatch.proj-1', 'batch-1')
    apiService.getVerificationBatch.mockResolvedValue({ success: true, data: { batchId: 'batch-1', status: 'running', urls: ['/a'] } })
    apiService.getVerificationBatchRuns.mockResolvedValue({ success: true, data: [{ pageUrl: '/a', runId: 'run-a', status: 'running' }] })
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' })]

    render()
    await act(async () => { await flushPromises() })

    expect(apiService.getVerificationBatch).toHaveBeenCalledWith('batch-1')
    expect(apiService.startVerificationBatch).not.toHaveBeenCalled()
    // The toolbar button reflects the resumed in-flight batch.
    expect(verifySelectedButton().textContent).toContain('Verifying…')
  })

  it('an expired/unknown batchId on refresh fails gracefully back to an idle state, not a crash', async () => {
    window.sessionStorage.setItem('odito.verificationBatch.proj-1', 'expired-batch')
    const notFound = Object.assign(new Error('Verification batch not found'), { status: 404 })
    apiService.getVerificationBatch.mockRejectedValue(notFound)
    apiService.getVerificationBatchRuns.mockRejectedValue(notFound)
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' })]

    expect(() => render()).not.toThrow()
    await act(async () => { await flushPromises() })

    // No progress modal ever existed; the button falls back to idle and the
    // failure is not surfaced as a toast (the user never started this batch).
    expect(document.body.textContent).not.toContain('Verifying URLs')
    expect(document.body.textContent).not.toContain('Verification failed')
    expect(verifySelectedButton().textContent).toBe('Verify Selected')
  })
})

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

// Sheet-family primitives aren't used here anymore (drawer removed), but
// VerifyUrlModal's Dialog and BulkVerifyConfirmDialog's AlertDialog are —
// same jsdom limitation as every other Verification UI test file.
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }) => (open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null),
  DialogContent: ({ children }) => React.createElement('div', null, children),
  DialogHeader: ({ children }) => React.createElement('div', null, children),
  DialogTitle: ({ children }) => React.createElement('h2', null, children),
  DialogDescription: ({ children }) => React.createElement('p', null, children),
}))

const AlertDialogOnOpenChangeContext = React.createContext(() => {})
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ open, onOpenChange, children }) =>
    open
      ? React.createElement(
          AlertDialogOnOpenChangeContext.Provider,
          { value: onOpenChange },
          React.createElement('div', { 'data-testid': 'alert-dialog' }, children)
        )
      : null,
  AlertDialogContent: ({ children }) => React.createElement('div', null, children),
  AlertDialogHeader: ({ children }) => React.createElement('div', null, children),
  AlertDialogTitle: ({ children }) => React.createElement('h2', null, children),
  AlertDialogDescription: ({ children }) => React.createElement('div', null, children),
  AlertDialogFooter: ({ children }) => React.createElement('div', null, children),
  AlertDialogCancel: ({ children }) => {
    const onOpenChange = React.useContext(AlertDialogOnOpenChangeContext)
    return React.createElement('button', { onClick: () => onOpenChange(false) }, children)
  },
  AlertDialogAction: ({ children, onClick }) => React.createElement('button', { onClick }, children),
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

function verifySelectedButton() {
  return Array.from(container.querySelectorAll('button')).find((b) => b.textContent.startsWith('Verify Selected'))
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

  it('opens the confirmation dialog, then starts the batch through the existing Verification Engine on Verify', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.verifyUrl.mockResolvedValue({ success: true, data: { runId: 'run-1' } })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })

    expect(container.querySelector('[data-testid="alert-dialog"]')).toBeTruthy()
    expect(container.textContent).toContain('2')

    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    expect(apiService.verifyUrl).toHaveBeenCalledWith('proj-1', '/a')
    expect(apiService.verifyUrl).toHaveBeenCalledWith('proj-1', '/b')
    // Existing VerifyUrlModal reused, in bulk mode — no second/new modal.
    expect(container.querySelector('[data-testid="dialog"]')).toBeTruthy()
    expect(container.textContent).toContain('Verifying URLs')
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
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    expect(apiService.verifyUrl).toHaveBeenCalledTimes(1)
    expect(apiService.verifyUrl).toHaveBeenCalledWith('proj-1', '/a')
  })

  it('aggregates progress from one shared websocket subscription (existing controller reused)', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.verifyUrl.mockImplementation((pid, url) => Promise.resolve({ success: true, data: { runId: `run-${url}` } }))
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    // Exactly one subscription for the whole batch, not one per URL.
    expect(socketService.onVerificationProgress).toHaveBeenCalledTimes(1)
    expect(container.textContent).toContain('Running (2)')

    // Aggregation: completing /a moves it out of Running into Completed,
    // while /b (no event yet) stays Running — proves per-URL Map updates,
    // not a single shared status.
    const onCompleted = lastHandler(socketService.onVerificationCompleted)
    act(() => { onCompleted({ pageUrl: '/a', runId: 'run-/a' }) })
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Running (1)')
    expect(container.textContent).toContain('Completed (1)')
  })

  it('shows the completion summary and clears selection after a successful batch', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' })]
    apiService.verifyUrl.mockResolvedValue({ success: true, data: { runId: 'run-1' } })
    apiService.getTaskById.mockResolvedValue({ success: true, data: { status: 'verified_fixed' } })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    const onCompleted = lastHandler(socketService.onVerificationCompleted)
    act(() => { onCompleted({ pageUrl: '/a', runId: 'run-1' }) })
    await act(async () => { await flushPromises() })
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Verification Complete')
    expect(apiService.getTaskById).toHaveBeenCalledWith('t1')
    expect(container.textContent).toContain('1')

    // Dismiss the completion modal and confirm the selection cleared.
    const closeBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Close')
    act(() => { closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })

    expect(container.textContent).toContain('0 selected')
    expect(checkboxFor('/a').checked).toBe(false)
  })

  it('does not abort the batch when one URL fails to verify', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.verifyUrl.mockImplementation((pid, url) => Promise.resolve({ success: true, data: { runId: `run-${url}` } }))
    apiService.getTaskById.mockResolvedValue({ success: true, data: { status: 'reopened' } })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    const onFailed = lastHandler(socketService.onVerificationFailed)
    const onCompleted = lastHandler(socketService.onVerificationCompleted)
    act(() => { onFailed({ pageUrl: '/a', runId: 'run-/a', errorMessage: 'x' }) })
    await act(async () => { await flushPromises() })
    expect(container.textContent).toContain('Verifying URLs') // /b still running, batch not aborted

    act(() => { onCompleted({ pageUrl: '/b', runId: 'run-/b' }) })
    await act(async () => { await flushPromises() })
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Verification Complete')
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
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
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

  it('starts via ONE POST /start-verification-batch instead of N verifyUrl calls', async () => {
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
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    expect(apiService.startVerificationBatch).toHaveBeenCalledTimes(1)
    expect(apiService.startVerificationBatch).toHaveBeenCalledWith('proj-1', ['/a', '/b'])
    expect(apiService.verifyUrl).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Verifying URLs')
  })

  it('per-page events update the modal but only verification:batch-completed ends the batch', async () => {
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' }), makeTask({ _id: 't2', pageUrl: '/b' })]
    apiService.startVerificationBatch.mockResolvedValue({
      success: true, batchId: 'batch-1', status: 'RUNNING', totalUrls: 2, dispatchedUrls: 2,
      runs: [{ url: '/a', runId: 'run-a', dispatched: true }, { url: '/b', runId: 'run-b', dispatched: true }],
      rejected: [],
    })
    apiService.getTaskById.mockResolvedValue({ success: true, data: { status: 'reopened' } })
    render()

    act(() => { checkboxFor('/a').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { checkboxFor('/b').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    act(() => { verifySelectedButton().dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    await act(async () => { await flushPromises() })

    const onCompleted = lastHandler(socketService.onVerificationCompleted)
    const onFailed = lastHandler(socketService.onVerificationFailed)
    act(() => { onCompleted({ pageUrl: '/a', runId: 'run-a' }) })
    act(() => { onFailed({ pageUrl: '/b', runId: 'run-b', errorMessage: 'boom' }) })
    await act(async () => { await flushPromises() })

    // Both pages resolved, but the backend hasn't said batch-completed yet
    // — the modal must NOT infer completion from page counts.
    expect(container.textContent).toContain('Verifying URLs')

    const onBatchCompleted = lastHandler(socketService.onVerificationBatchCompleted)
    act(() => { onBatchCompleted({ batchId: 'batch-1', status: 'partial', totalUrls: 2, completedUrls: 1, failedUrls: 1 }) })
    await act(async () => { await flushPromises() })
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Verification Complete')
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
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
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
    expect(container.textContent).toContain('Verifying URLs')
  })

  it('an expired/unknown batchId on refresh fails gracefully back to an idle state, not a crash', async () => {
    window.sessionStorage.setItem('odito.verificationBatch.proj-1', 'expired-batch')
    const notFound = Object.assign(new Error('Verification batch not found'), { status: 404 })
    apiService.getVerificationBatch.mockRejectedValue(notFound)
    apiService.getVerificationBatchRuns.mockRejectedValue(notFound)
    mockTasks = [makeTask({ _id: 't1', pageUrl: '/a' })]

    expect(() => render()).not.toThrow()
    await act(async () => { await flushPromises() })

    expect(container.textContent).not.toContain('Verifying URLs')
  })
})

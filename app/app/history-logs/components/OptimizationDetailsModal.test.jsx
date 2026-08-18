import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import OptimizationDetailsModal from './OptimizationDetailsModal'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }) => (open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null),
  DialogContent: ({ children }) => React.createElement('div', null, children),
  DialogTitle: ({ children }) => React.createElement('h2', null, children),
  DialogDescription: ({ children }) => React.createElement('div', null, children),
}))

let mockDetail = { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() }
let mockHistory = { data: null, isLoading: false, isError: false }

vi.mock('@/hooks/useDashboardQueries', () => ({
  useTaskDetail: () => mockDetail,
  useTaskHistory: () => mockHistory,
}))

function baseTask(overrides = {}) {
  return {
    _id: 'task-1',
    issueKey: 'meta_description_missing',
    issueName: 'Meta Description Missing',
    issueCategory: 'Content',
    pageUrl: 'https://example.com/page',
    status: 'verified_fixed',
    origin: 'ai_fix',
    implementedAt: '2026-07-30T00:00:00.000Z',
    verifiedAt: '2026-07-30T00:00:00.000Z',
    reopenedAt: null,
    attemptCount: 1,
    hasOlderAttempts: false,
    historyAvailable: true,
    latestAttempt: {
      attemptNumber: 1,
      attemptKind: 'fix_attempt',
      origin: 'ai_fix',
      status: 'verified_fixed',
      before: {
        source: 'structured_snapshot',
        dataPath: 'meta_tags.description',
        value: { type: 'meta_description', metaDescription: null },
      },
      fixApplied: {
        capturedAt: '2026-07-30T00:00:00.000Z',
        recommendationId: 'rec-1',
        recommendationVersion: 1,
        snapshot: {
          recommendedFix: 'Added a meta description',
          contentRewrite: { optimized: 'Professional graphic design and video services for growing brands.' },
        },
        expectedAfterValue: { type: 'meta_description', metaDescription: 'Professional graphic design and video services for growing brands.' },
      },
      implementedAt: '2026-07-30T00:00:00.000Z',
      verification: {
        verifiedAt: '2026-07-30T00:00:00.000Z',
        method: 'value_diff',
        result: 'verified_fixed',
        matched: true,
        after: { source: 'structured_snapshot', value: { type: 'meta_description', metaDescription: 'Professional graphic design and video services for growing brands.' } },
        triggerJobId: 'job-1',
      },
    },
    ...overrides,
  }
}

let container
let root

function render(ui) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => { root.render(ui) })
}

beforeEach(() => {
  mockDetail = { data: null, isLoading: false, isError: false, error: null, refetch: vi.fn() }
  mockHistory = { data: null, isLoading: false, isError: false }
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('OptimizationDetailsModal', () => {
  it('renders nothing (no dialog) when closed', () => {
    render(<OptimizationDetailsModal taskId={null} open={false} onOpenChange={() => {}} />)
    expect(container.querySelector('[data-testid="dialog"]')).toBeFalsy()
  })

  it('shows a skeleton while loading', () => {
    mockDetail = { data: null, isLoading: true, isError: false, error: null, refetch: vi.fn() }
    render(<OptimizationDetailsModal taskId="task-1" open onOpenChange={() => {}} />)
    // Skeleton renders placeholder blocks, not the real issue name yet.
    expect(container.textContent).not.toContain('Meta Description Missing')
  })

  it('renders real Before/Fix Applied/After/Verification data for a verified task — no fake values', () => {
    mockDetail = { data: { success: true, data: baseTask() }, isLoading: false, isError: false, error: null, refetch: vi.fn() }
    render(<OptimizationDetailsModal taskId="task-1" open onOpenChange={() => {}} />)

    expect(container.textContent).toContain('Meta Description Missing')
    expect(container.textContent).toContain('https://example.com/page')
    // Before: structured snapshot with null metaDescription -> "Missing"
    expect(container.textContent).toContain('Missing')
    // Fix Applied: the real recommendedFix + optimized text from the mock, nothing hardcoded
    expect(container.textContent).toContain('Added a meta description')
    expect(container.textContent).toContain('Professional graphic design and video services for growing brands.')
    // After + Verification
    expect(container.textContent).toContain('Found during verification')
    expect(container.textContent).toContain('Verified Fixed')
    expect(container.textContent).toContain('Value comparison')
  })

  it('shows the reopened banner and reopened verification result for a reopened task', () => {
    const reopenedTask = baseTask({
      status: 'reopened',
      attemptCount: 2,
      hasOlderAttempts: true,
      latestAttempt: {
        ...baseTask().latestAttempt,
        attemptNumber: 2,
        status: 'reopened',
        verification: {
          verifiedAt: '2026-08-13T00:00:00.000Z',
          method: 'presence_fallback',
          result: 'reopened',
          matched: null,
          after: { source: 'unavailable', value: null },
          triggerJobId: 'job-2',
        },
      },
    })
    mockDetail = { data: { success: true, data: reopenedTask }, isLoading: false, isError: false, error: null, refetch: vi.fn() }
    render(<OptimizationDetailsModal taskId="task-1" open onOpenChange={() => {}} />)

    expect(container.textContent).toContain('Reopened')
    expect(container.textContent).toContain('previously verified as fixed')
    expect(container.textContent).toContain('still detected during verification')
    // Preserves earlier attempts — the "show earlier attempts" affordance appears
    expect(container.textContent).toContain('Show 1 earlier attempt')
  })

  it('shows a graceful fallback for a legacy task with historyAvailable:false, without fabricating before/after data', () => {
    const legacyTask = baseTask({ attemptCount: 0, hasOlderAttempts: false, latestAttempt: null, historyAvailable: false })
    mockDetail = { data: { success: true, data: legacyTask }, isLoading: false, isError: false, error: null, refetch: vi.fn() }
    render(<OptimizationDetailsModal taskId="task-1" open onOpenChange={() => {}} />)

    expect(container.textContent).toContain('Historical fix details unavailable')
    expect(container.textContent).not.toContain('Professional graphic design')
  })

  it('shows a distinct message for a task_created task with no history yet (not framed as a legacy-data gap)', () => {
    const freshTask = baseTask({ status: 'task_created', attemptCount: 0, hasOlderAttempts: false, latestAttempt: null, historyAvailable: false })
    mockDetail = { data: { success: true, data: freshTask }, isLoading: false, isError: false, error: null, refetch: vi.fn() }
    render(<OptimizationDetailsModal taskId="task-1" open onOpenChange={() => {}} />)

    expect(container.textContent).toContain('No fix implemented yet')
  })

  it('shows a 404-specific message when the task no longer exists', () => {
    mockDetail = { data: null, isLoading: false, isError: true, error: Object.assign(new Error('not found'), { status: 404 }), refetch: vi.fn() }
    render(<OptimizationDetailsModal taskId="task-1" open onOpenChange={() => {}} />)
    expect(container.textContent).toContain('no longer available')
  })

  it('shows a retry action on a generic API failure', () => {
    const refetch = vi.fn()
    mockDetail = { data: null, isLoading: false, isError: true, error: new Error('network error'), refetch }
    render(<OptimizationDetailsModal taskId="task-1" open onOpenChange={() => {}} />)

    expect(container.textContent).toContain('Unable to load issue details')
    const retryBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Retry')
    expect(retryBtn).toBeTruthy()
    act(() => { retryBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(refetch).toHaveBeenCalled()
  })

  it('presence_fallback verification never claims an exact after-value that was not captured', () => {
    const presenceTask = baseTask({
      latestAttempt: {
        ...baseTask().latestAttempt,
        fixApplied: {
          capturedAt: '2026-07-30T00:00:00.000Z',
          recommendationId: null,
          recommendationVersion: null,
          snapshot: null,
          expectedAfterValue: null,
        },
        verification: {
          verifiedAt: '2026-07-30T00:00:00.000Z',
          method: 'presence_fallback',
          result: 'verified_fixed',
          matched: null,
          after: { source: 'unavailable', value: null },
          triggerJobId: 'job-1',
        },
      },
    })
    mockDetail = { data: { success: true, data: presenceTask }, isLoading: false, isError: false, error: null, refetch: vi.fn() }
    render(<OptimizationDetailsModal taskId="task-1" open onOpenChange={() => {}} />)

    expect(container.textContent).toContain('no longer detected during verification')
    expect(container.textContent).toContain('Presence check only')
    expect(container.textContent).toContain('Marked as implemented')
  })
})

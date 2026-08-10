import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VerificationRunComparisonDrawer from './VerificationRunComparisonDrawer'
import apiService from '@/lib/apiService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Exercises the real useVerificationRun hook (useDashboardQueries.js) —
// called twice, once per runId — through a real QueryClient. Only the
// network layer is mocked.
vi.mock('@/lib/apiService', () => ({
  default: { getVerificationRun: vi.fn() },
}))

// Sheet is Radix Dialog under the hood — same jsdom limitation as
// components/ui/dialog.jsx, stubbed the same way VerifyUrlModal.test.jsx
// and VerificationRunDrawer.test.jsx already do.
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ open, children }) => (open ? React.createElement('div', { 'data-testid': 'sheet' }, children) : null),
  SheetContent: ({ children }) => React.createElement('div', null, children),
  SheetHeader: ({ children }) => React.createElement('div', null, children),
  SheetTitle: ({ children }) => React.createElement('h2', null, children),
  SheetDescription: ({ children }) => React.createElement('p', null, children),
}))

// MetricTile is an already-shipped, reused component — stubbed the same
// way VerificationResultPanel.test.jsx and VerificationRunDrawer.test.jsx
// do, to verify the comparison math this file adds without pulling in
// AuditComparisonCard's real import chain (ProjectContext, etc).
vi.mock('@/components/dashboard/overview/AuditComparisonCard', () => ({
  MetricTile: ({ label, suffix, delta }) =>
    React.createElement(
      'div',
      { 'data-testid': 'metric-tile' },
      `${label}: ${delta?.previous} -> ${delta?.current} (${delta?.direction}, ${delta?.change}) ${suffix || ''}`
    ),
}))

function makeRun(overrides = {}) {
  return {
    verificationRunId: overrides.verificationRunId || 'mongo-1',
    runId: overrides.runId || 'run-1',
    projectId: 'proj-1',
    pageUrl: 'https://example.com/page',
    status: 'completed',
    completedAt: '2026-07-20T10:00:00.000Z',
    durationMs: 30000,
    aiVisibilityStatus: 'SUCCESS',
    before: {},
    after: { pageScore: 70, aisoScore: 60, aeoScore: 55, geoScore: 50, criticalIssues: 5, warningIssues: 8, infoIssues: 2 },
    delta: {},
    errorMessage: null,
    ...overrides,
  }
}

let container
let root
let queryClient

function renderDrawer(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(VerificationRunComparisonDrawer, props)
      )
    )
  })
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 10))
}

beforeEach(() => {
  vi.clearAllMocks()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

afterEach(() => {
  if (root) {
    act(() => {
      root.unmount()
    })
  }
  if (container) container.remove()
  container = null
  root = null
})

describe('VerificationRunComparisonDrawer', () => {
  it('does not render or fetch when closed', () => {
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: false, onOpenChange: () => {} })
    expect(apiService.getVerificationRun).not.toHaveBeenCalled()
    expect(container.textContent).not.toContain('Compare Verification Runs')
  })

  it('fetches both runs by their own runId once open', () => {
    apiService.getVerificationRun.mockReturnValue(new Promise(() => {}))
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    expect(apiService.getVerificationRun).toHaveBeenCalledTimes(2)
    expect(apiService.getVerificationRun).toHaveBeenCalledWith('run-a')
    expect(apiService.getVerificationRun).toHaveBeenCalledWith('run-b')
  })

  it('shows a skeleton for whichever side is still loading', async () => {
    apiService.getVerificationRun.mockImplementation((id) => {
      if (id === 'run-a') return Promise.resolve({ success: true, data: makeRun({ runId: 'run-a' }) })
      return new Promise(() => {}) // run-b never resolves
    })
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.querySelector('.skeleton-shimmer')).toBeTruthy()
    // Metrics grid needs BOTH runs — must not render with only one resolved
    expect(container.querySelector('[data-testid="metric-tile"]')).toBeNull()
  })

  it('renders the successfully fetched run even when the other fetch fails', async () => {
    apiService.getVerificationRun.mockImplementation((id) => {
      if (id === 'run-a') return Promise.resolve({ success: true, data: makeRun({ runId: 'run-a' }) })
      return Promise.reject(new Error('Network error'))
    })
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('Run A')
    expect(container.textContent).toContain("Couldn't load Run B — showing Run A only.")
    expect(container.querySelector('[data-testid="metric-tile"]')).toBeNull()
  })

  it('shows a combined error when both fetches fail', async () => {
    apiService.getVerificationRun.mockRejectedValue(new Error('Network error'))
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain("Couldn't load either run.")
  })

  it('computes SEO/issue comparison tiles correctly when both runs load, AI Visibility SUCCESS on both', async () => {
    apiService.getVerificationRun.mockImplementation((id) => {
      if (id === 'run-a') {
        return Promise.resolve({
          success: true,
          data: makeRun({
            runId: 'run-a',
            aiVisibilityStatus: 'SUCCESS',
            after: { pageScore: 70, aisoScore: 60, aeoScore: 55, geoScore: 50, criticalIssues: 5, warningIssues: 8, infoIssues: 2 },
          }),
        })
      }
      return Promise.resolve({
        success: true,
        data: makeRun({
          runId: 'run-b',
          aiVisibilityStatus: 'SUCCESS',
          after: { pageScore: 84, aisoScore: 70, aeoScore: 55, geoScore: 60, criticalIssues: 2, warningIssues: 8, infoIssues: 2 },
        }),
      })
    })
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    // SEO score: 70 -> 84, higher is better -> improved, +14
    expect(container.textContent).toContain('SEO Score: 70 -> 84 (improved, 14)')
    // AISO/AEO/GEO all shown since both runs succeeded
    expect(container.textContent).toContain('AISO Score: 60 -> 70 (improved, 10)')
    expect(container.textContent).toContain('AEO Score: 55 -> 55 (unchanged, 0)')
    expect(container.textContent).toContain('GEO Score: 50 -> 60 (improved, 10)')
    // Critical issues: 5 -> 2, lower is better -> improved, -3
    expect(container.textContent).toContain('Critical Issues: 5 -> 2 (improved, -3)')
    // Warnings: 8 -> 8, unchanged
    expect(container.textContent).toContain('Warnings: 8 -> 8 (unchanged, 0)')
    // Issue Count total: 15 -> 12
    expect(container.textContent).toContain('Issue Count: 15 -> 12 (improved, -3)')
  })

  it('hides AI score tiles when Run A is FAILED, even if Run B succeeded', async () => {
    apiService.getVerificationRun.mockImplementation((id) => {
      if (id === 'run-a') {
        return Promise.resolve({ success: true, data: makeRun({ runId: 'run-a', aiVisibilityStatus: 'FAILED' }) })
      }
      return Promise.resolve({ success: true, data: makeRun({ runId: 'run-b', aiVisibilityStatus: 'SUCCESS' }) })
    })
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).not.toContain('AISO Score')
    expect(container.textContent).toContain('AI check failed for this run — AI score changes unavailable.')
  })

  it('hides AI score tiles when Run B is SKIPPED, even if Run A succeeded', async () => {
    apiService.getVerificationRun.mockImplementation((id) => {
      if (id === 'run-a') {
        return Promise.resolve({ success: true, data: makeRun({ runId: 'run-a', aiVisibilityStatus: 'SUCCESS' }) })
      }
      return Promise.resolve({ success: true, data: makeRun({ runId: 'run-b', aiVisibilityStatus: 'SKIPPED' }) })
    })
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).not.toContain('AISO Score')
    expect(container.textContent).toContain('Skipped for this run — AI score changes unavailable.')
  })

  it('retrying the failed side calls refetch for that run only', async () => {
    apiService.getVerificationRun.mockImplementation((id) => {
      if (id === 'run-a') return Promise.resolve({ success: true, data: makeRun({ runId: 'run-a' }) })
      return Promise.reject(new Error('Network error'))
    })
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })
    expect(apiService.getVerificationRun).toHaveBeenCalledTimes(2)

    const retryBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Retry')
    expect(retryBtn).toBeTruthy()
    act(() => {
      retryBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await act(async () => {
      await flushPromises()
    })
    // Only Run B's failed query should have been retried — Run A already
    // succeeded and its own query key wasn't touched.
    expect(apiService.getVerificationRun).toHaveBeenCalledTimes(3)
  })

  it('exposes a live region while a side is loading and role=alert on error messages', async () => {
    apiService.getVerificationRun.mockReturnValue(new Promise(() => {}))
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })
    expect(container.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy()
  })

  it('marks the combined failure message with role=alert', async () => {
    apiService.getVerificationRun.mockRejectedValue(new Error('Network error'))
    renderDrawer({ runIdA: 'run-a', runIdB: 'run-b', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })
    expect(container.querySelector('[role="alert"]')).toBeTruthy()
  })
})

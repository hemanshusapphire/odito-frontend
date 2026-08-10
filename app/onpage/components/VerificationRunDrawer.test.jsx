import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VerificationRunDrawer from './VerificationRunDrawer'
import apiService from '@/lib/apiService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Exercises the real useVerificationRun hook (useDashboardQueries.js)
// through a real QueryClient — only the network layer is mocked — so
// "correct run fetched" / "fetches only when open" are genuine assertions
// about the query's own `enabled` wiring, not about a mock.
vi.mock('@/lib/apiService', () => ({
  default: { getVerificationRun: vi.fn() },
}))

// Sheet is Radix Dialog under the hood (components/ui/sheet.jsx wraps
// @radix-ui/react-dialog, same as components/ui/dialog.jsx) — portals/
// focus-trap/pointer-capture aren't fully implemented in jsdom, and none of
// that is the code under test here. Stubbed the same way
// VerifyUrlModal.test.jsx stubs @/components/ui/dialog.
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ open, children }) => (open ? React.createElement('div', { 'data-testid': 'sheet' }, children) : null),
  SheetContent: ({ children }) => React.createElement('div', null, children),
  SheetHeader: ({ children }) => React.createElement('div', null, children),
  SheetTitle: ({ children }) => React.createElement('h2', null, children),
  SheetDescription: ({ children }) => React.createElement('p', null, children),
}))

// MetricTile (and its CSS/DeltaBadge) is an already-shipped, reused
// component — not under test here. Stubbed the same way
// VerificationResultPanel.test.jsx and VerificationMetricsGrid consumers do,
// so this file doesn't need AuditComparisonCard's real import chain
// (which transitively drags in ProjectContext/full app providers).
vi.mock('@/components/dashboard/overview/AuditComparisonCard', () => ({
  MetricTile: ({ label, suffix, delta }) =>
    React.createElement(
      'div',
      { 'data-testid': 'metric-tile' },
      `${label}: ${delta?.previous} -> ${delta?.current} (${delta?.direction}, ${delta?.change}) ${suffix || ''}`
    ),
}))

function baseRun(overrides = {}) {
  return {
    verificationRunId: 'mongo-id-1',
    runId: 'run-1',
    projectId: 'proj-1',
    pageUrl: 'https://example.com/page',
    status: 'completed',
    startedAt: '2026-07-28T10:00:00.000Z',
    completedAt: '2026-07-28T10:00:42.000Z',
    durationMs: 42500,
    aiVisibilityStatus: 'SUCCESS',
    before: { pageScore: 72, aisoScore: 60, aeoScore: 55, geoScore: 50, criticalIssues: 5, warningIssues: 8, infoIssues: 2 },
    after: { pageScore: 84, aisoScore: 70, aeoScore: 55, geoScore: 60, criticalIssues: 2, warningIssues: 8, infoIssues: 2 },
    delta: { pageScoreChange: 12, aisoScoreChange: 10, aeoScoreChange: 0, geoScoreChange: 10, issuesFixed: 3, issuesIntroduced: 0, issuesUnchanged: 12 },
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
        React.createElement(VerificationRunDrawer, props)
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

describe('VerificationRunDrawer', () => {
  it('does not render sheet content when closed, and does not fetch', () => {
    renderDrawer({ runId: 'run-1', open: false, onOpenChange: () => {} })
    expect(apiService.getVerificationRun).not.toHaveBeenCalled()
    expect(container.textContent).not.toContain('Verification Run')
  })

  it('opens and fetches the exact runId it was given', async () => {
    apiService.getVerificationRun.mockResolvedValue({ success: true, data: baseRun() })
    renderDrawer({ runId: 'run-42', open: true, onOpenChange: () => {} })

    expect(apiService.getVerificationRun).toHaveBeenCalledTimes(1)
    expect(apiService.getVerificationRun).toHaveBeenCalledWith('run-42')

    await act(async () => {
      await flushPromises()
    })
    expect(container.textContent).toContain('Verification Run')
  })

  it('shows a skeleton while loading', async () => {
    let resolvePromise
    apiService.getVerificationRun.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })

    expect(container.querySelector('.skeleton-shimmer')).toBeTruthy()
    expect(container.querySelector('[data-testid="metric-tile"]')).toBeNull()

    await act(async () => {
      resolvePromise({ success: true, data: baseRun() })
      await flushPromises()
    })
  })

  it('shows a compact inline error when the fetch fails', async () => {
    apiService.getVerificationRun.mockRejectedValue(new Error('Network error'))
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain("Couldn't load this verification run")
  })

  it('renders date, duration, status, page URL, and metric tiles when AI Visibility is SUCCESS', async () => {
    apiService.getVerificationRun.mockResolvedValue({ success: true, data: baseRun() })
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('https://example.com/page')
    expect(container.textContent).toContain('Completed')
    expect(container.textContent).toContain('AI Visibility: Updated')
    expect(container.textContent).toContain('SEO Score: 72 -> 84 (improved, 12)')
    expect(container.textContent).toContain('AISO Score: 60 -> 70 (improved, 10)')
    expect(container.textContent).toContain('AEO Score')
    expect(container.textContent).toContain('GEO Score')
  })

  it('hides AI score tiles and shows a status badge when AI Visibility is FAILED', async () => {
    apiService.getVerificationRun.mockResolvedValue({
      success: true,
      data: baseRun({
        aiVisibilityStatus: 'FAILED',
        after: { pageScore: 84, aisoScore: null, aeoScore: null, geoScore: null, criticalIssues: 2, warningIssues: 8, infoIssues: 2 },
      }),
    })
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('AI Visibility: Failed')
    expect(container.textContent).not.toContain('AISO Score')
    expect(container.textContent).toContain('AI check failed for this run — AI score changes unavailable.')
  })

  it('hides AI score tiles and shows a status badge when AI Visibility is SKIPPED', async () => {
    apiService.getVerificationRun.mockResolvedValue({
      success: true,
      data: baseRun({
        aiVisibilityStatus: 'SKIPPED',
        after: { pageScore: 84, aisoScore: null, aeoScore: null, geoScore: null, criticalIssues: 2, warningIssues: 8, infoIssues: 2 },
      }),
    })
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('AI Visibility: Skipped')
    expect(container.textContent).not.toContain('AISO Score')
    expect(container.textContent).toContain('Skipped for this run — AI score changes unavailable.')
  })

  it('keeps the Run ID hidden until "Technical Details" is expanded', async () => {
    apiService.getVerificationRun.mockResolvedValue({ success: true, data: baseRun({ runId: 'run-technical-42' }) })
    renderDrawer({ runId: 'run-technical-42', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).not.toContain('run-technical-42')

    const toggle = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Technical Details'))
    act(() => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.textContent).toContain('run-technical-42')
  })

  it('calls onOpenChange(false) when closed, without affecting the fetched run data', async () => {
    apiService.getVerificationRun.mockResolvedValue({ success: true, data: baseRun() })
    const onOpenChange = vi.fn()
    renderDrawer({ runId: 'run-1', open: true, onOpenChange })

    await act(async () => {
      await flushPromises()
    })

    // Simulate the parent flipping `open` to false (as VerificationHistoryPanel
    // does when the Sheet's own onOpenChange fires) — the drawer should just
    // stop rendering its content, no extra fetch or mutation.
    act(() => {
      root.render(
        React.createElement(
          QueryClientProvider,
          { client: queryClient },
          React.createElement(VerificationRunDrawer, { runId: 'run-1', open: false, onOpenChange })
        )
      )
    })

    expect(container.textContent).not.toContain('SEO Score')
    expect(apiService.getVerificationRun).toHaveBeenCalledTimes(1)
  })

  it('retrying after an error calls refetch and can recover', async () => {
    apiService.getVerificationRun.mockRejectedValueOnce(new Error('Network error'))
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })

    await act(async () => {
      await flushPromises()
    })
    expect(container.textContent).toContain("Couldn't load this verification run")

    apiService.getVerificationRun.mockResolvedValueOnce({ success: true, data: baseRun() })
    const retryBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Retry')
    expect(retryBtn).toBeTruthy()
    act(() => {
      retryBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await act(async () => {
      await flushPromises()
    })
    expect(apiService.getVerificationRun).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('SEO Score')
  })

  it('exposes a polite live region while loading', () => {
    apiService.getVerificationRun.mockReturnValue(new Promise(() => {}))
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })
    expect(container.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy()
  })

  it('exposes role="alert" on the error state', async () => {
    apiService.getVerificationRun.mockRejectedValue(new Error('Network error'))
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })
    await act(async () => {
      await flushPromises()
    })
    expect(container.querySelector('[role="alert"]')).toBeTruthy()
  })

  it('gives the Technical Details toggle aria-expanded and hides its chevron from screen readers', async () => {
    apiService.getVerificationRun.mockResolvedValue({ success: true, data: baseRun() })
    renderDrawer({ runId: 'run-1', open: true, onOpenChange: () => {} })
    await act(async () => {
      await flushPromises()
    })
    const toggle = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Technical Details'))
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(toggle.querySelector('svg[aria-hidden="true"]')).toBeTruthy()
  })
})

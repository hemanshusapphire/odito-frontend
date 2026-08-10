import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VerificationResultPanel from './VerificationResultPanel'
import apiService from '@/lib/apiService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Exercises the real useLatestVerification hook (useDashboardQueries.js)
// through a real QueryClient — only the network layer is mocked — so
// "fetches after completion" / "does not fetch before completion" are
// genuine assertions about the query's `enabled` wiring, not about a mock.
vi.mock('@/lib/apiService', () => ({
  default: { getLatestVerification: vi.fn() },
}))

// MetricTile itself (and its DeltaBadge/CSS) is an already-shipped, reused
// component — not under test here. It's stubbed to render its own received
// props as plain text so the assertions below verify THIS file's before/
// after/change adapter (toMetricDelta), not MetricTile's rendering, and so
// this test doesn't need to pull in AuditComparisonCard's real import chain
// (which transitively drags in ProjectContext/full app providers).
vi.mock('@/components/dashboard/overview/AuditComparisonCard', () => ({
  MetricTile: ({ label, suffix, delta }) =>
    React.createElement(
      'div',
      { className: 'comp-metric-tile', 'data-testid': 'metric-tile' },
      `${label}: ${delta?.previous} -> ${delta?.current} (${delta?.direction}, ${delta?.change}) ${suffix || ''}`
    ),
}))

function baseRun(overrides = {}) {
  return {
    verificationRunId: 'vr-1',
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

function renderPanel(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(VerificationResultPanel, props)
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

describe('VerificationResultPanel', () => {
  it('does not fetch before the verification has completed', () => {
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: false })
    expect(apiService.getLatestVerification).not.toHaveBeenCalled()
    expect(container.firstChild).toBeNull()
  })

  it('fetches the latest verification once enabled', async () => {
    apiService.getLatestVerification.mockResolvedValue({ success: true, data: baseRun() })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    expect(apiService.getLatestVerification).toHaveBeenCalledTimes(1)
    expect(apiService.getLatestVerification).toHaveBeenCalledWith('proj-1', 'https://example.com/page')

    await act(async () => {
      await flushPromises()
    })
  })

  it('shows a skeleton while loading', async () => {
    let resolvePromise
    apiService.getLatestVerification.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    expect(container.querySelector('.skeleton-shimmer')).toBeTruthy()
    expect(container.querySelector('[data-testid="metric-tile"]')).toBeNull()

    await act(async () => {
      resolvePromise({ success: true, data: baseRun() })
      await flushPromises()
    })
  })

  it('renders SEO score and issue tiles with correct before/after/change values', async () => {
    apiService.getLatestVerification.mockResolvedValue({ success: true, data: baseRun() })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('SEO Score: 72 -> 84 (improved, 12) pts')
    expect(container.textContent).toContain('Completed')
  })

  it('computes before/after/change values correctly for scores and issue counts', async () => {
    apiService.getLatestVerification.mockResolvedValue({ success: true, data: baseRun() })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    await act(async () => {
      await flushPromises()
    })

    // SEO score: 72 -> 84, higher is better -> improved, +12
    expect(container.textContent).toContain('SEO Score: 72 -> 84 (improved, 12)')
    // Critical issues: 5 -> 2, lower is better -> improved, -3
    expect(container.textContent).toContain('Critical Issues: 5 -> 2 (improved, -3)')
    // Warnings: 8 -> 8, no change
    expect(container.textContent).toContain('Warnings: 8 -> 8 (unchanged, 0)')
    // Issue Count total: 15 -> 12, derived from issuesIntroduced(0) - issuesFixed(3) = -3, lower is better -> improved
    expect(container.textContent).toContain('Issue Count: 15 -> 12 (improved, -3)')
  })

  it('renders AISO/AEO/GEO tiles when AI Visibility status is SUCCESS', async () => {
    apiService.getLatestVerification.mockResolvedValue({ success: true, data: baseRun({ aiVisibilityStatus: 'SUCCESS' }) })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('AISO Score')
    expect(container.textContent).toContain('AEO Score')
    expect(container.textContent).toContain('GEO Score')
    expect(container.textContent).toContain('AI Visibility: Updated')
  })

  it('hides AI score tiles and shows an unavailable note when AI Visibility status is FAILED', async () => {
    apiService.getLatestVerification.mockResolvedValue({
      success: true,
      data: baseRun({
        aiVisibilityStatus: 'FAILED',
        after: { pageScore: 84, aisoScore: null, aeoScore: null, geoScore: null, criticalIssues: 2, warningIssues: 8, infoIssues: 2 },
      }),
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).not.toContain('AISO Score')
    expect(container.textContent).toContain('AI check failed for this run — AI score changes unavailable.')
    expect(container.textContent).toContain('AI Visibility: Failed')
  })

  it('hides AI score tiles and shows an unavailable note when AI Visibility status is SKIPPED', async () => {
    apiService.getLatestVerification.mockResolvedValue({
      success: true,
      data: baseRun({
        aiVisibilityStatus: 'SKIPPED',
        after: { pageScore: 84, aisoScore: null, aeoScore: null, geoScore: null, criticalIssues: 2, warningIssues: 8, infoIssues: 2 },
      }),
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).not.toContain('AISO Score')
    expect(container.textContent).toContain('Skipped for this run — AI score changes unavailable.')
    expect(container.textContent).toContain('AI Visibility: Skipped')
  })

  it('shows a compact inline error when the fetch fails', async () => {
    apiService.getLatestVerification.mockRejectedValue(new Error('Network error'))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain("Couldn't load the latest verification result")
  })

  it('retrying after an error calls refetch and can recover', async () => {
    apiService.getLatestVerification.mockRejectedValueOnce(new Error('Network error'))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })

    await act(async () => {
      await flushPromises()
    })
    expect(container.textContent).toContain("Couldn't load the latest verification result")

    apiService.getLatestVerification.mockResolvedValueOnce({ success: true, data: baseRun() })
    const retryBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Retry')
    expect(retryBtn).toBeTruthy()
    act(() => {
      retryBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await act(async () => {
      await flushPromises()
    })
    expect(apiService.getLatestVerification).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Completed')
  })

  it('exposes a polite live region while loading', () => {
    apiService.getLatestVerification.mockReturnValue(new Promise(() => {}))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })
    expect(container.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy()
  })

  it('exposes role="alert" on the error state', async () => {
    apiService.getLatestVerification.mockRejectedValue(new Error('Network error'))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })
    await act(async () => {
      await flushPromises()
    })
    expect(container.querySelector('[role="alert"]')).toBeTruthy()
  })

  it('exposes a polite live region once the result loads successfully', async () => {
    apiService.getLatestVerification.mockResolvedValue({ success: true, data: baseRun() })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page', enabled: true })
    await act(async () => {
      await flushPromises()
    })
    expect(container.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy()
  })
})

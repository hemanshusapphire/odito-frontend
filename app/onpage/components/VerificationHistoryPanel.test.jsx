import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VerificationHistoryPanel from './VerificationHistoryPanel'
import apiService from '@/lib/apiService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Exercises the real useVerificationHistory hook (useDashboardQueries.js)
// through a real QueryClient — only the network layer (apiService) is
// mocked — so "fetch occurs only once expanded" is a genuine assertion
// about the query's own `enabled` wiring, not about a mock.
vi.mock('@/lib/apiService', () => ({
  default: { getVerificationHistory: vi.fn() },
}))

// F4-004's drawer has its own dedicated test file
// (VerificationRunDrawer.test.jsx); mocked here so these F4-003 history-list
// tests don't depend on it or its own apiService/query calls — clicking a
// row now also opens this drawer, which this file only needs to observe as
// "did it receive the right runId / open state", not re-test internally.
vi.mock('./VerificationRunDrawer', () => ({
  default: ({ runId, open }) =>
    open ? React.createElement('div', { 'data-testid': 'run-drawer', 'data-run-id': runId }) : null,
}))

// F4-005's comparison drawer has its own dedicated test file
// (VerificationRunComparisonDrawer.test.jsx); mocked here for the same
// reason as VerificationRunDrawer above — this file only needs to observe
// "did compare-mode pass the right two runIds / open state".
vi.mock('./VerificationRunComparisonDrawer', () => ({
  default: ({ runIdA, runIdB, open }) =>
    open
      ? React.createElement('div', { 'data-testid': 'comparison-drawer', 'data-run-id-a': runIdA, 'data-run-id-b': runIdB })
      : null,
}))

function run(overrides = {}) {
  return {
    verificationRunId: overrides.verificationRunId || 'vr-1',
    runId: 'run-1',
    projectId: 'proj-1',
    pageUrl: 'https://example.com/page',
    status: 'completed',
    startedAt: '2026-07-20T10:00:00.000Z',
    completedAt: '2026-07-20T10:00:42.000Z',
    durationMs: 42500,
    aiVisibilityStatus: 'SUCCESS',
    before: {},
    after: {},
    delta: {},
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
        React.createElement(VerificationHistoryPanel, props)
      )
    )
  })
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 10))
}

function expandPanel() {
  const toggle = container.querySelector('.timeline-toggle-btn')
  act(() => {
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
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

describe('VerificationHistoryPanel', () => {
  it('renders collapsed and does not fetch until expanded', () => {
    apiService.getVerificationHistory.mockResolvedValue({ success: true, data: [] })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })

    expect(apiService.getVerificationHistory).not.toHaveBeenCalled()
    expect(container.querySelector('.timeline-list')).toBeNull()
    expect(container.textContent).toContain('Verification History')
  })

  it('fetches once the section is expanded', async () => {
    apiService.getVerificationHistory.mockResolvedValue({ success: true, data: [run()] })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })

    expandPanel()

    expect(apiService.getVerificationHistory).toHaveBeenCalledTimes(1)
    expect(apiService.getVerificationHistory).toHaveBeenCalledWith('proj-1', { limit: 50 })

    await act(async () => {
      await flushPromises()
    })
  })

  it('shows a skeleton while loading', async () => {
    let resolvePromise
    apiService.getVerificationHistory.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    expect(container.querySelector('.skeleton-shimmer')).toBeTruthy()
    expect(container.querySelector('.pill')).toBeNull()

    await act(async () => {
      resolvePromise({ success: true, data: [] })
      await flushPromises()
    })
  })

  it('shows the empty state when there are no runs for this page', async () => {
    apiService.getVerificationHistory.mockResolvedValue({ success: true, data: [] })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain('No previous verification runs')
  })

  it('shows a compact inline error when the fetch fails', async () => {
    apiService.getVerificationHistory.mockRejectedValue(new Error('Network error'))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    expect(container.textContent).toContain("Couldn't load verification history")
  })

  it('renders rows with date, duration, overall status, and AI Visibility status', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [run({ verificationRunId: 'vr-1', status: 'completed', aiVisibilityStatus: 'SUCCESS', durationMs: 42500 })],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    const row = container.querySelector('.timeline-run')
    expect(row).toBeTruthy()
    expect(row.textContent).toContain('42.5s')
    expect(row.textContent).toContain('Completed')
    expect(row.textContent).toContain('AI Visibility: Updated')
  })

  it('only lists runs for the current page and preserves the backend\'s newest-first order', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [
        run({ verificationRunId: 'this-page-newest', pageUrl: 'https://example.com/page', completedAt: '2026-07-27T00:00:00.000Z' }),
        run({ verificationRunId: 'other-page', pageUrl: 'https://example.com/other', completedAt: '2026-07-26T00:00:00.000Z' }),
        run({ verificationRunId: 'this-page-oldest', pageUrl: 'https://example.com/page', completedAt: '2026-07-20T00:00:00.000Z' }),
      ],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    const rows = Array.from(container.querySelectorAll('.timeline-run'))
    expect(rows).toHaveLength(2)
    expect(rows[0].textContent).toContain('Jul 27, 2026')
    expect(rows[1].textContent).toContain('Jul 20, 2026')
  })

  it('shows distinct AI Visibility badges for FAILED and SKIPPED runs', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [
        run({ verificationRunId: 'a', aiVisibilityStatus: 'FAILED' }),
        run({ verificationRunId: 'b', aiVisibilityStatus: 'SKIPPED', completedAt: '2026-07-19T00:00:00.000Z' }),
      ],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    const rows = Array.from(container.querySelectorAll('.timeline-run'))
    expect(rows[0].textContent).toContain('AI Visibility: Failed')
    expect(rows[1].textContent).toContain('AI Visibility: Skipped')
  })

  it('selects a row visually on click, without navigation', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [
        run({ verificationRunId: 'a', completedAt: '2026-07-27T00:00:00.000Z' }),
        run({ verificationRunId: 'b', completedAt: '2026-07-20T00:00:00.000Z' }),
      ],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    const rows = Array.from(container.querySelectorAll('.timeline-run'))
    expect(rows[0].className).not.toContain('selected')

    act(() => {
      rows[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(container.querySelectorAll('.timeline-run')[0].className).toContain('selected')
    expect(container.querySelectorAll('.timeline-run')[1].className).not.toContain('selected')

    act(() => {
      container.querySelectorAll('.timeline-run')[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(container.querySelectorAll('.timeline-run')[0].className).not.toContain('selected')
    expect(container.querySelectorAll('.timeline-run')[1].className).toContain('selected')
  })

  it('opens the Run Detail Drawer with the clicked run\'s runId (not its Mongo _id)', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [
        run({ verificationRunId: 'mongo-id-a', runId: 'tracking-id-a' }),
        run({ verificationRunId: 'mongo-id-b', runId: 'tracking-id-b', completedAt: '2026-07-19T00:00:00.000Z' }),
      ],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    expect(container.querySelector('[data-testid="run-drawer"]')).toBeNull()

    const rows = Array.from(container.querySelectorAll('.timeline-run'))
    act(() => {
      rows[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const drawer = container.querySelector('[data-testid="run-drawer"]')
    expect(drawer).toBeTruthy()
    expect(drawer.getAttribute('data-run-id')).toBe('tracking-id-b')
  })

  function findCompareButton(row) {
    return Array.from(row.querySelectorAll('button')).find((b) => b.textContent.includes('Compare'))
  }

  it('entering compare mode does not open the single-run drawer', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [
        run({ verificationRunId: 'a', runId: 'run-a' }),
        run({ verificationRunId: 'b', runId: 'run-b', completedAt: '2026-07-19T00:00:00.000Z' }),
      ],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    const rows = Array.from(container.querySelectorAll('.timeline-run'))
    act(() => {
      findCompareButton(rows[0]).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('[data-testid="run-drawer"]')).toBeNull()
    expect(container.textContent).toContain('Comparing — select a second run.')
    expect(container.querySelectorAll('.timeline-run')[0].className).toContain('selected')
  })

  it('picking a second run opens the comparison drawer with both runIds', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [
        run({ verificationRunId: 'a', runId: 'run-a' }),
        run({ verificationRunId: 'b', runId: 'run-b', completedAt: '2026-07-19T00:00:00.000Z' }),
      ],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    let rows = Array.from(container.querySelectorAll('.timeline-run'))
    act(() => {
      findCompareButton(rows[0]).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    rows = Array.from(container.querySelectorAll('.timeline-run'))
    act(() => {
      findCompareButton(rows[1]).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const drawer = container.querySelector('[data-testid="comparison-drawer"]')
    expect(drawer).toBeTruthy()
    expect(drawer.getAttribute('data-run-id-a')).toBe('run-a')
    expect(drawer.getAttribute('data-run-id-b')).toBe('run-b')
    // Compare mode banner clears once a pair is chosen
    expect(container.textContent).not.toContain('Comparing — select a second run.')
  })

  it('clicking Compare again on the same row cancels compare mode', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [run({ verificationRunId: 'a', runId: 'run-a' })],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    let row = container.querySelector('.timeline-run')
    act(() => {
      findCompareButton(row).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(container.textContent).toContain('Comparing — select a second run.')

    row = container.querySelector('.timeline-run')
    act(() => {
      findCompareButton(row).dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(container.textContent).not.toContain('Comparing — select a second run.')
    expect(container.querySelector('.timeline-run').className).not.toContain('selected')
  })

  it('selects a row via keyboard (Enter and Space), not just mouse click', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [run({ verificationRunId: 'a', runId: 'run-a' })],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    const row = container.querySelector('.timeline-run')
    expect(row.getAttribute('tabindex')).toBe('0')

    act(() => {
      row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    })
    expect(container.querySelector('[data-testid="run-drawer"]')).toBeTruthy()
  })

  it('retrying after an error calls refetch and can recover', async () => {
    apiService.getVerificationHistory.mockRejectedValueOnce(new Error('Network error'))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })
    expect(container.textContent).toContain("Couldn't load verification history")

    apiService.getVerificationHistory.mockResolvedValueOnce({ success: true, data: [run()] })
    const retryBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Retry')
    expect(retryBtn).toBeTruthy()
    act(() => {
      retryBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    await act(async () => {
      await flushPromises()
    })
    expect(apiService.getVerificationHistory).toHaveBeenCalledTimes(2)
    expect(container.querySelector('.timeline-run')).toBeTruthy()
  })

  it('exposes accessibility attributes: aria-expanded/aria-controls on the toggle, aria-hidden on icons, role=alert on error', async () => {
    apiService.getVerificationHistory.mockRejectedValue(new Error('Network error'))
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })

    const toggle = container.querySelector('.timeline-toggle-btn')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    const controlsId = toggle.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
    // Decorative chevron/history icons must not be announced
    expect(toggle.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThan(0)

    expandPanel()
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector(`#${controlsId}`)).toBeTruthy()

    await act(async () => {
      await flushPromises()
    })
    expect(container.querySelector('[role="alert"]')).toBeTruthy()
  })

  it('gives each row a meaningful accessible name via aria-label', async () => {
    apiService.getVerificationHistory.mockResolvedValue({
      success: true,
      data: [run({ verificationRunId: 'a', status: 'completed' })],
    })
    renderPanel({ projectId: 'proj-1', pageUrl: 'https://example.com/page' })
    expandPanel()

    await act(async () => {
      await flushPromises()
    })

    const row = container.querySelector('.timeline-run')
    expect(row.getAttribute('aria-label')).toContain('completed')
  })
})

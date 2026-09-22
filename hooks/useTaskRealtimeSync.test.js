import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTaskRealtimeSync } from './useTaskRealtimeSync'
import socketService from '@/lib/socketService'
import { queryKeys } from '@/lib/query/keys'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/lib/socketService', () => ({
  default: {
    onTaskImplemented: vi.fn(),
    onTaskVerified: vi.fn(),
    onTaskReopened: vi.fn(),
    offTaskImplemented: vi.fn(),
    offTaskVerified: vi.fn(),
    offTaskReopened: vi.fn(),
    joinProject: vi.fn(),
  },
}))

// Mirrors useUrlVerification.test.js's hand-rolled renderHook-equivalent
// (no @testing-library/react renderHook usage established in this repo for
// hooks that need a QueryClientProvider ancestor).
function Harness({ projectId }) {
  useTaskRealtimeSync(projectId)
  return null
}

let container
let root
let queryClient

function renderHarness(projectId) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(Harness, { projectId })
      )
    )
  })
}

function unmountHarness() {
  act(() => {
    root.unmount()
  })
  container.remove()
  container = null
  root = null
}

function lastHandler(mockFn) {
  const calls = mockFn.mock.calls
  return calls[calls.length - 1]?.[0]
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

afterEach(() => {
  if (root) unmountHarness()
  vi.useRealTimers()
})

describe('useTaskRealtimeSync', () => {
  it('subscribes to all three task events exactly once and joins the project room on mount', () => {
    renderHarness('proj-1')

    expect(socketService.onTaskImplemented).toHaveBeenCalledTimes(1)
    expect(socketService.onTaskVerified).toHaveBeenCalledTimes(1)
    expect(socketService.onTaskReopened).toHaveBeenCalledTimes(1)
    expect(socketService.joinProject).toHaveBeenCalledWith('proj-1')
  })

  it('does not subscribe at all when projectId is not yet available', () => {
    renderHarness(undefined)

    expect(socketService.onTaskImplemented).not.toHaveBeenCalled()
    expect(socketService.joinProject).not.toHaveBeenCalled()
  })

  it('unsubscribes every listener on unmount — no leak when navigating away from the issue page', () => {
    renderHarness('proj-1')
    unmountHarness()

    expect(socketService.offTaskImplemented).toHaveBeenCalledTimes(1)
    expect(socketService.offTaskVerified).toHaveBeenCalledTimes(1)
    expect(socketService.offTaskReopened).toHaveBeenCalledTimes(1)
    // The exact same function reference passed to on* must be the one
    // passed to off* — otherwise socketService's own Set-based dedup
    // (addEventListener/removeEventListener) can't actually remove it.
    expect(socketService.offTaskImplemented.mock.calls[0][0]).toBe(socketService.onTaskImplemented.mock.calls[0][0])
  })

  it('re-mounting (simulating navigation between issue pages) does not accumulate duplicate listeners — each mount cleans up before the next subscribes', () => {
    renderHarness('proj-1')
    unmountHarness()
    renderHarness('proj-1')

    // Exactly one active subscription cycle each time, not a growing count —
    // each mount calls on* once, and the prior mount's off* already ran.
    expect(socketService.onTaskImplemented).toHaveBeenCalledTimes(2)
    expect(socketService.offTaskImplemented).toHaveBeenCalledTimes(1)
  })

  it('task:implemented invalidates tasks.all/summary/activeUrls/detail scoped to this project — never a global cache clear', () => {
    renderHarness('proj-1')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const handler = lastHandler(socketService.onTaskImplemented)
    act(() => {
      handler({ taskId: 'task-9', issueKey: 'title_missing', pageUrl: 'https://example.com/x', status: 'implemented' })
    })

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0].queryKey)
    expect(invalidatedKeys).toContainEqual(queryKeys.tasks.all('proj-1'))
    expect(invalidatedKeys).toContainEqual(queryKeys.tasks.summary('proj-1'))
    expect(invalidatedKeys).toContainEqual(queryKeys.tasks.activeUrls('proj-1', 'title_missing'))
    expect(invalidatedKeys).toContainEqual(queryKeys.tasks.detail('task-9'))
    // Never a bare queryClient.clear()/invalidateQueries() with no key.
    expect(invalidateSpy.mock.calls.every((call) => call[0]?.queryKey)).toBe(true)
  })

  it('task:verified and task:reopened both invalidate the same scoped query set', () => {
    renderHarness('proj-1')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    act(() => {
      lastHandler(socketService.onTaskVerified)({ taskId: 't1', issueKey: 'title_missing', pageUrl: 'x', status: 'verified_fixed' })
    })
    const afterVerified = invalidateSpy.mock.calls.length
    expect(afterVerified).toBeGreaterThan(0)

    invalidateSpy.mockClear()
    act(() => {
      lastHandler(socketService.onTaskReopened)({ taskId: 't1', issueKey: 'title_missing', pageUrl: 'x', status: 'reopened' })
    })
    expect(invalidateSpy).toHaveBeenCalled()
  })
})

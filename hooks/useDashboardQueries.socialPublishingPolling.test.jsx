import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSocialPublishing, hasPendingSchedulerWork } from './useDashboardQueries'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Regression coverage for the "Publishing UI shows a stale Scheduled badge
// after the background scheduler already published the post" bug.
// socialSchedulerService.js's cron tick moves a publication through
// scheduled -> publishing -> published/failed entirely server-side, with
// no browser action involved — and this app's global default is
// refetchOnWindowFocus:false (queryClient.js), so without an explicit
// polling strategy the Posts tab/Publishing calendar would never notice.
// hasPendingSchedulerWork is the pure decision function useSocialPublishing
// feeds into refetchInterval: poll only while the currently-cached page
// still contains something the scheduler could change on its own.

function apiPost(overrides = {}) {
  return {
    id: 'pub-1', platform: 'facebook', content: 'Grow your brand', status: 'scheduled',
    scheduledAt: '2026-08-25T09:00:00.000Z', publishedAt: null,
    ...overrides,
  }
}

function fakeQuery(posts) {
  return { state: { data: { data: { data: posts, pagination: { page: 1, limit: 8, total: posts.length, totalPages: 1 } } } } }
}

describe('hasPendingSchedulerWork', () => {
  it('is true when the cached page contains a "scheduled" post', () => {
    expect(hasPendingSchedulerWork(fakeQuery([apiPost({ status: 'scheduled' })]))).toBe(true)
  })

  it('is true when the cached page contains a "publishing" post (mid-claim by the scheduler)', () => {
    expect(hasPendingSchedulerWork(fakeQuery([apiPost({ status: 'publishing' })]))).toBe(true)
  })

  it('is false when every post is in a terminal state (published/failed/draft/cancelled)', () => {
    expect(hasPendingSchedulerWork(fakeQuery([
      apiPost({ id: 'p1', status: 'published' }),
      apiPost({ id: 'p2', status: 'failed' }),
      apiPost({ id: 'p3', status: 'draft' }),
      apiPost({ id: 'p4', status: 'cancelled' }),
    ]))).toBe(false)
  })

  it('is true if even one post among several terminal ones is still scheduled/publishing', () => {
    expect(hasPendingSchedulerWork(fakeQuery([
      apiPost({ id: 'p1', status: 'published' }),
      apiPost({ id: 'p2', status: 'scheduled' }),
    ]))).toBe(true)
  })

  it('is false for an empty result set, and never throws for missing/malformed data', () => {
    expect(hasPendingSchedulerWork(fakeQuery([]))).toBe(false)
    expect(() => hasPendingSchedulerWork({ state: {} })).not.toThrow()
    expect(hasPendingSchedulerWork({ state: {} })).toBe(false)
    expect(() => hasPendingSchedulerWork({ state: { data: undefined } })).not.toThrow()
  })
})

let container
let root
let queryClient
let latestResult

vi.mock('@/lib/apiService', () => ({
  default: { getSocialPublications: vi.fn() },
}))

function Harness({ projectId, filters }) {
  latestResult = useSocialPublishing(projectId, filters)
  return null
}

function render(projectId, filters = {}) {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(Harness, { projectId, filters }))
    )
  })
}

async function flush() {
  for (let i = 0; i < 4; i += 1) {
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  latestResult = null
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
  queryClient?.clear()
})

describe('useSocialPublishing — refetchOnWindowFocus override', () => {
  it('scopes refetchOnWindowFocus:true to this query, overriding this app\'s global refetchOnWindowFocus:false default', async () => {
    const apiService = (await import('@/lib/apiService')).default
    apiService.getSocialPublications.mockResolvedValue({ data: { data: [apiPost()], pagination: {} } })

    render('proj-1')
    await flush()

    const observer = queryClient.getQueryCache().find({ queryKey: ['social', 'publishing', 'proj-1', {}] })
    expect(observer.options.refetchOnWindowFocus).toBe(true)
  })
})

describe('useSocialPublishing — refetchInterval is actually wired to hasPendingSchedulerWork', () => {
  it('the configured refetchInterval polls while pending, and stops once nothing is pending', async () => {
    const apiService = (await import('@/lib/apiService')).default
    apiService.getSocialPublications.mockResolvedValue({ data: { data: [apiPost({ status: 'scheduled' })], pagination: {} } })

    render('proj-1')
    await flush()

    const observer = queryClient.getQueryCache().find({ queryKey: ['social', 'publishing', 'proj-1', {}] })
    expect(typeof observer.options.refetchInterval).toBe('function')

    // The real query object, already holding this test's mocked "scheduled" response.
    expect(observer.options.refetchInterval(observer)).toBeGreaterThan(0)

    // Same wiring, asked about a page with nothing left for the scheduler
    // to change — must stop polling (false), not keep running forever.
    const terminalOnly = { state: { data: { data: { data: [apiPost({ status: 'published' })] } } } }
    expect(observer.options.refetchInterval(terminalOnly)).toBe(false)
  })
})

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAEOHub, useAEOHubIssues, useGEOHub, useGEOHubIssues, useAISOHub, useAISOHubIssues } from './useDashboardQueries'
import { staleTimes } from '@/lib/query/stale-times'

/**
 * Regression coverage for: a fixed backend calculation (e.g. the AEO
 * Answer Readiness signal-scoring bug) could still render as the old, wrong
 * value in the browser for up to 5 minutes — or indefinitely, if the tab
 * was never remounted — because these 6 hooks used `staleTimes.STANDARD`
 * (5 min) instead of `staleTimes.AUDIT_RESULT` (30s), combined with the
 * app's 24h localStorage-persisted query cache (see lib/queryClient.js).
 * Confirmed live: the real running backend already returned the corrected
 * values via a direct HTTP request, while the dashboard kept showing the
 * pre-fix numbers — a pure frontend caching issue, not a backend one.
 *
 * `stale-times.js` itself documents AUDIT_RESULT as the tier for exactly
 * this data ("audit results: scores, issues, overview, counts... must be
 * short so recrawl data is fetched fresh... rather than being served from
 * the persisted localStorage cache") — these hooks just weren't using it.
 */

vi.mock('@/lib/apiService', () => ({
  default: {
    getAEOHubData:   vi.fn().mockResolvedValue({ success: true, data: null }),
    getAEOHubIssues: vi.fn().mockResolvedValue({ success: true, data: { issues: [] } }),
    getGEOHubData:   vi.fn().mockResolvedValue({ success: true, data: null }),
    getGEOHubIssues: vi.fn().mockResolvedValue({ success: true, data: { issues: [] } }),
    getAISOHubData:   vi.fn().mockResolvedValue({ success: true, data: null }),
    getAISOHubIssues: vi.fn().mockResolvedValue({ success: true, data: { issues: [] } }),
  },
}))

const PROJECT_ID = 'project-1'

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function wrapperFor(client) {
  return ({ children }) => React.createElement(QueryClientProvider, { client }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe.each([
  ['useAEOHub', useAEOHub],
  ['useAEOHubIssues', useAEOHubIssues],
  ['useGEOHub', useGEOHub],
  ['useGEOHubIssues', useGEOHubIssues],
  ['useAISOHub', useAISOHub],
  ['useAISOHubIssues', useAISOHubIssues],
])('%s', (name, hook) => {
  test(`uses staleTimes.AUDIT_RESULT (30s), not the 5-minute STANDARD tier`, () => {
    const client = makeClient()
    renderHook(() => hook(PROJECT_ID), { wrapper: wrapperFor(client) })

    const query = client.getQueryCache().findAll()[0]
    expect(query, `${name} did not register a query`).toBeTruthy()
    expect(query.options.staleTime).toBe(staleTimes.AUDIT_RESULT)
    expect(query.options.staleTime).not.toBe(staleTimes.STANDARD)
  })
})

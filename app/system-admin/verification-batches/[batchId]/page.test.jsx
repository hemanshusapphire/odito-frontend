import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SystemAdminVerificationBatchDetailPage from './page'
import apiService from '@/lib/apiService'
import { AdminPageHeaderProvider } from '@/components/system-admin/shared/AdminPageHeaderContext'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useParams: () => ({ batchId: 'batch-abc123' }),
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/apiService', () => ({
  default: {
    getSystemAdminVerificationBatchDetail: vi.fn(),
  },
}))

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
        React.createElement(AdminPageHeaderProvider, null, React.createElement(SystemAdminVerificationBatchDetailPage))
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
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

function makeDetail(overrides = {}) {
  return {
    batch: {
      batchId: 'batch-abc123',
      status: 'completed',
      isStuck: false,
      currentStage: 'Completed',
      totalUrls: 3,
      completedUrls: 3,
      failedUrls: 0,
      durationMs: 45000,
      createdAt: '2026-07-30T00:00:00.000Z',
      startedAt: '2026-07-30T00:00:01.000Z',
      aggregateStartedAt: '2026-07-30T00:00:30.000Z',
      aggregateCompletedAt: '2026-07-30T00:00:40.000Z',
      completedAt: '2026-07-30T00:00:45.000Z',
    },
    project: { id: 'p1', name: 'Test Project' },
    user: { id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
    runs: [
      { runId: 'run-1', pageUrl: 'https://example.com/', status: 'completed', startedAt: '2026-07-30T00:00:01.000Z', completedAt: '2026-07-30T00:00:20.000Z', errorMessage: null },
    ],
    jobs: [
      { id: 'job-1', jobType: 'PAGE_SCRAPING', status: 'completed', attempts: 0, maxAttempts: 3, createdAt: '2026-07-30T00:00:01.000Z', completedAt: '2026-07-30T00:00:10.000Z', failureReason: null },
    ],
    timeline: [
      { stage: 'Batch Created', timestamp: '2026-07-30T00:00:00.000Z' },
      { stage: 'Completed', timestamp: '2026-07-30T00:00:45.000Z' },
    ],
    recoveryEvents: [],
    ...overrides,
  }
}

describe('SystemAdminVerificationBatchDetailPage (ODITO-OPS-001)', () => {
  it('renders all detail sections once data loads', async () => {
    apiService.getSystemAdminVerificationBatchDetail.mockResolvedValue({ success: true, data: makeDetail() })

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Page Verification Runs (1)')
    expect(container.textContent).toContain('Jobs (1)')
    expect(container.textContent).toContain('Timeline')
    expect(container.textContent).toContain('Recovery Events (0)')
    expect(container.textContent).toContain('No recovery activity recorded for this batch.')
    expect(container.textContent).toContain('Test Project')
    expect(container.textContent).toContain('https://example.com/')
  })

  it('shows a loading skeleton before data resolves', () => {
    apiService.getSystemAdminVerificationBatchDetail.mockReturnValue(new Promise(() => {}))

    render()

    expect(container.querySelectorAll('[class*="animate-pulse"]').length).toBeGreaterThan(0)
  })

  it('shows an error state with a retry button on failure', async () => {
    apiService.getSystemAdminVerificationBatchDetail.mockRejectedValue(new Error('batch not found'))

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain("Couldn't load this batch")
    expect(container.textContent).toContain('batch not found')
  })

  it('marks a stuck batch with a Stuck badge', async () => {
    apiService.getSystemAdminVerificationBatchDetail.mockResolvedValue({
      success: true,
      data: makeDetail({ batch: { ...makeDetail().batch, status: 'aggregating', isStuck: true } }),
    })

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Stuck')
  })
})

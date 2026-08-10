import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SystemAdminVerificationBatchesPage from './page'
import apiService from '@/lib/apiService'
import { AdminPageHeaderProvider } from '@/components/system-admin/shared/AdminPageHeaderContext'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }))

vi.mock('@/lib/apiService', () => ({
  default: {
    getSystemAdminVerificationBatchesSummary: vi.fn(),
    getSystemAdminVerificationBatches: vi.fn(),
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
        React.createElement(AdminPageHeaderProvider, null, React.createElement(SystemAdminVerificationBatchesPage))
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

function makeBatchRow(overrides = {}) {
  return {
    batchId: 'batch-123456789',
    project: { id: 'p1', name: 'Test Project' },
    user: { id: 'u1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' },
    status: 'completed',
    isStuck: false,
    totalUrls: 5,
    completedUrls: 5,
    failedUrls: 0,
    currentStage: 'Completed',
    durationMs: 65000,
    startedAt: '2026-07-30T00:00:00.000Z',
    aggregateStartedAt: '2026-07-30T00:01:00.000Z',
    completedAt: '2026-07-30T00:02:05.000Z',
    createdAt: '2026-07-30T00:00:00.000Z',
    ...overrides,
  }
}

describe('SystemAdminVerificationBatchesPage (ODITO-OPS-001)', () => {
  it('renders the summary cards and the batch table once data loads', async () => {
    apiService.getSystemAdminVerificationBatchesSummary.mockResolvedValue({
      success: true,
      data: { pending: 0, running: 1, aggregating: 0, completed: 4, partial: 0, failed: 1, stuckCount: 0, totalBatches: 6, averageUrlsPerBatch: 3.2, averageDurationMs: 60000, longestBatchDurationMs: 120000 },
    })
    apiService.getSystemAdminVerificationBatches.mockResolvedValue({
      success: true,
      data: {
        batches: [makeBatchRow()],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        filters: { statuses: ['pending', 'running', 'aggregating', 'completed', 'partial', 'failed'] },
      },
    })

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Running')
    expect(container.textContent).toContain('Stuck (>15m)')
    expect(container.textContent).toContain('batch-12345678') // truncated batchId visible somewhere
    expect(container.textContent).toContain('Test Project')
    expect(container.textContent).toContain('Completed')
  })

  it('highlights a stuck batch distinctly from a healthy one', async () => {
    apiService.getSystemAdminVerificationBatchesSummary.mockResolvedValue({
      success: true, data: { pending: 0, running: 0, aggregating: 1, completed: 0, partial: 0, failed: 0, stuckCount: 1, totalBatches: 1, averageUrlsPerBatch: 2, averageDurationMs: null, longestBatchDurationMs: null },
    })
    apiService.getSystemAdminVerificationBatches.mockResolvedValue({
      success: true,
      data: {
        batches: [makeBatchRow({ batchId: 'stuck-batch-1', status: 'aggregating', isStuck: true })],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        filters: { statuses: ['aggregating'] },
      },
    })

    render()
    await act(async () => { await flushPromises() })

    expect(container.querySelector('svg.lucide-triangle-alert, svg.lucide-alert-triangle')).toBeTruthy()
  })

  it('shows an error state with a retry button on failure', async () => {
    apiService.getSystemAdminVerificationBatchesSummary.mockResolvedValue({ success: true, data: { pending: 0, running: 0, aggregating: 0, completed: 0, partial: 0, failed: 0, stuckCount: 0, totalBatches: 0, averageUrlsPerBatch: 0, averageDurationMs: null, longestBatchDurationMs: null } })
    apiService.getSystemAdminVerificationBatches.mockRejectedValue(new Error('network down'))

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain("Couldn't load verification batches")
    expect(container.textContent).toContain('network down')
  })

  it('shows an empty state (zero total) without crashing', async () => {
    apiService.getSystemAdminVerificationBatchesSummary.mockResolvedValue({
      success: true, data: { pending: 0, running: 0, aggregating: 0, completed: 0, partial: 0, failed: 0, stuckCount: 0, totalBatches: 0, averageUrlsPerBatch: 0, averageDurationMs: null, longestBatchDurationMs: null },
    })
    apiService.getSystemAdminVerificationBatches.mockResolvedValue({
      success: true,
      data: { batches: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 }, filters: { statuses: [] } },
    })

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Verification Batch Dashboard')
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SystemAdminVerificationRecoveryPage from './page'
import apiService from '@/lib/apiService'
import { AdminPageHeaderProvider } from '@/components/system-admin/shared/AdminPageHeaderContext'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }))

vi.mock('@/lib/apiService', () => ({
  default: {
    getSystemAdminVerificationRecoverySummary: vi.fn(),
    getSystemAdminVerificationRecoveryEvents: vi.fn(),
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
        React.createElement(AdminPageHeaderProvider, null, React.createElement(SystemAdminVerificationRecoveryPage))
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

describe('SystemAdminVerificationRecoveryPage (ODITO-OPS-001)', () => {
  it('renders the summary tiles, events table, and the unavailable-categories banner', async () => {
    apiService.getSystemAdminVerificationRecoverySummary.mockResolvedValue({
      success: true,
      data: { retryReclaimedCount: 4, staleLockRecoveredCount: 1, orphanedJobRecoveredCount: 2 },
    })
    apiService.getSystemAdminVerificationRecoveryEvents.mockResolvedValue({
      success: true,
      data: {
        events: [
          { id: 'e1', timestamp: '2026-07-30T00:00:00.000Z', reason: 'Stale lock recovered', jobType: 'PAGE_SCRAPING', batchId: 'batch-1' },
        ],
        pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        unavailable: ['batch_resumed', 'aggregation_resumed', 'duplicate_recovery_avoided'],
      },
    })

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Retry Reclaimed')
    expect(container.textContent).toContain('Stale Locks Recovered')
    expect(container.textContent).toContain('Orphaned Jobs Recovered')
    expect(container.textContent).toContain('Stale lock recovered')
    expect(container.textContent).toContain('batch resumed')
    expect(container.textContent).toContain('aggregation resumed')
    expect(container.textContent).toContain('duplicate recovery avoided')
  })

  it('shows an error state with a retry button on failure', async () => {
    apiService.getSystemAdminVerificationRecoverySummary.mockResolvedValue({
      success: true, data: { retryReclaimedCount: 0, staleLockRecoveredCount: 0, orphanedJobRecoveredCount: 0 },
    })
    apiService.getSystemAdminVerificationRecoveryEvents.mockRejectedValue(new Error('recovery feed down'))

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain("Couldn't load recovery events")
    expect(container.textContent).toContain('recovery feed down')
  })
})

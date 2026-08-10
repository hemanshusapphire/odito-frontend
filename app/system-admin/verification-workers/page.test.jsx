import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SystemAdminVerificationWorkersPage from './page'
import apiService from '@/lib/apiService'
import { AdminPageHeaderProvider } from '@/components/system-admin/shared/AdminPageHeaderContext'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }))

vi.mock('@/lib/apiService', () => ({
  default: { getSystemAdminVerificationWorkerHealth: vi.fn() },
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
        React.createElement(AdminPageHeaderProvider, null, React.createElement(SystemAdminVerificationWorkersPage))
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

describe('SystemAdminVerificationWorkersPage (ODITO-OPS-001)', () => {
  it('renders the Node and Python health cards once data loads', async () => {
    apiService.getSystemAdminVerificationWorkerHealth.mockResolvedValue({
      success: true,
      data: {
        node: {
          uptimeSeconds: 3725,
          staleLockScheduler: { enabled: true, running: true, cronExpression: '*/5 * * * *', lockTimeoutMs: 900000, lastRun: { at: '2026-07-30T00:00:00.000Z' } },
          verificationBatchRecoveryScheduler: { enabled: true, running: true, cronExpression: '*/30 * * * * *', lastRun: { at: '2026-07-30T00:00:10.000Z' } },
        },
        python: {
          apparentlyOnline: true,
          isStale: false,
          lastPollAt: '2026-07-30T00:00:05.000Z',
          lastPollAgeMs: 4000,
          jobsProcessedLast24h: 120,
          averageProcessingMs: 8200,
        },
      },
    })

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Node')
    expect(container.textContent).toContain('Python Workers')
    expect(container.textContent).toContain('1h 2m')
    expect(container.textContent).toContain('Online')
    expect(container.textContent).toContain('120')
  })

  it('marks Python as stale/possibly offline when isStale is true', async () => {
    apiService.getSystemAdminVerificationWorkerHealth.mockResolvedValue({
      success: true,
      data: {
        node: {
          uptimeSeconds: 60,
          staleLockScheduler: { enabled: true, running: false, cronExpression: '*/5 * * * *', lockTimeoutMs: 900000, lastRun: null },
          verificationBatchRecoveryScheduler: { enabled: true, running: false, cronExpression: '*/30 * * * * *', lastRun: null },
        },
        python: { apparentlyOnline: false, isStale: true, lastPollAt: null, lastPollAgeMs: null, jobsProcessedLast24h: 0, averageProcessingMs: null },
      },
    })

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Stale / Possibly Offline')
    expect(container.textContent).toContain('Not Running')
  })

  it('shows an error state with a retry button on failure', async () => {
    apiService.getSystemAdminVerificationWorkerHealth.mockRejectedValue(new Error('health check failed'))

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain("Couldn't load worker health")
    expect(container.textContent).toContain('health check failed')
  })
})

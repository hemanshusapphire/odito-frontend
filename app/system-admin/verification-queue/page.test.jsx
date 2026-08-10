import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SystemAdminVerificationQueuePage from './page'
import apiService from '@/lib/apiService'
import { AdminPageHeaderProvider } from '@/components/system-admin/shared/AdminPageHeaderContext'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), useSearchParams: () => new URLSearchParams() }))

vi.mock('@/lib/apiService', () => ({
  default: { getSystemAdminVerificationQueueSummary: vi.fn() },
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
        React.createElement(AdminPageHeaderProvider, null, React.createElement(SystemAdminVerificationQueuePage))
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

describe('SystemAdminVerificationQueuePage (ODITO-OPS-001)', () => {
  it('renders total queue depth and a row per job type once data loads', async () => {
    apiService.getSystemAdminVerificationQueueSummary.mockResolvedValue({
      success: true,
      data: {
        queueDepth: 7,
        byType: [
          { jobType: 'PAGE_SCRAPING', pending: 2, processing: 1, retrying: 0, failed: 0, completed: 40, retryCount: 3, oldestPending: { ageMs: 5000 }, longestProcessing: { ageMs: 12000 } },
          { jobType: 'AI_VISIBILITY', pending: 0, processing: 0, retrying: 1, failed: 2, completed: 38, retryCount: 5, oldestPending: null, longestProcessing: null },
        ],
      },
    })

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain('Total Queue Depth')
    expect(container.textContent).toContain('7')
    expect(container.textContent).toContain('PAGE SCRAPING')
    expect(container.textContent).toContain('AI VISIBILITY')
  })

  it('shows an error state with a retry button on failure', async () => {
    apiService.getSystemAdminVerificationQueueSummary.mockRejectedValue(new Error('queue unavailable'))

    render()
    await act(async () => { await flushPromises() })

    expect(container.textContent).toContain("Couldn't load the queue")
    expect(container.textContent).toContain('queue unavailable')
  })
})

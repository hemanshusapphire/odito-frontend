import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { screen, waitFor, act } from '@testing-library/react'
import { renderWithClient, publication } from '@/test-utils/socialMediaAI'

const api = vi.hoisted(() => ({ getSocialPublications: vi.fn() }))
vi.mock('@/lib/apiService', () => ({ default: api }))

import { useScheduledPosts, usePublishedPosts } from './useSocialMediaAI'

/** Scheduled Posts + Published tabs on one QueryClient, as the real page has them. */
function Probe() {
  const scheduled = useScheduledPosts('proj-1')
  const published = usePublishedPosts('proj-1')
  return (
    <div>
      <span data-testid="scheduled">{scheduled.posts.map((p) => `${p.id}:${p.status}`).join(',')}</span>
      <span data-testid="published">{published.posts.map((p) => `${p.id}:${p.status}`).join(',')}</span>
    </div>
  )
}

let server
const reply = (rows) => ({ success: true, data: { data: rows, pagination: { page: 1, limit: 50, total: rows.length, totalPages: 1 } } })

beforeEach(() => {
  api.getSocialPublications.mockReset()
  server = { scheduled: [], publishing: [], published: [], failed: [] }
  api.getSocialPublications.mockImplementation(async (pid, filters = {}) => reply(server[filters.status] || []))
  vi.useFakeTimers({ shouldAdvanceTime: true })
})
afterEach(() => { vi.useRealTimers() })

describe('a post leaving Scheduled (the scheduler published it) refreshes the other lists', () => {
  it('Scheduled -> Publishing -> Published appears without any click or reload', async () => {
    server.scheduled = [publication({ id: 'p1', status: 'scheduled', scheduledAt: '2099-01-01T10:00:00.000Z' })]
    renderWithClient(<Probe />)
    await waitFor(() => expect(screen.getByTestId('scheduled')).toHaveTextContent('p1:scheduled'))
    expect(screen.getByTestId('published').textContent).toBe('')

    // the scheduler claims it
    server.scheduled = []
    server.publishing = [publication({ id: 'p1', status: 'publishing' })]
    await act(async () => { await vi.advanceTimersByTimeAsync(31_000) })
    await waitFor(() => expect(screen.getByTestId('scheduled')).toHaveTextContent('p1:publishing'))

    // and publishes it
    server.publishing = []
    server.published = [publication({ id: 'p1', status: 'published', publishedAt: '2099-01-01T10:00:04.000Z', externalPostId: 'pg_1_post_1' })]
    await act(async () => { await vi.advanceTimersByTimeAsync(11_000) })
    await waitFor(() => expect(screen.getByTestId('scheduled').textContent).toBe(''))
    await waitFor(() => expect(screen.getByTestId('published')).toHaveTextContent('p1:published'))
  })

  it('a post that fails is picked up by the Failed list the same way', async () => {
    server.scheduled = [publication({ id: 'p2', status: 'scheduled', scheduledAt: '2099-01-01T10:00:00.000Z' })]
    const { queryClient } = renderWithClient(<Probe />)
    await waitFor(() => expect(screen.getByTestId('scheduled')).toHaveTextContent('p2'))
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    server.scheduled = []
    server.failed = [publication({ id: 'p2', status: 'failed' })]
    await act(async () => { await vi.advanceTimersByTimeAsync(31_000) })
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: ['social', 'publishing', 'proj-1'] }))
  })

  it('no extra refetch while nothing leaves the list, and none on first load', async () => {
    server.scheduled = [publication({ id: 'p3', status: 'scheduled', scheduledAt: '2099-01-01T10:00:00.000Z' })]
    const { queryClient } = renderWithClient(<Probe />)
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    await waitFor(() => expect(screen.getByTestId('scheduled')).toHaveTextContent('p3'))
    await act(async () => { await vi.advanceTimersByTimeAsync(65_000) })
    expect(spy).not.toHaveBeenCalledWith({ queryKey: ['social', 'publishing', 'proj-1'] })
    expect(screen.getByTestId('scheduled')).toHaveTextContent('p3:scheduled')
  })
})

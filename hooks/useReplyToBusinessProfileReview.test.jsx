import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const api = vi.hoisted(() => ({ replyToBusinessProfileReview: vi.fn() }))
vi.mock('@/lib/apiService', () => ({ default: api }))

import { useReplyToBusinessProfileReview } from './useDashboardQueries'

const KEY = ['business-profile', 'p1', 'reviews', { page: 1 }]
const RATING = ['business-profile', 'p1', 'rating']
const seed = () => ({
  success: true,
  data: { available: true, reviews: [
    { google_review_id: 'r1', reviewer_name: 'A', reply: { comment: null } },
    { google_review_id: 'r2', reviewer_name: 'B', reply: { comment: null } },
  ] },
})

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(KEY, seed())
  client.setQueryData(RATING, { data: { repliedCount: 0 } })
  const invalidate = vi.spyOn(client, 'invalidateQueries')
  const wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  const { result } = renderHook(() => useReplyToBusinessProfileReview('p1'), { wrapper })
  return { client, invalidate, result }
}

describe('useReplyToBusinessProfileReview', () => {
  it('after Google accepts: patches ONLY that review in cache from the server response and refetches reviews + rating', async () => {
    api.replyToBusinessProfileReview.mockResolvedValue({
      success: true, data: { review: { google_review_id: 'r1', reply: { comment: 'Thanks!', update_time: '2026-10-06T12:00:00Z', state: 'APPROVED' } } },
    })
    const { client, invalidate, result } = setup()
    await act(async () => { await result.current.mutateAsync({ reviewId: 'r1', reply: 'Thanks!' }) })

    const reviews = client.getQueryData(KEY).data.reviews
    expect(reviews[0].reply.comment).toBe('Thanks!')
    expect(reviews[0].reviewer_name).toBe('A')
    expect(reviews[1].reply.comment).toBeNull()
    expect(api.replyToBusinessProfileReview).toHaveBeenCalledWith('p1', 'r1', 'Thanks!')
    const keys = invalidate.mock.calls.map((c) => c[0].queryKey)
    expect(keys).toContainEqual(['business-profile', 'p1', 'reviews'])
    expect(keys).toContainEqual(RATING)
  })

  it('on failure: cache is NOT modified (no optimistic fake reply)', async () => {
    api.replyToBusinessProfileReview.mockRejectedValue(Object.assign(new Error('x'), { code: 'GOOGLE_UNAVAILABLE', status: 503 }))
    const { client, invalidate, result } = setup()
    await act(async () => { await result.current.mutateAsync({ reviewId: 'r1', reply: 'Thanks!' }).catch(() => {}) })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData(KEY).data.reviews[0].reply.comment).toBeNull()
    expect(invalidate).not.toHaveBeenCalled()
  })

  it('on ALREADY_REPLIED: syncs the existing Google reply into the cache', async () => {
    api.replyToBusinessProfileReview.mockRejectedValue(Object.assign(new Error('x'), {
      code: 'ALREADY_REPLIED', status: 409,
      data: { review: { google_review_id: 'r2', reply: { comment: 'Replied on google.com' } } },
    }))
    const { client, result } = setup()
    await act(async () => { await result.current.mutateAsync({ reviewId: 'r2', reply: 'Hi' }).catch(() => {}) })
    expect(client.getQueryData(KEY).data.reviews[1].reply.comment).toBe('Replied on google.com')
  })
})

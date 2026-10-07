import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

let mockQuery = 'view=list'
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/app/google-visibility/business-profile/reviews',
  useSearchParams: () => new URLSearchParams(mockQuery),
}))
vi.mock('next/link', () => ({ default: ({ href, children, ...p }) => <a href={href} {...p}>{children}</a> }))
vi.mock('@/contexts/ProjectContext', () => ({ useProject: () => ({ activeProjectId: 'proj-1' }) }))

const hooks = vi.hoisted(() => ({
  useBusinessProfileStatus: vi.fn(),
  useBusinessProfileRating: vi.fn(),
  useBusinessProfileReviews: vi.fn(),
  useReplyToBusinessProfileReview: vi.fn(),
  useBusinessProfileReviewAnalytics: vi.fn(),
}))
vi.mock('@/hooks/useDashboardQueries', () => hooks)

import ReviewsPage from './page'

const connectedStatus = { data: { data: { connected: true, serviceEnabled: true } }, isLoading: false }
const review = (over = {}) => ({
  google_review_id: 'r1', reviewer_name: 'John Doe', reviewer_photo_url: null, star_rating: 5,
  comment: 'Excellent service', review_create_time: '2026-10-01T00:00:00Z', reply: { comment: null, update_time: null }, ...over,
})
const reviewsResult = (reviews, over = {}) => ({
  data: { data: { available: true, reviews, pagination: { page: 1, limit: 10, total: reviews.length, pages: 1 } } },
  isLoading: false, isError: false, isFetching: false, isPlaceholderData: false, refetch: vi.fn(), ...over,
})
const replyMutation = (over = {}) => ({ mutate: vi.fn(), reset: vi.fn(), isPending: false, error: null, ...over })
const lastReviewParams = () => hooks.useBusinessProfileReviews.mock.calls.at(-1)

beforeEach(() => {
  vi.clearAllMocks()
  mockQuery = 'view=list'
  hooks.useBusinessProfileReviewAnalytics.mockReturnValue({ data: undefined, isLoading: true, isError: false, isFetching: true })
  hooks.useReplyToBusinessProfileReview.mockReturnValue(replyMutation())
  hooks.useBusinessProfileStatus.mockReturnValue(connectedStatus)
  hooks.useBusinessProfileRating.mockReturnValue({
    isLoading: false,
    data: { data: { available: true, averageRating: 4.6, totalReviewCount: 128, repliedCount: 40, distribution: { 1: 1, 2: 2, 3: 5, 4: 38, 5: 82 } } },
  })
})

describe('Business Profile Reviews page', () => {
  it('shows real summary values and reviews with response status', () => {
    hooks.useBusinessProfileReviews.mockReturnValue(reviewsResult([
      review(),
      review({ google_review_id: 'r2', reviewer_name: 'Jane', reply: { comment: 'Thank you!', update_time: '2026-10-02T00:00:00Z' } }),
    ]))
    render(<ReviewsPage />)
    expect(screen.getByText('128')).toBeInTheDocument()
    expect(screen.getByText('4.6')).toBeInTheDocument()
    expect(screen.getByText('82')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Not responded')).toBeInTheDocument()
    expect(screen.getByText('Thank you!')).toBeInTheDocument()
    expect(screen.getByText(/Business response/)).toBeInTheDocument()
  })

  it('does not request reviews until a location is selected', () => {
    hooks.useBusinessProfileStatus.mockReturnValue({ data: { data: { connected: true, serviceEnabled: false } }, isLoading: false })
    hooks.useBusinessProfileReviews.mockReturnValue({ data: undefined, isLoading: false })
    render(<ReviewsPage />)
    expect(lastReviewParams()[0]).toBeNull()
    expect(screen.getByText('Select a Business Profile location')).toBeInTheDocument()
  })

  it('renders skeletons while loading', () => {
    hooks.useBusinessProfileReviews.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    render(<ReviewsPage />)
    expect(screen.getByLabelText('Loading reviews')).toBeInTheDocument()
  })

  it('renders the empty state (not an error) when there are no reviews', () => {
    hooks.useBusinessProfileReviews.mockReturnValue(reviewsResult([]))
    render(<ReviewsPage />)
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
    expect(screen.queryByText('Unable to load reviews')).not.toBeInTheDocument()
  })

  it('renders an error state with a working Retry', () => {
    const refetch = vi.fn()
    hooks.useBusinessProfileReviews.mockReturnValue({ data: undefined, isLoading: false, isError: true, isFetching: false, refetch })
    render(<ReviewsPage />)
    expect(screen.getByText('Unable to load reviews')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders an unavailable state when Google restricts review access', () => {
    hooks.useBusinessProfileReviews.mockReturnValue({
      ...reviewsResult([]), data: { data: { available: false, reason: 'Restricted by Google', reviews: [], pagination: { page: 1, pages: 0, total: 0 } } },
    })
    render(<ReviewsPage />)
    expect(screen.getByText('Reviews unavailable')).toBeInTheDocument()
    expect(screen.getByText('Restricted by Google')).toBeInTheDocument()
  })

  it('paginates server-side', () => {
    hooks.useBusinessProfileReviews.mockReturnValue(reviewsResult([review()], {
      data: { data: { available: true, reviews: [review()], pagination: { page: 1, limit: 10, total: 25, pages: 3 } } },
    }))
    render(<ReviewsPage />)
    expect(screen.getByText(/Showing 1–1 of 25/)).toBeInTheDocument()
    Element.prototype.scrollIntoView = vi.fn()
    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(lastReviewParams()[1]).toMatchObject({ page: 2, limit: 10 })
  })

  describe('reply flow', () => {
    const open = () => {
      hooks.useBusinessProfileReviews.mockReturnValue(reviewsResult([
        review({ google_review_id: 'open1', reviewer_name: 'Open Person' }),
        review({ google_review_id: 'done1', reviewer_name: 'Done Person', reply: { comment: 'Thanks!', update_time: null } }),
      ]))
    }

    it('shows Reply only on reviews without a reply', () => {
      open()
      render(<ReviewsPage />)
      expect(screen.getAllByRole('button', { name: /^Reply to / })).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Reply to Open Person' })).toBeInTheDocument()
    })

    it('opens the composer, blocks empty text, and sends exactly the typed (trimmed) text for that review on explicit submit', () => {
      const m = replyMutation()
      hooks.useReplyToBusinessProfileReview.mockReturnValue(m)
      open()
      render(<ReviewsPage />)
      fireEvent.click(screen.getByRole('button', { name: 'Reply to Open Person' }))
      expect(screen.getByText('Reply to Open Person')).toBeInTheDocument()
      const submit = screen.getByRole('button', { name: 'Post reply' })
      expect(submit).toBeDisabled()
      expect(m.mutate).not.toHaveBeenCalled()

      fireEvent.change(screen.getByLabelText(/Your reply to Open Person/), { target: { value: '  Thank you!  ' } })
      expect(submit).toBeEnabled()
      expect(m.mutate).not.toHaveBeenCalled() // typing alone never sends
      fireEvent.click(submit)
      expect(m.mutate).toHaveBeenCalledTimes(1)
      expect(m.mutate.mock.calls[0][0]).toEqual({ reviewId: 'open1', reply: 'Thank you!' })
    })

    it('disables submit and cannot be double-submitted while pending', () => {
      hooks.useReplyToBusinessProfileReview.mockReturnValue(replyMutation({ isPending: true }))
      open()
      render(<ReviewsPage />)
      fireEvent.click(screen.getByRole('button', { name: 'Reply to Open Person' }))
      expect(screen.getByRole('button', { name: /Posting/ })).toBeDisabled()
    })

    it('shows a safe message (never the raw server text) and a retry label for a retryable failure', () => {
      hooks.useReplyToBusinessProfileReview.mockReturnValue(replyMutation({
        error: Object.assign(new Error('raw upstream stack ya29.TOKEN'), { code: 'GOOGLE_UNAVAILABLE', status: 503 }),
      }))
      open()
      render(<ReviewsPage />)
      fireEvent.click(screen.getByRole('button', { name: 'Reply to Open Person' }))
      fireEvent.change(screen.getByLabelText(/Your reply to Open Person/), { target: { value: 'Hello' } })
      expect(screen.getByRole('alert')).toHaveTextContent('Could not reach Google. Please try again.')
      expect(screen.queryByText(/ya29/)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled()
    })

    it('maps permission and re-authorization failures to the specified messages', () => {
      for (const [code, msg] of [
        ['GOOGLE_PERMISSION_DENIED', 'Your Google account does not have permission to reply to this review.'],
        ['GOOGLE_AUTH_FAILED', 'Your Google Business Profile connection may need to be re-authorized.'],
        [undefined, 'Unable to post reply.'],
      ]) {
        hooks.useReplyToBusinessProfileReview.mockReturnValue(replyMutation({ error: Object.assign(new Error('x'), { code, status: 502 }) }))
        open()
        const { unmount } = render(<ReviewsPage />)
        fireEvent.click(screen.getByRole('button', { name: 'Reply to Open Person' }))
        expect(screen.getByRole('alert')).toHaveTextContent(msg)
        unmount()
      }
    })

    it('closes the composer after a successful reply', () => {
      const m = replyMutation()
      m.mutate.mockImplementation((_vars, opts) => opts.onSuccess())
      hooks.useReplyToBusinessProfileReview.mockReturnValue(m)
      open()
      render(<ReviewsPage />)
      fireEvent.click(screen.getByRole('button', { name: 'Reply to Open Person' }))
      fireEvent.change(screen.getByLabelText(/Your reply to Open Person/), { target: { value: 'Thanks!' } })
      fireEvent.click(screen.getByRole('button', { name: 'Post reply' }))
      expect(screen.queryByText('Reply to Open Person')).not.toBeInTheDocument()
    })

    it('rejects over-long text (4096 BYTES, not characters) before sending', () => {
      const m = replyMutation()
      hooks.useReplyToBusinessProfileReview.mockReturnValue(m)
      open()
      render(<ReviewsPage />)
      fireEvent.click(screen.getByRole('button', { name: 'Reply to Open Person' }))
      fireEvent.change(screen.getByLabelText(/Your reply to Open Person/), { target: { value: '€'.repeat(1400) } })
      expect(screen.getByRole('button', { name: 'Post reply' })).toBeDisabled()
      expect(screen.getByText('Reply is too long. Please shorten it.')).toBeInTheDocument()
    })
  })

  describe('Insights / Reviews views', () => {
    it('defaults to Insights, and does NOT fetch the review list or rating summary (no duplicate calls)', () => {
      mockQuery = ''
      hooks.useBusinessProfileReviews.mockReturnValue({ data: undefined, isLoading: false })
      render(<ReviewsPage />)
      expect(hooks.useBusinessProfileReviewAnalytics).toHaveBeenCalled()
      expect(hooks.useBusinessProfileReviews.mock.calls.at(-1)[0]).toBeNull()
      expect(hooks.useBusinessProfileRating.mock.calls.at(-1)[0]).toBeNull()
      expect(screen.getByRole('tab', { name: 'Insights' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.queryByLabelText('Search reviews')).not.toBeInTheDocument()
    })

    it('passes the URL range and the connected location to the analytics query', () => {
      mockQuery = 'range=30d'
      hooks.useBusinessProfileStatus.mockReturnValue({ data: { data: { connected: true, serviceEnabled: true, businessLocationId: 'L9' } }, isLoading: false })
      render(<ReviewsPage />)
      const [projectId, opts] = hooks.useBusinessProfileReviewAnalytics.mock.calls.at(-1)
      expect(projectId).toBe('proj-1')
      expect(opts).toMatchObject({ range: '30d', locationId: 'L9' })
    })

    it('an invalid range in the URL falls back to 90d', () => {
      mockQuery = 'range=999d'
      render(<ReviewsPage />)
      expect(hooks.useBusinessProfileReviewAnalytics.mock.calls.at(-1)[1].range).toBe('90d')
    })

    it('switching to List keeps the existing list (search/filters/reply) and persists the view in the URL', () => {
      mockQuery = ''
      hooks.useBusinessProfileReviews.mockReturnValue(reviewsResult([review()]))
      render(<ReviewsPage />)
      const tab = screen.getByRole('tab', { name: 'List' })
      fireEvent.mouseDown(tab)
      fireEvent.click(tab)
      expect(mockReplace).toHaveBeenCalledTimes(1)
      expect(mockReplace.mock.calls[0][0]).toContain('view=list')
    })

    it('header: the "Reviews" title with the Google source, and the List | Insights segmented tabs', () => {
      mockQuery = ''
      render(<ReviewsPage />)
      expect(screen.getByRole('heading', { name: 'Reviews', level: 1 })).toBeInTheDocument()
      expect(screen.getByLabelText('Data source: Google')).toBeInTheDocument()
      expect(within(screen.getByRole('tablist', { name: 'Reviews view' })).getAllByRole('tab').map((t) => t.textContent)).toEqual(['List', 'Insights'])
    })

    it('the Filter menu changes the SAME shared range (URL), and only appears on Insights', () => {
      mockQuery = 'range=30d'
      const { unmount } = render(<ReviewsPage />)
      const filter = screen.getByRole('button', { name: 'Filter' })
      fireEvent.keyDown(filter, { key: 'Enter' })
      const radio = screen.getByRole('menuitemradio', { name: 'Last 6 months' })
      expect(screen.getByRole('menuitemradio', { name: 'Last 30 days' })).toHaveAttribute('aria-checked', 'true')
      fireEvent.click(radio)
      expect(mockReplace).toHaveBeenCalledTimes(1)
      expect(mockReplace.mock.calls[0][0]).toContain('range=6m')
      unmount()

      mockQuery = 'view=list'
      hooks.useBusinessProfileReviews.mockReturnValue(reviewsResult([review()]))
      render(<ReviewsPage />)
      expect(screen.queryByRole('button', { name: 'Filter' })).not.toBeInTheDocument()
    })

    it('the list view still runs the list + summary queries', () => {
      mockQuery = 'view=list'
      hooks.useBusinessProfileReviews.mockReturnValue(reviewsResult([review()]))
      render(<ReviewsPage />)
      expect(hooks.useBusinessProfileReviews.mock.calls.at(-1)[0]).toBe('proj-1')
      expect(screen.getByLabelText('Search reviews')).toBeInTheDocument()
    })
  })
})

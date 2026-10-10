import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'

import PostCard from './PostCard'
import PostsKPIs from './PostsKPIs'

const post = (over = {}) => ({
  google_post_id: 'p1', summary: 'A post', topic_type: 'STANDARD', state: 'LIVE', media: [],
  create_time: '2026-10-07T00:00:00Z', views_search: 0, actions_call_to_action: 0, metrics_last_synced_at: null, ...over,
})
const footer = () => screen.getByText('views').closest('div').parentElement

describe('PostCard views / clicks', () => {
  it('real numbers from Google are shown', () => {
    render(<PostCard post={post({ views_search: 1234, actions_call_to_action: 56, metrics_last_synced_at: '2026-10-10T08:00:00Z' })} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(footer()).toHaveTextContent('1,234')
    expect(footer()).toHaveTextContent('56')
  })

  it('a REAL zero (Google measured it) is shown as 0', () => {
    render(<PostCard post={post({ views_search: 0, actions_call_to_action: 0, metrics_last_synced_at: '2026-10-10T08:00:00Z' })} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(footer()).toHaveTextContent('0')
    expect(footer()).not.toHaveTextContent('—')
  })

  it('never measured (no sync of numbers yet) is "—", not a fake 0, with an explanation', () => {
    render(<PostCard post={post()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(footer()).toHaveTextContent('—')
    expect(footer().textContent.match(/—/g)).toHaveLength(2)
    expect(screen.getByTitle(/Not measured yet - views appear after the next successful sync/)).toBeInTheDocument()
    expect(screen.getByTitle(/Not measured yet - clicks appear/)).toBeInTheDocument()
  })
})

describe('PostsKPIs views / clicks', () => {
  const summary = (over = {}) => ({ totalPosts: 9, livePosts: 9, totalViews: 0, totalActions: 0, postsWithMetrics: 0, ...over })

  it('no post has been measured -> "—" with a reason, not 0', () => {
    render(<PostsKPIs summary={summary()} />)
    const views = screen.getByText('Search Views').closest('div')
    const clicks = screen.getByText('Action Clicks').closest('div')
    expect(views).toHaveTextContent('—')
    expect(clicks).toHaveTextContent('—')
    expect(views).toHaveTextContent('Not measured yet - sync to load')
    // the post counts are unaffected
    expect(screen.getByText('Total Posts').closest('div')).toHaveTextContent('9')
  })

  it('once any post is measured the totals are real numbers (including a real total of 0)', () => {
    const { rerender } = render(<PostsKPIs summary={summary({ postsWithMetrics: 4, totalViews: 321, totalActions: 12 })} />)
    expect(screen.getByText('Search Views').closest('div')).toHaveTextContent('321')
    expect(screen.getByText('Action Clicks').closest('div')).toHaveTextContent('12')
    rerender(<PostsKPIs summary={summary({ postsWithMetrics: 4, totalViews: 0, totalActions: 0 })} />)
    expect(screen.getByText('Search Views').closest('div')).toHaveTextContent('0')
    expect(screen.getByText('Search Views').closest('div')).not.toHaveTextContent('—')
  })

  it('an older API without postsWithMetrics keeps showing the numbers (no regression)', () => {
    render(<PostsKPIs summary={{ totalPosts: 3, livePosts: 3, totalViews: 40, totalActions: 2 }} />)
    expect(screen.getByText('Search Views').closest('div')).toHaveTextContent('40')
  })

  it('no posts at all shows plain zeros, not dashes', () => {
    render(<PostsKPIs summary={{ totalPosts: 0, livePosts: 0, totalViews: 0, totalActions: 0, postsWithMetrics: 0 }} />)
    expect(screen.getByText('Search Views').closest('div')).toHaveTextContent('0')
  })
})

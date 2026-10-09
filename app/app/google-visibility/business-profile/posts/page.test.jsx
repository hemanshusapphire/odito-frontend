import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...p }) => <a href={href} {...p}>{children}</a>
}))
vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProjectId: 'proj-1' })
}))
vi.mock('@/lib/apiService', () => ({
  default: {
    uploadBusinessProfilePostMedia: vi.fn(),
    deleteBusinessProfilePostMedia: vi.fn(),
  }
}))

if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock-preview-url'
if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {}

const hooks = vi.hoisted(() => ({
  useBusinessProfileStatus: vi.fn(),
  useBusinessProfileDetails: vi.fn(),
  useBusinessProfilePosts: vi.fn(),
  useCreateBusinessProfilePost: vi.fn(),
  useUpdateBusinessProfilePost: vi.fn(),
  useDeleteBusinessProfilePost: vi.fn(),
  useSyncBusinessProfilePosts: vi.fn(),
}))
vi.mock('@/hooks/useDashboardQueries', () => hooks)

import BusinessProfilePostsPage from './page'

const connectedStatus = {
  data: { data: { connected: true, serviceEnabled: true, lastSyncAt: '2026-10-06T12:00:00Z' } },
  isLoading: false,
  isError: false
}

const mockPost = (over = {}) => ({
  google_post_id: 'post_1',
  summary: 'Exciting news: we have launched our new seasonal menu!',
  topic_type: 'STANDARD',
  state: 'LIVE',
  views_search: 250,
  actions_call_to_action: 35,
  create_time: '2026-10-05T10:00:00Z',
  call_to_action: { action_type: 'LEARN_MORE', url: 'https://example.com' },
  ...over
})

const postsResult = (posts = [], over = {}) => ({
  data: {
    data: {
      available: true,
      status: 'available',
      posts,
      summary: {
        totalPosts: posts.length,
        livePosts: posts.filter(p => p.state === 'LIVE').length,
        totalViews: posts.reduce((acc, p) => acc + (p.views_search || 0), 0),
        totalActions: posts.reduce((acc, p) => acc + (p.actions_call_to_action || 0), 0),
      },
      pagination: { page: 1, limit: 9, total: posts.length, pages: 1 }
    }
  },
  isLoading: false,
  isError: false,
  isFetching: false,
  refetch: vi.fn(),
  ...over
})

const mockMutation = () => ({
  mutate: vi.fn(),
  reset: vi.fn(),
  isPending: false,
  error: null
})

beforeEach(() => {
  vi.clearAllMocks()
  hooks.useBusinessProfileStatus.mockReturnValue(connectedStatus)
  hooks.useBusinessProfileDetails.mockReturnValue({
    data: { data: { businessName: 'Odito Coffee Roasters' } },
    isLoading: false
  })
  hooks.useBusinessProfilePosts.mockReturnValue(postsResult([mockPost()]))
  hooks.useCreateBusinessProfilePost.mockReturnValue(mockMutation())
  hooks.useUpdateBusinessProfilePost.mockReturnValue(mockMutation())
  hooks.useDeleteBusinessProfilePost.mockReturnValue(mockMutation())
  hooks.useSyncBusinessProfilePosts.mockReturnValue(mockMutation())
})

describe('Business Profile Posts Page', () => {
  it('renders page header and business name when connected', () => {
    render(<BusinessProfilePostsPage />)

    expect(screen.getByText('Google Business Profile Posts')).toBeInTheDocument()
    expect(screen.getByText('Odito Coffee Roasters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sync posts/i })).toBeInTheDocument()
  })

  it('displays KPI cards with correct metric values', () => {
    render(<BusinessProfilePostsPage />)

    expect(screen.getByText('Total Posts')).toBeInTheDocument()
    expect(screen.getByText('Live Posts')).toBeInTheDocument()
    expect(screen.getByText('Search Views')).toBeInTheDocument()
    expect(screen.getByText('Action Clicks')).toBeInTheDocument()
    expect(screen.getAllByText('250')[0]).toBeInTheDocument()
    expect(screen.getAllByText('35')[0]).toBeInTheDocument()
  })

  it('renders post cards with post copy and metrics', () => {
    render(<BusinessProfilePostsPage />)

    expect(screen.getByText(/Exciting news: we have launched our new seasonal menu!/i)).toBeInTheDocument()
    expect(screen.getByText("What's New")).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('renders empty state when there are no posts yet', () => {
    hooks.useBusinessProfilePosts.mockReturnValue(postsResult([]))

    render(<BusinessProfilePostsPage />)

    expect(screen.getByText(/No Google Business Profile Posts Yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create your first post/i })).toBeInTheDocument()
  })

  it('renders unavailable state when Google restricts posts capability', () => {
    hooks.useBusinessProfilePosts.mockReturnValue({
      data: {
        data: {
          available: false,
          status: 'restricted',
          reason: 'Google limits direct post publishing to approved API partners.'
        }
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn()
    })

    render(<BusinessProfilePostsPage />)

    expect(screen.getByText(/Google Posts Access Unavailable/i)).toBeInTheDocument()
    expect(screen.getByText(/limits direct post publishing/i)).toBeInTheDocument()
  })

  it('opens create post dialog when Create Post button is clicked', () => {
    render(<BusinessProfilePostsPage />)

    const createBtn = screen.getByRole('button', { name: /create post/i })
    fireEvent.click(createBtn)

    expect(screen.getByRole('heading', { name: /create google business post/i })).toBeInTheDocument()
    expect(screen.getByText(/post content/i)).toBeInTheDocument()
  })
})

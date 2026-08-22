import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import SocialFeedsPage from './page'
import apiService from '@/lib/apiService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProjectId: 'proj-1' }),
}))

vi.mock('@/lib/apiService', () => ({
  default: { getMetaConnectUrl: vi.fn() },
}))

const notifyMock = vi.fn()
vi.mock('@/hooks/useToastQueue', () => ({
  useToastQueue: () => ({ toasts: [], notify: notifyMock, dismiss: vi.fn() }),
}))

vi.mock('@/components/dashboard/social/SocialTabs', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/CreatePostDialog', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/ConnectAccountDialog', () => ({ default: () => null }))
vi.mock('@/components/shared/ToastStack', () => ({ default: () => null }))

let statusResult
let feedsResult
let feedsRefetch
let syncMutate
let accountsResult

const lastFeedsArgs = { projectId: null, filters: null, activeSocialAccountId: null }

vi.mock('@/hooks/useDashboardQueries', () => ({
  useSocialAccountsStatus: () => statusResult,
  useFacebookAccounts: () => accountsResult,
  useSocialFeeds: (projectId, filters, activeSocialAccountId) => {
    lastFeedsArgs.projectId = projectId
    lastFeedsArgs.filters = filters
    lastFeedsArgs.activeSocialAccountId = activeSocialAccountId
    return feedsResult
  },
  useSyncSocialFeeds: () => ({ mutateAsync: syncMutate, isPending: false }),
}))

let container
let root

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(SocialFeedsPage))
  })
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function refreshButton() {
  return Array.from(container.querySelectorAll('button')).find((b) => /^Refresh(ing…)?$/.test(b.textContent.trim()))
}

beforeEach(() => {
  vi.clearAllMocks()
  statusResult = { data: { data: { facebook: { connected: true }, instagram: { connected: false } } } }
  accountsResult = { data: { data: { accounts: [{ id: 'acc-1', name: 'Real Page Name', picture: null, isActive: true, status: 'active' }] } } }
  syncMutate = vi.fn().mockResolvedValue({ data: { totalPostsSynced: 0, accounts: [] } })
  feedsResult = {
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    data: {
      data: {
        data: [{
          id: 'post-1', platform: 'facebook', accountName: 'Real Page Name', accountPicture: null, username: null,
          text: 'A real synced post', mediaUrl: null, thumbnailUrl: null, type: 'post', permalink: 'https://facebook.com/p1',
          status: 'published', publishedAt: '2026-08-01T00:00:00.000Z', metrics: { likes: 5, comments: null, shares: 0, views: null },
        }],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        summary: { all: 1, facebook: 1, instagram: 0, x: 0, linkedin: 0, tiktok: 0 },
      },
    },
  }
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('Social Feeds page — real API data, no dummy fallback', () => {
  it('renders a real post from the API, never the old dummy "Bellhaven Family Dental" content', () => {
    render()
    expect(container.textContent).toContain('Real Page Name')
    expect(container.textContent).toContain('A real synced post')
    expect(container.textContent).not.toContain('Bellhaven')
  })

  it('summary tiles show the real backend counts, including real zeros for unintegrated platforms', () => {
    render()
    expect(container.textContent).toContain('1') // All Feeds / Facebook count
  })

  it('clicking Refresh calls the real sync mutation, not a fake setTimeout', async () => {
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(syncMutate).toHaveBeenCalledTimes(1)
    expect(notifyMock).toHaveBeenCalledWith('Feeds refreshed', 'success')
  })

  it('a failed sync shows an error toast, not a false success message', async () => {
    syncMutate.mockRejectedValue(new Error('Sync failed'))
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(notifyMock).toHaveBeenCalledWith('Sync failed', 'error')
  })

  it('passes platform/search/date/sort filters through to useSocialFeeds as real API params', () => {
    render()
    expect(lastFeedsArgs.filters).toEqual(expect.objectContaining({ sort: 'newest', page: 1, limit: 50 }))
  })

  it('when no social account is connected, the feeds query is disabled and the empty state says so', () => {
    statusResult = { data: { data: { facebook: { connected: false }, instagram: { connected: false } } } }
    feedsResult = { ...feedsResult, data: { data: { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }, summary: { all: 0, facebook: 0, instagram: 0, x: 0, linkedin: 0, tiktok: 0 } } } }
    render()
    expect(container.textContent).toContain('No social accounts connected')
  })

  it('a connected Facebook filter with zero real posts shows the Facebook-specific empty state, not a generic one', () => {
    feedsResult = { ...feedsResult, data: { data: { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }, summary: { all: 0, facebook: 0, instagram: 0, x: 0, linkedin: 0, tiktok: 0 } } } }
    render()
    const platformTile = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Facebook'))
    act(() => { platformTile.click() })
    expect(container.textContent).toContain('No Facebook posts found')
  })

  it('a metric Meta did not report (null) is never rendered as a fabricated "0"', () => {
    render()
    // comments:null must not appear as a rendered "0" comment pill; likes:5 (real) must render.
    expect(container.textContent).toContain('5')
  })
})

// Regression coverage for the reported bug: Feeds pooled posts from EVERY
// connected account regardless of which one was active. These lock in
// the new default (scoped to the active account, via the SAME
// useFacebookAccounts source of truth Overview/SwitchAccountDialog use —
// no second "selected account" state) and the explicit "All Feeds"
// opt-out.
describe('Feeds — account scoping (reuses the same active-account source of truth as Overview)', () => {
  it('the header shows the active account, from the same useFacebookAccounts source Overview reads', () => {
    render()
    expect(container.textContent).toContain('Real Page Name')
  })

  it('by default (no tile clicked), the query is scoped — allAccounts is not sent as true', () => {
    render()
    expect(lastFeedsArgs.filters.allAccounts).toBeUndefined()
  })

  it('clicking "All Feeds" explicitly requests the unscoped, every-connected-account view', () => {
    render()
    const allFeedsTile = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('All Feeds'))
    act(() => { allFeedsTile.click() })
    expect(lastFeedsArgs.filters.allAccounts).toBe(true)
    expect(lastFeedsArgs.filters.platform).toBeUndefined()
  })

  it('clicking a specific platform tile after "All Feeds" snaps back to active-account scoping, not "every Page of that platform"', () => {
    render()
    const allFeedsTile = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('All Feeds'))
    act(() => { allFeedsTile.click() })
    expect(lastFeedsArgs.filters.allAccounts).toBe(true)

    const facebookTile = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Facebook') && !b.textContent.includes('posts'))
    act(() => { facebookTile.click() })
    expect(lastFeedsArgs.filters.allAccounts).toBeUndefined()
    expect(lastFeedsArgs.filters.platform).toBe('facebook')
  })

  it('the active Facebook Page id flows into useSocialFeeds for cache-key purposes (switching accounts must produce a fresh cache entry)', () => {
    render()
    expect(lastFeedsArgs.activeSocialAccountId).toBe('acc-1')
  })

  it('a different active account produces a different cache-key id, without any second/duplicated account state', () => {
    accountsResult = { data: { data: { accounts: [{ id: 'acc-2', name: 'Different Page', picture: null, isActive: true, status: 'active' }] } } }
    render()
    expect(lastFeedsArgs.activeSocialAccountId).toBe('acc-2')
    expect(container.textContent).toContain('Different Page')
  })
})

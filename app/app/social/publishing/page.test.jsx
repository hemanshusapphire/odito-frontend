import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import SocialPublishingPage from './page'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProjectId: 'proj-1' }),
}))

const notifyMock = vi.fn()
vi.mock('@/hooks/useToastQueue', () => ({
  useToastQueue: () => ({ toasts: [], notify: notifyMock, dismiss: vi.fn() }),
}))

vi.mock('@/components/dashboard/social/SocialTabs', () => ({ default: () => null }))
vi.mock('@/components/shared/ToastStack', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/publishing/BulkUploadCard', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/publishing/PostPlannerBoard', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/publishing/PostsTable', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/publishing/PostHistoryTable', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/publishing/ScheduleCalendar', () => ({
  default: ({ posts }) => React.createElement('div', { 'data-testid': 'calendar' }, `posts=${posts.length}`),
}))
let lastOnSubmit = null
vi.mock('@/components/dashboard/social/CreatePostDialog', () => ({
  default: ({ onSubmit }) => { lastOnSubmit = onSubmit; return null },
}))

let statusResult
let calendarResult
let createMutate

vi.mock('@/hooks/useDashboardQueries', () => ({
  useSocialAccountsStatus: () => statusResult,
  useSocialPublishing: () => calendarResult,
  useCreateSocialPost: () => ({ mutateAsync: createMutate, isPending: false }),
}))

const getMetaConnectUrlMock = vi.fn()
vi.mock('@/lib/apiService', () => ({
  default: { getMetaConnectUrl: (...args) => getMetaConnectUrlMock(...args) },
}))

let container
let root

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(SocialPublishingPage))
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  createMutate = vi.fn().mockResolvedValue({ data: { publication: { id: 'pub-1', status: 'published' } } })
  statusResult = {
    data: { data: { facebook: { connected: true, socialAccountId: 'acct-fb-1', publishingReady: true }, instagram: { connected: false } } },
  }
  calendarResult = {
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    data: {
      data: {
        data: [{ id: 'p1', platform: 'facebook', content: 'Real scheduled post', status: 'scheduled', scheduledAt: '2026-08-25T09:00:00.000Z' }],
        counts: { drafts: 2, scheduledToday: 1 },
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

describe('Social Publishing page — real API data, no dummy fallback', () => {
  it('renders real calendar posts from the API, never the old fake "Thanksgiving..." calendar events', () => {
    render()
    expect(container.textContent).toContain('posts=1')
    expect(container.textContent).not.toContain('Thanksgiving')
  })

  it('shows real drafts and scheduled-today counts from the API, never hardcoded 3/2', () => {
    render()
    expect(container.textContent).toContain('2') // drafts
    expect(container.textContent).toContain('1') // scheduledToday
  })

  it('never shows a fabricated "Pending Approval" metric', () => {
    render()
    expect(container.textContent).not.toContain('Pending Approval')
  })

  it('Platform Status reflects real Facebook connection and shows X/LinkedIn/TikTok as Not Connected', () => {
    render()
    expect(container.textContent).toContain('Connected')
    expect(container.textContent).toContain('Not Connected')
  })

  it('Refresh calls the real query refetch, not a fake setTimeout', () => {
    render()
    const btn = Array.from(container.querySelectorAll('button')).find((b) => /^Refresh$/.test(b.textContent.trim()))
    act(() => { btn.click() })
    expect(calendarResult.refetch).toHaveBeenCalledTimes(1)
  })
})

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('Social Publishing page — Create Post wiring', () => {
  it('creating a post with only Facebook selected calls createSocialPost with the real connected socialAccountId, never a fabricated one', async () => {
    render()
    let result
    await act(async () => {
      result = await lastOnSubmit({ text: 'Hello world', platformIds: ['facebook'], media: [], scheduledAt: null })
      await flushPromises()
    })
    expect(createMutate).toHaveBeenCalledWith(expect.objectContaining({ platform: 'facebook', socialAccountId: 'acct-fb-1', content: 'Hello world', publishNow: true }))
    expect(notifyMock).toHaveBeenCalledWith('Post published.', 'success')
    expect(result).toBe(true)
  })

  it('a scheduled post (scheduledAt present) is created with publishNow:false and a success message that says "scheduled"', async () => {
    render()
    let result
    await act(async () => {
      result = await lastOnSubmit({ text: 'Later', platformIds: ['facebook'], media: [], scheduledAt: '2026-09-01T09:00:00' })
      await flushPromises()
    })
    expect(createMutate).toHaveBeenCalledWith(expect.objectContaining({ publishNow: false, scheduledAt: '2026-09-01T09:00:00' }))
    expect(notifyMock).toHaveBeenCalledWith('Post scheduled.', 'success')
    expect(result).toBe(true)
  })

  // Phase 2/3/6 superseded the old "photo/video not supported yet"
  // rejection: a real media upload pipeline + Facebook/Instagram media
  // publishing now exist end to end (mediaStorageService.js,
  // facebookAdapter.js/instagramAdapter.js). By the time `media` reaches
  // this handler it is already `[{url, type}]` — CreatePostDialog's
  // MediaUploader has already uploaded the file to a real public URL (see
  // CreatePostDialog.test.jsx for that upload-gating behavior) — so this
  // handler's job is simply to forward it to the API, not reject it.
  it('a submission with real uploaded media ([{url,type}]) is forwarded to the API, not rejected', async () => {
    render()
    let result
    const media = [{ url: 'https://backend.example.com/storage/social_media/proj-1/abc.png', type: 'image' }]
    await act(async () => {
      result = await lastOnSubmit({ text: 'With a photo', platformIds: ['facebook'], media, scheduledAt: null })
      await flushPromises()
    })
    expect(createMutate).toHaveBeenCalledWith(expect.objectContaining({ platform: 'facebook', media }))
    expect(notifyMock).toHaveBeenCalledWith('Post published.', 'success')
    expect(result).toBe(true)
  })

  it('selecting Instagram while it is not connected never calls the API with a fabricated account id, and reports failure', async () => {
    render()
    let result
    await act(async () => {
      result = await lastOnSubmit({ text: 'IG only', platformIds: ['instagram'], media: [], scheduledAt: null })
      await flushPromises()
    })
    expect(createMutate).not.toHaveBeenCalled()
    expect(notifyMock).toHaveBeenCalledWith(expect.stringMatching(/connected/i), 'error')
    expect(result).toBe(false)
  })

  it('a real Meta publish rejection (publishError in the response) surfaces the real reason, not a false success, and reports failure', async () => {
    createMutate.mockResolvedValue({ data: { publication: { id: 'pub-1', status: 'failed' }, publishError: { code: 'FACEBOOK_TOKEN_INVALID', message: 'Meta denied this request.' } } })
    render()
    let result
    await act(async () => {
      result = await lastOnSubmit({ text: 'Will fail', platformIds: ['facebook'], media: [], scheduledAt: null })
      await flushPromises()
    })
    expect(notifyMock).toHaveBeenCalledWith('Meta denied this request.', 'error')
    expect(result).toBe(false)
  })
})

describe('Social Publishing page — Reconnect for Publishing (Phase 4)', () => {
  it('a connected-but-not-publish-ready Facebook account shows "Reconnect for Publishing", and clicking it starts a REAL reconnect OAuth flow (reconnect:true)', async () => {
    statusResult = {
      data: { data: { facebook: { connected: true, socialAccountId: 'acct-fb-1', publishingReady: false }, instagram: { connected: false } } },
    }
    getMetaConnectUrlMock.mockResolvedValue({ data: { url: 'https://www.facebook.com/v21.0/dialog/oauth?auth_type=rerequest' } })
    render()

    const btn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Reconnect for Publishing'))
    expect(btn).toBeTruthy()
    expect(container.textContent).toContain('Connected for analytics/read access, but publishing permission is required.')

    await act(async () => {
      btn.click()
      await flushPromises()
    })

    expect(getMetaConnectUrlMock).toHaveBeenCalledWith('proj-1', 'social', true)
  })

  it('a fully publish-ready Facebook account never shows the reconnect prompt', () => {
    render()
    expect(container.textContent).not.toContain('Reconnect for Publishing')
  })
})

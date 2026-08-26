import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import PostsTable from './PostsTable'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProjectId: 'proj-1' }),
}))

vi.mock('@/lib/apiService', () => ({
  default: { uploadSocialMedia: vi.fn() },
}))

// Radix's real DropdownMenu opens via Pointer Events (pointerdown) and
// calls hasPointerCapture/setPointerCapture — none of which jsdom
// implements at all (verified directly: typeof window.PointerEvent,
// Element.prototype.hasPointerCapture are both `undefined` in this
// project's jsdom). A plain .click() therefore never opens it. This
// mocks the menu shell only (always-rendered, no open/close state of its
// own) so the actual thing under test — which menu items PostsTable
// renders, their `disabled`/`onClick` props — is exercised directly and
// deterministically, without fighting jsdom's Pointer Events gap.
// DeletePostConfirmDialog/CancelPostConfirmDialog are NOT mocked — they're
// AlertDialogs whose `open` prop is fully controlled by PostsTable's own
// React state (not Radix-internal pointer interaction to open), so they
// render for real once that state flips, same as
// CancelPostConfirmDialog.test.jsx's own convention.
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => React.createElement(React.Fragment, null, children),
  DropdownMenuTrigger: ({ children }) => children,
  DropdownMenuContent: ({ children }) => React.createElement('div', { 'data-testid': 'dropdown-content' }, children),
  DropdownMenuItem: ({ children, onClick, disabled, variant, className, ...props }) =>
    React.createElement('button', { type: 'button', onClick, disabled, 'data-variant': variant, ...props }, children),
  DropdownMenuSeparator: () => React.createElement('hr'),
}))

let queryResult
let deleteMutate
let publishMutate

vi.mock('@/hooks/useDashboardQueries', () => ({
  useSocialPublishing: () => queryResult,
  useDeleteSocialPost: () => ({ mutateAsync: deleteMutate, isPending: false }),
  usePublishSocialPost: () => ({ mutateAsync: publishMutate, isPending: false }),
  useUpdateSocialPost: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelSocialPost: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

function post(overrides = {}) {
  return {
    id: 'pub-1', platform: 'facebook', content: 'Grow your brand', status: 'published',
    scheduledAt: null, timezone: null, publishedAt: '2026-08-25T06:10:00.000Z', failureCode: null,
    ...overrides,
  }
}

let container
let root

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(PostsTable, { notify: vi.fn() }))
  })
}

function deleteButton() {
  return Array.from(container.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Delete')
}

function dialogButton(text) {
  return Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === text)
}

beforeEach(() => {
  vi.clearAllMocks()
  deleteMutate = vi.fn().mockResolvedValue({ data: { deleted: true } })
  publishMutate = vi.fn().mockResolvedValue({ data: { publication: { status: 'published' } } })
  queryResult = {
    isLoading: false,
    data: { data: { data: [post()], pagination: { page: 1, totalPages: 1 } } },
  }
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

// Regression coverage for "Implement Published Social Post Deletion" +
// "Implement Real External Social Post Deletion": the Delete menu item
// used to be permanently disabled for status:'published' — it's now
// enabled for both platforms, but clicking it opens a confirmation
// (rather than deleting immediately), and the confirmation's wording/
// action differs by platform because deleting actually does something
// different for each: a real Meta DELETE for Facebook, versus an
// Odito-only "Remove from Odito history" for Instagram (no Graph API
// DELETE exists for IG Media).
describe('PostsTable — Delete is enabled for a published post, and requires confirmation', () => {
  it('the Delete action is NOT disabled for a published post', () => {
    render()
    const btn = deleteButton()
    expect(btn).toBeTruthy()
    expect(btn.disabled).toBe(false)
  })

  it('keeps the destructive styling for a published post\'s Delete action (unchanged)', () => {
    render()
    expect(deleteButton().dataset.variant).toBe('destructive')
  })

  it('clicking Delete does NOT call the mutation immediately — it opens a confirmation dialog first', () => {
    render()
    act(() => { deleteButton().click() })
    expect(deleteMutate).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Delete this post?')
  })

  it('is still disabled for a post that is currently "publishing" (the one remaining undeletable status)', () => {
    queryResult.data.data.data = [post({ status: 'publishing' })]
    render()
    expect(deleteButton().disabled).toBe(true)
  })
})

describe('PostsTable — confirming Delete for a published FACEBOOK post', () => {
  it('shows the explicit "delete from Facebook AND Odito" wording, and confirming calls the mutation with historyOnly:false', async () => {
    render()
    act(() => { deleteButton().click() })

    expect(document.body.textContent).toContain('permanently delete the published post from Facebook')
    expect(document.body.textContent).toContain('remove it from Odito')

    await act(async () => { dialogButton('Delete Post').click() })
    expect(deleteMutate).toHaveBeenCalledWith({ publicationId: 'pub-1', historyOnly: false })
  })

  it('a failed external deletion keeps the post visible (dialog/notify only — no optimistic removal)', async () => {
    deleteMutate.mockRejectedValue(new Error('Meta denied this request — the Page connection may need to be reconnected. The post was NOT deleted.'))
    const notify = vi.fn()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => { root.render(React.createElement(PostsTable, { notify })) })

    act(() => { deleteButton().click() })
    await act(async () => { dialogButton('Delete Post').click() })

    expect(notify).toHaveBeenCalledWith('Meta denied this request — the Page connection may need to be reconnected. The post was NOT deleted.', 'error')
    // The post is still in the (unchanged) query result the table renders
    // from — nothing here ever optimistically removes it before the
    // mutation actually succeeds.
    expect(container.textContent).toContain('Grow your brand')
  })
})

describe('PostsTable — confirming Delete for a published INSTAGRAM post (no external delete path exists)', () => {
  it('shows "Remove from Odito history" — never a misleading "delete from Instagram" — and confirming sends historyOnly:true', async () => {
    queryResult.data.data.data = [post({ platform: 'instagram', id: 'pub-ig-1' })]
    render()
    act(() => { deleteButton().click() })

    expect(document.body.textContent).toContain('Remove from Odito history?')
    expect(document.body.textContent).toContain('Instagram does not support deleting a published post through the API')
    expect(document.body.textContent).toContain('the real Instagram post will remain untouched')
    expect(document.body.textContent).not.toMatch(/permanently delete.*from Instagram/i)

    await act(async () => { dialogButton('Remove from Odito History').click() })
    expect(deleteMutate).toHaveBeenCalledWith({ publicationId: 'pub-ig-1', historyOnly: true })
  })
})

describe('PostsTable — non-published statuses keep the simple, unchanged confirmation', () => {
  it('draft/scheduled/failed/cancelled show the plain "removed from Odito" wording and send historyOnly:false', async () => {
    for (const status of ['draft', 'scheduled', 'failed', 'cancelled']) {
      deleteMutate.mockClear()
      queryResult.data.data.data = [post({ status, id: `pub-${status}` })]
      render()
      const btn = deleteButton()
      expect(btn.disabled).toBe(false)
      act(() => { btn.click() })
      expect(document.body.textContent).toContain('permanently removed from Odito')
      await act(async () => { dialogButton('Delete Post').click() })
      expect(deleteMutate).toHaveBeenCalledWith({ publicationId: `pub-${status}`, historyOnly: false })
      act(() => { root.unmount() })
      container.remove()
    }
    root = null
    container = null
  })
})

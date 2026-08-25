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

// Regression coverage for "Implement Published Social Post Deletion": the
// Delete menu item used to be permanently disabled for status:'published'
// (DELETABLE_STATUSES excluded it) — it must now be enabled, and clicking
// it must call the real delete mutation with that post's id.
describe('PostsTable — Delete is enabled for a published post', () => {
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

  it('clicking Delete on a published post calls the real delete mutation with its id', async () => {
    render()
    await act(async () => { deleteButton().click() })
    expect(deleteMutate).toHaveBeenCalledWith('pub-1')
  })

  it('is still disabled for a post that is currently "publishing" (the one remaining undeletable status)', () => {
    queryResult.data.data.data = [post({ status: 'publishing' })]
    render()
    expect(deleteButton().disabled).toBe(true)
  })

  it('remains enabled and functional for the other already-deletable statuses (draft/scheduled/failed/cancelled)', async () => {
    for (const status of ['draft', 'scheduled', 'failed', 'cancelled']) {
      deleteMutate.mockClear()
      queryResult.data.data.data = [post({ status, id: `pub-${status}` })]
      render()
      const btn = deleteButton()
      expect(btn.disabled).toBe(false)
      await act(async () => { btn.click() })
      expect(deleteMutate).toHaveBeenCalledWith(`pub-${status}`)
      act(() => { root.unmount() })
      container.remove()
    }
    root = null
    container = null
  })
})

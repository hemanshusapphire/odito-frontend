import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSelectMetaPage, useSwitchFacebookAccount, useDeleteSocialPost } from './useDashboardQueries'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/lib/apiService', () => ({
  default: {
    selectMetaPage: vi.fn().mockResolvedValue({ data: { facebook: { connected: true } } }),
    switchFacebookAccount: vi.fn().mockResolvedValue({ data: { account: { id: 'acc-2', isActive: true } } }),
    deleteSocialPublication: vi.fn().mockResolvedValue({ data: { deleted: true } }),
  },
}))

let container
let root
let queryClient
let latestMutate

function Harness({ projectId }) {
  const mutation = useSelectMetaPage(projectId)
  latestMutate = mutation.mutate
  return null
}

let latestDeleteMutate

function DeleteHarness({ projectId }) {
  const mutation = useDeleteSocialPost(projectId)
  latestDeleteMutate = mutation.mutate
  return null
}

function renderDelete(projectId) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(DeleteHarness, { projectId }))
    )
  })
}

let latestSwitchMutate

function SwitchHarness({ projectId }) {
  const mutation = useSwitchFacebookAccount(projectId)
  latestSwitchMutate = mutation.mutate
  return null
}

function renderSwitch(projectId) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(SwitchHarness, { projectId }))
    )
  })
}

function render(projectId) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(Harness, { projectId }))
    )
  })
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

// The Switch Account feature (facebook/accounts, facebook/overview keyed
// by active account) was added after useSelectMetaPage already existed —
// this proves that gap is closed: connecting/selecting a Page must not
// leave a DIFFERENT, already-cached Page's accounts list or overview
// data stale.
describe('useSelectMetaPage — invalidates every social cache a connect can affect', () => {
  it('invalidates connection status, the Facebook accounts list, and the Facebook overview (prefix match reaches every account-scoped overview key)', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    render('proj-1')

    await act(async () => { latestMutate('page-123'); await flushPromises() })

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0].queryKey)
    expect(invalidatedKeys).toContainEqual(['social', 'accounts', 'status', 'proj-1'])
    expect(invalidatedKeys).toContainEqual(['social', 'facebook', 'accounts', 'proj-1'])
    expect(invalidatedKeys).toContainEqual(['social', 'facebook', 'overview', 'proj-1'])
    // Root-cause regression coverage: selectMetaPage also runs Instagram
    // discovery for the newly-selected Page server-side (Instagram's data
    // is entirely derived from whichever Page is active) — omitting this
    // invalidation was part of why Instagram Overview kept showing stale/
    // wrong-account data after a Page connect/switch.
    expect(invalidatedKeys).toContainEqual(['social', 'instagram', 'overview', 'proj-1'])
  })
})

// The user-facing "Switch Account" action itself — this is the mutation
// SwitchAccountDialog.jsx actually calls. Instagram Overview is entirely
// derived from whichever Facebook Page is active (see
// instagramOverviewService.js), so switching Pages must invalidate
// Instagram's cache too, not just Facebook's own.
describe('useSwitchFacebookAccount — switching the active Page also invalidates Instagram (derived from the same active Page)', () => {
  it('invalidates Facebook accounts/overview AND Instagram overview', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    renderSwitch('proj-1')

    await act(async () => { latestSwitchMutate('acc-2'); await flushPromises() })

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0].queryKey)
    expect(invalidatedKeys).toContainEqual(['social', 'facebook', 'accounts', 'proj-1'])
    expect(invalidatedKeys).toContainEqual(['social', 'accounts', 'status', 'proj-1'])
    expect(invalidatedKeys).toContainEqual(['social', 'facebook', 'overview', 'proj-1'])
    expect(invalidatedKeys).toContainEqual(['social', 'instagram', 'overview', 'proj-1'])
  })
})

// Regression coverage for "Implement Published Social Post Deletion":
// deleting a post (including a now-deletable published one) must
// invalidate the ['social','publishing',projectId] prefix so the Posts
// tab AND the Publishing calendar (which both build their own query key
// on top of that same prefix, just with different trailing `filters`)
// both drop the deleted post immediately, without needing two separate
// invalidation calls.
describe('useDeleteSocialPost — invalidates the publishing query prefix (Posts tab + Publishing calendar)', () => {
  it('invalidates ["social","publishing",projectId] on a successful delete', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    renderDelete('proj-1')

    await act(async () => { latestDeleteMutate('pub-1'); await flushPromises() })

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0].queryKey)
    expect(invalidatedKeys).toContainEqual(['social', 'publishing', 'proj-1'])
  })

  it('that invalidation, by key-prefix matching, also covers a differently-filtered query built on the same prefix (e.g. the calendar\'s own filters)', async () => {
    // Seed two cache entries sharing the ['social','publishing','proj-1']
    // prefix but with different trailing `filters` objects — exactly how
    // PostsTable.jsx's own filters and the Publishing calendar's
    // { sort:'newest', page:1, limit:... } filters produce two distinct
    // query keys today.
    queryClient.setQueryData(['social', 'publishing', 'proj-1', { status: 'published' }], { data: { data: [{ id: 'pub-1' }] } })
    queryClient.setQueryData(['social', 'publishing', 'proj-1', { sort: 'newest', page: 1, limit: 100 }], { data: { data: [{ id: 'pub-1' }] } })

    renderDelete('proj-1')
    await act(async () => { latestDeleteMutate('pub-1'); await flushPromises() })

    const postsTableQuery = queryClient.getQueryState(['social', 'publishing', 'proj-1', { status: 'published' }])
    const calendarQuery = queryClient.getQueryState(['social', 'publishing', 'proj-1', { sort: 'newest', page: 1, limit: 100 }])
    expect(postsTableQuery.isInvalidated).toBe(true)
    expect(calendarQuery.isInvalidated).toBe(true)
  })
})

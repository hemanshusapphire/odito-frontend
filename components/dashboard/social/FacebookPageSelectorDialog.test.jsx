import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import FacebookPageSelectorDialog from './FacebookPageSelectorDialog'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let pagesResult
let accountsResult
let selectMutate
let selectState
let switchMutate
let switchState
let retryMutate
let retryState
let lastMetaPagesArgs
let lastFacebookAccountsArgs

vi.mock('@/hooks/useDashboardQueries', () => ({
  useMetaPages: (...args) => { lastMetaPagesArgs = args; return pagesResult },
  useFacebookAccounts: (...args) => { lastFacebookAccountsArgs = args; return accountsResult },
  useSelectMetaPage: () => ({
    mutate: selectMutate,
    isPending: selectState.isPending,
    isError: selectState.isError,
    error: selectState.error,
    reset: vi.fn(),
  }),
  useSwitchFacebookAccount: () => ({
    mutate: switchMutate,
    isPending: switchState.isPending,
    isError: switchState.isError,
    error: switchState.error,
    reset: vi.fn(),
  }),
  useRetryMetaInstagramDiscovery: () => ({
    mutate: retryMutate,
    isPending: retryState.isPending,
    reset: vi.fn(),
  }),
}))

let container
let root

function render(props = {}) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(FacebookPageSelectorDialog, {
      open: true,
      onOpenChange: vi.fn(),
      projectId: 'proj-1',
      mode: 'connect',
      ...props,
    }))
  })
}

function rerender(props) {
  act(() => {
    root.render(React.createElement(FacebookPageSelectorDialog, props))
  })
}

function pageCard(name) {
  return Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes(name))
}

beforeEach(() => {
  selectMutate = vi.fn()
  switchMutate = vi.fn()
  retryMutate = vi.fn()
  selectState = { isPending: false, isError: false, error: null }
  switchState = { isPending: false, isError: false, error: null }
  retryState = { isPending: false }

  pagesResult = {
    isLoading: false,
    isError: false,
    data: {
      data: {
        pages: [
          { id: 'page-1', name: 'Brand New Page', category: 'Business', picture: null, alreadyConnected: false, isActive: false },
          { id: 'page-2', name: 'Already Connected Page', category: 'Business', picture: null, alreadyConnected: true, isActive: false },
          { id: 'page-3', name: 'Currently Active Page', category: 'Business', picture: null, alreadyConnected: true, isActive: true },
        ],
      },
    },
  }

  accountsResult = {
    isLoading: false,
    isError: false,
    data: {
      data: {
        accounts: [
          { id: 'acc-1', name: 'The Baseball', picture: null, isActive: false },
          { id: 'acc-2', name: 'Nashik Property Deals', picture: null, isActive: true },
        ],
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

describe('FacebookPageSelectorDialog — connect mode', () => {
  it('renders every Meta-discovered Page from useMetaPages', () => {
    render({ mode: 'connect' })
    expect(document.body.textContent).toContain('Brand New Page')
    expect(document.body.textContent).toContain('Already Connected Page')
    expect(document.body.textContent).toContain('Currently Active Page')
  })

  it('shows "Connect" for a genuinely new Page, "Connected" for one already persisted, and an "Active" badge for the currently active one', () => {
    render({ mode: 'connect' })
    expect(pageCard('Brand New Page').textContent).toContain('Connect')
    expect(pageCard('Brand New Page').textContent).not.toContain('Connected')
    expect(pageCard('Already Connected Page').textContent).toContain('Connected')
    expect(pageCard('Currently Active Page').textContent).toContain('Active')
  })

  it('does not preselect any Page (never auto-fires Connect for a Page the user did not click)', () => {
    render({ mode: 'connect' })
    const connectBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Connect')
    expect(connectBtn.disabled).toBe(true)
  })

  it('clicking a Page card then Connect calls selectMetaPage with that Page id', () => {
    render({ mode: 'connect' })
    act(() => { pageCard('Brand New Page').click() })
    const connectBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Connect')
    expect(connectBtn.disabled).toBe(false)
    act(() => { connectBtn.click() })
    expect(selectMutate).toHaveBeenCalledWith('page-1', expect.objectContaining({ onSuccess: expect.any(Function) }))
  })

  it('shows the Facebook+Instagram connection result once selectMetaPage resolves, and calls onConnected', () => {
    const onConnected = vi.fn()
    selectMutate = vi.fn((id, { onSuccess }) => onSuccess({
      data: { facebook: { accountName: 'Brand New Page' }, instagram: { connected: true, username: 'brandnew' } },
    }))
    render({ mode: 'connect', onConnected })
    act(() => { pageCard('Brand New Page').click() })
    const connectBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Connect')
    act(() => { connectBtn.click() })
    expect(document.body.textContent).toContain('Connection result')
    expect(document.body.textContent).toContain('@brandnew')
    expect(onConnected).toHaveBeenCalledWith('page-1')
  })

  it('offers a Retry when Instagram discovery fails for a retryable reason', () => {
    selectMutate = vi.fn((id, { onSuccess }) => onSuccess({
      data: { facebook: { accountName: 'Brand New Page' }, instagram: { connected: false, reason: 'DISCOVERY_FAILED' } },
    }))
    render({ mode: 'connect' })
    act(() => { pageCard('Brand New Page').click() })
    act(() => { Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Connect').click() })
    expect(document.body.textContent).toContain('Retry')
  })

  it('clicking Retry calls retryMetaInstagramDiscovery for the selected Page and updates the result in place once it succeeds', () => {
    selectMutate = vi.fn((id, { onSuccess }) => onSuccess({
      data: { facebook: { accountName: 'Brand New Page' }, instagram: { connected: false, reason: 'DISCOVERY_FAILED' } },
    }))
    retryMutate = vi.fn((id, { onSuccess }) => onSuccess({ data: { instagram: { connected: true, username: 'brandnew' } } }))
    render({ mode: 'connect' })
    act(() => { pageCard('Brand New Page').click() })
    act(() => { Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Connect').click() })

    const retryBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Retry')
    act(() => { retryBtn.click() })

    expect(retryMutate).toHaveBeenCalledWith('page-1', expect.objectContaining({ onSuccess: expect.any(Function) }))
    expect(document.body.textContent).toContain('@brandnew')
    expect(document.body.textContent).not.toContain('Retry')
  })

  it('shows a loading state while Pages are being fetched', () => {
    pagesResult = { isLoading: true, isError: false, data: undefined }
    render({ mode: 'connect' })
    expect(document.body.textContent).toContain('Loading your Facebook Pages')
  })

  it('shows an error state with a retry affordance when the Pages fetch fails', () => {
    pagesResult = { isLoading: false, isError: true, error: { message: 'Could not load your Facebook Pages.' }, data: undefined, refetch: vi.fn() }
    render({ mode: 'connect' })
    expect(document.body.textContent).toContain('Could not load your Facebook Pages.')
  })
})

describe('FacebookPageSelectorDialog — switch mode', () => {
  it('renders connected accounts from useFacebookAccounts, not useMetaPages', () => {
    render({ mode: 'switch' })
    expect(document.body.textContent).toContain('The Baseball')
    expect(document.body.textContent).toContain('Nashik Property Deals')
  })

  it('defaults selection to the currently active account and disables Switch Account until a different Page is chosen', () => {
    render({ mode: 'switch' })
    const switchBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Switch Account')
    expect(switchBtn.disabled).toBe(true)
    act(() => { pageCard('The Baseball').click() })
    expect(switchBtn.disabled).toBe(false)
  })

  it('marks the active account with an "Active" badge', () => {
    render({ mode: 'switch' })
    expect(pageCard('Nashik Property Deals').textContent).toContain('Active')
  })

  it('selecting a different Page and clicking Switch Account calls useSwitchFacebookAccount and, on success, closes the dialog', () => {
    const onOpenChange = vi.fn()
    const onSwitched = vi.fn()
    switchMutate = vi.fn((id, { onSuccess }) => onSuccess({ data: { account: { id: 'acc-1', name: 'The Baseball' } } }))
    render({ mode: 'switch', onOpenChange, onSwitched })
    act(() => { pageCard('The Baseball').click() })
    act(() => { Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Switch Account').click() })
    expect(switchMutate).toHaveBeenCalledWith('acc-1', expect.objectContaining({ onSuccess: expect.any(Function) }))
    expect(onSwitched).toHaveBeenCalledWith({ id: 'acc-1', name: 'The Baseball' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows a loading state while accounts are being fetched', () => {
    accountsResult = { isLoading: true, isError: false, data: undefined }
    render({ mode: 'switch' })
    expect(document.body.textContent).toContain('Loading your Facebook Pages')
  })

  it('a failed switch mutation shows an error but does not corrupt which account is marked Active', () => {
    switchState = { isPending: false, isError: true, error: { message: 'Failed to switch to that Page. Please try again.' } }
    render({ mode: 'switch' })
    expect(document.body.textContent).toContain('Failed to switch to that Page. Please try again.')
    expect(pageCard('Nashik Property Deals').textContent).toContain('Active')
    expect(pageCard('The Baseball').textContent).not.toContain('Active')
  })
})

describe('FacebookPageSelectorDialog — mode isolation (no cross-mode network calls)', () => {
  it('connect mode enables the Meta Pages query and disables the Facebook accounts (switch) query', () => {
    render({ mode: 'connect' })
    expect(lastMetaPagesArgs[1]).toMatchObject({ enabled: true })
    expect(lastFacebookAccountsArgs[1]).toMatchObject({ enabled: false })
  })

  it('switch mode enables the Facebook accounts query and disables the Meta Pages query', () => {
    render({ mode: 'switch' })
    expect(lastFacebookAccountsArgs[1]).toMatchObject({ enabled: true })
    expect(lastMetaPagesArgs[1]).toMatchObject({ enabled: false })
  })

  it('neither query is enabled while the dialog is closed, regardless of mode', () => {
    render({ mode: 'connect', open: false })
    expect(lastMetaPagesArgs[1]).toMatchObject({ enabled: false })
    rerender({ mode: 'switch', open: false, onOpenChange: vi.fn(), projectId: 'proj-1' })
    expect(lastFacebookAccountsArgs[1]).toMatchObject({ enabled: false })
  })
})

describe('FacebookPageSelectorDialog — no stale selection across close/reopen', () => {
  it('reset() clears the selection when the dialog is closed, so a fresh open never carries a stale selected card', () => {
    // Mirrors what the real Cancel/close path does (handleOpenChange ->
    // reset() -> onOpenChange(false)) without depending on Radix's own
    // open/close DOM-presence timing, which is unrelated to this
    // component's own state-reset logic.
    const onOpenChange = vi.fn()
    render({ mode: 'connect', open: true, onOpenChange })
    act(() => { pageCard('Brand New Page').click() })
    expect(pageCard('Brand New Page').getAttribute('aria-pressed')).toBe('true')

    act(() => { Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Cancel').click() })
    expect(onOpenChange).toHaveBeenCalledWith(false)

    // Same mounted instance, dialog reported as reopened by the parent —
    // proves the earlier reset() call (not a fresh mount) is what clears it.
    rerender({ mode: 'connect', open: true, onOpenChange, projectId: 'proj-1' })
    expect(pageCard('Brand New Page').getAttribute('aria-pressed')).toBe('false')
  })

  it('a mutation error message is shown but does not block choosing a different Page afterward', () => {
    selectState = { isPending: false, isError: true, error: { message: 'Failed to connect Brand New Page. Please try again.' } }
    render({ mode: 'connect' })
    expect(document.body.textContent).toContain('Failed to connect Brand New Page. Please try again.')
    act(() => { pageCard('Already Connected Page').click() })
    expect(pageCard('Already Connected Page').getAttribute('aria-pressed')).toBe('true')
  })
})

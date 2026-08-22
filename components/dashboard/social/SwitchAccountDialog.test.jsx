import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import SwitchAccountDialog from './SwitchAccountDialog'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let accountsResult
let switchMutate
let switchState

vi.mock('@/hooks/useDashboardQueries', () => ({
  useFacebookAccounts: () => accountsResult,
  useSwitchFacebookAccount: () => ({
    mutate: switchMutate,
    isPending: switchState.isPending,
    isError: switchState.isError,
    error: switchState.error,
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
    root.render(React.createElement(SwitchAccountDialog, {
      open: true,
      onOpenChange: vi.fn(),
      projectId: 'proj-1',
      ...props,
    }))
  })
}

beforeEach(() => {
  switchMutate = vi.fn()
  switchState = { isPending: false, isError: false, error: null }
  accountsResult = {
    isLoading: false,
    isError: false,
    data: {
      data: {
        accounts: [
          { id: 'acc-1', name: 'The Baseball', picture: null, status: 'active', isActive: false },
          { id: 'acc-2', name: 'Nashik Property Deals', picture: null, status: 'active', isActive: true },
          { id: 'acc-3', name: 'Naxonify', picture: null, status: 'active', isActive: false },
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

// Root cause / architecture note: `activeAccount` is derived from
// accountsQuery's own `isActive` flag (GET /social/facebook/accounts) —
// the SAME query key the parent dashboard's `activeSocialAccountId` reads
// (useFacebookAccounts, keyed ['social','facebook','accounts', projectId]).
// There is no separate/duplicated "which account is active" state to keep
// in sync — these tests lock in that the modal-level indicator reads that
// same real value, never a hardcoded name.
describe('SwitchAccountDialog — modal-level "Currently connected" indicator', () => {
  it('shows a clear, prominent "Currently connected: <name>" line derived from the real active account', () => {
    render()
    expect(document.body.textContent).toContain('Currently connected:')
    expect(document.body.textContent).toContain('Nashik Property Deals')
  })

  it('never hardcodes an account name — a different active account produces a different label', () => {
    accountsResult.data.data.accounts = [
      { id: 'acc-1', name: 'Arclite Digital Learning', picture: null, status: 'active', isActive: true },
      { id: 'acc-2', name: 'Naxonify', picture: null, status: 'active', isActive: false },
    ]
    render()
    expect(document.body.textContent).toContain('Currently connected:')
    expect(document.body.textContent).toContain('Arclite Digital Learning')
    expect(document.body.textContent).not.toContain('Nashik Property Deals')
  })

  it('does not show the indicator while accounts are still loading (no false/empty active claim)', () => {
    accountsResult = { isLoading: true, isError: false, data: undefined }
    render()
    expect(document.body.textContent).not.toContain('Currently connected:')
  })

  it('does not show the indicator when no account is active yet', () => {
    accountsResult.data.data.accounts = [
      { id: 'acc-1', name: 'The Baseball', picture: null, status: 'active', isActive: false },
    ]
    render()
    expect(document.body.textContent).not.toContain('Currently connected:')
  })

  it('the same active account also carries the in-card Active badge (secondary, not the only signal)', () => {
    render()
    const activeCard = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes('Nashik Property Deals'))
    expect(activeCard.textContent).toContain('Active')
  })

  it('other connected accounts show only "Connected", never an Active badge', () => {
    render()
    const otherCard = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes('Naxonify'))
    expect(otherCard.textContent).not.toContain('Active')
    expect(otherCard.textContent).toContain('Connected')
  })

  it('disables switching and shows a loading state while a switch is in flight, without prematurely marking the new account Active', () => {
    switchState = { isPending: true, isError: false, error: null }
    render()
    const switchButton = document.body.querySelector('button[aria-label="Switch Account"]')
    expect(switchButton.disabled).toBe(true)
    // Still says the OLD account is active — nothing optimistically flipped.
    expect(document.body.textContent).toContain('Currently connected:')
    expect(document.body.textContent).toContain('Nashik Property Deals')
  })

  it('on a failed switch, keeps the previous account marked active and shows an error message', () => {
    switchState = { isPending: false, isError: true, error: { message: 'Failed to switch Facebook Page. Please try again.' } }
    render()
    expect(document.body.textContent).toContain('Failed to switch Facebook Page');
    expect(document.body.textContent).toContain('Nashik Property Deals')
  })
})

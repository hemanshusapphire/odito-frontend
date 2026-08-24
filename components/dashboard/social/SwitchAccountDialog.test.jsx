import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import SwitchAccountDialog from './SwitchAccountDialog'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Radix's real AvatarImage never mounts an <img> in jsdom (there is no
// real network to "load" against), so the existing tests below never
// depended on it and only ever assert on text content. The picture-
// normalization tests further down DO need to inspect a real `src`
// attribute, so only AvatarImage is swapped for a minimal stand-in here —
// Avatar/AvatarFallback stay the real components, unchanged. Same
// technique already used in FacebookPageSelectorDialog.test.jsx.
vi.mock('@/components/ui/avatar', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    AvatarImage: ({ src, alt }) => (src ? React.createElement('img', { src, alt }) : null),
  }
})

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

// Regression coverage for the Meta Graph API occasionally returning an
// account's `picture` as a Markdown-style link instead of a bare URL.
describe('SwitchAccountDialog — picture normalization', () => {
  function accountCard(name) {
    return Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes(name))
  }

  it('A. a normal image URL renders as a real <img> with that exact src', () => {
    accountsResult.data.data.accounts[0].picture = 'https://example.com/a.jpg'
    render()
    const img = accountCard('The Baseball').querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('https://example.com/a.jpg')
  })

  it('B. a Markdown-wrapped image URL is extracted and used as the <img> src', () => {
    accountsResult.data.data.accounts[0].picture = '[https://example.com/a.jpg](https://example.com/a.jpg)'
    render()
    const img = accountCard('The Baseball').querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('https://example.com/a.jpg')
  })

  it('C/D/E. missing, empty, and malformed pictures all fall back cleanly, never a broken <img>, never throwing', () => {
    accountsResult.data.data.accounts[0].picture = null
    accountsResult.data.data.accounts[1].picture = ''
    accountsResult.data.data.accounts[2].picture = 'not a url at all'
    expect(() => render()).not.toThrow()
    expect(accountCard('The Baseball').querySelector('img')).toBeNull()
    expect(accountCard('Nashik Property Deals').querySelector('img')).toBeNull()
    expect(accountCard('Naxonify').querySelector('img')).toBeNull()
  })

  it('F/G/H. each connected account normalizes independently, including the active one', () => {
    accountsResult.data.data.accounts[0].picture = 'https://example.com/a.jpg' // connected, not active
    accountsResult.data.data.accounts[1].picture = '[https://example.com/active.jpg](https://example.com/active.jpg)' // active
    accountsResult.data.data.accounts[2].picture = 'javascript:alert(1)' // connected, unsafe
    render()
    expect(accountCard('The Baseball').querySelector('img').getAttribute('src')).toBe('https://example.com/a.jpg')
    const activeImg = accountCard('Nashik Property Deals').querySelector('img')
    expect(activeImg.getAttribute('src')).toBe('https://example.com/active.jpg')
    expect(accountCard('Nashik Property Deals').textContent).toContain('Active')
    expect(accountCard('Naxonify').querySelector('img')).toBeNull()
  })
})

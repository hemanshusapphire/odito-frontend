import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from './AuthGuard'
import apiService from '@/lib/apiService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Regression coverage for the real production bug: the Facebook Page
// selector dialog (opened via useMetaOAuthRedirect right after a Meta
// OAuth round-trip on /app/social) opened, showed the fetched accounts,
// then disappeared on its own ~1 second later — with no user click and no
// onOpenChange(false) call from the dialog itself.
//
// Root cause: AuthContext.jsx's checkProjectExistence was a plain function
// redefined on every AuthProvider render (not useCallback'd). AuthGuard.jsx
// below lists it as a useEffect dependency. useMetaOAuthRedirect strips
// ?meta_connected=1 from the URL via router.replace() right after opening
// the dialog — a client-side navigation that hands AuthProvider (mounted
// once at the root layout, frontend/app/layout.js) a fresh `children` tree,
// re-invoking its function body even though none of ITS OWN state changed.
// That regenerated checkProjectExistence, which re-ran AuthGuard's effect,
// which synchronously set isCheckingProjects(true) — flipping AuthGuard to
// render its "Loading your space..." screen INSTEAD OF children, unmounting
// the entire protected page (dialog included) and resetting all of its
// local useState. When the (now-cached, near-instant) check resolved,
// isCheckingProjects flipped back to false and the page remounted fresh,
// with the dialog's local `open` state back at its initial `false` — which
// is what read as the dialog "closing itself".
//
// These tests mount the REAL AuthProvider + AuthGuard (not mocked) around a
// stateful probe standing in for a page with an open dialog, and simulate
// exactly that App-Router-hands-fresh-children re-render — without ever
// calling any of AuthProvider's own setters — to prove the protected
// subtree (and the dialog's local state) survives it.

vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }) => children,
  useSession: () => ({ data: null }),
  signOut: vi.fn(),
}))

// IMPORTANT: the real Next.js useRouter() returns a STABLE object reference
// across renders. A mock that builds a new `{ push, replace }` object on
// every call would make AuthGuard's effect (which lists `router` as a
// dependency) re-run on every render forever — that's a bug in a test
// double, not something the real hook does, so this captures one object
// up front and always returns the same reference, exactly like production.
const mockRouter = { push: vi.fn(), replace: vi.fn() }
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('@/lib/apiService', () => ({
  default: {
    isAuthenticated: vi.fn(),
    getProfile: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
    removeToken: vi.fn(),
    getProjects: vi.fn(),
  },
}))

vi.mock('@/lib/socketService', () => ({
  default: { connect: vi.fn(), disconnect: vi.fn() },
}))

vi.mock('@/lib/queryClient', () => ({
  queryClient: { clear: vi.fn() },
}))

// Stands in for SocialMediaOverviewPage: local UI state (the dialog's
// `open` flag) that must NEVER reset just because an ancestor re-rendered.
let mountCount = 0
function ProtectedPageWithDialog() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  React.useEffect(() => {
    mountCount += 1
    // Simulate useMetaOAuthRedirect's onConnected() opening the dialog
    // right after this page mounts.
    setDialogOpen(true)
  }, [])
  return React.createElement('div', { 'data-testid': 'protected-page' },
    React.createElement('span', { 'data-testid': 'mount-count' }, String(mountCount)),
    dialogOpen && React.createElement('div', { 'data-testid': 'facebook-page-selector' }, 'Choose a Facebook Page')
  )
}

let container
let root

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(AuthProvider, null,
        React.createElement(AuthGuard, null,
          React.createElement(ProtectedPageWithDialog)
        )
      )
    )
  })
}

function rerenderSameTree() {
  // A fresh top-level render pass with an equivalent tree — exactly what
  // the App Router produces when handing AuthProvider new routed
  // `children` on a client-side navigation (e.g. useMetaOAuthRedirect's
  // router.replace() call), without touching any of AuthProvider's own
  // useState.
  act(() => {
    root.render(
      React.createElement(AuthProvider, null,
        React.createElement(AuthGuard, null,
          React.createElement(ProtectedPageWithDialog)
        )
      )
    )
  })
}

async function flush() {
  // Several nested async chains (checkAuth -> per-field setState -> AuthGuard's
  // effect re-running per state transition -> its own verifyProjects/
  // checkProjectExistence await) need more than a couple of microtask ticks
  // to fully settle. Pure microtask ticks (not real setTimeout, which hangs
  // act() in this React/jsdom/vitest combination) — same pattern already
  // proven in contexts/AuthContext.test.jsx's own flush().
  for (let i = 0; i < 8; i += 1) {
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mountCount = 0
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('AuthGuard — protected page (and any dialog open inside it) survives an unrelated parent re-render', () => {
  it('the Facebook Page selector dialog stays open and the page does not remount when AuthProvider re-renders with an equivalent children tree', async () => {
    apiService.isAuthenticated.mockReturnValue(true)
    apiService.getProfile.mockResolvedValue({ success: true, data: { _id: 'u1', roleId: 5, isEmailVerified: true, hasProjects: true } })
    apiService.getToken.mockReturnValue('stored-jwt')

    render()
    await flush()

    expect(container.querySelector('[data-testid="protected-page"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="facebook-page-selector"]')).toBeTruthy()
    // hasProjects legitimately transitions null -> true once during initial
    // auth bootstrap (a real, one-time settle that happens BEFORE the real
    // page/dialog would ever mount in production, since AuthGuard doesn't
    // render children at all until hasProjects first resolves) — so this
    // may already be >1 by the time the initial flush settles. That one-time
    // settle is not the bug under test; what matters is that it does NOT
    // keep climbing on every SUBSEQUENT, unrelated re-render below.
    const baselineMountCount = container.querySelector('[data-testid="mount-count"]').textContent

    // Simulate the router.replace() navigation that strips
    // ?meta_connected=1 right after the dialog opened.
    rerenderSameTree()
    await flush()

    // The dialog must still be visible...
    expect(container.querySelector('[data-testid="facebook-page-selector"]')).toBeTruthy()
    // ...and critically, the page must NOT have remounted again (mount
    // effect must not have re-run a second time) — proving this specific,
    // unrelated re-render caused no additional unmount/remount cycle, not
    // just that the dialog "happens to still be open" by coincidence.
    expect(container.querySelector('[data-testid="mount-count"]').textContent).toBe(baselineMountCount)
  })

  it('never shows the "Loading your space..." screen once hasProjects is already known true, even across repeated re-renders', async () => {
    apiService.isAuthenticated.mockReturnValue(true)
    apiService.getProfile.mockResolvedValue({ success: true, data: { _id: 'u1', roleId: 5, isEmailVerified: true, hasProjects: true } })
    apiService.getToken.mockReturnValue('stored-jwt')

    render()
    await flush()

    for (let i = 0; i < 3; i += 1) {
      rerenderSameTree()
      await flush()
      expect(container.textContent).not.toContain('Loading your space')
      expect(container.querySelector('[data-testid="protected-page"]')).toBeTruthy()
    }
  })

  it('getProjects (the network fallback inside checkProjectExistence) is never called again once hasProjects is already true', async () => {
    apiService.isAuthenticated.mockReturnValue(true)
    apiService.getProfile.mockResolvedValue({ success: true, data: { _id: 'u1', roleId: 5, isEmailVerified: true, hasProjects: true } })
    apiService.getToken.mockReturnValue('stored-jwt')

    render()
    await flush()
    rerenderSameTree()
    await flush()
    rerenderSameTree()
    await flush()

    expect(apiService.getProjects).not.toHaveBeenCalled()
  })
})

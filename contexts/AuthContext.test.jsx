import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, useAuth } from './AuthContext'
import apiService from '@/lib/apiService'
import socketService from '@/lib/socketService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// F4-008/F4-009: socket connection lifecycle now lives here — the single
// app-wide place authenticated status is known (this provider wraps the
// whole app at the root layout, frontend/app/layout.js). Individual
// pages/features (BulkVerificationController, useUrlVerification) never
// call connect()/disconnect() themselves — only join rooms / register
// listeners on the connection this provider owns.

vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }) => children,
  useSession: () => ({ data: null }),
  signOut: vi.fn(),
}))

vi.mock('@/lib/apiService', () => ({
  default: {
    isAuthenticated: vi.fn(),
    getProfile: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
    removeToken: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('@/lib/socketService', () => ({
  default: { connect: vi.fn(), disconnect: vi.fn() },
}))

vi.mock('@/lib/queryClient', () => ({
  queryClient: { clear: vi.fn() },
}))

let container
let root
let latestAuth

function Probe() {
  latestAuth = useAuth()
  return null
}

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(
      React.createElement(AuthProvider, null, React.createElement(Probe))
    )
  })
}

async function flush() {
  await act(async () => { await Promise.resolve(); await Promise.resolve() })
}

beforeEach(() => {
  vi.clearAllMocks()
  latestAuth = null
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('AuthContext — Socket.IO connection lifecycle', () => {
  it('connects the socket with the stored token once an existing session is restored on load', async () => {
    apiService.isAuthenticated.mockReturnValue(true)
    apiService.getProfile.mockResolvedValue({ success: true, data: { _id: 'u1', hasProjects: true } })
    apiService.getToken.mockReturnValue('stored-jwt')

    render()
    await flush()

    expect(socketService.connect).toHaveBeenCalledWith('stored-jwt')
    // The lifecycle effect also runs once on the initial `user === null`
    // render, before checkAuth() resolves — a harmless disconnect() no-op
    // (disconnect() itself guards on `this.socket` existing), not a bug.
    expect(socketService.connect).toHaveBeenCalledTimes(1)
  })

  it('does not connect (and disconnects, harmlessly) when no session exists on load', async () => {
    apiService.isAuthenticated.mockReturnValue(false)

    render()
    await flush()

    expect(socketService.connect).not.toHaveBeenCalled()
    expect(socketService.disconnect).toHaveBeenCalled()
  })

  it('connects on a fresh login()', async () => {
    apiService.isAuthenticated.mockReturnValue(false)
    apiService.login.mockResolvedValue({ data: { token: 'fresh-jwt', user: { _id: 'u2', hasProjects: false } } })
    apiService.getToken.mockReturnValue('fresh-jwt')

    render()
    await flush()
    expect(socketService.connect).not.toHaveBeenCalled() // not authenticated yet

    await act(async () => { await latestAuth.login('a@b.com', 'pw') })

    expect(socketService.connect).toHaveBeenCalledWith('fresh-jwt')
  })

  it('disconnects on logout()', async () => {
    apiService.isAuthenticated.mockReturnValue(true)
    apiService.getProfile.mockResolvedValue({ success: true, data: { _id: 'u1' } })
    apiService.getToken.mockReturnValue('stored-jwt')
    apiService.logout.mockResolvedValue({})

    render()
    await flush()
    expect(socketService.connect).toHaveBeenCalledTimes(1)

    await act(async () => { await latestAuth.logout() })

    expect(socketService.disconnect).toHaveBeenCalled()
  })
})

// Regression coverage for the "Facebook Page selector closes itself ~1s
// after opening" bug. Root cause: checkProjectExistence was a plain
// function redefined on every AuthProvider render (not useCallback'd).
// AuthGuard.jsx's project-existence-check effect lists it as a dependency,
// so ANY re-render of AuthProvider — including one where none of its own
// state changed, e.g. the Next.js App Router simply handing it a fresh
// `children` tree during a client-side navigation (router.replace(),
// exactly what useMetaOAuthRedirect calls right after opening the Facebook
// selector to strip ?meta_connected=1 from the URL) — made that effect
// re-run and briefly flip AuthGuard into its loading-screen branch,
// unmounting the whole protected page (and any dialog open inside it).
describe('AuthContext — checkProjectExistence identity stability (root cause of the Facebook selector self-closing bug)', () => {
  it('keeps the same function reference across a re-render where nothing it owns changed (simulates the App Router handing AuthProvider fresh children)', async () => {
    apiService.isAuthenticated.mockReturnValue(true)
    apiService.getProfile.mockResolvedValue({ success: true, data: { _id: 'u1', hasProjects: true } })
    apiService.getToken.mockReturnValue('stored-jwt')

    render()
    await flush()
    const first = latestAuth.checkProjectExistence

    // A fresh top-level render pass with an equivalent tree — the same
    // shape a client-side navigation produces when AuthProvider (mounted
    // once at the root layout) receives new routed `children`, without
    // any of AuthProvider's own useState values changing.
    act(() => {
      root.render(React.createElement(AuthProvider, null, React.createElement(Probe)))
    })
    await flush()

    expect(latestAuth.checkProjectExistence).toBe(first)
  })

  it('still changes identity when hasProjects itself genuinely changes (not over-memoized into permanent staleness)', async () => {
    apiService.isAuthenticated.mockReturnValue(true)
    apiService.getProfile.mockResolvedValue({ success: true, data: { _id: 'u1', hasProjects: false } })
    apiService.getToken.mockReturnValue('stored-jwt')

    render()
    await flush()
    const first = latestAuth.checkProjectExistence

    await act(async () => { latestAuth.setHasProjects(true) })

    expect(latestAuth.checkProjectExistence).not.toBe(first)
  })
})

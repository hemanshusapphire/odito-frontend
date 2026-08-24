import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { useMetaOAuthRedirect } from './useMetaOAuthRedirect'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let mockSearchParams
const mockReplace = vi.fn()
const mockRouter = { replace: mockReplace }

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/app/social',
  useSearchParams: () => mockSearchParams,
}))

function Host({ onConnected, onError }) {
  useMetaOAuthRedirect({ onConnected, onError })
  return null
}

let container
let root

function render(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(Host, props))
  })
}

function rerender(props) {
  act(() => {
    root.render(React.createElement(Host, props))
  })
}

beforeEach(() => {
  mockReplace.mockClear()
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

// Regression coverage for Task 6/9 of the "Facebook selector closes itself"
// investigation: ?meta_connected=1 must be processed exactly once (never
// repeatedly reopening/closing the dialog on subsequent re-renders) and
// stripped from the URL via a single router.replace() call.
describe('useMetaOAuthRedirect', () => {
  it('calls onConnected exactly once for ?meta_connected=1 and strips it from the URL', () => {
    mockSearchParams = new URLSearchParams('meta_connected=1')
    const onConnected = vi.fn()
    render({ onConnected, onError: vi.fn() })

    expect(onConnected).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith('/app/social')
  })

  it('never re-fires onConnected on a subsequent re-render of the host component', () => {
    mockSearchParams = new URLSearchParams('meta_connected=1')
    const onConnected = vi.fn()
    render({ onConnected, onError: vi.fn() })
    expect(onConnected).toHaveBeenCalledTimes(1)

    // Several unrelated re-renders (new callback references each time, as
    // a real parent re-render would produce) — must not reopen/re-trigger.
    rerender({ onConnected, onError: vi.fn() })
    rerender({ onConnected, onError: vi.fn() })
    rerender({ onConnected, onError: vi.fn() })

    expect(onConnected).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledTimes(1)
  })

  it('calls onError exactly once for ?meta_error=<code>, never onConnected', () => {
    mockSearchParams = new URLSearchParams('meta_error=access_denied')
    const onConnected = vi.fn()
    const onError = vi.fn()
    render({ onConnected, onError })

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith('access_denied')
    expect(onConnected).not.toHaveBeenCalled()
  })

  it('preserves other query params while stripping only meta_connected/meta_error', () => {
    mockSearchParams = new URLSearchParams('meta_connected=1&projectId=abc123')
    render({ onConnected: vi.fn(), onError: vi.fn() })

    expect(mockReplace).toHaveBeenCalledWith('/app/social?projectId=abc123')
  })

  it('does nothing (no callback, no replace) when neither param is present', () => {
    mockSearchParams = new URLSearchParams('')
    const onConnected = vi.fn()
    const onError = vi.fn()
    render({ onConnected, onError })

    expect(onConnected).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})

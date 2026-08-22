import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import QuickActions from './QuickActions'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const FB_PLATFORM = { id: 'facebook', name: 'Facebook', brandColor: '#1877F2', icon: () => null }

let container
let root

function render(platformStatus, onReconnectForPublishing) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(QuickActions, {
      onCreatePost: vi.fn(), onGoToTab: vi.fn(), counts: {}, platformStatus, onReconnectForPublishing,
    }))
  })
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('QuickActions — Platform Status publishing-readiness', () => {
  it('a fully-ready connected platform shows plain "Connected", no reconnect prompt', () => {
    render([{ ...FB_PLATFORM, connected: true, publishingReady: true }], vi.fn())
    expect(container.textContent).toContain('Connected')
    expect(container.textContent).not.toContain('Read Only')
    expect(container.textContent).not.toContain('Reconnect for Publishing')
  })

  it('a connected-but-not-publish-ready platform shows "Read Only" + the exact required explanation + a Reconnect action', () => {
    render([{ ...FB_PLATFORM, connected: true, publishingReady: false }], vi.fn())
    expect(container.textContent).toContain('Read Only')
    expect(container.textContent).toContain('Connected for analytics/read access, but publishing permission is required.')
    expect(container.textContent).toContain('Reconnect for Publishing')
  })

  it('clicking "Reconnect for Publishing" calls the real reconnect handler', () => {
    const onReconnect = vi.fn()
    render([{ ...FB_PLATFORM, connected: true, publishingReady: false }], onReconnect)
    const btn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Reconnect for Publishing'))
    act(() => { btn.click() })
    expect(onReconnect).toHaveBeenCalledTimes(1)
  })

  it('a disconnected platform shows "Not Connected", never the Read Only/reconnect UI', () => {
    render([{ ...FB_PLATFORM, connected: false, publishingReady: false }], vi.fn())
    expect(container.textContent).toContain('Not Connected')
    expect(container.textContent).not.toContain('Reconnect for Publishing')
  })
})

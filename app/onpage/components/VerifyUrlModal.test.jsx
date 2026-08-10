import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import VerifyUrlModal from './VerifyUrlModal'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Radix's Dialog relies on portals/focus-trap/pointer-capture APIs jsdom
// doesn't fully implement, and none of that is the code under test here —
// VerifyUrlModal is purely presentational. Stand in with plain elements so
// the test exercises this component's own open/state rendering only.
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }) => (open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null),
  DialogContent: ({ children }) => React.createElement('div', null, children),
  DialogHeader: ({ children }) => React.createElement('div', null, children),
  DialogTitle: ({ children }) => React.createElement('h2', null, children),
  DialogDescription: ({ children }) => React.createElement('p', null, children),
}))

let container
let root

function render(ui) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(ui)
  })
}

afterEach(() => {
  if (root) {
    act(() => {
      root.unmount()
    })
  }
  if (container) container.remove()
  container = null
  root = null
})

describe('VerifyUrlModal', () => {
  it('renders nothing when closed', () => {
    render(
      React.createElement(VerifyUrlModal, {
        open: false,
        onOpenChange: () => {},
        pageUrl: 'https://example.com/page',
        progress: null,
      })
    )
    expect(container.querySelector('[data-testid="dialog"]')).toBeNull()
  })

  it('shows the in-progress stage and percentage', () => {
    render(
      React.createElement(VerifyUrlModal, {
        open: true,
        onOpenChange: () => {},
        pageUrl: 'https://example.com/page',
        progress: { status: 'processing', stage: 'SEO Scoring', percentage: 65 },
      })
    )
    expect(container.textContent).toContain('SEO Scoring')
    expect(container.textContent).toContain('65%')
  })

  it('shows the completed state', () => {
    render(
      React.createElement(VerifyUrlModal, {
        open: true,
        onOpenChange: () => {},
        pageUrl: 'https://example.com/page',
        progress: { status: 'completed', stage: 'Completed', percentage: 100 },
      })
    )
    expect(container.textContent).toContain('Verification complete')
  })

  it('shows the failed state with the error message', () => {
    render(
      React.createElement(VerifyUrlModal, {
        open: true,
        onOpenChange: () => {},
        pageUrl: 'https://example.com/page',
        progress: { status: 'failed', errorMessage: 'Page returned a 500' },
      })
    )
    expect(container.textContent).toContain('Verification failed')
    expect(container.textContent).toContain('Page returned a 500')
  })

  it('exposes progressbar semantics with the current percentage while processing', () => {
    render(
      React.createElement(VerifyUrlModal, {
        open: true,
        onOpenChange: () => {},
        pageUrl: 'https://example.com/page',
        progress: { status: 'processing', stage: 'SEO Scoring', percentage: 65 },
      })
    )
    const bar = container.querySelector('[role="progressbar"]')
    expect(bar).toBeTruthy()
    expect(bar.getAttribute('aria-valuenow')).toBe('65')
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
  })

  it('uses a polite live region while processing and an assertive one on failure', () => {
    render(
      React.createElement(VerifyUrlModal, {
        open: true,
        onOpenChange: () => {},
        pageUrl: 'https://example.com/page',
        progress: { status: 'processing', stage: 'SEO Scoring', percentage: 65 },
      })
    )
    expect(container.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy()
  })

  it('marks the failed state with role=alert and aria-live=assertive', () => {
    render(
      React.createElement(VerifyUrlModal, {
        open: true,
        onOpenChange: () => {},
        pageUrl: 'https://example.com/page',
        progress: { status: 'failed', errorMessage: 'Page returned a 500' },
      })
    )
    expect(container.querySelector('[role="alert"][aria-live="assertive"]')).toBeTruthy()
  })

  it('hides decorative icons from screen readers', () => {
    render(
      React.createElement(VerifyUrlModal, {
        open: true,
        onOpenChange: () => {},
        pageUrl: 'https://example.com/page',
        progress: { status: 'processing', stage: 'SEO Scoring', percentage: 65 },
      })
    )
    expect(container.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThan(0)
  })
})

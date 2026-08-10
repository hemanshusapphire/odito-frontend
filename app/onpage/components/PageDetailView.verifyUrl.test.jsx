import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import PageDetailView from './PageDetailView'
import { useUrlVerification } from '@/hooks/useUrlVerification'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// This file only exercises the Verify URL wiring added in F4-001. The hook's
// own logic (API call, websocket subscriptions, invalidation) is covered in
// hooks/useUrlVerification.test.js — here we mock it and assert PageDetailView
// renders/disables/reports it correctly, and that the rest of the existing
// page (issue list, palette, fix panel) is untouched by the addition.
// Explicit factory (not bare automock) — automocking would import the real
// module first to derive its shape, which transitively pulls in apiService
// -> apiConfig, and apiConfig throws when NEXT_PUBLIC_API_URL isn't set.
vi.mock('@/hooks/useUrlVerification', () => ({ useUrlVerification: vi.fn() }))

vi.mock('./PageInfoCard', () => ({ default: () => React.createElement('div', { 'data-testid': 'page-info' }) }))
vi.mock('./PagePreviewCard', () => ({ default: () => React.createElement('div', { 'data-testid': 'page-preview' }) }))
vi.mock('./IssuePalette', () => ({ default: () => React.createElement('div', { 'data-testid': 'issue-palette' }) }))
vi.mock('./IssueRow', () => ({ default: ({ issue }) => React.createElement('div', { 'data-testid': 'issue-row' }, issue.id) }))
vi.mock('./FixPanel', () => ({ default: () => React.createElement('div', { 'data-testid': 'fix-panel' }) }))
vi.mock('./VerifyUrlModal', () => ({
  default: ({ open }) => (open ? React.createElement('div', { 'data-testid': 'verify-modal' }) : null),
}))
// F4-002's result panel has its own dedicated test file
// (VerificationResultPanel.test.jsx); here it's mocked purely so this file's
// F4-001 assertions don't depend on it or its live apiService/query calls.
vi.mock('./VerificationResultPanel', () => ({
  default: ({ enabled }) => (enabled ? React.createElement('div', { 'data-testid': 'verification-result-panel' }) : null),
}))
// F4-003's history panel has its own dedicated test file
// (VerificationHistoryPanel.test.jsx); mocked here for the same reason as
// VerificationResultPanel above.
vi.mock('./VerificationHistoryPanel', () => ({
  default: () => React.createElement('div', { 'data-testid': 'verification-history-panel' }),
}))

const basePageData = {
  name: 'Home',
  url: 'https://example.com/',
  statusCode: 200,
  issues: { critical: 1, high: 0, medium: 0, low: 0 },
  issues_list: [{ id: 'i1', severity: 'critical' }],
}

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

beforeEach(() => {
  vi.clearAllMocks()
})

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

function setHookState(overrides = {}) {
  useUrlVerification.mockReturnValue({
    isVerifying: false,
    startError: null,
    modalOpen: false,
    progress: null,
    verifyUrl: vi.fn(),
    closeModal: vi.fn(),
    ...overrides,
  })
}

describe('PageDetailView — Verify URL button (F4-001)', () => {
  it('renders the Verify URL button', () => {
    setHookState()
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    expect(container.textContent).toContain('Verify URL')
  })

  it('calls verifyUrl when clicked', () => {
    const verifyUrl = vi.fn()
    setHookState({ verifyUrl })
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    const button = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Verify URL'))
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(verifyUrl).toHaveBeenCalledTimes(1)
  })

  it('disables the button and shows a spinner while verifying', () => {
    setHookState({ isVerifying: true })
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    const button = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Verifying'))
    expect(button).toBeTruthy()
    expect(button.disabled).toBe(true)
  })

  it('shows a start error inline', () => {
    setHookState({ startError: 'A verification for this page is already in progress.' })
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    expect(container.textContent).toContain('A verification for this page is already in progress.')
  })

  it('renders the progress modal only when modalOpen is true', () => {
    setHookState({ modalOpen: true })
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    expect(container.querySelector('[data-testid="verify-modal"]')).toBeTruthy()
  })

  it('enables the Verification Result Panel only once progress.status is completed (F4-002)', () => {
    setHookState({ progress: { status: 'processing', stage: 'SEO Scoring', percentage: 60 } })
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    expect(container.querySelector('[data-testid="verification-result-panel"]')).toBeNull()

    act(() => {
      root.unmount()
    })
    setHookState({ progress: { status: 'completed', stage: 'Completed', percentage: 100 } })
    root = createRoot(container)
    act(() => {
      root.render(
        React.createElement(PageDetailView, {
          url: basePageData.url,
          pageData: basePageData,
          loading: false,
          error: null,
          onBack: () => {},
          projectId: 'proj-1',
        })
      )
    })
    expect(container.querySelector('[data-testid="verification-result-panel"]')).toBeTruthy()
  })

  it('marks the Verify button aria-busy while verifying and gives it a descriptive label', () => {
    setHookState({ isVerifying: true })
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    const button = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Verifying'))
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button.getAttribute('aria-label')).toMatch(/verifying/i)
    expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('marks the inline start error with role=alert', () => {
    setHookState({ startError: 'A verification for this page is already in progress.' })
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('A verification for this page is already in progress.')
  })

  it('leaves the existing issue list and palette rendering untouched', () => {
    setHookState()
    render(
      React.createElement(PageDetailView, {
        url: basePageData.url,
        pageData: basePageData,
        loading: false,
        error: null,
        onBack: () => {},
        projectId: 'proj-1',
      })
    )
    expect(container.querySelector('[data-testid="page-info"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="page-preview"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="issue-palette"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="issue-row"]')).toBeTruthy()
  })
})

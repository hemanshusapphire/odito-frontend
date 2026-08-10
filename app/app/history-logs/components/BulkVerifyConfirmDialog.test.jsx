import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import BulkVerifyConfirmDialog, { estimateBulkVerificationSeconds } from './BulkVerifyConfirmDialog'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// AlertDialog is Radix Dialog under the hood — same jsdom limitation as
// components/ui/dialog.jsx / sheet.jsx, stubbed the same way.
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ open, children }) => (open ? React.createElement('div', { 'data-testid': 'alert-dialog' }, children) : null),
  AlertDialogContent: ({ children }) => React.createElement('div', null, children),
  AlertDialogHeader: ({ children }) => React.createElement('div', null, children),
  AlertDialogTitle: ({ children }) => React.createElement('h2', null, children),
  AlertDialogDescription: ({ children }) => React.createElement('div', null, children),
  AlertDialogFooter: ({ children }) => React.createElement('div', null, children),
  AlertDialogCancel: ({ children, onClick }) => React.createElement('button', { onClick }, children),
  AlertDialogAction: ({ children, onClick }) => React.createElement('button', { onClick }, children),
}))

let container
let root

function render(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(BulkVerifyConfirmDialog, props))
  })
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('estimateBulkVerificationSeconds', () => {
  it('scales with URL count and concurrency', () => {
    expect(estimateBulkVerificationSeconds(3, 3)).toBe(40)
    expect(estimateBulkVerificationSeconds(12, 3)).toBe(160)
    expect(estimateBulkVerificationSeconds(0, 3)).toBe(0)
  })
})

describe('BulkVerifyConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render({ open: false, onOpenChange: () => {}, selectedCount: 3, onConfirm: () => {} })
    expect(container.querySelector('[data-testid="alert-dialog"]')).toBeNull()
  })

  it('shows the selected URL count and a clearly-labeled estimate — no single issue name (selection can span many issues)', () => {
    render({ open: true, onOpenChange: () => {}, selectedCount: 3, onConfirm: () => {} })
    expect(container.textContent).toContain('You are about to verify')
    expect(container.textContent).toContain('3')
    expect(container.textContent).toContain('URLs')
    expect(container.textContent).toContain('(estimate)')
  })

  it('uses singular "URL" wording for a single selected row', () => {
    render({ open: true, onOpenChange: () => {}, selectedCount: 1, onConfirm: () => {} })
    expect(container.textContent).toContain('1 URL.')
  })

  it('calls onConfirm when the Verify action is clicked', () => {
    const onConfirm = vi.fn()
    render({ open: true, onOpenChange: () => {}, selectedCount: 3, onConfirm })
    const verifyBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Verify')
    act(() => { verifyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('renders a Cancel action (dismissal itself is Radix\'s own AlertDialogCancel behavior)', () => {
    render({ open: true, onOpenChange: () => {}, selectedCount: 3, onConfirm: () => {} })
    const cancelBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent === 'Cancel')
    expect(cancelBtn).toBeTruthy()
  })
})

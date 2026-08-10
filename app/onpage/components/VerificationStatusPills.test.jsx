import { describe, it, expect, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import VerificationStatusPills from './VerificationStatusPills'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let container
let root

function render(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(VerificationStatusPills, props))
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

describe('VerificationStatusPills', () => {
  it('renders the overall status pill', () => {
    render({ status: 'completed', aiVisibilityStatus: null })
    expect(container.textContent).toContain('Completed')
  })

  it('renders failed/running/pending overall statuses', () => {
    render({ status: 'failed', aiVisibilityStatus: null })
    expect(container.textContent).toContain('Failed')
  })

  it('does not render an AI pill when aiVisibilityStatus is absent', () => {
    render({ status: 'completed', aiVisibilityStatus: null })
    expect(container.textContent).not.toContain('AI Visibility')
  })

  it('renders "AI Visibility: Updated" for SUCCESS — the same wording everywhere it appears', () => {
    render({ status: 'completed', aiVisibilityStatus: 'SUCCESS' })
    expect(container.textContent).toContain('AI Visibility: Updated')
  })

  it('renders "AI Visibility: Failed" for FAILED', () => {
    render({ status: 'completed', aiVisibilityStatus: 'FAILED' })
    expect(container.textContent).toContain('AI Visibility: Failed')
  })

  it('renders "AI Visibility: Skipped" for SKIPPED', () => {
    render({ status: 'completed', aiVisibilityStatus: 'SKIPPED' })
    expect(container.textContent).toContain('AI Visibility: Skipped')
  })

  it('renders both pills with role="status"', () => {
    render({ status: 'completed', aiVisibilityStatus: 'SUCCESS' })
    expect(container.querySelectorAll('[role="status"]').length).toBe(2)
  })
})

import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import CancelPostConfirmDialog from './CancelPostConfirmDialog'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let container
let root

function render(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(CancelPostConfirmDialog, { open: true, ...props }))
  })
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

function findButton(text) {
  return Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes(text))
}

describe('CancelPostConfirmDialog', () => {
  it('confirming calls onConfirm — cancelling never calls any platform API, it only ever changes status locally', async () => {
    const onConfirm = vi.fn()
    render({ post: { id: 'pub-1', scheduledAt: '2026-09-01T09:00:00.000Z' }, onConfirm, onOpenChange: vi.fn() })

    expect(document.body.textContent).toMatch(/cancelled/i)
    act(() => { findButton('Cancel Post').click() })
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('"Keep Post" closes without confirming', async () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render({ post: { id: 'pub-1', scheduledAt: null }, onConfirm, onOpenChange })

    act(() => { findButton('Keep Post').click() })
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('buttons are disabled while loading', async () => {
    render({ post: { id: 'pub-1' }, onConfirm: vi.fn(), onOpenChange: vi.fn(), loading: true })
    expect(findButton('Cancelling…').disabled).toBe(true)
    expect(findButton('Keep Post').disabled).toBe(true)
  })
})

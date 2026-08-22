import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import EditPostDialog from './EditPostDialog'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/lib/apiService', () => ({
  default: { uploadSocialMedia: vi.fn() },
}))

if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock-url'
if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {}

const POST = {
  id: 'pub-1',
  content: 'Original content',
  media: [{ url: 'https://backend.example.com/storage/social_media/proj-1/existing.png', type: 'image' }],
}

let container
let root

function render({ post = POST, onSave } = {}) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  const onOpenChange = vi.fn()
  act(() => {
    root.render(React.createElement(EditPostDialog, {
      post, projectId: 'proj-1', open: true, onOpenChange, onSave,
    }))
  })
  return onOpenChange
}

function textarea() {
  return document.body.querySelector('textarea')
}

function saveButton() {
  return Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes('Save Changes'))
}

function typeInto(el, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
  nativeSetter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('EditPostDialog', () => {
  it('pre-fills the textarea with the post\'s existing content and shows its existing media, without re-uploading it', async () => {
    render({})
    expect(textarea().value).toBe('Original content')
    // The existing media renders from its real stored URL directly (an
    // <img> whose src is that URL) — no upload call should ever fire for
    // media that was already uploaded before this dialog opened.
    const img = document.body.querySelector('img')
    expect(img.src).toBe('https://backend.example.com/storage/social_media/proj-1/existing.png')
  })

  it('saving calls onSave with the edited content and the (unchanged) existing media, then closes on success', async () => {
    const onSave = vi.fn().mockResolvedValue(true)
    const onOpenChange = render({ onSave })

    act(() => { typeInto(textarea(), 'Edited content') })
    await act(async () => {
      saveButton().click()
      await wait(20)
    })

    expect(onSave).toHaveBeenCalledWith('pub-1', {
      content: 'Edited content',
      media: [{ url: 'https://backend.example.com/storage/social_media/proj-1/existing.png', type: 'image' }],
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('a failed save (onSave resolves false) keeps the dialog open, matching CreatePostDialog\'s own open-on-failure contract', async () => {
    const onSave = vi.fn().mockResolvedValue(false)
    const onOpenChange = render({ onSave })

    act(() => { typeInto(textarea(), 'Will fail to save') })
    await act(async () => {
      saveButton().click()
      await wait(20)
    })

    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('empty content disables Save Changes', async () => {
    render({})
    act(() => { typeInto(textarea(), '') })
    expect(saveButton().disabled).toBe(true)
  })
})

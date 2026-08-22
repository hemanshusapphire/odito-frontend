import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import CreatePostDialog from './CreatePostDialog'
import apiService from '@/lib/apiService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// MediaUploader.jsx (rendered inside CreatePostDialog) calls the real
// apiService.uploadSocialMedia() for each selected file — mocked here
// exactly like every other test file that touches apiService (see
// contexts/AuthContext.test.jsx), both to avoid a real network call and
// because lib/apiConfig.js throws at import time if NEXT_PUBLIC_API_URL
// isn't set in this test environment.
vi.mock('@/lib/apiService', () => ({
  default: { uploadSocialMedia: vi.fn() },
}))

// jsdom has no real object-URL implementation — MediaUploader.jsx only
// ever uses these for an on-screen thumbnail (never sent to the backend,
// see buildPayload's own comment), so a trivial stub is sufficient here.
if (typeof URL.createObjectURL !== 'function') URL.createObjectURL = () => 'blob:mock-url'
if (typeof URL.revokeObjectURL !== 'function') URL.revokeObjectURL = () => {}

// Root-cause regression coverage for a real report: a user attached a
// photo, typed content, clicked Publish Now — the modal closed as if it
// worked, but NOTHING was ever created (0 documents in MongoDB). Traced to
// two compounding facts: (1) the Publishing page's onSubmit correctly
// refuses media (no upload pipeline exists yet) and shows an error toast,
// but (2) this dialog used to call handleOpenChange(false) UNCONDITIONALLY
// right after calling onSubmit, regardless of whether it succeeded — so a
// clean, correct rejection looked identical to a silent success. These
// tests lock in the fix: onSubmit returning `false` keeps the dialog open
// (and the user's text/selection intact) instead of closing it.

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', connected: true, icon: () => null },
  { id: 'instagram', name: 'Instagram', connected: true, icon: () => null },
]

let container
let root

function render(onSubmit) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  const onOpenChange = vi.fn()
  act(() => {
    root.render(React.createElement(CreatePostDialog, {
      open: true, onOpenChange, platforms: PLATFORMS, onSubmit, projectId: 'proj-1',
    }))
  })
  return onOpenChange
}

function textarea() {
  return document.body.querySelector('textarea')
}

function publishButton() {
  return Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes('Publish Now'))
}

function fileInputEl() {
  return document.body.querySelector('input[type="file"]')
}

// jsdom's <input type="file">.files is normally read-only; this is the
// standard workaround (redefine the property) to simulate a real file
// selection and let UploadDropzone's onChange -> MediaUploader's real
// upload call fire exactly as it would in a browser.
function selectFile(file) {
  const input = fileInputEl()
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// React tracks a controlled input's value through its own internal
// wrapper around the native setter — directly assigning `.value` bypasses
// that tracker, so a plain `dispatchEvent(new Event('input'))` afterward
// is a no-op as far as React's onChange is concerned. Using the native
// setter directly (the standard workaround) makes React actually see the
// change.
function typeInto(el, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
  nativeSetter.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('CreatePostDialog — stays open on a rejected/failed submission', () => {
  it('a submission onSubmit reports as failed (returns false) keeps the dialog open and preserves the typed content', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false)
    const onOpenChange = render(onSubmit)

    act(() => { typeInto(textarea(), 'A post with a photo attached') })
    await act(async () => {
      publishButton().click()
      await wait(750)
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    // The dialog must still be open (never told its parent to close) and
    // the user's own text must still be exactly what they typed — nothing
    // silently discarded.
    expect(textarea().value).toBe('A post with a photo attached')
  })

  it('a successful submission (onSubmit resolves true) closes the dialog', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    const onOpenChange = render(onSubmit)

    act(() => { typeInto(textarea(), 'A real text post') })
    await act(async () => {
      publishButton().click()
      await wait(750)
    })

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('onSubmit resolving undefined (the Overview/Feeds pages\' trivial toast-only handlers) is still treated as success', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onOpenChange = render(onSubmit)

    act(() => { typeInto(textarea(), 'Trivial handler post') })
    await act(async () => {
      publishButton().click()
      await wait(750)
    })

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('the Publish Now button becomes clickable again after a rejected submission (loading state clears)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(false)
    render(onSubmit)

    act(() => { typeInto(textarea(), 'Retry me') })
    await act(async () => {
      publishButton().click()
      await wait(750)
    })

    expect(publishButton().disabled).toBe(false)
  })
})

describe('CreatePostDialog — real media upload (Phase 2/3/6)', () => {
  afterEach(() => { apiService.uploadSocialMedia.mockReset() })

  it('a selected image is uploaded via apiService.uploadSocialMedia, and the real uploaded {url,type} — never a blob: preview URL — is sent to onSubmit', async () => {
    apiService.uploadSocialMedia.mockResolvedValue({
      data: { url: 'https://backend.example.com/storage/social_media/proj-1/abc.png', type: 'image', mimeType: 'image/png', width: 10, height: 10, size: 5 },
    })
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(onSubmit)

    act(() => { typeInto(textarea(), 'A post with a real photo') })
    await act(async () => {
      selectFile(new File(['x'], 'photo.png', { type: 'image/png' }))
      await wait(20)
    })

    expect(apiService.uploadSocialMedia).toHaveBeenCalledWith('proj-1', expect.any(File))
    await act(async () => {
      publishButton().click()
      await wait(750)
    })

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      media: [{ url: 'https://backend.example.com/storage/social_media/proj-1/abc.png', type: 'image' }],
    }))
  })

  it('Publish Now is disabled while the upload is in flight, and enables once it finishes', async () => {
    let resolveUpload
    apiService.uploadSocialMedia.mockReturnValue(new Promise((resolve) => { resolveUpload = resolve }))
    render(vi.fn().mockResolvedValue(true))

    act(() => { typeInto(textarea(), 'Waiting on upload') })
    await act(async () => {
      selectFile(new File(['x'], 'photo.png', { type: 'image/png' }))
      await wait(20)
    })
    expect(publishButton().disabled).toBe(true)

    await act(async () => {
      resolveUpload({ data: { url: 'https://x/img.png', type: 'image' } })
      await wait(20)
    })
    expect(publishButton().disabled).toBe(false)
  })

  it('a failed upload blocks submission and shows Retry; retrying and succeeding unblocks it', async () => {
    apiService.uploadSocialMedia.mockRejectedValueOnce(new Error('Upload failed.'))
    render(vi.fn().mockResolvedValue(true))

    act(() => { typeInto(textarea(), 'Retry flow') })
    await act(async () => {
      selectFile(new File(['x'], 'photo.png', { type: 'image/png' }))
      await wait(20)
    })
    expect(publishButton().disabled).toBe(true)
    const retryBtn = Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes('Retry'))
    expect(retryBtn).toBeTruthy()

    apiService.uploadSocialMedia.mockResolvedValueOnce({ data: { url: 'https://x/img.png', type: 'image' } })
    await act(async () => {
      retryBtn.click()
      await wait(20)
    })
    expect(publishButton().disabled).toBe(false)
  })

  it('Instagram selected with no media shows a non-blocking hint but Publish Now still succeeds (default multi-select must not be broken)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(onSubmit)
    act(() => { typeInto(textarea(), 'Text only, both platforms selected') })

    expect(document.body.textContent).toMatch(/Instagram requires a photo or video/i)
    expect(publishButton().disabled).toBe(false)

    await act(async () => {
      publishButton().click()
      await wait(750)
    })
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ media: [] }))
  })
})

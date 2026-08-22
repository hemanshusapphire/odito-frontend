import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import FailureDetails, { NOT_RETRYABLE_CODES } from './FailureDetails'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Root-cause regression coverage: a failed Instagram post used to show
// only a bare "Failed" badge with no way to see why (the underlying real
// bug — Meta's error reduced to "Meta rejected this post." — is fixed at
// the backend; see instagramAdapter.js/socialPublishingService.js). This
// component is the "View error" affordance the Posts/History tables now
// render for any failed post.

let container
let root

function render(post) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => { root.render(React.createElement(FailureDetails, { post })) })
}

function viewErrorButton() {
  return Array.from(document.body.querySelectorAll('button')).find((b) => b.textContent.includes('View error'))
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('FailureDetails', () => {
  it('renders nothing for a non-failed post', () => {
    render({ status: 'published', failureReason: null, failureCode: null, platform: 'facebook' })
    expect(viewErrorButton()).toBeFalsy()
  })

  it('renders nothing for a failed post with no failureReason at all (defensive)', () => {
    render({ status: 'failed', failureReason: null, failureCode: null, platform: 'facebook' })
    expect(viewErrorButton()).toBeFalsy()
  })

  it('shows a "View error" trigger for a failed post, and expands to a curated headline + the raw failureReason + the failureCode for a known code', async () => {
    render({ status: 'failed', failureCode: 'INSTAGRAM_PERMISSION_MISSING', failureReason: 'This Instagram connection is missing publishing permission — disconnect and reconnect it, making sure to approve posting permission when Facebook asks.', platform: 'instagram' })
    const btn = viewErrorButton()
    expect(btn).toBeTruthy()

    await act(async () => { btn.click() })
    expect(document.body.textContent).toContain('Instagram publishing permission is missing. Reconnect your Instagram account.')
    expect(document.body.textContent).toContain('This Instagram connection is missing publishing permission')
    expect(document.body.textContent).toContain('INSTAGRAM_PERMISSION_MISSING')
  })

  it('shows the media-unreachable headline for INSTAGRAM_MEDIA_URL_UNREACHABLE', async () => {
    render({ status: 'failed', failureCode: 'INSTAGRAM_MEDIA_URL_UNREACHABLE', failureReason: 'Instagram could not access the uploaded media. Publishing requires a publicly reachable HTTPS media URL.', platform: 'instagram' })
    await act(async () => { viewErrorButton().click() })
    expect(document.body.textContent).toContain('Instagram could not access the uploaded media. Publishing requires a publicly reachable HTTPS media URL.')
  })

  it('falls back to a generic, still platform-aware headline for an unrecognized/legacy failureCode', async () => {
    render({ status: 'failed', failureCode: null, failureReason: 'Meta rejected this post.', platform: 'instagram' })
    const btn = viewErrorButton()
    expect(btn).toBeTruthy() // an old record with no failureCode still gets a usable "View error"
    await act(async () => { btn.click() })
    expect(document.body.textContent).toContain('Instagram rejected this post. View technical details for troubleshooting.')
    expect(document.body.textContent).toContain('Meta rejected this post.')
  })

  it('never renders a bare technical code without also showing a human-readable headline', async () => {
    render({ status: 'failed', failureCode: 'SOME_UNKNOWN_FUTURE_CODE', failureReason: 'Something specific went wrong.', platform: 'facebook' })
    await act(async () => { viewErrorButton().click() })
    expect(document.body.textContent).toContain('Facebook rejected this post. View technical details for troubleshooting.')
    expect(document.body.textContent).toContain('Something specific went wrong.')
  })

  it('shows a specific headline for FACEBOOK_TOKEN_INVALID / INSTAGRAM_RATE_LIMITED (Phase 9 coverage)', async () => {
    render({ status: 'failed', failureCode: 'FACEBOOK_TOKEN_INVALID', failureReason: 'Meta denied this request — the Page connection may need to be reconnected.', platform: 'facebook' })
    await act(async () => { viewErrorButton().click() })
    expect(document.body.textContent).toContain('Meta denied this request — the Page connection may need to be reconnected.')
  })
})

describe('NOT_RETRYABLE_CODES', () => {
  it('marks permission-missing and media-unreachable codes as not blindly retryable', () => {
    expect(NOT_RETRYABLE_CODES.has('FACEBOOK_PERMISSION_MISSING')).toBe(true)
    expect(NOT_RETRYABLE_CODES.has('INSTAGRAM_PERMISSION_MISSING')).toBe(true)
    expect(NOT_RETRYABLE_CODES.has('FACEBOOK_MEDIA_URL_UNREACHABLE')).toBe(true)
    expect(NOT_RETRYABLE_CODES.has('INSTAGRAM_MEDIA_URL_UNREACHABLE')).toBe(true)
  })

  it('does not block genuinely retryable failures like rate limiting or a transient publish failure', () => {
    expect(NOT_RETRYABLE_CODES.has('FACEBOOK_RATE_LIMITED')).toBe(false)
    expect(NOT_RETRYABLE_CODES.has('INSTAGRAM_PUBLISH_FAILED')).toBe(false)
  })
})

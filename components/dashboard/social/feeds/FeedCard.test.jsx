import { describe, it, expect, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import FeedCard from './FeedCard'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const FB_PLATFORM = { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: () => null }

function basePost(overrides = {}) {
  return {
    id: 'post-1',
    accountName: 'Real Page Name',
    username: null,
    accountPicture: null,
    text: 'Hello world',
    status: 'published',
    publishedAt: '2026-08-01T12:00:00.000Z',
    metrics: {},
    ...overrides,
  }
}

let container
let root

function render(post, platform = FB_PLATFORM) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(FeedCard, { post, platform }))
  })
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

// Regression coverage for the Meta Graph API occasionally returning a
// post's `accountPicture` as a Markdown-style link (`[url](url)`) instead
// of a bare URL — see lib/security/sanitize.js's normalizeImageUrl, which
// this card now runs `post.accountPicture` through before it ever reaches
// the <img> src.
describe('FeedCard — account picture normalization', () => {
  it('A. a normal image URL renders as a real <img> with that exact src', () => {
    render(basePost({ accountPicture: 'https://example.com/a.jpg' }))
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('https://example.com/a.jpg')
  })

  it('B. a Markdown-wrapped image URL is extracted and used as the <img> src', () => {
    render(basePost({ accountPicture: '[https://example.com/a.jpg](https://example.com/a.jpg)' }))
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('https://example.com/a.jpg')
  })

  it('C. a missing accountPicture renders the initials fallback, never a broken <img>', () => {
    render(basePost({ accountPicture: null, accountName: 'Real Page Name' }))
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('R')
  })

  it('D. an empty accountPicture renders the initials fallback', () => {
    render(basePost({ accountPicture: '' }))
    expect(container.querySelector('img')).toBeNull()
  })

  it('E. a malformed accountPicture renders the initials fallback, never throws', () => {
    expect(() => render(basePost({ accountPicture: 'not a url at all' }))).not.toThrow()
    expect(container.querySelector('img')).toBeNull()
  })

  it('an unsafe scheme (javascript:) is never passed through as an image source', () => {
    render(basePost({ accountPicture: 'javascript:alert(1)' }))
    expect(container.querySelector('img')).toBeNull()
  })

  it('the card still renders the post text/date/platform badge normally regardless of picture validity', () => {
    render(basePost({ accountPicture: '[broken markdown', text: 'Still renders #hashtag' }))
    expect(container.textContent).toContain('Still renders')
    expect(container.textContent).toContain('#hashtag')
  })
})

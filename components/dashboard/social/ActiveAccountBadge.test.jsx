import { describe, it, expect, afterEach, vi } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import ActiveAccountBadge from './ActiveAccountBadge'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Radix's real AvatarImage never mounts an <img> in jsdom (there is no
// real network to "load" against), so a minimal stand-in is used here to
// inspect the actual `src` it receives — Avatar/AvatarFallback stay the
// real components, unchanged. Same technique already used in
// FacebookPageSelectorDialog.test.jsx.
vi.mock('@/components/ui/avatar', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    AvatarImage: ({ src, alt }) => (src ? React.createElement('img', { src, alt }) : null),
  }
})

let container
let root

function render(props) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(ActiveAccountBadge, props))
  })
}

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

// Regression coverage for the Meta Graph API occasionally returning an
// account's `picture` as a Markdown-style link instead of a bare URL —
// this badge is the single shared render point SocialPageHeader.jsx and
// FeedsHeader.jsx both delegate to, so fixing normalization here covers
// both pages without duplicating it in either parent.
describe('ActiveAccountBadge — picture normalization', () => {
  it('A. a normal image URL renders as a real <img> with that exact src', () => {
    render({ name: 'The Baseball', picture: 'https://example.com/a.jpg' })
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('https://example.com/a.jpg')
  })

  it('B. a Markdown-wrapped image URL is extracted and used as the <img> src', () => {
    render({ name: 'The Baseball', picture: '[https://example.com/a.jpg](https://example.com/a.jpg)' })
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img.getAttribute('src')).toBe('https://example.com/a.jpg')
  })

  it('C. a missing picture renders the initials fallback, never a broken <img>', () => {
    render({ name: 'The Baseball', picture: null })
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('T')
  })

  it('D. an empty picture renders the initials fallback', () => {
    render({ name: 'The Baseball', picture: '' })
    expect(container.querySelector('img')).toBeNull()
  })

  it('E. a malformed picture renders the initials fallback, never throws', () => {
    expect(() => render({ name: 'The Baseball', picture: 'not a url at all' })).not.toThrow()
    expect(container.querySelector('img')).toBeNull()
  })

  it('an unsafe scheme (data:) is never passed through as an image source', () => {
    render({ name: 'The Baseball', picture: 'data:image/png;base64,aGVsbG8=' })
    expect(container.querySelector('img')).toBeNull()
  })

  it('renders nothing at all when there is no account name yet, regardless of picture', () => {
    render({ name: null, picture: 'https://example.com/a.jpg' })
    expect(container.innerHTML).toBe('')
  })
})

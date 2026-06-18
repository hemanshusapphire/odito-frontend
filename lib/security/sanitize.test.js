import { describe, it, expect } from 'vitest'
import { escapeHTML, sanitizeHTML, renderInlineMarkdown } from './sanitize'

describe('escapeHTML', () => {
  it('escapes all HTML-significant characters', () => {
    expect(escapeHTML(`<img src=x onerror="alert(1)">`)).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'
    )
  })

  it('handles null/undefined', () => {
    expect(escapeHTML(null)).toBe('')
    expect(escapeHTML(undefined)).toBe('')
  })
})

describe('sanitizeHTML', () => {
  it('strips script blocks and their contents', () => {
    expect(sanitizeHTML('hi<script>alert(1)</script>there')).toBe('hithere')
  })

  it('drops disallowed tags but keeps their text', () => {
    expect(sanitizeHTML('<div onclick="x">hello</div>')).toBe('hello')
  })

  it('keeps allowlisted tags but strips every attribute', () => {
    expect(sanitizeHTML('<strong style="color:red" onmouseover="x">hi</strong>')).toBe(
      '<strong>hi</strong>'
    )
  })

  it('removes javascript: anchors entirely (attributes stripped)', () => {
    expect(sanitizeHTML('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>')
  })
})

describe('renderInlineMarkdown', () => {
  it('renders bold from markdown after escaping', () => {
    expect(renderInlineMarkdown('hello **world**')).toBe('hello <strong>world</strong>')
  })

  it('neutralizes injected HTML in the source text', () => {
    const out = renderInlineMarkdown('<img src=x onerror=alert(1)> **safe**')
    expect(out).not.toContain('<img')
    expect(out).toContain('<strong>safe</strong>')
    expect(out).toContain('&lt;img')
  })
})

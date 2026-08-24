import { describe, it, expect } from 'vitest'
import { escapeHTML, sanitizeHTML, renderInlineMarkdown, normalizeImageUrl } from './sanitize'

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

// Regression coverage for the Meta Graph API occasionally returning a
// social Page's `picture` as a Markdown-style link (`[url](url)`) instead
// of a bare URL, which would otherwise be handed straight to an <img>/
// <AvatarImage> `src` and fail to load.
describe('normalizeImageUrl', () => {
  it('returns a normal http(s) URL unchanged', () => {
    expect(normalizeImageUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg')
    expect(normalizeImageUrl('http://example.com/a.jpg')).toBe('http://example.com/a.jpg')
  })

  it('extracts the real URL from a Markdown-style link', () => {
    expect(normalizeImageUrl('[https://example.com/a.jpg](https://example.com/a.jpg)')).toBe('https://example.com/a.jpg')
  })

  it('extracts the URL from a Markdown link with a different label than the URL', () => {
    expect(normalizeImageUrl('[Page photo](https://example.com/a.jpg)')).toBe('https://example.com/a.jpg')
  })

  it('returns null for missing values', () => {
    expect(normalizeImageUrl(null)).toBeNull()
    expect(normalizeImageUrl(undefined)).toBeNull()
  })

  it('returns null for an empty or whitespace-only string', () => {
    expect(normalizeImageUrl('')).toBeNull()
    expect(normalizeImageUrl('   ')).toBeNull()
  })

  it('returns null for a malformed/non-URL string, never throws', () => {
    expect(() => normalizeImageUrl('not a url at all')).not.toThrow()
    expect(normalizeImageUrl('not a url at all')).toBeNull()
    expect(normalizeImageUrl('[broken markdown without a closing paren')).toBeNull()
  })

  it('never throws for a non-string value (number, object, array), and rejects the ones that are not a usable URL', () => {
    expect(() => normalizeImageUrl(12345)).not.toThrow()
    expect(() => normalizeImageUrl({ url: 'https://example.com/a.jpg' })).not.toThrow()
    expect(() => normalizeImageUrl(['https://example.com/a.jpg', 'https://example.com/b.jpg'])).not.toThrow()
    expect(normalizeImageUrl(12345)).toBeNull()
    expect(normalizeImageUrl({ url: 'https://example.com/a.jpg' })).toBeNull()
  })

  it('unescapes JSON-style backslash-escaped slashes before parsing', () => {
    expect(normalizeImageUrl('https:\\/\\/example.com\\/a.jpg')).toBe('https://example.com/a.jpg')
  })

  it('decodes an HTML-entity-escaped ampersand in the URL', () => {
    expect(normalizeImageUrl('https://example.com/a.jpg?x=1&amp;y=2')).toBe('https://example.com/a.jpg?x=1&y=2')
  })

  it('rejects unsafe schemes (javascript:, data:, blob:, file:) even after extraction', () => {
    expect(normalizeImageUrl('javascript:alert(1)')).toBeNull()
    expect(normalizeImageUrl('data:image/png;base64,aGVsbG8=')).toBeNull()
    expect(normalizeImageUrl('blob:https://example.com/uuid')).toBeNull()
    expect(normalizeImageUrl('file:///etc/passwd')).toBeNull()
    expect(normalizeImageUrl('[javascript:alert(1)](javascript:alert(1))')).toBeNull()
  })

  it('rejects a relative/protocol-less string rather than guessing a scheme', () => {
    expect(normalizeImageUrl('example.com/a.jpg')).toBeNull()
    expect(normalizeImageUrl('/images/a.jpg')).toBeNull()
  })

  it('rejects a protocol-relative URL ("//host/path") — it must not be treated as same-origin-safe', () => {
    expect(normalizeImageUrl('//example.com/a.jpg')).toBeNull()
  })

  it('preserves query parameters and a fragment on an ordinary URL unchanged', () => {
    expect(normalizeImageUrl('https://example.com/a.jpg?w=200&h=200#thumb')).toBe('https://example.com/a.jpg?w=200&h=200#thumb')
  })

  it('does not mistake bracket/paren text that is not a whole-string Markdown link for one', () => {
    // Has brackets AND parens, but the string isn't ENTIRELY `[label](url)` —
    // must not be treated as Markdown, and (correctly) has no usable URL.
    expect(normalizeImageUrl('[not a link] just text (with parens)')).toBeNull()
    expect(normalizeImageUrl('prefix [https://example.com/a.jpg](https://example.com/a.jpg)')).toBeNull()
  })

  it('returns null for an array or empty-array input rather than throwing', () => {
    expect(() => normalizeImageUrl([])).not.toThrow()
    expect(() => normalizeImageUrl([null, undefined])).not.toThrow()
    expect(normalizeImageUrl([])).toBeNull()
    expect(normalizeImageUrl([null, undefined])).toBeNull()
  })
})

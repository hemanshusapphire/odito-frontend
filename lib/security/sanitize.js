/**
 * Lightweight, dependency-free HTML sanitization helpers for the small number
 * of `dangerouslySetInnerHTML` sites in the app (AI chat output, generated
 * impact copy). Runs identically on server and client (no DOM dependency).
 *
 * These are intentionally conservative: they whitelist a tiny set of formatting
 * tags and strip ALL attributes, which kills event handlers (onerror, onclick),
 * `javascript:` URLs, and inline styles. For richer needs, reach for DOMPurify.
 */

const DEFAULT_ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'code', 'pre', 'ul', 'ol', 'li', 'a',
  'h1', 'h2', 'h3', 'span',
]

/** Escape HTML special characters so text can never be interpreted as markup. */
export function escapeHTML(input) {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Sanitize an HTML string by removing dangerous blocks, dropping any tag not on
 * the allowlist, and stripping every attribute from the tags that remain.
 *
 * @param {string} html
 * @param {{ allowedTags?: string[] }} [options]
 * @returns {string} sanitized HTML safe for dangerouslySetInnerHTML
 */
export function sanitizeHTML(html, { allowedTags = DEFAULT_ALLOWED_TAGS } = {}) {
  if (html == null) return ''
  let out = String(html)

  // 1. Remove dangerous elements together with their contents.
  out = out.replace(
    /<(script|style|iframe|object|embed|noscript|template)\b[\s\S]*?<\/\1\s*>/gi,
    ''
  )
  // Also drop any self-closing/orphan dangerous opening tags.
  out = out.replace(/<\/?(script|style|iframe|object|embed|noscript|template)\b[^>]*>/gi, '')

  // 2. Walk remaining tags: keep allowlisted ones (attribute-stripped), drop the rest.
  out = out.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g, (match, slash, tag, selfClose) => {
    const name = tag.toLowerCase()
    if (!allowedTags.includes(name)) return ''
    if (slash) return `</${name}>`
    return selfClose ? `<${name} />` : `<${name}>`
  })

  return out
}

/**
 * Render a tiny, fixed subset of inline markdown (`**bold**`, `*italic*`) from
 * untrusted text. The text is HTML-escaped FIRST, then only our own formatting
 * tags are introduced — so no markup from the input can ever survive.
 *
 * @param {string} text
 * @returns {string} safe HTML
 */
export function renderInlineMarkdown(text) {
  const escaped = escapeHTML(text)
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+?)\*/g, '$1<em>$2</em>')
}

/**
 * Normalizes an external (Meta-sourced) image URL — a Facebook/Instagram
 * Page's `picture` field, or a post's `accountPicture` — into a plain,
 * safe URL a component can hand straight to an <img>/<AvatarImage> `src`.
 *
 * Meta's Graph API has been observed occasionally returning `picture` as a
 * Markdown-style link (`[url](url)`) instead of a bare URL. This recovers
 * the real target from that one specific shape without becoming a general
 * Markdown parser, tolerates JSON/HTML-escaped characters that can appear
 * if the value passed through an extra escaping layer upstream, and never
 * throws — any value that isn't a genuine http(s) URL (missing, empty,
 * malformed, or an unsafe scheme like `javascript:`/`data:`/`blob:`)
 * resolves to `null` so callers can fall back to their existing
 * avatar-initial UI exactly as they already do for a missing picture.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
export function normalizeImageUrl(value) {
  if (value === null || value === undefined) return null

  let str
  try {
    str = String(value).trim()
  } catch {
    return null
  }
  if (!str) return null

  // Backslash-escaped slashes ("https:\/\/example.com\/a.jpg") are a sign
  // of a value that was JSON-encoded an extra time upstream — unescape
  // before attempting to read it as a URL or match the Markdown shape.
  str = str.replace(/\\\//g, '/')

  // Markdown-style link `[label](url)` — extract the real target, not the
  // bracketed label. Only matches when the ENTIRE string has this shape,
  // so an ordinary URL is never mistakenly rewritten.
  const markdownMatch = str.match(/^\[([^\]]*)\]\(([^)]+)\)$/)
  if (markdownMatch) {
    str = markdownMatch[2].trim()
  }

  // Decode the one HTML-entity most likely to appear if the value passed
  // through an HTML-escaping layer upstream (e.g. "&" in a query string).
  str = str.replace(/&amp;/g, '&')

  if (!str) return null

  let parsed
  try {
    parsed = new URL(str)
  } catch {
    return null
  }

  // Only ever accept http(s) — reject javascript:, data:, blob:, and any
  // other scheme so a malformed/malicious value can never become an image
  // source, per this app's existing "no untrusted scheme" rule.
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null

  return str
}

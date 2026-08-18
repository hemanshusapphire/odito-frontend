/**
 * Generic issue-snapshot → display-shape mapping for the Optimization
 * Center's View Details modal.
 *
 * Backend shapes (see odito_backend TaskHistoryService / TaskVerificationService
 * and python_workers rules/categories/*.py before_snapshot kwargs):
 *   before.value / fixApplied.expectedAfterValue → { type, ...fields }
 *   verification.after.value (method: 'value_diff') → { type, ...fields },
 *     except image_alt, whose *after* shape is { type: 'image_alt', images: [{src,alt}] }
 *     (the whole page's images, not one) — matched against `contextSrc` from
 *     the SAME attempt's before.value.src.
 *
 * Every function here is pure data-shaping — no JSX — so it's trivially
 * testable and reusable between the main attempt view and the history
 * timeline's compact rows.
 */

const TYPE_LABELS = {
  title: 'Title',
  meta_description: 'Meta Description',
  h1: 'H1',
  canonical: 'Canonical URL',
  image_alt: 'Alt Text',
}

export function typeLabel(type) {
  return TYPE_LABELS[type] || null
}

/**
 * Render a "before" or "expected after" typed value — both share the exact
 * same shape ({type, ...}), so one function covers both call sites.
 * Returns null if the shape is unrecognized (caller falls back to the
 * generic key/value renderer).
 */
export function renderTypedValue(typed) {
  if (!typed || typeof typed !== 'object' || !typed.type) return null

  switch (typed.type) {
    case 'title':
      return {
        label: 'Title',
        text: typed.title || null,
        meta: typed.length != null ? `${typed.length} characters` : null,
      }
    case 'meta_description':
      return {
        label: 'Meta Description',
        text: typed.metaDescription || null,
        meta: typed.length != null ? `${typed.length} characters` : null,
      }
    case 'h1': {
      const texts = Array.isArray(typed.h1Text)
        ? typed.h1Text.filter(Boolean)
        : (typed.h1Text ? [typed.h1Text] : [])
      return {
        label: 'H1',
        text: texts.length ? texts.join('  •  ') : null,
        meta: typed.h1Count != null ? `${typed.h1Count} H1 tag${typed.h1Count === 1 ? '' : 's'} detected` : null,
      }
    }
    case 'canonical':
      return {
        label: 'Canonical URL',
        text: typed.canonical || null,
        meta: null,
      }
    case 'image_alt':
      return {
        label: 'Alt Text',
        text: typed.alt || null,
        meta: typed.src || typed.imageUrl || null,
      }
    default:
      return null
  }
}

/**
 * Render an actual-verification "after" value. For most types this is the
 * same shape as renderTypedValue's input; image_alt is the one exception —
 * the resolver returns every image on the page, so the specific one this
 * fix targeted has to be matched by its (unchanged) src, carried over from
 * the same attempt's before.value.src.
 */
export function renderAfterValue(typed, { contextSrc } = {}) {
  if (!typed || typeof typed !== 'object' || !typed.type) return null

  if (typed.type === 'image_alt' && Array.isArray(typed.images)) {
    const match = contextSrc ? typed.images.find(img => img.src === contextSrc) : null
    return {
      label: 'Alt Text',
      text: match ? (match.alt || null) : null,
      meta: contextSrc || null,
      unresolved: !match,
    }
  }

  return renderTypedValue(typed)
}

/**
 * Safe fallback for values that don't match any known typed shape — a
 * diagnostic string, a raw number, or an object shape from a rule type this
 * modal doesn't have a dedicated renderer for yet. Never crashes, never
 * exposes raw Mongo internals like _id/ObjectId wrappers.
 */
export function renderGenericValue(value) {
  if (value == null || value === '') return { isEmpty: true }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return { text: String(value) }
  }
  if (Array.isArray(value)) {
    return { text: value.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ') }
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([k, v]) => k !== 'type' && isDisplayable(v))
    return { entries }
  }
  return { text: String(value) }
}

function isDisplayable(v) {
  return v !== undefined && typeof v !== 'function'
}

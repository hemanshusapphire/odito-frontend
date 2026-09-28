/**
 * Client-side validation for Organization `sameAs` social profile URLs.
 *
 * A CONVENIENCE for the site owner (instant feedback, Apply disabled while
 * anything is wrong) — never the enforcement. The backend
 * (odito_backend .../tasks/service/socialProfileUrls.js) repeats every rule and
 * is the only thing that decides. The two are kept identical on purpose and
 * pinned by the same test vectors (see socialProfileUrl.test.js).
 *
 * The URL itself is the source of truth: there is no list of "supported
 * networks", and nothing here ever suggests, guesses or completes a URL.
 */

export const SOCIAL_PROFILE_LIMITS = Object.freeze({
  maxUrlLength: 2048,
  maxProfilesPerRequest: 10,
})

export const SOCIAL_PROFILE_ERRORS = Object.freeze({
  NOT_A_STRING: "NOT_A_STRING",
  EMPTY: "EMPTY",
  TOO_LONG: "TOO_LONG",
  INVALID_CHARACTERS: "INVALID_CHARACTERS",
  NOT_HTTP: "NOT_HTTP",
  INVALID_URL: "INVALID_URL",
  CREDENTIALS: "CREDENTIALS",
  PORT: "PORT",
  INVALID_HOST: "INVALID_HOST",
  DUPLICATE: "DUPLICATE",
})

const MESSAGES = {
  NOT_A_STRING: "Each profile must be a text URL.",
  EMPTY: "Enter a URL.",
  TOO_LONG: `URL is too long (maximum ${SOCIAL_PROFILE_LIMITS.maxUrlLength} characters).`,
  INVALID_CHARACTERS: "URL contains spaces, line breaks, HTML or other characters that are not allowed.",
  NOT_HTTP: "URL must start with http:// or https://.",
  INVALID_URL: "This is not a valid URL.",
  CREDENTIALS: "URL must not contain a username or password.",
  PORT: "URL must not specify a port.",
  INVALID_HOST: "URL must point to a public website address (for example https://www.linkedin.com/company/example).",
  DUPLICATE: "This URL is listed more than once.",
}

const FORBIDDEN_CHARACTERS = /[\s\u0000-\u001f\u007f-\u009f<>"\\`]/
const PUBLIC_HOSTNAME = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i

/** @returns {{ok: true, url: string} | {ok: false, code: string, message: string}} */
export function validateSocialProfileUrl(raw) {
  const fail = (code) => ({ ok: false, code, message: MESSAGES[code] })

  if (typeof raw !== "string") return fail(SOCIAL_PROFILE_ERRORS.NOT_A_STRING)
  const trimmed = raw.trim()
  if (!trimmed) return fail(SOCIAL_PROFILE_ERRORS.EMPTY)
  if (trimmed.length > SOCIAL_PROFILE_LIMITS.maxUrlLength) return fail(SOCIAL_PROFILE_ERRORS.TOO_LONG)
  if (FORBIDDEN_CHARACTERS.test(trimmed)) return fail(SOCIAL_PROFILE_ERRORS.INVALID_CHARACTERS)
  if (!/^https?:\/\//i.test(trimmed)) return fail(SOCIAL_PROFILE_ERRORS.NOT_HTTP)

  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    return fail(SOCIAL_PROFILE_ERRORS.INVALID_URL)
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return fail(SOCIAL_PROFILE_ERRORS.NOT_HTTP)
  if (parsed.username || parsed.password) return fail(SOCIAL_PROFILE_ERRORS.CREDENTIALS)
  if (parsed.port) return fail(SOCIAL_PROFILE_ERRORS.PORT)
  if (!PUBLIC_HOSTNAME.test(parsed.hostname)) return fail(SOCIAL_PROFILE_ERRORS.INVALID_HOST)

  const path = parsed.pathname.replace(/\/+$/, "")
  return { ok: true, url: `${parsed.protocol}//${parsed.host}${path}${parsed.search}` }
}

/** Scheme- and trailing-slash-insensitive identity of a profile; null if it isn't a parseable http(s) URL. */
export function sameAsComparisonKey(raw) {
  if (typeof raw !== "string") return null
  let parsed
  try {
    parsed = new URL(raw.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
  return `${parsed.host}${parsed.pathname.replace(/\/+$/, "")}${parsed.search}`
}

/**
 * Validates the draft rows of the profile editor.
 *
 * `existingKeys` are the profiles already on the site (protected + additional):
 * typing one of those again is a duplicate too, caught here so the owner isn't
 * told "applied" for something that would be a no-op.
 *
 * @param {string[]} rows raw text of each input row
 * @param {{ existingKeys?: Set<string> }} [options]
 * @returns {{
 *   rows: Array<{ raw: string, blank: boolean, ok: boolean, url: string|null, code: string|null, message: string|null }>,
 *   urls: string[],
 *   canApply: boolean,
 * }}
 *  Blank rows are ignored (the empty first row is shown by default) — they
 *  are neither an error nor a profile. `canApply` needs at least one URL and
 *  no invalid row.
 */
export function validateProfileRows(rows, { existingKeys = new Set() } = {}) {
  const seen = new Set()
  const results = rows.map((raw) => {
    const text = typeof raw === "string" ? raw : ""
    if (!text.trim()) return { raw: text, blank: true, ok: true, url: null, code: null, message: null }

    const checked = validateSocialProfileUrl(text)
    if (!checked.ok) return { raw: text, blank: false, ok: false, url: null, code: checked.code, message: checked.message }

    const key = sameAsComparisonKey(checked.url)
    if (seen.has(key)) {
      return { raw: text, blank: false, ok: false, url: null, code: SOCIAL_PROFILE_ERRORS.DUPLICATE, message: MESSAGES.DUPLICATE }
    }
    if (existingKeys.has(key)) {
      return { raw: text, blank: false, ok: false, url: null, code: SOCIAL_PROFILE_ERRORS.DUPLICATE, message: "This profile is already on your site." }
    }
    seen.add(key)
    return { raw: text, blank: false, ok: true, url: checked.url, code: null, message: null }
  })

  const urls = results.filter((r) => !r.blank && r.ok).map((r) => r.url)
  const hasInvalid = results.some((r) => !r.blank && !r.ok)
  const tooMany = urls.length > SOCIAL_PROFILE_LIMITS.maxProfilesPerRequest
  return { rows: results, urls, canApply: urls.length > 0 && !hasInvalid && !tooMany }
}

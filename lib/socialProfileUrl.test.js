import { describe, it, expect } from "vitest"
import {
  SOCIAL_PROFILE_ERRORS as E,
  SOCIAL_PROFILE_LIMITS,
  sameAsComparisonKey,
  validateProfileRows,
  validateSocialProfileUrl,
} from "./socialProfileUrl"

// MIRRORS odito_backend/src/modules/tasks/service/socialProfileUrls.test.js —
// the frontend's rules must never disagree with the backend's.
const VALID = [
  ["https://www.linkedin.com/company/example", "https://www.linkedin.com/company/example"],
  ["https://www.facebook.com/example", "https://www.facebook.com/example"],
  ["https://www.instagram.com/example", "https://www.instagram.com/example"],
  ["https://x.com/example", "https://x.com/example"],
  ["https://www.youtube.com/@example", "https://www.youtube.com/@example"],
  ["http://example.com/profile", "http://example.com/profile"],
  ["https://www.facebook.com/profile.php?id=12345", "https://www.facebook.com/profile.php?id=12345"],
  ["  https://x.com/example  ", "https://x.com/example"],
  ["https://X.COM/Example", "https://x.com/Example"],
  ["HTTPS://x.com/example", "https://x.com/example"],
  ["https://x.com/example/", "https://x.com/example"],
  ["https://x.com/example///", "https://x.com/example"],
  ["https://example.com/", "https://example.com"],
  ["https://example.com", "https://example.com"],
  ["https://x.com/example#section", "https://x.com/example"],
  ["https://sub.domain.co.uk/a/b", "https://sub.domain.co.uk/a/b"],
  ["https://münchen.de/profil", "https://xn--mnchen-3ya.de/profil"],
]

const INVALID = [
  ["javascript:alert(1)", E.NOT_HTTP],
  ["JaVaScRiPt:alert(1)", E.NOT_HTTP],
  ["data:text/html,<script>alert(1)</script>", E.INVALID_CHARACTERS],
  ["data:text/plain;base64,QUJD", E.NOT_HTTP],
  ["vbscript:x", E.NOT_HTTP],
  ["ftp://example.com/file", E.NOT_HTTP],
  ["mailto:someone@example.com", E.NOT_HTTP],
  ["/relative/path", E.NOT_HTTP],
  ["//example.com/profile", E.NOT_HTTP],
  ["www.linkedin.com/company/example", E.NOT_HTTP],
  ["linkedin.com/company/example", E.NOT_HTTP],
  ["", E.EMPTY],
  ["   ", E.EMPTY],
  ["\t\n", E.EMPTY],
  ['<a href="https://x.com/a">x</a>', E.INVALID_CHARACTERS],
  ["https://x.com/<b>", E.INVALID_CHARACTERS],
  ['https://x.com/a"onmouseover=x', E.INVALID_CHARACTERS],
  ["https://x.com/back\\slash", E.INVALID_CHARACTERS],
  ["https://x.com/a b", E.INVALID_CHARACTERS],
  ["https://x.com/a\nhttps://evil.com", E.INVALID_CHARACTERS],
  ["https://x.com/a\r\nhttps://evil.com", E.INVALID_CHARACTERS],
  ["https://x.com/a\u0000", E.INVALID_CHARACTERS],
  ["https://user:pass@example.com/a", E.CREDENTIALS],
  ["https://user@example.com/a", E.CREDENTIALS],
  ["https://example.com:8080/a", E.PORT],
  ["https://localhost/a", E.INVALID_HOST],
  ["https://intranet/a", E.INVALID_HOST],
  ["https://127.0.0.1/a", E.INVALID_HOST],
  ["https://192.168.1.10/a", E.INVALID_HOST],
  ["https://[::1]/a", E.INVALID_HOST],
  ["https://-bad.example.com/a", E.INVALID_HOST],
  ["https://", E.INVALID_URL],
  ["http://", E.INVALID_URL],
]

describe("validateSocialProfileUrl — same vectors as the backend", () => {
  for (const [input, expected] of VALID) {
    it(`accepts and normalizes ${JSON.stringify(input)}`, () => {
      expect(validateSocialProfileUrl(input)).toEqual({ ok: true, url: expected })
    })
  }
  for (const [input, code] of INVALID) {
    it(`rejects ${JSON.stringify(input)} (${code})`, () => {
      const result = validateSocialProfileUrl(input)
      expect(result.ok).toBe(false)
      expect(result.code).toBe(code)
      expect(result.message.length).toBeGreaterThan(0)
    })
  }
  it("rejects non-strings", () => {
    for (const bad of [null, undefined, 42, {}, [], true]) expect(validateSocialProfileUrl(bad).code).toBe(E.NOT_A_STRING)
  })
  it("rejects an over-long URL", () => {
    expect(validateSocialProfileUrl(`https://example.com/${"a".repeat(SOCIAL_PROFILE_LIMITS.maxUrlLength)}`).code).toBe(E.TOO_LONG)
  })
})

describe("sameAsComparisonKey", () => {
  it("ignores scheme, host case and trailing slash; keeps path case", () => {
    const key = sameAsComparisonKey("https://www.linkedin.com/company/example")
    expect(sameAsComparisonKey("http://WWW.linkedin.com/company/example/")).toBe(key)
    expect(sameAsComparisonKey("https://x.com/Example")).not.toBe(sameAsComparisonKey("https://x.com/example"))
  })
  it("returns null for anything unparseable", () => {
    for (const junk of [null, undefined, 5, "", "not a url", "javascript:alert(1)"]) expect(sameAsComparisonKey(junk)).toBeNull()
  })
})

describe("validateProfileRows — the editor's draft rows", () => {
  const LI = "https://www.linkedin.com/company/example"

  it("the automatically-shown empty first row is neither an error nor a profile, and does not allow Apply", () => {
    const r = validateProfileRows([""])
    expect(r.rows[0]).toMatchObject({ blank: true, ok: true })
    expect(r.urls).toEqual([])
    expect(r.canApply).toBe(false)
  })

  it("one valid URL enables Apply and is returned normalized", () => {
    const r = validateProfileRows(["  https://X.com/example/ "])
    expect(r.urls).toEqual(["https://x.com/example"])
    expect(r.canApply).toBe(true)
  })

  it("several valid URLs; blank rows in between are ignored", () => {
    const r = validateProfileRows([LI, "", "https://www.instagram.com/example"])
    expect(r.urls).toEqual([LI, "https://www.instagram.com/example"])
    expect(r.canApply).toBe(true)
  })

  it("an invalid row blocks Apply and carries its reason; valid rows are still reported", () => {
    const r = validateProfileRows([LI, "javascript:alert(1)"])
    expect(r.rows[1]).toMatchObject({ ok: false, code: E.NOT_HTTP })
    expect(r.canApply).toBe(false)
    expect(r.urls).toEqual([LI])
  })

  it("a duplicate within the drafts (even with a trailing slash) is flagged on the SECOND row and blocks Apply", () => {
    const r = validateProfileRows([LI, `${LI}/`])
    expect(r.rows[0].ok).toBe(true)
    expect(r.rows[1]).toMatchObject({ ok: false, code: E.DUPLICATE })
    expect(r.canApply).toBe(false)
  })

  it("a URL already on the site (protected or additional) is a duplicate", () => {
    const existing = new Set([sameAsComparisonKey("https://www.facebook.com/example")])
    const r = validateProfileRows(["http://www.facebook.com/example/"], { existingKeys: existing })
    expect(r.rows[0]).toMatchObject({ ok: false, code: E.DUPLICATE, message: "This profile is already on your site." })
    expect(r.canApply).toBe(false)
  })

  it("more than the per-request maximum blocks Apply", () => {
    const rows = Array.from({ length: SOCIAL_PROFILE_LIMITS.maxProfilesPerRequest + 1 }, (_, i) => `https://example.com/p${i}`)
    expect(validateProfileRows(rows).canApply).toBe(false)
  })
})

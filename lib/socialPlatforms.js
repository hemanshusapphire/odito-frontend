/**
 * Social platforms offered in the Organization sameAs editor.
 *
 * DISPLAY AND CONVENIENCE ONLY. Nothing here is validation and nothing here
 * reaches the backend: the URL itself is the source of truth (the backend
 * receives a flat list of normalized URLs and knows nothing about platforms),
 * and it is fine for a URL to sit in a field whose platform it does not match.
 * The platform list is used to
 *   - lay out one labelled field per common network,
 *   - map profiles that already exist on the site back to their field, and
 *   - show a NON-BLOCKING "does this look right?" hint.
 *
 * Adding a network is one entry here (plus an icon in SameAsApplyDialog).
 */

export const SOCIAL_PLATFORMS = Object.freeze([
  { id: "facebook", label: "Facebook", noun: "a Facebook", placeholder: "https://facebook.com/your-page", domains: ["facebook.com", "fb.com", "fb.me"] },
  { id: "instagram", label: "Instagram", noun: "an Instagram", placeholder: "https://instagram.com/your-profile", domains: ["instagram.com", "instagr.am"] },
  { id: "linkedin", label: "LinkedIn", noun: "a LinkedIn", placeholder: "https://linkedin.com/company/your-company", domains: ["linkedin.com", "lnkd.in"] },
  { id: "x", label: "X / Twitter", noun: "an X / Twitter", placeholder: "https://x.com/your-profile", domains: ["x.com", "twitter.com"] },
  { id: "youtube", label: "YouTube", noun: "a YouTube", placeholder: "https://youtube.com/@your-channel", domains: ["youtube.com", "youtu.be"] },
  { id: "tiktok", label: "TikTok", noun: "a TikTok", placeholder: "https://tiktok.com/@your-profile", domains: ["tiktok.com"] },
  // Pinterest runs on country domains (pinterest.co.uk, pinterest.de, ...).
  { id: "pinterest", label: "Pinterest", noun: "a Pinterest", placeholder: "https://pinterest.com/your-profile", domains: ["pinterest.com", "pin.it"], hostPattern: /(^|\.)pinterest\.[a-z]{2,}(\.[a-z]{2})?$/ },
])

/** Any legitimate profile on a network not listed above. Accepts any valid http(s) URL. */
export const OTHER_PLATFORM = Object.freeze({
  id: "other",
  label: "Other / Custom Profile",
  placeholder: "https://...",
})

function hostnameOf(url) {
  if (typeof url !== "string") return null
  try {
    const parsed = new URL(url.trim())
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    return parsed.hostname.toLowerCase()
  } catch {
    return null
  }
}

function hostMatches(host, platform) {
  if (!host) return false
  if (platform.domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) return true
  return !!platform.hostPattern && platform.hostPattern.test(host)
}

/** True if the URL's host belongs to `platformId` (www./m./regional subdomains included). */
export function urlMatchesPlatform(url, platformId) {
  const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId)
  return !!platform && hostMatches(hostnameOf(url), platform)
}

/**
 * Which listed platform a URL belongs to, or null (-> "Other / Custom").
 * Used to put profiles that already exist on the site into the right field.
 */
export function detectPlatformId(url) {
  const host = hostnameOf(url)
  if (!host) return null
  return SOCIAL_PLATFORMS.find((platform) => hostMatches(host, platform))?.id ?? null
}

/**
 * Non-blocking hint for a URL typed into a specific platform's field, or null
 * when there is nothing to say. Never applies to the "Other" field, and never
 * changes or rejects the URL — the URL stays authoritative.
 */
export function platformMismatchWarning(platformId, url) {
  const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId)
  if (!platform || !hostnameOf(url)) return null
  if (hostMatches(hostnameOf(url), platform)) return null
  return `This URL does not appear to be ${platform.noun} URL. Please verify it.`
}

/**
 * Groups profile URLs by the field they belong in. Unknown hosts go to "other".
 * Order within a group is preserved.
 * @param {string[]} urls
 * @returns {Record<string, string[]>} keyed by platform id (only non-empty groups) plus "other"
 */
export function groupUrlsByPlatform(urls) {
  const groups = {}
  for (const url of urls || []) {
    const id = detectPlatformId(url) ?? OTHER_PLATFORM.id
    ;(groups[id] ||= []).push(url)
  }
  return groups
}

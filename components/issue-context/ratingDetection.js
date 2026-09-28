/**
 * Helpers for the AggregateRating issue (issueId "aggregate_rating_schema").
 *
 * The backend's issue-context response carries a `ratingDetection` object for
 * this issue (see odito_backend/.../tasks/service/aggregateRatingSchema.js):
 *
 *   {
 *     status: 'ready' | 'rating_unavailable' | 'rating_ambiguous' | 'no_target_schema'
 *           | 'target_not_mergeable' | 'already_present',
 *     canGenerate, message, reason, warnings,
 *     detectedRatingData: { status, reason, selected: {ratingValue, bestRating,
 *                           reviewCount?, ratingCount?, evidence, source}, candidates },
 *     existingSchemas: [{ types, id, name, hasAggregateRating, eligibleTarget, targetKind }],
 *     existingAggregateRating: { present, valid, source },
 *     targetSchemaType, target: { types, id, name, kind },
 *     missingSchemaFields, generatedSchema: { jsonLd, mergeMode } | null,
 *   }
 *
 * Display only — every value shown comes from the backend; the schema itself is
 * always generated server-side from crawl data, never in the browser.
 */

export const RATING_ISSUE_ID = "aggregate_rating_schema"

export const RATING_UNAVAILABLE_MESSAGE =
  "Reliable rating data is unavailable: a rating value and a review count could not both be extracted from this page, so no AggregateRating schema will be generated."

/** The detection payload for an aggregate_rating_schema issue context, or null for any other issue / no data. */
export function getRatingDetection(issueContext) {
  const d = issueContext?.ratingDetection
  return d && typeof d === "object" && d.detectedRatingData ? d : null
}

/** "4.8 out of 5 from 127 reviews" — built from the detected numbers only. */
export function formatRating(r) {
  if (!r) return null
  const count = r.reviewCount != null
    ? `${r.reviewCount} review${r.reviewCount === 1 ? "" : "s"}`
    : r.ratingCount != null ? `${r.ratingCount} rating${r.ratingCount === 1 ? "" : "s"}` : null
  return `${r.ratingValue} out of ${r.bestRating}${count ? ` from ${count}` : ""}`
}

/**
 * Parses a rating JSON-LD node string into {target, rating} (display only).
 * Null for anything that isn't a node with @type, @id, name and an AggregateRating.
 */
export function parseRatingJsonLd(jsonLd) {
  if (typeof jsonLd !== "string" || !jsonLd.trim()) return null
  try {
    const node = JSON.parse(jsonLd)
    const ar = node?.aggregateRating
    if (!node?.["@id"] || typeof node.name !== "string" || !node["@type"] || ar?.["@type"] !== "AggregateRating") return null
    if (ar.ratingValue == null || (ar.reviewCount == null && ar.ratingCount == null)) return null
    const first = Array.isArray(node["@type"]) ? node["@type"][0] : node["@type"]
    return {
      target: { type: first, id: node["@id"], name: node.name },
      rating: {
        ratingValue: ar.ratingValue,
        bestRating: ar.bestRating ?? "5",
        reviewCount: ar.reviewCount != null ? Number(ar.reviewCount) : undefined,
        ratingCount: ar.ratingCount != null ? Number(ar.ratingCount) : undefined,
      },
    }
  } catch {
    return null
  }
}

/**
 * What the recommendation panel should say instead of offering "Generate" when
 * the backend says a schema cannot (or need not) be generated. Null when
 * generation is allowed.
 */
export function describeRatingGenerationBlock(detection) {
  if (!detection || detection.canGenerate) return null
  const hint = detection.reason === "crawl_predates_extraction"
    ? "This page was crawled before rating extraction was available. Run a new crawl to refresh it."
    : null
  const tone = detection.status === "already_present" ? "info" : "warning"
  return { tone, message: detection.message || RATING_UNAVAILABLE_MESSAGE, hint }
}

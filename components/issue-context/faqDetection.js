/**
 * Helpers for the FAQ schema issue (issueId "faq_schema").
 *
 * The backend's issue-context response carries a `faqDetection` object for this
 * issue (see odito_backend/.../tasks/service/faqSchema.js getFaqDetection):
 *
 *   {
 *     content: { detected, status: 'extracted'|'extraction_failed'|'no_faq_content',
 *                reason, pairCount, pairs: [{question, answer}], warnings, message },
 *     schema:  { detected, pairCount },
 *     schemaPreview: { format: 'json-ld', jsonLd } | null,
 *     canGenerate: boolean,
 *   }
 *
 * Nothing here builds or edits FAQ content — the UI only displays what the
 * backend detected, and the schema itself is always generated server-side.
 */

export const FAQ_ISSUE_ID = "faq_schema"

export const FAQ_EXTRACTION_FAILED_MESSAGE =
  "FAQ content detected, but the question/answer pairs could not be reliably extracted."

/** The detection payload for a faq_schema issue context, or null for any other issue / no data. */
export function getFaqDetection(issueContext) {
  const detection = issueContext?.faqDetection
  return detection && typeof detection === "object" && detection.content ? detection : null
}

/**
 * Parses a FAQPage JSON-LD string into its Q/A pairs (display only). Returns
 * null for anything that is not a FAQPage with at least one Question entry.
 */
export function parseFaqJsonLd(jsonLd) {
  if (typeof jsonLd !== "string" || !jsonLd.trim()) return null
  try {
    const parsed = JSON.parse(jsonLd)
    if (parsed?.["@type"] !== "FAQPage" || !Array.isArray(parsed.mainEntity) || parsed.mainEntity.length === 0) return null
    const pairs = parsed.mainEntity.map((entity) => ({
      question: entity?.name,
      answer: entity?.acceptedAnswer?.text,
    }))
    return pairs.every((p) => typeof p.question === "string" && typeof p.answer === "string") ? pairs : null
  } catch {
    return null
  }
}

/**
 * What the recommendation panel should say instead of offering "Generate" when
 * the backend says a schema cannot (or need not) be generated. Returns null
 * when generation is allowed.
 */
export function describeFaqGenerationBlock(detection) {
  if (!detection || detection.canGenerate) return null
  if (detection.schema?.detected) {
    return { tone: "info", message: "A FAQPage schema is already present on this page in the latest crawl." }
  }
  if (detection.content?.status === "extraction_failed") {
    return { tone: "warning", message: detection.content.message || FAQ_EXTRACTION_FAILED_MESSAGE, hint: extractionHint(detection) }
  }
  return { tone: "info", message: "No FAQ content was detected on this page in the latest crawl." }
}

/** Extra guidance for the legacy case: a crawl that ran before pair extraction existed. */
export function extractionHint(detection) {
  return detection?.content?.reason === "crawl_predates_extraction"
    ? "This page was crawled before FAQ extraction was available. Run a new crawl to refresh it."
    : null
}

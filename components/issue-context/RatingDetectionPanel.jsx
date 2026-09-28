"use client"

import React, { memo } from "react"
import { formatRating, RATING_UNAVAILABLE_MESSAGE } from "./ratingDetection"

/**
 * RatingDetectionPanel
 *
 * The "Detected Issue" body for the aggregate_rating_schema issue. The generic
 * "Not detected — no AggregateRating schema" card shows nothing the user can act
 * on, so this shows what the crawler actually found:
 *
 *   AggregateRating       — NOT DETECTED / DETECTED (JSON-LD or microdata)
 *   Detected Rating Data  — ratingValue, count, scale, and the page text it came from
 *   Existing Schema       — every entity already on the page, and which one the
 *                           rating would attach to
 *   Missing Fields        — what is absent
 *
 * Display only — nothing here estimates or edits a value.
 */

const TONES = {
  good: { color: "var(--gr)", surface: "var(--color-status-success-surface)", border: "var(--color-status-success-border)" },
  bad: { color: "var(--re)", surface: "var(--color-status-error-surface)", border: "var(--color-status-error-border)" },
  warn: { color: "var(--am)", surface: "var(--color-status-warning-surface)", border: "var(--color-status-warning-border)" },
}

const SECTION_LABEL = { fontSize: 9.5, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }

function StatusRow({ label, value, detail, tone, testId }) {
  const t = TONES[tone]
  return (
    <div data-testid={testId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: t.color, background: "rgba(255,255,255,0.05)" }}>
        {tone === "good" ? "✓" : tone === "warn" ? "!" : "✕"}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ ...SECTION_LABEL, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: t.color }}>
          {value}
          {detail && <span style={{ fontWeight: 500, color: "var(--t2)" }}> · {detail}</span>}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, testId }) {
  return (
    <div data-testid={testId} style={{ padding: "8px 10px", background: "var(--s2)", border: "1px solid var(--b)", borderRadius: 8, minWidth: 0 }}>
      <div style={{ ...SECTION_LABEL, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t)" }}>{value}</div>
    </div>
  )
}

function Badge({ children, tone = "neutral" }) {
  const styles = tone === "good"
    ? { color: "var(--gr)", background: TONES.good.surface, border: TONES.good.border }
    : { color: "var(--t2)", background: "var(--s2)", border: "var(--b)" }
  return (
    <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20, color: styles.color, background: styles.background, border: `1px solid ${styles.border}` }}>
      {children}
    </span>
  )
}

const RatingDetectionPanel = memo(function RatingDetectionPanel({ detection, expectedState }) {
  const { detectedRatingData: rating, existingSchemas = [], existingAggregateRating: existing, target, missingSchemaFields = [], warnings = [] } = detection
  const selected = rating.selected
  const unavailable = rating.status === "unavailable"
  const ambiguous = rating.status === "ambiguous"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }} data-testid="rating-detection-panel">
      <StatusRow
        testId="aggregate-rating-status"
        label="AggregateRating"
        value={existing?.present ? "DETECTED" : "NOT DETECTED"}
        detail={existing?.present ? `${existing.source}${existing.valid ? "" : " (incomplete)"}` : null}
        tone={existing?.present ? "good" : "bad"}
      />

      <div data-testid="detected-rating-data">
        <div style={SECTION_LABEL}>Detected Rating Data</div>
        {selected && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 7 }}>
              <Stat testId="rating-value" label="ratingValue" value={selected.ratingValue} />
              <Stat testId="rating-best" label="bestRating" value={selected.bestRating} />
              {selected.worstRating != null && <Stat label="worstRating" value={selected.worstRating} />}
              {selected.reviewCount != null && <Stat testId="rating-review-count" label="reviewCount" value={selected.reviewCount} />}
              {selected.ratingCount != null && <Stat testId="rating-rating-count" label="ratingCount" value={selected.ratingCount} />}
            </div>
            {selected.evidence && (
              <div data-testid="rating-evidence" style={{ marginTop: 7, padding: "8px 10px", fontSize: 11, lineHeight: 1.5, color: "var(--t2)", background: "var(--s)", border: "1px solid var(--b)", borderRadius: 8, wordBreak: "break-word" }}>
                <span style={{ color: "var(--t3)" }}>Found on the page: </span>“{selected.evidence}”
              </div>
            )}
          </>
        )}
        {ambiguous && (
          <div data-testid="rating-ambiguous" style={{ padding: "10px 12px", borderRadius: 9, fontSize: 11.5, lineHeight: 1.55, color: "var(--am)", background: TONES.warn.surface, border: `1px solid ${TONES.warn.border}` }}>
            This page shows more than one different rating, so it is unclear which one to mark up:
            <ul style={{ margin: "6px 0 0", paddingLeft: 16, color: "var(--t2)" }}>
              {rating.candidates.map((c, i) => <li key={i}>{formatRating(c)}</li>)}
            </ul>
          </div>
        )}
        {unavailable && (
          <div data-testid="rating-unavailable" style={{ padding: "10px 12px", borderRadius: 9, fontSize: 11.5, lineHeight: 1.55, color: "var(--am)", background: TONES.warn.surface, border: `1px solid ${TONES.warn.border}` }}>
            {RATING_UNAVAILABLE_MESSAGE}
            {rating.reason === "crawl_predates_extraction" && (
              <div style={{ marginTop: 4, color: "var(--t2)" }}>This page was crawled before rating extraction was available. Run a new crawl to refresh it.</div>
            )}
          </div>
        )}
      </div>

      <div data-testid="existing-schemas">
        <div style={SECTION_LABEL}>Existing schema on this page</div>
        {existingSchemas.length === 0 ? (
          <div style={{ fontSize: 11.5, color: "var(--t3)" }}>No structured data was found on this page.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {existingSchemas.map((s, i) => {
              const isTarget = target && s.id === target.id
              return (
                <div key={`${s.id || s.types.join("-")}-${i}`} data-testid="existing-schema" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", padding: "7px 10px", background: "var(--s)", border: `1px solid ${isTarget ? TONES.good.border : "var(--b)"}`, borderRadius: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t)" }}>{s.types.join(", ") || "Unknown"}</span>
                  {s.name && <span style={{ fontSize: 11.5, color: "var(--t2)" }}>“{s.name}”</span>}
                  {isTarget && <Badge tone="good">rating attaches here</Badge>}
                  {!isTarget && s.eligibleTarget && <Badge>can hold a rating</Badge>}
                  {s.hasAggregateRating && <Badge tone="good">has AggregateRating</Badge>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {target && (
        <div data-testid="target-schema" style={{ padding: "8px 10px", fontSize: 11.5, lineHeight: 1.55, color: "var(--t2)", background: "var(--s)", border: "1px solid var(--b)", borderRadius: 8, wordBreak: "break-all" }}>
          <span style={{ color: "var(--t3)" }}>Target schema: </span>
          <strong style={{ color: "var(--t)" }}>{detection.targetSchemaType}</strong> “{target.name}” <span style={{ color: "var(--t3)" }}>({target.id})</span>
        </div>
      )}

      {missingSchemaFields.length > 0 && (
        <div data-testid="missing-schema-fields" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ ...SECTION_LABEL, marginBottom: 0 }}>Missing</span>
          {missingSchemaFields.map((f) => <Badge key={f}>{f}</Badge>)}
        </div>
      )}

      {detection.message && !unavailable && !ambiguous && detection.status !== "ready" && (
        <div data-testid="rating-blocked-reason" style={{ padding: "10px 12px", borderRadius: 9, fontSize: 11.5, lineHeight: 1.55, color: detection.status === "already_present" ? "var(--t2)" : "var(--am)", background: detection.status === "already_present" ? "var(--s)" : TONES.warn.surface, border: `1px solid ${detection.status === "already_present" ? "var(--b)" : TONES.warn.border}` }}>
          {detection.message}
        </div>
      )}

      {warnings.includes("self_serving_target") && (
        <div data-testid="rating-self-serving-warning" style={{ fontSize: 10.5, color: "var(--am)", lineHeight: 1.5 }}>
          This rating would be attached to your own {detection.targetSchemaType === "Organization" ? "organization" : "business"} entity. Google&apos;s guidelines don&apos;t show star results for ratings a business gives about itself, so this may not produce star snippets.
        </div>
      )}

      {expectedState?.description && (
        <div style={{ padding: "9px 12px", borderRadius: 9, fontSize: 11.5, color: "var(--gr)", background: TONES.good.surface, border: `1px solid ${TONES.good.border}` }}>
          <strong>Expected:</strong> {expectedState.description}
        </div>
      )}
    </div>
  )
})

export default RatingDetectionPanel

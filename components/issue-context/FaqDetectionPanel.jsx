"use client"

import React, { memo, useState } from "react"
import { extractionHint, FAQ_EXTRACTION_FAILED_MESSAGE } from "./faqDetection"

const INITIAL_VISIBLE = 5

/**
 * FaqDetectionPanel
 *
 * The "Detected Issue" body for the faq_schema issue. The generic "Not detected
 * — No FAQPage schema was found" card is misleading here: the issue exists
 * because FAQ *content* WAS found and only the FAQPage *schema* is missing. So
 * this shows the two facts separately:
 *
 *   FAQ Content     — DETECTED / EXTRACTION FAILED / NOT DETECTED
 *   FAQPage Schema  — DETECTED / NOT DETECTED
 *
 * and lists the detected question/answer pairs, so the user can verify exactly
 * what will be converted into schema. Display only — nothing here edits or
 * generates FAQ text.
 */

const TONES = {
  good: { color: "var(--gr)", surface: "var(--color-status-success-surface)", border: "var(--color-status-success-border)" },
  bad: { color: "var(--re)", surface: "var(--color-status-error-surface)", border: "var(--color-status-error-border)" },
  warn: { color: "var(--am)", surface: "var(--color-status-warning-surface)", border: "var(--color-status-warning-border)" },
}

function StatusRow({ label, value, detail, tone, testId }) {
  const t = TONES[tone]
  return (
    <div
      data-testid={testId}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
        background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0,
        fontSize: 13, fontWeight: 700, color: t.color, background: "rgba(255,255,255,0.05)",
      }}>
        {tone === "good" ? "✓" : tone === "warn" ? "!" : "✕"}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: t.color }}>
          {value}
          {detail && <span style={{ fontWeight: 500, color: "var(--t2)" }}> · {detail}</span>}
        </div>
      </div>
    </div>
  )
}

function PairCard({ pair, index }) {
  const [expanded, setExpanded] = useState(false)
  const long = pair.answer.length > 180
  return (
    <div
      data-testid="faq-pair"
      style={{ padding: "10px 12px", background: "var(--s)", border: "1px solid var(--b)", borderRadius: 9 }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--cy)", paddingTop: 2, flexShrink: 0 }}>Q{index + 1}</span>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t)", lineHeight: 1.45, wordBreak: "break-word" }}>{pair.question}</div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 6 }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--gr)", paddingTop: 2, flexShrink: 0 }}>A</span>
        <div style={{ fontSize: 11.5, color: "var(--t2)", lineHeight: 1.55, wordBreak: "break-word" }}>
          {long && !expanded ? `${pair.answer.slice(0, 180).trimEnd()}…` : pair.answer}
          {long && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              style={{ marginLeft: 6, background: "none", border: "none", color: "var(--cy)", fontSize: 11, cursor: "pointer", padding: 0 }}
            >
              {expanded ? "Show less" : "Show full answer"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const FaqDetectionPanel = memo(function FaqDetectionPanel({ detection, expectedState }) {
  const [showAll, setShowAll] = useState(false)
  const { content, schema } = detection
  const pairs = content.pairs || []
  const visiblePairs = showAll ? pairs : pairs.slice(0, INITIAL_VISIBLE)
  const hint = extractionHint(detection)

  let contentRow
  if (content.status === "extracted") {
    contentRow = { value: "DETECTED", detail: `${content.pairCount} question${content.pairCount === 1 ? "" : "s"} & answers`, tone: "good" }
  } else if (content.status === "extraction_failed") {
    contentRow = { value: "DETECTED", detail: "pairs could not be extracted", tone: "warn" }
  } else {
    contentRow = { value: "NOT DETECTED", detail: null, tone: "bad" }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }} data-testid="faq-detection-panel">
      <StatusRow testId="faq-content-status" label="FAQ Content" {...contentRow} />
      <StatusRow
        testId="faq-schema-status"
        label="FAQPage Schema"
        value={schema.detected ? "DETECTED" : "NOT DETECTED"}
        detail={schema.detected && schema.pairCount ? `${schema.pairCount} question${schema.pairCount === 1 ? "" : "s"}` : null}
        tone={schema.detected ? "good" : "bad"}
      />

      {content.status === "extraction_failed" && (
        <div
          data-testid="faq-extraction-failed"
          style={{
            padding: "10px 12px", borderRadius: 9, fontSize: 11.5, lineHeight: 1.55,
            color: "var(--am)", background: TONES.warn.surface, border: `1px solid ${TONES.warn.border}`,
          }}
        >
          {content.message || FAQ_EXTRACTION_FAILED_MESSAGE}
          {hint && <div style={{ marginTop: 4, color: "var(--t2)" }}>{hint}</div>}
          <div style={{ marginTop: 4, color: "var(--t2)" }}>No schema will be generated from content that cannot be read reliably.</div>
        </div>
      )}

      {content.status === "extracted" && (
        <div data-testid="faq-detected-pairs">
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "4px 0 7px" }}>
            Detected FAQs — will be converted into schema
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {visiblePairs.map((pair, i) => <PairCard key={`${i}-${pair.question}`} pair={pair} index={i} />)}
          </div>
          {pairs.length > INITIAL_VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              style={{ marginTop: 8, background: "none", border: "none", color: "var(--cy)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
            >
              {showAll ? "Show fewer" : `Show all ${pairs.length} questions`}
            </button>
          )}
          {content.warnings?.includes("partial_extraction") && (
            <div style={{ marginTop: 8, fontSize: 10.5, color: "var(--am)", lineHeight: 1.5 }}>
              Only {content.pairCount} of about {content.heuristicQuestionCount} FAQ-style questions on this page could be read reliably.
              Only the ones listed above will be included — review them before applying.
            </div>
          )}
        </div>
      )}

      {expectedState?.description && (
        <div style={{
          padding: "9px 12px", borderRadius: 9, fontSize: 11.5, color: "var(--gr)",
          background: TONES.good.surface, border: `1px solid ${TONES.good.border}`,
        }}>
          <strong>Expected:</strong> {expectedState.description}
        </div>
      )}
    </div>
  )
})

export default FaqDetectionPanel

"use client"

/**
 * Apply-via-WordPress confirmation for a missing H1.
 *
 * An H1 is page CONTENT (not an SEO-plugin field), so this dialog says exactly what will change
 * and how, in the builder's own terms, before anything is written: the current state, the
 * recommended text (as the backend will write it — plain text, markup stripped), the target
 * element, the page builder, and the plan (e.g. "the page-title heading becomes the H1"). It also
 * states plainly that page content is edited directly.
 *
 * Nothing shown here is sent back: the only thing the confirm action carries to the server is the
 * fingerprint of the page state that was just displayed (held by the parent), so if the page
 * changes in WordPress after this dialog opens, the backend refuses instead of overwriting.
 * The value written is derived server-side from the task's own Recommendation.
 */
const STATE_LABEL = {
  missing: "No H1 found",
  empty: "Empty H1 (no text)",
}

function currentH1Display(context) {
  const state = context?.state
  if (state === "present") return context.current?.h1Texts?.[0] || "An H1 already exists"
  if (state === "multiple") return `${context.current?.h1Count ?? "Multiple"} H1 headings`
  return STATE_LABEL[state] || "Unknown"
}

const LABEL_STYLE = { fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }
const BOX_STYLE = { fontSize: 12.5, color: "var(--t)", padding: "8px 10px", background: "var(--s2)", borderRadius: 8, border: "1px solid var(--b)", minHeight: 20, wordBreak: "break-word" }

export default function H1ApplyDialog({
  open, onOpenChange, siteLabel, pageUrl, context, contextLoading, contextUnavailable,
  onConfirm, onRefreshContext, isApplying, errorInfo,
}) {
  if (!open) return null

  const recommended = context?.recommended
  const canApply = !!(context?.supported && recommended?.ok && context?.fingerprint)
  // A conflict (the page changed after review) or an unreadable page must be acknowledged by
  // re-reading the page — the primary action is replaced, never silently retried with old state.
  const showRefreshAction = !!(errorInfo?.requiresRefresh || contextUnavailable)
  const applyDisabled = isApplying || contextLoading || !canApply || !!errorInfo?.nonRetryable
  const plan = context?.plan

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
      <div
        role="dialog"
        aria-label="Apply H1 via WordPress"
        style={{ width: "min(520px, 94vw)", maxHeight: "90vh", overflow: "auto", background: "var(--card, var(--s))", border: "1px solid var(--b)", borderRadius: 14, padding: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t)", marginBottom: 4 }}>Add an H1 to This Page?</div>
        <div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 14, wordBreak: "break-all" }}>
          {pageUrl ? `Page: ${pageUrl}` : null}{siteLabel ? ` · Website: ${siteLabel}` : null}
        </div>

        {contextLoading ? (
          <div style={{ ...BOX_STYLE, color: "var(--t3)", marginBottom: 14 }}>Reading the page from WordPress…</div>
        ) : contextUnavailable ? (
          <div style={{ ...BOX_STYLE, color: "#ff3860", marginBottom: 14 }}>Unable to read this page from WordPress. Refresh and try again.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ ...LABEL_STYLE, color: "var(--t3)" }}>Current</div>
              <div data-testid="h1-current" style={BOX_STYLE}>{currentH1Display(context)}</div>
            </div>
            <div>
              <div style={{ ...LABEL_STYLE, color: "#00f5a0" }}>Recommended</div>
              <div
                data-testid="h1-recommended"
                style={{ ...BOX_STYLE, background: "rgba(0,245,160,0.06)", border: "1px solid rgba(0,245,160,0.2)", color: recommended && !recommended.ok ? "#ff3860" : "var(--t)" }}
              >
                {recommended?.ok ? recommended.text : (recommended?.message || "No recommendation available")}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ ...LABEL_STYLE, color: "var(--t3)" }}>Target</div>
                <div data-testid="h1-target" style={BOX_STYLE}>H1</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...LABEL_STYLE, color: "var(--t3)" }}>Page builder</div>
                <div data-testid="h1-builder" style={BOX_STYLE}>{context?.builder?.label || "Unknown"}</div>
              </div>
            </div>

            {context?.supported && plan && (
              <div data-testid="h1-plan" style={{ fontSize: 11.5, color: "var(--t2)", lineHeight: 1.5 }}>
                <div style={{ marginBottom: 4 }}>{plan.summary}</div>
                {Array.isArray(plan.changes) && plan.changes.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {plan.changes.map((change) => <li key={change}>{change}</li>)}
                  </ul>
                )}
              </div>
            )}

            {context && !context.supported && (
              <div data-testid="h1-unsupported" style={{ fontSize: 11.5, color: "#f5a623", lineHeight: 1.5, padding: "8px 10px", background: "rgba(245,166,35,0.1)", borderRadius: 8 }}>
                {context.reason || "This page's H1 cannot be changed automatically."}
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: 11.5, color: "#f5a623", marginBottom: 12, lineHeight: 1.4 }}>
          This changes the page content directly.
        </div>

        {errorInfo && (
          <div style={{
            fontSize: 11.5, lineHeight: 1.5, marginBottom: 12, padding: "8px 10px", borderRadius: 8,
            color: errorInfo.isConflict ? "#f5a623" : "#ff3860",
            background: errorInfo.isConflict ? "rgba(245,166,35,0.1)" : "rgba(255,56,96,0.08)",
          }}>
            {errorInfo.wordpressWriteSucceeded
              ? "The WordPress change was applied, but Odito couldn't record it because the task changed at the same time. Refresh the page state and check WordPress before trying again."
              : errorInfo.isConflict
                ? `${errorInfo.message} Refresh the page state and review it again.`
                : errorInfo.message}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button" onClick={() => onOpenChange(false)} disabled={isApplying}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "1px solid var(--b)", background: "var(--s2)", color: "var(--t2)", cursor: isApplying ? "not-allowed" : "pointer" }}
          >
            Cancel
          </button>
          {showRefreshAction ? (
            <button
              type="button" onClick={onRefreshContext} disabled={contextLoading}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: "#f5a623", color: "#1a1a1a", cursor: contextLoading ? "not-allowed" : "pointer", opacity: contextLoading ? 0.7 : 1 }}
            >
              {contextLoading ? "Refreshing…" : "Refresh Page State"}
            </button>
          ) : (
            <button
              type="button" onClick={onConfirm} disabled={applyDisabled}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: "linear-gradient(135deg,#7730ed,#00dfff)", color: "#fff", cursor: applyDisabled ? "not-allowed" : "pointer", opacity: applyDisabled ? 0.5 : 1 }}
            >
              {isApplying ? "Applying…" : "Apply via WordPress"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

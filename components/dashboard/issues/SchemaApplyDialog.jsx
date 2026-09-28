"use client"

/**
 * Generic Apply-via-WordPress confirmation dialog for schema fixes (FAQPage,
 * AggregateRating). There is no single "current value → new value" pair to
 * compare for these; what the user approves is the exact JSON-LD that will be
 * sent to the Odito SEO Bridge for THIS page, shown in full before anything is
 * written, plus a plain-language statement of what it is built from.
 *
 * The value shown is the Recommendation's stored schema (fetched by the task's
 * own recommendationId); the backend re-derives what it writes from that same
 * Recommendation and re-checks it against the latest crawl, so the preview and
 * the write cannot diverge and the client never supplies content.
 *
 * Wrappers (FaqSchemaApplyDialog, RatingSchemaApplyDialog) provide the wording.
 *
 * Page resolution: before anything can be applied, the page must resolve to a WordPress
 * page/post (GET /wordpress/page-resolution — the same resolver the write uses). While that is
 * being checked, when it failed, or when the page cannot be resolved (different site, blog-index
 * homepage, unsupported content type, not exposed by REST), Apply stays disabled and the reason is
 * shown. `resolution` undefined with nothing loading means no check was requested.
 */
export default function SchemaApplyDialog({
  open, onOpenChange, ariaLabel, title, siteLabel, pageUrl, description,
  previewLabel = "Schema preview", previewTestId = "schema-preview", jsonLd, isValid, invalidMessage,
  onConfirm, onRegenerate, isApplying, isRegenerating, errorInfo,
  resolution, resolutionLoading = false, resolutionError = false,
}) {
  if (!open) return null

  const resolutionBlocked = !!(resolutionLoading || resolutionError || (resolution && !resolution.resolved))
  const applyDisabled = isApplying || !isValid || !!errorInfo?.nonRetryable || resolutionBlocked
  const needsRegenerate = !!errorInfo?.regenerateRequired

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
      <div
        role="dialog"
        aria-label={ariaLabel}
        style={{ width: "min(560px, 94vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "var(--card, var(--s))", border: "1px solid var(--b)", borderRadius: 14, padding: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t)", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 4, wordBreak: "break-all" }}>
          {pageUrl ? `Page: ${pageUrl}` : null}{siteLabel ? ` · Website: ${siteLabel}` : null}
        </div>
        <div style={{ fontSize: 11, color: "var(--t2)", marginBottom: 14, lineHeight: 1.5 }}>{description}</div>

        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#00f5a0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          {previewLabel}
        </div>
        {isValid ? (
          <pre
            data-testid={previewTestId}
            style={{
              margin: "0 0 14px", padding: "10px 12px", overflow: "auto", maxHeight: 280, fontSize: 11, lineHeight: 1.5,
              color: "var(--t)", background: "var(--s2)", border: "1px solid var(--b)", borderRadius: 8, whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}
          >
            {jsonLd}
          </pre>
        ) : (
          <div style={{ fontSize: 12, color: "#ff3860", padding: "10px 12px", background: "rgba(255,56,96,0.08)", borderRadius: 8, marginBottom: 14 }}>
            {invalidMessage}
          </div>
        )}

        {resolutionLoading ? (
          <div data-testid="page-resolution" style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 12 }}>Checking this page in WordPress…</div>
        ) : resolutionError ? (
          <div data-testid="page-resolution" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 12, padding: "8px 10px", borderRadius: 8, color: "#ff3860", background: "rgba(255,56,96,0.08)" }}>
            Could not check this page in WordPress. Close this dialog and try again.
          </div>
        ) : resolution && !resolution.resolved ? (
          <div data-testid="page-resolution" style={{ fontSize: 11.5, lineHeight: 1.5, marginBottom: 12, padding: "8px 10px", borderRadius: 8, color: "#f5a623", background: "rgba(245,166,35,0.1)" }}>
            {resolution.message || "This page could not be matched to a WordPress page or post."}
          </div>
        ) : resolution?.resolved ? (
          <div data-testid="page-resolution" style={{ fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>
            WordPress {resolution.postType === "post" ? "post" : "page"} #{resolution.postId}{resolution.isFrontPage ? " (site front page)" : ""}
          </div>
        ) : null}

        {errorInfo && (
          <div style={{
            fontSize: 11.5, lineHeight: 1.5, marginBottom: 12, padding: "8px 10px", borderRadius: 8,
            color: errorInfo.isConflict ? "#f5a623" : "#ff3860",
            background: errorInfo.isConflict ? "rgba(245,166,35,0.1)" : "rgba(255,56,96,0.08)",
          }}>
            {errorInfo.wordpressWriteSucceeded
              ? "The WordPress change may have already been applied, but Odito couldn't record it because the task changed at the same time. Refresh and check WordPress before trying again."
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
          {needsRegenerate ? (
            <button
              type="button" onClick={onRegenerate} disabled={isRegenerating}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: "#f5a623", color: "#1a1a1a", cursor: isRegenerating ? "not-allowed" : "pointer", opacity: isRegenerating ? 0.7 : 1 }}
            >
              {isRegenerating ? "Regenerating…" : "Regenerate from current page"}
            </button>
          ) : (
            <button
              type="button" onClick={onConfirm} disabled={applyDisabled}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, border: "none", background: "linear-gradient(135deg,#7730ed,#00dfff)", color: "#fff", cursor: applyDisabled ? "not-allowed" : "pointer", opacity: applyDisabled ? 0.5 : 1 }}
            >
              {isApplying ? "Applying…" : "Apply Fix"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

"use client";

/**
 * Informational-only banner — never blocks the page, never shows as an
 * error. Visible exactly when there are more qualified URLs than the
 * account's remaining page quota can cover; hidden otherwise. `pagesRemaining`
 * comes from the same GET /subscription response (subscription.pages.remaining)
 * every other quota display in the app already reads — no new calculation.
 *
 * `onBuyMorePages` is optional and deliberately the only coupling to the
 * purchase flow — this banner doesn't import or render BuyPagesModal
 * itself, so it stays usable anywhere the quota-exceeded message alone is
 * needed. When omitted, the sentence just renders as plain text.
 */
const PageQuotaBanner = ({ totalQualified, pagesRemaining, onBuyMorePages }) => {
  if (pagesRemaining == null || totalQualified <= pagesRemaining) return null;

  return (
    <div
      style={{
        marginBottom: 18,
        padding: "12px 16px",
        borderRadius: 10,
        border: "1px solid rgba(245,158,11,0.3)",
        background: "rgba(245,158,11,0.08)",
        color: "var(--text)",
        fontSize: 13,
        lineHeight: 1.5,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0 }}>ℹ️</span>
      <span>
        You have discovered {totalQualified} pages, but your current subscription allows auditing up to{' '}
        {pagesRemaining} pages.{' '}
        {onBuyMorePages ? (
          <button
            type="button"
            onClick={onBuyMorePages}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              font: "inherit",
              color: "#00e5ff",
              fontWeight: 700,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Buy More Pages
          </button>
        ) : (
          "Buy More Pages"
        )}
        {' '}to audit additional pages.
      </span>
    </div>
  );
};

export default PageQuotaBanner;

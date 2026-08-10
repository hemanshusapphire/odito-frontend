"use client";

const UrlSelectionSummaryBar = ({ totalSelected, selectionLimit, limitMessage, submitting, error, onApprove }) => {
  // selectionLimit here is the caller's EFFECTIVE cap — the more
  // restrictive of any per-project admin override and the account's page
  // quota (client.jsx combines both via min() before passing this down;
  // nothing here recomputes that).
  const overLimit = selectionLimit != null && totalSelected > selectionLimit;
  const disabled = submitting || totalSelected === 0 || overLimit;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px 24px",
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        zIndex: 20
      }}
    >
      <div style={{ maxWidth: 960, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
            {totalSelected} URL{totalSelected === 1 ? '' : 's'} selected
          </div>
          {error && (
            <div style={{ fontSize: 12.5, color: "var(--destructive, #ef4444)", marginTop: 2 }}>{error}</div>
          )}
          {!error && overLimit && (
            <div style={{ fontSize: 12.5, color: "var(--destructive, #ef4444)", marginTop: 2 }}>
              Exceeds the maximum of {selectionLimit} — deselect some URLs to continue.
            </div>
          )}
          {!error && !overLimit && limitMessage && (
            <div style={{ fontSize: 12.5, color: "var(--destructive, #ef4444)", marginTop: 2 }}>
              {limitMessage}
            </div>
          )}
        </div>

        <button
          onClick={onApprove}
          disabled={disabled}
          style={{
            padding: "12px 28px",
            borderRadius: 10,
            border: "none",
            background: disabled ? "rgba(124,58,237,0.3)" : "var(--grad1, linear-gradient(135deg,#7c3aed,#00e5ff))",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            cursor: disabled ? "not-allowed" : "pointer",
            whiteSpace: "nowrap"
          }}
        >
          {submitting ? "Approving..." : `Approve ${totalSelected} URL${totalSelected === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
};

export default UrlSelectionSummaryBar;

"use client";

import { useRef, useState } from 'react';

// Lightweight, dependency-free virtualization: fixed row height, render only
// the rows currently in (or near) the visible scroll window. Necessary at
// the 500-1000+ row scale this screen is required to handle — naively
// rendering every row as a real DOM node would visibly jank at that size.
const ROW_HEIGHT = 44;
const CONTAINER_HEIGHT = 480;
const BUFFER_ROWS = 6;

const typeColor = (type) => {
  switch (type) {
    case 'main': return 'var(--cyan, #00e5ff)';
    case 'service': return '#7c3aed';
    case 'blog': return '#f59e0b';
    case 'portfolio': return '#10b981';
    default: return 'var(--text3)';
  }
};

// "HTTP_404" -> "HTTP 404", "STALE_SITEMAP_URL" -> "Stale Sitemap Url",
// "TIMEOUT" -> "Timeout". Presentation only — never used for any decision.
const formatReasonCode = (code) => {
  if (!code) return null;
  if (code.startsWith('HTTP_')) return `HTTP ${code.slice(5)}`;
  return code
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
};

const UrlSelectionTable = ({ urls, selected, onToggle }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [detailRow, setDetailRow] = useState(null);
  const containerRef = useRef(null);

  const totalHeight = urls.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
  const endIndex = Math.min(
    urls.length,
    Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT) + BUFFER_ROWS
  );
  const visibleRows = urls.slice(startIndex, endIndex);

  if (urls.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text3)", fontSize: 13.5 }}>
        No URLs match the current search/filter.
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{
          height: CONTAINER_HEIGHT,
          overflowY: "auto",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          position: "relative",
          background: "rgba(255,255,255,0.02)"
        }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleRows.map((row, i) => {
            const index = startIndex + i;
            const isSelected = selected.has(row.url);
            // Every unqualified row can show a rejection detail popover, even
            // if qualification_details wasn't captured (older/pre-fix audit
            // runs) — the modal below falls back to reject_reason/status_code
            // in that case, so the affordance is never hidden unnecessarily.
            const showDetailTrigger = !row.qualified;
            return (
              <div
                key={row.url}
                onClick={() => onToggle(row.url)}
                style={{
                  position: "absolute",
                  top: index * ROW_HEIGHT,
                  left: 0,
                  right: 0,
                  height: ROW_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: isSelected ? "rgba(124,58,237,0.08)" : "transparent",
                  cursor: "pointer"
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(row.url)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={!row.qualified}
                  style={{ width: 14, height: 14, cursor: row.qualified ? "pointer" : "not-allowed", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13, color: "var(--text)" }}>
                  {row.url}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: typeColor(row.page_type), flexShrink: 0, minWidth: 60, textAlign: "center" }}>
                  {row.page_type}
                </span>
                <span
                  onClick={showDetailTrigger ? (e) => { e.stopPropagation(); setDetailRow(row); } : undefined}
                  title={showDetailTrigger ? "Click for rejection details" : undefined}
                  style={{
                    fontSize: 11, fontWeight: 600, flexShrink: 0, minWidth: 70, textAlign: "center",
                    color: row.qualified ? "var(--green, #10b981)" : "var(--destructive, #ef4444)",
                    textDecoration: showDetailTrigger ? "underline dotted" : "none",
                    cursor: showDetailTrigger ? "help" : "default",
                  }}
                >
                  {row.qualified ? `✓ ${row.status_code ?? ''}` : (row.reject_reason || 'rejected')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {detailRow && (
        <RejectionDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
      )}
    </>
  );
};

function RejectionDetailModal({ row, onClose }) {
  const d = row.qualification_details || {};
  const reasonLabel = formatReasonCode(d.reason_code) || formatReasonCode(row.reject_reason) || 'Rejected';
  const explanation = d.explanation || null;
  const sourceValue = d.source?.sitemap || d.source?.source_page || null;
  const sourceLabel = d.source?.sitemap ? 'Source (Sitemap)' : (d.source?.source_page ? 'Source (Linked From)' : 'Source');
  const finalStatus = d.probe?.final_status ?? row.status_code ?? null;
  const responseTimeMs = d.probe?.response_time_ms ?? null;
  const probeMethod = d.probe?.method ?? null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div
        className="glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 24, maxWidth: 460, width: "100%" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 18 }}>❌</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--destructive, #ef4444)" }}>
            Rejected
          </span>
        </div>

        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, wordBreak: "break-all" }}>
          {row.url}
        </div>

        <DetailField label="Reason" value={reasonLabel} />
        {explanation && <DetailField label="Explanation" value={explanation} />}
        {sourceValue && <DetailField label={sourceLabel} value={sourceValue} />}
        {finalStatus != null && <DetailField label="Response" value={String(finalStatus)} />}
        {responseTimeMs != null && <DetailField label="Response Time" value={`${responseTimeMs} ms`} />}
        {probeMethod && <DetailField label="Probe Method" value={probeMethod} />}

        <button
          onClick={onClose}
          style={{
            marginTop: 8, padding: "10px 16px", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "var(--text)",
            fontSize: 13, cursor: "pointer", width: "100%",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "var(--text)", wordBreak: "break-word", lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}

export default UrlSelectionTable;

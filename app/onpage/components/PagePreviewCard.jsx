"use client";

import { useState, useMemo } from 'react';
import { usePageRawHtml } from '@/hooks/useDashboardQueries';

export default function PagePreviewCard({ url, issues, projectId }) {
  const [loadHtml, setLoadHtml] = useState(false);

  // Only fires after user clicks the HTML button — not on mount
  const { data: rawHtmlResponse, isLoading: loading, error: queryError } = usePageRawHtml(
    loadHtml ? projectId : null,
    loadHtml ? url : null
  );

  const rawHtml = useMemo(() => {
    if (rawHtmlResponse?.success && rawHtmlResponse?.data?.html) {
      return rawHtmlResponse.data.html;
    }
    return '';
  }, [rawHtmlResponse]);

  const error = queryError
    ? (queryError.message || 'Failed to fetch HTML')
    : (rawHtmlResponse && !rawHtmlResponse.success
        ? (rawHtmlResponse.message || 'Failed to fetch HTML')
        : '');

  return (
    <div className="preview-card">
      <div className="preview-hd">
        <div className="preview-hd-title">🖥 Page Preview</div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button className="btn sm pr" onClick={() => setLoadHtml(true)}>HTML</button>
        </div>
      </div>

      <div className="browser">
        <div className="browser-bar">
          <div className="browser-dots">
            <div className="browser-dot" style={{ background: "#ff5f57" }}></div>
            <div className="browser-dot" style={{ background: "#febc2e" }}></div>
            <div className="browser-dot" style={{ background: "#28c840" }}></div>
          </div>
          <div className="browser-addr">{url}</div>
        </div>

        <div className="browser-viewport" style={{ overflow: "hidden" }}>
          <div style={{
            position: "relative",
            zIndex: 1,
            padding: "0",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            background: "white"
          }}>
            {!loadHtml ? (
              <div
                onClick={() => setLoadHtml(true)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: "10px",
                  cursor: "pointer",
                  color: "#888",
                  fontSize: "12px",
                  userSelect: "none"
                }}
              >
                <div style={{ fontSize: "28px", opacity: 0.4 }}>🖥</div>
                <div>Click <strong>HTML</strong> to load preview</div>
              </div>
            ) : loading ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#666",
                fontSize: "12px"
              }}>
                Loading HTML from stored data...
              </div>
            ) : error ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#ff4444",
                fontSize: "11px",
                padding: "10px",
                textAlign: "center"
              }}>
                {error}
              </div>
            ) : (
              <iframe
                srcDoc={rawHtml}
                style={{
                  border: "none",
                  background: "white",
                  transform: "scale(0.6)",
                  transformOrigin: "top left",
                  width: "166.67%",
                  height: "166.67%",
                }}
                title="Page Preview"
                sandbox="allow-same-origin allow-scripts allow-forms"
                scrolling="no"
              />
            )}
          </div>

          {/* Issue Indicator Dots */}
          {issues.crit > 0 && (
            <div style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "var(--re)",
              boxShadow: "0 0 8px rgba(255,56,96,0.9)",
              animation: "blink 1.4s infinite"
            }}></div>
          )}
          {issues.warn > 0 && (
            <div style={{
              position: "absolute",
              top: "14px",
              left: "28px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "var(--am)",
              boxShadow: "0 0 7px rgba(255,183,3,0.8)",
              animation: "blink 1.9s infinite"
            }}></div>
          )}
          {issues.low > 0 && (
            <div style={{
              position: "absolute",
              top: "14px",
              left: "42px",
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "var(--cy)",
              boxShadow: "0 0 7px rgba(0,223,255,0.7)",
              animation: "blink 2.2s infinite"
            }}></div>
          )}
        </div>
      </div>
    </div>
  )
}

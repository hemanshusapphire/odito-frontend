"use client";

import { memo } from "react";

// Memoized: sits beside other dashboard widgets and should not re-render when a
// sibling widget updates; only its three count props matter.
function SEOSummaryPanel({ pagesCrawled = 0, totalIssues = 0, criticalIssues = 0 }) {
  return (
    <div>
      <div className="section-head">
        <div className="section-title">SEO Summary</div>
        <div className="section-tag">LIVE</div>
      </div>
      <div className="stat-grid">
        {[
          { l: "Pages Crawled", v: pagesCrawled, c: "var(--cyan)" },
          { l: "Total Issues", v: totalIssues, c: "var(--purple)" },
          { l: "Critical", v: criticalIssues, c: "var(--red)" },
        ].map((s, i) => (
          <div key={i} className="stat-tile">
            <div className="stat-tile-label">{s.l}</div>
            <div className="stat-tile-value" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(SEOSummaryPanel);

"use client";

import { memo } from "react";

// Memoized: sits beside other dashboard widgets and should not re-render when a
// sibling widget updates; only its count props matter.
//
// `totalIssuesState` is one of 'live' | 'stale' | 'error' | 'loading' — the
// Total Issues tile renders differently for each so a failed/unavailable
// live query never looks identical to a fresh result (previously it could
// silently show a cached, possibly-outdated `project.total_issues` snapshot,
// or even a fabricated 0, with no visual distinction from live data).
function SEOSummaryPanel({ pagesCrawled = 0, totalIssues = null, totalIssuesState = 'live', criticalIssues = 0 }) {
  const totalIssuesDisplay = (() => {
    if (totalIssuesState === 'error') return { value: '—', suffix: null, dim: true };
    if (totalIssuesState === 'stale') return { value: totalIssues, suffix: ' (cached)', dim: true };
    return { value: totalIssues ?? 0, suffix: null, dim: false };
  })();

  return (
    <div>
      <div className="section-head">
        <div className="section-title">SEO Summary</div>
        <div className="section-tag">LIVE</div>
      </div>
      <div className="stat-grid">
        {[
          { l: "Pages Crawled", v: pagesCrawled, c: "var(--cyan)" },
          // Deliberately labeled "All Categories" — this includes Accessibility
          // issues, so it will legitimately differ from the On-Page tab's total
          // (which excludes Accessibility, since that has its own tab). Same
          // canonical calculation underneath; only the category scope differs.
          {
            l: "Total Issues (All Categories)",
            v: totalIssuesDisplay.dim ? `${totalIssuesDisplay.value}${totalIssuesDisplay.suffix || ''}` : totalIssuesDisplay.value,
            c: totalIssuesDisplay.dim ? "var(--muted-foreground, #888)" : "var(--purple)",
            title: totalIssuesState === 'error'
              ? "Unable to load right now — this is not a count of zero issues, the request failed."
              : totalIssuesState === 'stale'
              ? "Live count unavailable — showing the cached total from the last completed audit, which may be out of date."
              : "Every open issue across all categories, including Accessibility. The On-Page tab shows SEO issues only.",
          },
          { l: "Critical", v: criticalIssues, c: "var(--red)" },
        ].map((s, i) => (
          <div key={i} className="stat-tile" title={s.title}>
            <div className="stat-tile-label">{s.l}</div>
            <div className="stat-tile-value" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(SEOSummaryPanel);

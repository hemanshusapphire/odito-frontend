"use client";

import { useRouter } from 'next/navigation';

/**
 * Was a fully static, hardcoded paragraph — no props, no API call, no data
 * wiring of any kind — labeled "AI Explainer" and presented as if it were a
 * real, project-specific analysis. Verified against a real audited project
 * (Sapphiredigitalagency-Com): the card claimed "removing the Noindex from
 * 3 pages" while the project genuinely had 0 noindexed pages, and claimed
 * "adding FAQ schema sitewide" while FAQ schema was already present on
 * every page (the real, opposite problem was that it didn't match visible
 * content). The "+14–19 points" estimate had no calculation behind it
 * anywhere in the codebase. This is exactly the "3 pages"-style fabricated
 * value the original data-consistency audit was looking for.
 *
 * Replaced with a summary built only from real numbers already computed on
 * this page (page-content.jsx) — no invented specifics, no point estimate
 * that doesn't exist. The "Watch AI Video Brief" button still links to the
 * real AI Video Report feature (aiScript.service.js / AiHubSnapshotService),
 * which generates its narration from real audit data.
 */
export default function AISummaryCard({ pagesCrawled, totalIssues, totalIssuesState, criticalIssues }) {
  const router = useRouter();

  const handleVideoBrief = () => {
    router.push('/app/ai-video');
  };

  const hasRealCounts = totalIssuesState === 'live' && totalIssues != null;

  return (
    <div className="ai-card" style={{ marginBottom: 24 }}>
      <div className="ai-card-label">✦Odito AI Explainer</div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--grad1)", display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>🎥</div>
        <div>
          <div className="ai-card-text">
            {hasRealCounts ? (
              <>
                This audit found <strong style={{ color: "var(--text)" }}>{totalIssues} open {totalIssues === 1 ? 'issue' : 'issues'}</strong>
                {criticalIssues > 0 && <> (<strong style={{ color: "var(--cyan)" }}>{criticalIssues} critical</strong>)</>} across{" "}
                <strong style={{ color: "var(--text)" }}>{pagesCrawled} {pagesCrawled === 1 ? 'page' : 'pages'}</strong> crawled. Watch the AI Video Brief for a full,
                narrated breakdown of your AI visibility opportunities.
              </>
            ) : (
              <>Run or wait for an audit to complete to see your site's real issue summary here.</>
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              className="task-btn primary tap-target"
              style={{
                fontSize: 12,
                background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={handleVideoBrief}
            >
              🎬 Watch AI Video Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

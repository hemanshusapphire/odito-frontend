"use client"

import { memo } from "react"
import VerificationMetricsGrid from "./VerificationMetricsGrid"
import VerificationStatusPills from "./VerificationStatusPills"
import { formatCompletedAt, formatDuration } from "./verificationFormat"
import { useLatestVerification } from "@/hooks/useDashboardQueries"

// Matches the eventual max tile count (SEO + AISO + AEO + GEO + Issue Count +
// Critical + Warnings) so the skeleton->real-content swap doesn't visibly
// grow the grid (F4-006: avoid layout shift). Real content may render fewer
// tiles (a single "unavailable" tile replaces 3 AI tiles when AI Visibility
// isn't SUCCESS) — a shrink reads better than a grow.
const SKELETON_TILE_COUNT = 7

/**
 * Verification Result Panel (F4-002).
 *
 * Shows the result of the URL Verification that JUST completed on this
 * page — not a history/timeline. Renders nothing until `enabled` (driven
 * by PageDetailView from useUrlVerification's own progress.status), so a
 * normal page load never shows a stale prior run.
 *
 * Reuses MetricTile/DeltaBadge (components/dashboard/overview/AuditComparisonCard)
 * and their existing CSS (styles/components/cards.css) — same before→after/
 * change tiles used by the project-level Progress Tracker card, so no new
 * design language is introduced.
 *
 * Wrapped in memo() (F4-006): `enabled` only flips once per verification
 * (false throughout the multi-tick "processing" phase, true once at
 * completion) but PageDetailView itself re-renders on every progress tick —
 * without memo() this panel would re-render on every tick too, even though
 * its own props never change in between.
 */
function VerificationResultPanel({ projectId, pageUrl, enabled }) {
  const { data, isLoading, isError, refetch } = useLatestVerification(projectId, pageUrl, { enabled })

  if (!enabled) return null

  if (isLoading) {
    return (
      <div className="audit-comp-card verify-result-panel" role="status" aria-live="polite" aria-label="Loading verification result">
        <div className="section-head">
          <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 170, height: 18 }} />
        </div>
        <div className="comp-grid">
          {[...Array(SKELETON_TILE_COUNT)].map((_, i) => (
            <div key={i} className="comp-metric-tile">
              <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 80, height: 10 }} />
              <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 110, height: 24, marginTop: 2 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="verify-panel-error" role="alert">
        Couldn&apos;t load the latest verification result. The rest of this page is unaffected.{' '}
        <button className="verify-panel-retry-btn" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    )
  }

  const run = data?.data
  if (!run) return null

  const aiStatus = run.aiVisibilityStatus

  return (
    <div className="audit-comp-card verify-result-panel" role="status" aria-live="polite">
      <div className="section-head">
        <div className="section-title">Verification Result</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <VerificationStatusPills status={run.status} aiVisibilityStatus={aiStatus} />
        </div>
      </div>

      <div className="verify-panel-meta">
        <span>Verified {formatCompletedAt(run.completedAt)}</span>
        <span>·</span>
        <span>{formatDuration(run.durationMs)}</span>
      </div>

      <VerificationMetricsGrid
        before={run.before}
        after={run.after}
        delta={run.delta}
        aiVisibilityStatus={aiStatus}
      />
    </div>
  )
}

export default memo(VerificationResultPanel)

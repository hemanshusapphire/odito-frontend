"use client"

import { MetricTile } from "@/components/dashboard/overview/AuditComparisonCard"

/**
 * Shared before → after → change tile grid for a verification run's
 * SEO/AI scores and issue counts. Extracted out of VerificationResultPanel
 * (F4-002) so the Run Detail Drawer (F4-004) can show identical before/
 * after math instead of a second hand-copied implementation — single
 * source of truth for this adapter/rollup logic.
 *
 * Reuses MetricTile (components/dashboard/overview/AuditComparisonCard),
 * same component the project-level Progress Tracker card uses.
 */
export default function VerificationMetricsGrid({ before = {}, after = {}, delta = {}, aiVisibilityStatus }) {
  const aiSuccess = aiVisibilityStatus === 'SUCCESS'
  const beforeTotal = totalIssues(before)
  const afterTotal = totalIssues(after)
  const totalChange = (delta.issuesIntroduced ?? 0) - (delta.issuesFixed ?? 0)

  return (
    <div className="comp-grid">
      <MetricTile
        label="SEO Score"
        suffix="pts"
        delta={toMetricDelta(before.pageScore, after.pageScore, delta.pageScoreChange)}
      />

      {aiSuccess ? (
        <>
          <MetricTile
            label="AISO Score"
            suffix="pts"
            delta={toMetricDelta(before.aisoScore, after.aisoScore, delta.aisoScoreChange)}
          />
          <MetricTile
            label="AEO Score"
            suffix="pts"
            delta={toMetricDelta(before.aeoScore, after.aeoScore, delta.aeoScoreChange)}
          />
          <MetricTile
            label="GEO Score"
            suffix="pts"
            delta={toMetricDelta(before.geoScore, after.geoScore, delta.geoScoreChange)}
          />
        </>
      ) : (
        <div className="comp-metric-tile">
          <div className="comp-metric-label">AI Visibility</div>
          <div className="verify-panel-ai-unavailable">
            {aiVisibilityStatus === 'SKIPPED'
              ? 'Skipped for this run — AI score changes unavailable.'
              : 'AI check failed for this run — AI score changes unavailable.'}
          </div>
        </div>
      )}

      <MetricTile
        label="Issue Count"
        suffix="issues"
        isLowerBetter
        delta={toMetricDelta(beforeTotal, afterTotal, totalChange, { lowerIsBetter: true })}
      />
      <MetricTile
        label="Critical Issues"
        suffix="issues"
        isLowerBetter
        delta={toMetricDelta(before.criticalIssues, after.criticalIssues, after.criticalIssues - before.criticalIssues, { lowerIsBetter: true })}
      />
      <MetricTile
        label="Warnings"
        suffix="issues"
        isLowerBetter
        delta={toMetricDelta(before.warningIssues, after.warningIssues, after.warningIssues - before.warningIssues, { lowerIsBetter: true })}
      />
    </div>
  )
}

function totalIssues(snapshot) {
  return (snapshot.criticalIssues ?? 0) + (snapshot.warningIssues ?? 0) + (snapshot.infoIssues ?? 0)
}

// Adapts a raw before/after/change reading into MetricTile's own
// {previous, current, direction, change} contract — no new tile rendering
// logic, just a shape adapter for the existing component.
function toMetricDelta(before, after, change, { lowerIsBetter = false } = {}) {
  if (before == null || after == null) {
    return { previous: before, current: after, direction: 'unchanged', change: null }
  }
  let direction = 'unchanged'
  if (change) {
    const increased = change > 0
    direction = (lowerIsBetter ? !increased : increased) ? 'improved' : 'declined'
  }
  return { previous: before, current: after, direction, change }
}

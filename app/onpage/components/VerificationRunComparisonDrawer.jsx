"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import VerificationMetricsGrid from "./VerificationMetricsGrid"
import VerificationStatusPills from "./VerificationStatusPills"
import { formatCompletedAt, formatDuration } from "./verificationFormat"
import { useVerificationRun } from "@/hooks/useDashboardQueries"

/**
 * Verification Run Comparison Drawer (F4-005).
 *
 * Compares two already-persisted runs for the same page — entirely
 * frontend, no new backend endpoint. Fetches each run via the exact same
 * GET /verification-runs/:runId used by the single-run drawer (F4-004),
 * called twice (once per runId).
 *
 * Reuses the existing Sheet primitive (no new modal system, focus trap/
 * restoration provided by Radix same as the single-run drawer) and
 * VerificationMetricsGrid/MetricTile (no new tile rendering) — the two
 * runs' own AFTER snapshots are fed in as this comparison's before/after
 * pair, with a delta object computed the same way the backend's own
 * computeVerificationDelta does (score = after-before when both are
 * numbers; issue counts = per-severity fixed/introduced via max(0, ...)) —
 * same rules, reapplied client-side to a different pair of inputs, not a
 * new semantic.
 */
export default function VerificationRunComparisonDrawer({ runIdA, runIdB, open, onOpenChange }) {
  const { data: dataA, isLoading: isLoadingA, isError: isErrorA, refetch: refetchA } = useVerificationRun(runIdA, { enabled: open })
  const { data: dataB, isLoading: isLoadingB, isError: isErrorB, refetch: refetchB } = useVerificationRun(runIdB, { enabled: open })

  const runA = dataA?.data
  const runB = dataB?.data
  const bothLoaded = !isLoadingA && !isLoadingB && !isErrorA && !isErrorB && runA && runB

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Compare Verification Runs</SheetTitle>
          <SheetDescription className="break-all">
            {runA?.pageUrl || runB?.pageUrl || ' '}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="comp-grid">
            <RunColumn label="Run A" run={runA} isLoading={isLoadingA} isError={isErrorA} onRetry={refetchA} />
            <RunColumn label="Run B" run={runB} isLoading={isLoadingB} isError={isErrorB} onRetry={refetchB} />
          </div>

          {/* One failed fetch must not prevent rendering the successfully
              fetched run's own header above — this message is additive,
              not a replacement for it. */}
          {(isErrorA || isErrorB) && !(isErrorA && isErrorB) && (
            <div className="verify-panel-error" role="alert">
              Couldn&apos;t load {isErrorA ? 'Run A' : 'Run B'} — showing {isErrorA ? 'Run B' : 'Run A'} only.
            </div>
          )}
          {isErrorA && isErrorB && (
            <div className="verify-panel-error" role="alert">
              Couldn&apos;t load either run.{' '}
              <button className="verify-panel-retry-btn" onClick={() => { refetchA(); refetchB() }}>
                Retry
              </button>
            </div>
          )}

          {bothLoaded && (
            <VerificationMetricsGrid {...buildComparisonInputs(runA, runB)} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function RunColumn({ label, run, isLoading, isError, onRetry }) {
  if (isLoading) {
    return (
      <div className="comp-metric-tile" role="status" aria-live="polite" aria-label={`Loading ${label}`}>
        <div className="comp-metric-label">{label}</div>
        <div className="skeleton-base skeleton-shimmer rounded" style={{ width: '90%', height: 12, marginTop: 8 }} />
        <div className="skeleton-base skeleton-shimmer rounded" style={{ width: '60%', height: 12, marginTop: 6 }} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="comp-metric-tile" role="alert">
        <div className="comp-metric-label">{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--rd, #ff5c5c)', marginTop: 6 }}>
          Couldn&apos;t load this run.{' '}
          <button className="verify-panel-retry-btn" onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className="comp-metric-tile">
        <div className="comp-metric-label">{label}</div>
      </div>
    )
  }

  return (
    <div className="comp-metric-tile">
      <div className="comp-metric-label">{label}</div>
      <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>{formatCompletedAt(run.completedAt)}</div>
      <div style={{ fontSize: 11, color: 'var(--t3)' }}>{formatDuration(run.durationMs)}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
        <VerificationStatusPills status={run.status} aiVisibilityStatus={run.aiVisibilityStatus} />
      </div>
    </div>
  )
}

// Mirrors odito_backend's computeVerificationDelta.js exactly (null-safe
// score diff; per-severity fixed/introduced via max(0, ...)) — same rules,
// applied here to two runs' AFTER snapshots instead of one run's own
// before/after pair. Never fabricates AI values: aiVisibilityStatus is only
// 'SUCCESS' when BOTH runs actually succeeded; otherwise VerificationMetricsGrid
// falls back to its existing "changes unavailable" tile, exactly as it
// already does for a single run.
function buildComparisonInputs(runA, runB) {
  const before = runA.after || {}
  const after = runB.after || {}

  const bothAiSuccess = runA.aiVisibilityStatus === 'SUCCESS' && runB.aiVisibilityStatus === 'SUCCESS'
  const aiVisibilityStatus = bothAiSuccess
    ? 'SUCCESS'
    : (runA.aiVisibilityStatus !== 'SUCCESS' ? runA.aiVisibilityStatus : runB.aiVisibilityStatus)

  const critical = severityDelta(before.criticalIssues, after.criticalIssues)
  const warning = severityDelta(before.warningIssues, after.warningIssues)
  const info = severityDelta(before.infoIssues, after.infoIssues)

  return {
    before,
    after,
    delta: {
      pageScoreChange: scoreChange(before.pageScore, after.pageScore),
      aisoScoreChange: scoreChange(before.aisoScore, after.aisoScore),
      aeoScoreChange: scoreChange(before.aeoScore, after.aeoScore),
      geoScoreChange: scoreChange(before.geoScore, after.geoScore),
      issuesFixed: critical.fixed + warning.fixed + info.fixed,
      issuesIntroduced: critical.introduced + warning.introduced + info.introduced,
    },
    aiVisibilityStatus,
  }
}

function scoreChange(before, after) {
  if (typeof before !== 'number' || typeof after !== 'number') return null
  return after - before
}

function severityDelta(before, after) {
  const b = before ?? 0
  const a = after ?? 0
  return { fixed: Math.max(0, b - a), introduced: Math.max(0, a - b) }
}

"use client"

import { memo, useState } from "react"
import { ChevronDown, ChevronUp, History } from "lucide-react"
import { useVerificationHistory } from "@/hooks/useDashboardQueries"
import { AuditTimelineSkeleton } from "@/components/skeletons/dashboard/AuditComparisonSkeleton"
import VerificationRunDrawer from "./VerificationRunDrawer"
import VerificationRunComparisonDrawer from "./VerificationRunComparisonDrawer"
import VerificationStatusPills from "./VerificationStatusPills"
import { formatCompletedAt, formatDuration } from "./verificationFormat"

const HISTORY_CONTENT_ID = "verification-history-panel-content"

/**
 * Verification History Panel (F4-003).
 *
 * Historical visibility only — no comparison, charts, or diff views.
 * Structurally mirrors AuditTimeline (components/dashboard/overview) —
 * same collapsible toggle + timeline-list/timeline-run classes, expanded
 * state gates the fetch exactly like that component does — but uses this
 * page's own `.pill` status-badge convention (already shipped in
 * VerificationResultPanel, F4-002) instead of AuditTimeline's run-number/
 * score styling, since Overall/AI Visibility status is this row's subject.
 *
 * Row selection (local state only) now also opens VerificationRunDrawer
 * (F4-004) — no global store, no navigation; closing the drawer only
 * clears this local selection and never touches the history list's own
 * cached query.
 *
 * F4-005 adds a separate "Compare" control per row (distinct from the
 * row's own click-to-open-single-drawer area): clicking it enters
 * comparison mode anchored on that run; clicking "Compare" on a different
 * row picks it as the second run and opens VerificationRunComparisonDrawer
 * with both. All of this is local state — no global store, and it never
 * touches the single-run drawer's own selection/state.
 *
 * Wrapped in memo() (F4-006): this panel's own props (`projectId`,
 * `pageUrl`) are stable across a verification's progress ticks, but its
 * parent (PageDetailView) re-renders on every tick — without memo() this
 * whole subtree (including both drawers) would re-render needlessly too.
 */
function VerificationHistoryPanel({ projectId, pageUrl }) {
  const [expanded, setExpanded] = useState(false)
  // Holds the whole clicked run (not just an id): the row's visual
  // "selected" state matches by `verificationRunId` (Mongo _id, unique per
  // row), but the drawer/API need `runId` (the String tracking id
  // PageVerificationRun.findOne({ runId }) actually filters by) — these are
  // two different fields on the same serialized run.
  const [selectedRun, setSelectedRun] = useState(null)
  // Comparison mode: `compareAnchor` is Run A once "Compare" is clicked on a
  // row; `comparePair` holds {runA, runB} once a second run is picked, which
  // is what actually opens the comparison drawer.
  const [compareAnchor, setCompareAnchor] = useState(null)
  const [comparePair, setComparePair] = useState(null)

  const { data: runs, isLoading, isError, refetch } = useVerificationHistory(projectId, pageUrl, { enabled: expanded })

  const handleCompareClick = (run) => {
    if (compareAnchor?.verificationRunId === run.verificationRunId) {
      setCompareAnchor(null)
      return
    }
    if (compareAnchor) {
      setComparePair({ runA: compareAnchor, runB: run })
      setCompareAnchor(null)
    } else {
      setCompareAnchor(run)
    }
  }

  return (
    <div className="audit-timeline-wrap">
      <button
        className="timeline-toggle-btn"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={HISTORY_CONTENT_ID}
      >
        <History size={15} style={{ flexShrink: 0 }} aria-hidden="true" />
        <span style={{ flex: 1 }}>Verification History</span>
        {expanded ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
      </button>

      {expanded && (
        <div id={HISTORY_CONTENT_ID} style={{ marginTop: 8 }}>
          {isLoading ? (
            <div role="status" aria-live="polite" aria-label="Loading verification history">
              <AuditTimelineSkeleton />
            </div>
          ) : isError ? (
            <div className="verify-panel-error" role="alert">
              Couldn&apos;t load verification history. The rest of this page is unaffected.{' '}
              <button className="verify-panel-retry-btn" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : !runs || runs.length === 0 ? (
            <div
              role="status"
              style={{
                padding: "20px 0",
                textAlign: "center",
                fontSize: 13,
                color: "var(--color-text-tertiary)",
              }}
            >
              No previous verification runs
            </div>
          ) : (
            <>
              {compareAnchor && (
                <div role="status" aria-live="polite" style={{ fontSize: 11.5, color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
                  Comparing — select a second run.
                </div>
              )}
              <div className="timeline-list">
                {runs.map((run) => (
                  <HistoryRow
                    key={run.verificationRunId}
                    run={run}
                    selected={selectedRun?.verificationRunId === run.verificationRunId}
                    onSelect={() => setSelectedRun(run)}
                    comparing={!!compareAnchor}
                    isCompareAnchor={compareAnchor?.verificationRunId === run.verificationRunId}
                    onCompare={() => handleCompareClick(run)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <VerificationRunDrawer
        runId={selectedRun?.runId}
        open={!!selectedRun}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedRun(null)
        }}
      />

      <VerificationRunComparisonDrawer
        runIdA={comparePair?.runA?.runId}
        runIdB={comparePair?.runB?.runId}
        open={!!comparePair}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setComparePair(null)
        }}
      />
    </div>
  )
}

function HistoryRowImpl({ run, selected, onSelect, comparing, isCompareAnchor, onCompare }) {
  const compareLabel = isCompareAnchor ? 'Cancel Compare' : comparing ? 'Compare With This' : 'Compare'
  const rowLabel = `Verification run from ${formatCompletedAt(run.completedAt)}, ${run.status}. View details.`

  return (
    <div
      className={`timeline-run${selected ? ' selected' : ''}${isCompareAnchor ? ' selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={rowLabel}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="timeline-run-date">
        {formatCompletedAt(run.completedAt)} · {formatDuration(run.durationMs)}
      </div>
      <VerificationStatusPills status={run.status} aiVisibilityStatus={run.aiVisibilityStatus} />
      <button
        className="timeline-run-compare-btn timeline-expand-btn"
        aria-label={
          isCompareAnchor
            ? 'Cancel comparing this run'
            : comparing
            ? `Compare with the run from ${formatCompletedAt(run.completedAt)}`
            : `Compare the run from ${formatCompletedAt(run.completedAt)} with another run`
        }
        onClick={(e) => {
          e.stopPropagation()
          onCompare()
        }}
      >
        {compareLabel}
      </button>
    </div>
  )
}

const HistoryRow = memo(HistoryRowImpl)

export default memo(VerificationHistoryPanel)

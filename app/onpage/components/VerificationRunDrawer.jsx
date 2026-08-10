"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
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

// Matches VerificationResultPanel's own skeleton tile count (F4-006): the
// eventual max is 7 tiles (SEO + AISO + AEO + GEO + Issue Count + Critical +
// Warnings), so the skeleton->real-content swap doesn't visibly grow the
// grid — a shrink (when AI isn't SUCCESS) reads better than a grow.
const SKELETON_TILE_COUNT = 7

/**
 * Verification Run Detail Drawer (F4-004).
 *
 * Inspects ONE persisted run — no comparison, charts, or editing. Reuses
 * the app's existing Sheet primitive (components/ui/sheet.jsx, same one
 * ReviewsDrawer already uses) rather than a new modal system, and reuses
 * VerificationMetricsGrid (MetricTile under the hood) for the before/after/
 * change tiles — same component F4-002's result panel uses.
 *
 * Fetches GET /seo/verification-runs/:runId (NOT latest-verification) so it
 * always shows the exact run the user clicked, not "whatever is newest".
 *
 * Radix's Dialog primitive (which Sheet wraps) already provides focus
 * trapping and focus restoration to the trigger on close — no additional
 * work needed here for that.
 */
export default function VerificationRunDrawer({ runId, open, onOpenChange }) {
  const [showTechnical, setShowTechnical] = useState(false)
  const { data, isLoading, isError, refetch } = useVerificationRun(runId, { enabled: open })

  const run = data?.data
  const aiStatus = run?.aiVisibilityStatus

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Verification Run</SheetTitle>
          <SheetDescription className="break-all">
            {run?.pageUrl || ' '}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div role="status" aria-live="polite" aria-label="Loading verification run">
              <DrawerSkeleton />
            </div>
          ) : isError ? (
            <div className="verify-panel-error" role="alert">
              Couldn&apos;t load this verification run.{' '}
              <button className="verify-panel-retry-btn" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          ) : !run ? null : (
            <>
              <div className="section-head">
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

              <button
                className="timeline-expand-btn"
                onClick={() => setShowTechnical((v) => !v)}
                aria-expanded={showTechnical}
                aria-controls="verification-run-technical-details"
              >
                {showTechnical ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
                Technical Details
              </button>

              {showTechnical && (
                <div id="verification-run-technical-details" style={{ fontSize: 12, color: 'var(--t3)' }}>
                  Run ID: <span style={{ fontFamily: 'var(--font-metric, monospace)' }}>{run.runId}</span>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DrawerSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 140, height: 20 }} />
      <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 200, height: 12 }} />
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

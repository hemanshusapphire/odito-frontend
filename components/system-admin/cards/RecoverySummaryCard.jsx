"use client"

import { RotateCw, Lock, PackageOpen } from "lucide-react"
import { SystemStatCard } from "./SystemStatCard"

/**
 * ODITO-OPS-001 §3/§7 — "these should remain very low" (per the spec) is
 * why every tile here uses a neutral/green tone rather than red-by-default:
 * a nonzero count is expected and healthy (it means retries/recovery are
 * working), only a sustained SPIKE would be the actual signal — which this
 * dashboard's raw numbers make visible without editorializing.
 */
export function RecoverySummaryCard({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SystemStatCard icon={RotateCw} label="Retry Reclaimed" value={summary.retryReclaimedCount} tone="blue" />
      <SystemStatCard icon={Lock} label="Stale Locks Recovered" value={summary.staleLockRecoveredCount} tone="amber" />
      <SystemStatCard icon={PackageOpen} label="Orphaned Jobs Recovered" value={summary.orphanedJobRecoveredCount} tone="violet" />
    </div>
  )
}

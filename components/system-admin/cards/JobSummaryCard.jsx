"use client"

import { Clock, Loader2, RotateCw, CheckCircle2, XCircle } from "lucide-react"
import { SystemStatCard } from "./SystemStatCard"

/**
 * Reuses the same <SystemStatCard> as the Dashboard (Phase 2B) and Payments
 * (Phase 2E) summary rows — no new tile JSX.
 */
export function JobSummaryCard({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <SystemStatCard icon={Clock} label="Pending" value={summary.pending} tone="amber" />
      <SystemStatCard icon={Loader2} label="Running" value={summary.running} tone="blue" />
      <SystemStatCard icon={RotateCw} label="Retrying" value={summary.retrying} tone="orange" />
      <SystemStatCard icon={CheckCircle2} label="Completed" value={summary.completed} tone="emerald" />
      <SystemStatCard icon={XCircle} label="Failed" value={summary.failed} tone="red" />
    </div>
  )
}

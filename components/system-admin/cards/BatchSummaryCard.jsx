"use client"

import { Play, Loader2, CheckCircle2, AlertTriangle, XCircle, Clock3 } from "lucide-react"
import { SystemStatCard } from "./SystemStatCard"

/**
 * ODITO-OPS-001 — same <SystemStatCard> grid every other System Admin
 * summary row uses (JobSummaryCard, WebhookSummaryCard, ...). "Stuck" gets
 * its own red tile regardless of how small the count is — that's the one
 * number this whole dashboard exists to make impossible to miss.
 */
export function BatchSummaryCard({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SystemStatCard icon={Play} label="Running" value={summary.running} tone="blue" />
      <SystemStatCard icon={Loader2} label="Aggregating" value={summary.aggregating} tone="violet" />
      <SystemStatCard icon={CheckCircle2} label="Completed" value={summary.completed} tone="emerald" />
      <SystemStatCard icon={AlertTriangle} label="Partial" value={summary.partial} tone="amber" />
      <SystemStatCard icon={XCircle} label="Failed" value={summary.failed} tone="red" />
      <SystemStatCard
        icon={Clock3}
        label="Stuck (>15m)"
        value={summary.stuckCount}
        tone={summary.stuckCount > 0 ? "red" : "green"}
        breakdown={[
          { label: "avg URLs/batch", value: summary.averageUrlsPerBatch },
          { label: "total batches", value: summary.totalBatches },
        ]}
      />
    </div>
  )
}

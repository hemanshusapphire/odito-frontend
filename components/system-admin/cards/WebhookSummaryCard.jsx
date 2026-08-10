"use client"

import { CheckCircle2, Loader2, XCircle, EyeOff } from "lucide-react"
import { SystemStatCard } from "./SystemStatCard"

export function WebhookSummaryCard({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SystemStatCard icon={CheckCircle2} label="Completed" value={summary.completed} tone="emerald" />
      <SystemStatCard icon={Loader2} label="Processing" value={summary.processing} tone="blue" />
      <SystemStatCard icon={XCircle} label="Failed" value={summary.failed} tone="red" />
      <SystemStatCard icon={EyeOff} label="Ignored" value={summary.ignored} tone="violet" />
    </div>
  )
}

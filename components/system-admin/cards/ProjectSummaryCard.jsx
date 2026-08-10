"use client"

import { FolderOpen, Loader2, CheckCircle2, XCircle, PauseCircle, Trash2 } from "lucide-react"
import { SystemStatCard } from "./SystemStatCard"

/**
 * Reuses SystemStatCard, same as every other summary row. "Paused Audits"
 * maps to the project-level status:'paused' (crawl_status has no paused
 * value) — see systemAdminProjectService.js's file comment.
 */
export function ProjectSummaryCard({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SystemStatCard icon={FolderOpen} label="Total Projects" value={summary.total} tone="blue" />
      <SystemStatCard icon={Loader2} label="Running Audits" value={summary.running} tone="cyan" />
      <SystemStatCard icon={CheckCircle2} label="Completed Audits" value={summary.completed} tone="emerald" />
      <SystemStatCard icon={XCircle} label="Failed Audits" value={summary.failed} tone="red" />
      <SystemStatCard icon={PauseCircle} label="Paused Audits" value={summary.paused} tone="amber" />
      <SystemStatCard icon={Trash2} label="Deleted Projects" value={summary.deleted} tone="orange" />
    </div>
  )
}

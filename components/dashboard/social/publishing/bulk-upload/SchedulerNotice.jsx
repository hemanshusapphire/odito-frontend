"use client"

import { AlertTriangle } from 'lucide-react'

/**
 * Non-blocking warning shown when the import result reports
 * schedulerEnabled === false and the backend returned warnings.
 *
 * The text is rendered verbatim from `warnings` — the frontend never
 * re-words it, never modifies environment variables, never calls a
 * scheduler endpoint, and never retries automatically.
 */
export default function SchedulerNotice({ warnings = [] }) {
  if (!Array.isArray(warnings) || warnings.length === 0) return null
  return (
    <div
      role="status"
      className="flex gap-3 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-200"
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold">Scheduled publishing is disabled in this environment</p>
        {warnings.map((w, i) => (
          <p key={i} className="leading-snug">{w}</p>
        ))}
      </div>
    </div>
  )
}

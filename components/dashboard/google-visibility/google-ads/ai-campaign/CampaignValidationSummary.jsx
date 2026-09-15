"use client"

import { AlertTriangle } from 'lucide-react'

/**
 * Collapsible-free summary of client-side validation issues (spec §34).
 * Purely a UX aid — the backend still validates on save. `errors` is the
 * flat { path: message } map from validateWorkspace().
 */
export default function CampaignValidationSummary({ errors, onJump }) {
  const entries = Object.entries(errors || {})
  if (entries.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 px-4 py-3 text-sm dark:border-amber-700/50 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4" />
        {entries.length} {entries.length === 1 ? 'item needs' : 'items need'} attention before this campaign is complete
      </div>
      <ul className="mt-2 space-y-1 text-amber-700/90 dark:text-amber-200/80">
        {entries.slice(0, 8).map(([path, message]) => (
          <li key={path}>
            <button
              type="button"
              onClick={() => onJump?.(path)}
              className="text-left underline-offset-2 hover:underline"
            >
              <span className="font-mono text-xs text-amber-800/70 dark:text-amber-300/70">{path}</span>
              {' — '}
              {message}
            </button>
          </li>
        ))}
        {entries.length > 8 && <li className="text-xs opacity-70">…and {entries.length - 8} more</li>}
      </ul>
    </div>
  )
}

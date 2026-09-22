"use client"

import { RefreshCw } from 'lucide-react'

/** "Regenerate all" / "Regenerate selected" buttons below the design grid. */
export function RegenerateControls({ onRegenerateAll, onRegenerateSelected, regenerating }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onRegenerateAll}
        disabled={!!regenerating}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <RefreshCw className={`h-4 w-4 ${regenerating === 'all' ? 'animate-spin' : ''}`} />
        Regenerate all
      </button>
      <button
        type="button"
        onClick={onRegenerateSelected}
        disabled={!!regenerating}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <RefreshCw className={`h-4 w-4 ${regenerating === 'selected' ? 'animate-spin' : ''}`} />
        Regenerate selected
      </button>
    </div>
  )
}

export default RegenerateControls

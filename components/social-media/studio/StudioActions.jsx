"use client"

import { Loader2, RefreshCw, Sparkles } from 'lucide-react'

/**
 * Generate designs (first time) / Regenerate all (a new set of three) / Regenerate selected (one design, same creative direction).
 * Everything is a real server request; the buttons only reflect what the server and the click state allow.
 */
export function StudioActions({ hasDesigns, busy, generating, canGenerate, target, onGenerate, onRegenerateSelected }) {
  const disabled = busy || !canGenerate
  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="studio-actions">
      <button type="button" onClick={onGenerate} disabled={disabled} data-testid="generate-designs-button" className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
        {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />}
        {generating ? 'Generating…' : hasDesigns ? 'Regenerate all' : 'Generate designs'}
      </button>
      {hasDesigns && (
        <button type="button" onClick={onRegenerateSelected} disabled={disabled || !target} title={target ? undefined : 'Choose a design first'} data-testid="regenerate-selected-button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
          <RefreshCw className="h-4 w-4" aria-hidden />Regenerate selected
        </button>
      )}
      {generating && <p role="status" className="text-sm text-slate-500" data-testid="studio-generating">Odito is drawing your designs. This usually takes under a minute - you can leave this page.</p>}
    </div>
  )
}

export default StudioActions

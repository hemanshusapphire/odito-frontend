"use client"

import { Button } from '@/components/ui/button'
import { Loader2, Check, CircleDot } from 'lucide-react'

/**
 * Sticky bottom bar for the workspace (spec §20 / §21 / §26).
 * Explicit "Save Draft" — no aggressive autosave. Shows dirty / saving /
 * saved / error state. Save is disabled while a save is in flight
 * (duplicate-save prevention) and when there is nothing to save.
 */
export default function CampaignSaveBar({
  isDirty,
  isSaving,
  savedAt,
  errorMessage,
  validationCount = 0,
  onSave,
}) {
  let statusEl
  if (isSaving) {
    statusEl = (
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    )
  } else if (errorMessage) {
    statusEl = <span className="text-destructive">{errorMessage}</span>
  } else if (isDirty) {
    statusEl = (
      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
        <CircleDot className="h-3.5 w-3.5" /> Unsaved changes
      </span>
    )
  } else if (savedAt) {
    statusEl = (
      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
        <Check className="h-3.5 w-3.5" /> Saved
      </span>
    )
  } else {
    statusEl = <span className="text-muted-foreground">All changes saved</span>
  }

  return (
    <div className="sticky bottom-0 z-20 -mx-1 mt-2 border-t border-border/60 bg-background/85 px-1 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs">
          {statusEl}
          {validationCount > 0 && !isSaving && (
            <span className="text-amber-600 dark:text-amber-400">
              {validationCount} {validationCount === 1 ? 'issue' : 'issues'} to review
            </span>
          )}
        </div>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="gap-1.5"
          data-testid="save-draft"
        >
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Draft
        </Button>
      </div>
    </div>
  )
}

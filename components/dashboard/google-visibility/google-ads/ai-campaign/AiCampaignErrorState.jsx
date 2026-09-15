"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react'

/**
 * Friendly generation-failure panel (spec §23). Never shows a raw backend /
 * Claude error — `message` is already mapped through
 * friendlyErrorMessage(). When the backend created a draft before failing
 * it passes `draftId` so the user can still open the preserved draft.
 */
export default function AiCampaignErrorState({ title, message, onRetry, onBack, draftId, onOpenDraft }) {
  return (
    <Card className="mx-auto max-w-xl items-center gap-4 px-8 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">{title || "We couldn't generate your campaign"}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        {draftId && (
          <p className="text-xs text-muted-foreground">Your campaign draft has been preserved, so you can retry without losing your setup.</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to setup
          </Button>
        )}
        {onRetry && (
          <Button size="sm" onClick={onRetry} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        )}
        {draftId && onOpenDraft && (
          <Button variant="outline" size="sm" onClick={() => onOpenDraft(draftId)}>
            Open preserved draft
          </Button>
        )}
      </div>
    </Card>
  )
}

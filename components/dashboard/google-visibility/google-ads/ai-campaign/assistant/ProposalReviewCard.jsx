"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Sparkles, Loader2, X, Check } from 'lucide-react'
import ChangeDiffItem from './ChangeDiffItem'
import { groupChangesBySection, countChanges } from '@/lib/aiCampaignProposal'

/**
 * Review + accept/reject UI for one ready proposal (spec §18-§23).
 *
 * Never applies anything automatically — Accept always goes through an
 * explicit confirmation step (spec §23 "Preview before apply") naming what
 * will actually change, then a single Accept mutation. Reject discards the
 * proposal; the draft is never touched either way until Accept succeeds.
 */
export default function ProposalReviewCard({ proposal, isAccepting, isRejecting, acceptError, onAccept, onReject, disabled = false, disabledReason }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const changes = proposal.changes || []
  const groups = groupChangesBySection(changes)
  const total = countChanges(changes)
  const isStale = proposal.status === 'stale'
  const isExpired = proposal.status === 'expired'
  const isDecided = proposal.status === 'accepted' || proposal.status === 'rejected'

  return (
    <Card className="gap-4 p-4" data-testid="proposal-review-card">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground">{proposal.summary?.explanation}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {total} proposed change{total === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {(isStale || isExpired) && (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
          {isStale
            ? 'This suggestion was created from an older version of your campaign. Generate a new suggestion to continue.'
            : 'This suggestion has expired. Generate a new one to continue.'}
        </div>
      )}

      <Accordion type="multiple" defaultValue={groups.map((g) => g.section)} className="space-y-1">
        {groups.map((g) => (
          <AccordionItem key={g.section} value={g.section} className="border-border/60">
            <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                {g.section}
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{g.changes.length}</Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5">
                {g.changes.map((c) => <ChangeDiffItem key={c.id} change={c} />)}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {acceptError && <p className="text-xs text-destructive">{acceptError}</p>}

      {disabled && !isDecided && !isStale && !isExpired && disabledReason && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{disabledReason}</p>
      )}

      {!isDecided && !isStale && !isExpired && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onReject}
            disabled={isAccepting || isRejecting || disabled}
          >
            {isRejecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Reject
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setConfirmOpen(true)}
            disabled={isAccepting || isRejecting || disabled}
            data-testid="review-changes"
          >
            {isAccepting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Review changes
          </Button>
        </div>
      )}

      {isDecided && (
        <p className="text-xs text-muted-foreground">
          {proposal.status === 'accepted' ? 'AI changes applied.' : 'Suggestion rejected — your campaign was not changed.'}
        </p>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply {total} change{total === 1 ? '' : 's'}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1 text-left text-sm text-muted-foreground">
                {groups.map((g) => (
                  <div key={g.section}>
                    <span className="font-medium text-foreground">{g.section}:</span> {g.changes.length} change{g.changes.length === 1 ? '' : 's'}
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAccepting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="apply-changes"
              disabled={isAccepting}
              onClick={(e) => {
                e.preventDefault()
                onAccept()
                setConfirmOpen(false)
              }}
            >
              {isAccepting ? 'Applying…' : 'Apply changes'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

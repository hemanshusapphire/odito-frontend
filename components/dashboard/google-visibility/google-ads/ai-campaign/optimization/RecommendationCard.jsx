"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Sparkles, Loader2, X, Check, ArrowRight } from 'lucide-react'
import {
  optimizationOperationLabel, confidenceLabel, formatMetricValue,
} from '@/lib/aiCampaignConstants'

const RISK_BADGE_VARIANT = { low: 'secondary', medium: 'warning', high: 'critical' }

function describeValue(field, value) {
  if (value === null || value === undefined) return '—'
  if (field === 'status') return value
  if (field === 'dailyBudgetMicros') return formatMetricValue(value / 1_000_000, { decimals: 2 })
  if (field === 'negativeKeyword') return typeof value === 'object' ? `"${value.text}" (${value.matchType})` : String(value)
  return String(value)
}

/**
 * One AI optimization recommendation, reviewed exactly like a Phase 4
 * change proposal (spec §20 — "reuse the conceptual diff/approval
 * experience"): a plain-language reason, an explicit before → proposed
 * diff, and two separate actions — Approve (behind a confirmation dialog
 * naming exactly what will change in Google Ads) and Reject. Nothing here
 * can execute without that confirmation; a non-executable recommendation
 * shows as informational only, with no Approve control at all.
 */
export default function RecommendationCard({ recommendation, isApproving, isRejecting, approveError, onApprove, onReject }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isDecided = ['rejected', 'stale', 'executed', 'failed'].includes(recommendation.status)
  const canAct = recommendation.status === 'pending'

  return (
    <Card className="gap-3 p-4" data-testid="recommendation-card">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">{optimizationOperationLabel(recommendation.operation)}</span>
            <Badge variant={RISK_BADGE_VARIANT[recommendation.risk] || 'secondary'} className="h-4 px-1.5 text-[10px]">{recommendation.risk} risk</Badge>
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">{confidenceLabel(recommendation.confidence)}</Badge>
            {!recommendation.executable && <Badge variant="outline" className="h-4 px-1.5 text-[10px]">Informational only</Badge>}
          </div>
          {recommendation.targetEntityLabel && (
            <p className="mt-0.5 text-xs text-muted-foreground">{recommendation.targetEntityLabel}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-foreground">{recommendation.reason}</p>
      <p className="text-xs text-muted-foreground">{recommendation.expectedImpact}</p>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs">
        <span className="font-mono text-muted-foreground">{describeValue(recommendation.proposedChange.field, recommendation.proposedChange.before)}</span>
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="font-mono font-medium text-foreground">{describeValue(recommendation.proposedChange.field, recommendation.proposedChange.after)}</span>
      </div>

      {recommendation.status === 'stale' && (
        <p className="text-xs text-amber-600 dark:text-amber-400">This recommendation is no longer current. Run a fresh analysis to see up-to-date suggestions.</p>
      )}
      {recommendation.status === 'failed' && (
        <p className="text-xs text-destructive">Could not apply this — the underlying state may have changed. Run a fresh analysis to see the current state.</p>
      )}
      {recommendation.status === 'executed' && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">Applied.</p>
      )}
      {recommendation.status === 'rejected' && (
        <p className="text-xs text-muted-foreground">Rejected — no change was made.</p>
      )}
      {approveError && <p className="text-xs text-destructive">{approveError}</p>}

      {canAct && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={onReject}
            disabled={isApproving || isRejecting}
            data-testid="reject-recommendation"
          >
            {isRejecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            Reject
          </Button>
          {recommendation.executable && (
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => setConfirmOpen(true)}
              disabled={isApproving || isRejecting}
              data-testid="open-approve-confirm"
            >
              {isApproving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Approve
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{optimizationOperationLabel(recommendation.operation)}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left text-sm text-muted-foreground">
                <p>This will make a real change in your connected Google Ads account.</p>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
                  <p><span className="font-medium text-foreground">Target:</span> {recommendation.targetEntityLabel || recommendation.targetEntityId}</p>
                  <p><span className="font-medium text-foreground">Current:</span> {describeValue(recommendation.proposedChange.field, recommendation.proposedChange.before)}</p>
                  <p><span className="font-medium text-foreground">Proposed:</span> {describeValue(recommendation.proposedChange.field, recommendation.proposedChange.after)}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-approve"
              disabled={isApproving}
              onClick={(e) => {
                e.preventDefault()
                onApprove()
                setConfirmOpen(false)
              }}
            >
              {isApproving ? 'Applying…' : 'Approve and apply'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

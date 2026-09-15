"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { UploadCloud, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
import { usePublishAiCampaignDraft, useAiCampaignPublishStatus } from '@/hooks/useAiCampaign'
import { objectiveLabel, campaignTotals, formatBudgetAmount, friendlyErrorMessage } from '@/lib/aiCampaignConstants'

/**
 * Phase 6 — "Review campaign → Publish to Google Ads" (spec §23-§26).
 *
 * Mounted by CampaignReadinessPanel ONLY when the current readiness result
 * is `{ status: 'ready', isCurrent: true }` — this component never renders
 * a Publish control for a campaign that isn't currently ready (spec §23:
 * "The Publish button must only be available when the current draft is
 * publishable"). Publishing is irreversible and external, so every publish
 * goes through an explicit confirmation naming exactly what will be created
 * (spec §24) — there is no way to trigger it with a single click.
 */
export default function PublishSection({ draftId, draft }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { data: statusData } = useAiCampaignPublishStatus(draftId)
  const publishMutation = usePublishAiCampaignDraft(draftId)

  const attempt = statusData?.data?.attempt || null
  const totals = campaignTotals(draft.adGroups)
  const campaign = draft.campaign || {}

  // Already published (draft.status reflects this immediately after a
  // successful mutation — see usePublishAiCampaignDraft) — show the
  // published state, never the Publish button again.
  if (draft.status === 'published') {
    return (
      <Card className="gap-2 border-emerald-300/60 bg-emerald-50/60 p-5 dark:border-emerald-700/50 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Published to Google Ads
        </div>
        {draft.googleAdsCampaignId && (
          <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70">
            Google Ads campaign ID: <span className="font-mono">{draft.googleAdsCampaignId}</span>
          </p>
        )}
        <a
          href="https://ads.google.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-xs text-emerald-800 underline-offset-2 hover:underline dark:text-emerald-300"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Google Ads to review it
        </a>
      </Card>
    )
  }

  const isPartial = attempt?.status === 'partially_published'

  return (
    <Card className="gap-3 p-5">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <UploadCloud className="h-4 w-4" />
          Publish to Google Ads
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          This creates a new, paused campaign in your connected Google Ads account. You can review and enable it there.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
        <div><dt className="text-muted-foreground">Campaign</dt><dd className="font-medium text-foreground">{campaign.name || '—'}</dd></div>
        <div><dt className="text-muted-foreground">Objective</dt><dd className="font-medium text-foreground">{objectiveLabel(campaign.objective)}</dd></div>
        <div><dt className="text-muted-foreground">Daily budget</dt><dd className="font-medium text-foreground">{formatBudgetAmount(campaign.dailyBudget)} {campaign.currency}</dd></div>
        <div><dt className="text-muted-foreground">Locations</dt><dd className="font-medium text-foreground">{(campaign.locations || []).map((l) => l.name).join(', ') || '—'}</dd></div>
        <div><dt className="text-muted-foreground">Ad groups</dt><dd className="font-medium text-foreground">{totals.adGroups}</dd></div>
        <div><dt className="text-muted-foreground">Keywords / Ads</dt><dd className="font-medium text-foreground">{totals.keywords} / {totals.ads}</dd></div>
        <div className="col-span-2 sm:col-span-3">
          <dt className="text-muted-foreground">Google Ads account</dt>
          <dd className="font-mono font-medium text-foreground">{draft.googleAdsCustomerId}</dd>
        </div>
      </dl>

      {isPartial && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          A previous publish attempt stopped partway through — some parts of this campaign may already exist in Google Ads. Contact support before retrying.
        </div>
      )}

      {publishMutation.isError && !isPartial && (
        <p className="text-xs text-destructive">{friendlyErrorMessage(publishMutation.error, 'Publishing failed. Please try again.')}</p>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          className="gap-1.5"
          onClick={() => setConfirmOpen(true)}
          disabled={publishMutation.isPending || isPartial}
          data-testid="open-publish-confirm"
        >
          {publishMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          {publishMutation.isPending ? 'Publishing…' : 'Publish to Google Ads'}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this campaign?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left text-sm text-muted-foreground">
                <p>This will create a new, paused campaign in Google Ads. It will not spend any budget until you review and enable it there.</p>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
                  <p><span className="font-medium text-foreground">Campaign:</span> {campaign.name}</p>
                  <p><span className="font-medium text-foreground">Budget:</span> {formatBudgetAmount(campaign.dailyBudget)} {campaign.currency} / day</p>
                  <p><span className="font-medium text-foreground">Account:</span> {draft.googleAdsCustomerId}</p>
                  <p><span className="font-medium text-foreground">Contents:</span> {totals.adGroups} ad group{totals.adGroups === 1 ? '' : 's'}, {totals.keywords} keyword{totals.keywords === 1 ? '' : 's'}, {totals.ads} ad{totals.ads === 1 ? '' : 's'}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-publish"
              disabled={publishMutation.isPending}
              onClick={(e) => {
                e.preventDefault()
                publishMutation.mutate(undefined, { onSuccess: () => setConfirmOpen(false) })
              }}
            >
              {publishMutation.isPending ? 'Publishing…' : 'Publish campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

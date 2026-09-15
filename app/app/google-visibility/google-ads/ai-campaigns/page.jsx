"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Sparkles, Plus, ArrowLeft, Trash2, Loader2 } from 'lucide-react'

import { useProject } from '@/contexts/ProjectContext'
import { useAiCampaignDrafts, useDeleteAiCampaignDraft } from '@/hooks/useAiCampaign'
import { useToastQueue } from '@/hooks/useToastQueue'
import ToastStack from '@/components/shared/ToastStack'
import DraftStatusBadge from '@/components/dashboard/google-visibility/google-ads/ai-campaign/DraftStatusBadge'
import { objectiveLabel, campaignTotals, friendlyErrorMessage, formatBudgetAmount } from '@/lib/aiCampaignConstants'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

const BASE = '/app/google-visibility/google-ads/ai-campaigns'
const GOOGLE_ADS = '/app/google-visibility/google-ads'
const DELETABLE = new Set(['draft', 'failed'])

export default function AiCampaignDraftsPage() {
  const router = useRouter()
  const { activeProjectId } = useProject()
  const { toasts, notify, dismiss } = useToastQueue()
  const { data, isLoading, isError, error, refetch } = useAiCampaignDrafts(activeProjectId, { limit: 50, sort: 'updatedAt', sortOrder: 'desc' })
  const deleteMutation = useDeleteAiCampaignDraft(activeProjectId)
  const [pendingDelete, setPendingDelete] = useState(null)

  const drafts = useMemo(() => data?.data || [], [data])

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteMutation.mutateAsync(pendingDelete._id || pendingDelete.id)
      notify('Draft deleted', 'success')
    } catch (err) {
      notify(friendlyErrorMessage(err, 'Could not delete this draft'), 'danger')
    }
    setPendingDelete(null)
  }

  if (!activeProjectId) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 text-sm text-muted-foreground">
        Select or create a project to view AI campaigns.
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <Link href={GOOGLE_ADS} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Google Ads
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Campaigns
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Campaign drafts created with Claude. Edit them here and save — nothing is published to Google Ads in this step.
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href={`${BASE}/new`}><Plus className="h-4 w-4" /> New AI Campaign</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading drafts…
        </div>
      ) : isError ? (
        <Card className="items-center gap-3 px-8 py-10 text-center">
          <p className="text-sm text-muted-foreground">{friendlyErrorMessage(error)}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
        </Card>
      ) : drafts.length === 0 ? (
        <Card className="items-center gap-3 px-8 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold">No AI campaigns yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Describe your business and let Claude draft a full Search campaign — structure, keywords and ad copy — that you can edit before anything goes live.
          </p>
          <Button asChild size="sm" className="mt-1 gap-2">
            <Link href={`${BASE}/new`}><Plus className="h-4 w-4" /> Create your first AI campaign</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {drafts.map((d) => {
            const id = d._id || d.id
            const totals = campaignTotals(d.adGroups || [])
            const canOpen = d.status !== 'failed' && d.status !== 'generating'
            return (
              <Card key={id} className="flex-row items-center justify-between gap-4 p-4">
                <button
                  type="button"
                  disabled={!canOpen}
                  onClick={() => canOpen && router.push(`${BASE}/${id}`)}
                  className="min-w-0 flex-1 text-left disabled:cursor-default"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold">{d.campaign?.name || 'Untitled campaign'}</span>
                    <DraftStatusBadge status={d.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{objectiveLabel(d.campaign?.objective)}</span>
                    <span>·</span>
                    <span>{d.campaign?.currency} {formatBudgetAmount(d.campaign?.dailyBudget)}/day</span>
                    <span>·</span>
                    <span>{totals.adGroups} ad groups · {totals.keywords} keywords · {totals.ads} ads</span>
                    {d.updatedAt && (<><span>·</span><span>Updated {formatRelativeTime(d.updatedAt)}</span></>)}
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  {canOpen && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`${BASE}/${id}`}>Open</Link>
                    </Button>
                  )}
                  {DELETABLE.has(d.status) && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Delete draft"
                      onClick={() => setPendingDelete(d)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this campaign draft?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.campaign?.name || 'Untitled campaign'}” will be removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmDelete() }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}

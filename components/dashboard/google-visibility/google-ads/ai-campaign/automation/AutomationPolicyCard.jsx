"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Pencil, Trash2, History, Eye, Loader2, Sparkles, CheckCircle2, XCircle,
} from 'lucide-react'
import {
  useSetAiCampaignAutomationPolicyEnabled, useSetAiCampaignAutomationPolicyMode,
  useDeleteAiCampaignAutomationPolicy, usePreviewAiCampaignAutomationPolicy, useAiCampaignAutomationPolicyHistory,
} from '@/hooks/useAiCampaign'
import {
  AUTOMATION_MODES, automationModeLabel, automationModeDescription, describeAutomationRule, describeAutomationSchedule,
  optimizationOperationLabel, automationSkipReasonLabel, automationRunStatusLabel, automationActionStatusLabel,
  friendlyErrorMessage,
} from '@/lib/aiCampaignConstants'
import AutomationPolicyForm from './AutomationPolicyForm'

/**
 * Phase 8 — one automation policy's card (spec §59-§61).
 *
 * The two genuinely consequential actions — turning a policy ON, and
 * switching it into 'execute' mode — each get their own explicit
 * confirmation naming what will actually happen, mirroring PublishSection's
 * / RecommendationCard's established convention: the SAFE direction
 * (disable, or switching back to observe/recommend) never needs one.
 */
export default function AutomationPolicyCard({ draftId, policy }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [enableConfirmOpen, setEnableConfirmOpen] = useState(false)
  const [pendingMode, setPendingMode] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [previewResult, setPreviewResult] = useState(null)

  const enabledMutation = useSetAiCampaignAutomationPolicyEnabled(draftId)
  const modeMutation = useSetAiCampaignAutomationPolicyMode(draftId)
  const deleteMutation = useDeleteAiCampaignAutomationPolicy(draftId)
  const previewMutation = usePreviewAiCampaignAutomationPolicy(draftId)
  const { data: historyData, isLoading: historyLoading } = useAiCampaignAutomationPolicyHistory(draftId, policy._id, { enabled: showHistory })

  function handleToggleEnabled(next) {
    if (next) { setEnableConfirmOpen(true); return }
    enabledMutation.mutate({ policyId: policy._id, enabled: false })
  }

  function handleModeChange(nextMode) {
    if (nextMode === policy.mode) return
    if (nextMode === 'execute') { setPendingMode(nextMode); return }
    modeMutation.mutate({ policyId: policy._id, mode: nextMode })
  }

  function runPreview() {
    setPreviewResult(null)
    previewMutation.mutate(policy._id, { onSuccess: (res) => setPreviewResult(res?.data || null) })
  }

  return (
    <Card className="gap-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">{policy.name}</h4>
            <Badge variant={policy.enabled ? 'default' : 'secondary'} className="h-5 px-1.5 text-[10px]">{policy.enabled ? 'Enabled' : 'Disabled'}</Badge>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{automationModeLabel(policy.mode)}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{describeAutomationSchedule(policy.schedule)}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" size="icon" variant="ghost" onClick={() => setEditOpen(true)} data-testid="edit-policy" aria-label="Edit policy"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button type="button" size="icon" variant="ghost" onClick={() => setDeleteConfirmOpen(true)} data-testid="delete-policy" aria-label="Delete policy"><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>

      <ul className="space-y-1 text-xs text-muted-foreground">
        {(policy.rules || []).map((r, i) => <li key={i}>{describeAutomationRule(r)}</li>)}
      </ul>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>Up to {policy.limits?.maxActionsPerRun} action{policy.limits?.maxActionsPerRun === 1 ? '' : 's'} per run</span>
        <span>{policy.limits?.cooldownHours}h cooldown</span>
        {policy.highRiskOperationsEnabled && <span className="text-amber-700 dark:text-amber-400">High-risk actions allowed</span>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2">
          <Switch checked={policy.enabled} onCheckedChange={handleToggleEnabled} disabled={enabledMutation.isPending} data-testid="toggle-enabled" />
          <span className="text-xs text-muted-foreground">{policy.enabled ? 'Running on schedule' : 'Not running'}</span>
        </div>
        <select
          aria-label="Automation mode"
          data-testid="mode-select"
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
          value={policy.mode}
          disabled={modeMutation.isPending}
          onChange={(e) => handleModeChange(e.target.value)}
        >
          {AUTOMATION_MODES.map((m) => <option key={m} value={m}>{automationModeLabel(m)}</option>)}
        </select>
      </div>

      {enabledMutation.isError && <p className="text-xs text-destructive">{friendlyErrorMessage(enabledMutation.error, 'Could not update this policy.')}</p>}
      {modeMutation.isError && <p className="text-xs text-destructive">{friendlyErrorMessage(modeMutation.error, 'Could not change the mode.')}</p>}

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={runPreview} disabled={previewMutation.isPending} data-testid="preview-policy">
          {previewMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
          Preview
        </Button>
        <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => setShowHistory((v) => !v)} data-testid="toggle-policy-history">
          <History className="h-3.5 w-3.5" />
          History
        </Button>
      </div>

      {previewMutation.isError && <p className="text-xs text-destructive">{friendlyErrorMessage(previewMutation.error, 'Could not generate a preview.')}</p>}

      {previewResult && (
        <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3" data-testid="preview-results">
          {!previewResult.performanceAvailable && <p className="text-xs text-muted-foreground">No performance data is available yet for this campaign.</p>}
          {previewResult.performanceAvailable && previewResult.planned.length === 0 && (
            <p className="text-xs text-muted-foreground">No rules currently match — nothing would happen right now.</p>
          )}
          {(previewResult.planned || []).map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              {p.wouldRun ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              <div>
                <p className="font-medium text-foreground">{optimizationOperationLabel(p.operation)} — {p.targetEntityLabel}</p>
                <p className="text-muted-foreground">{p.wouldRun ? 'Would run now.' : automationSkipReasonLabel(p.skipReason)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showHistory && (
        <div className="space-y-1.5 border-t border-border/60 pt-3">
          {historyLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
          {!historyLoading && (historyData?.data || []).length === 0 && <p className="text-xs text-muted-foreground">No automation runs yet.</p>}
          {(historyData?.data || []).map((run) => (
            <div key={run._id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-xs">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {automationRunStatusLabel(run.status)} · {run.actions?.length || 0} action{(run.actions?.length || 0) === 1 ? '' : 's'}
              </span>
              <span className="text-muted-foreground">{run.completedAt ? new Date(run.completedAt).toLocaleString() : '—'}</span>
            </div>
          ))}
          {(historyData?.data || []).flatMap((run) => run.actions || []).some((a) => a.status) && (
            <ul className="space-y-1 pl-1 text-[11px] text-muted-foreground">
              {(historyData?.data || []).flatMap((run) => run.actions || []).slice(0, 20).map((a, i) => (
                <li key={i}>{optimizationOperationLabel(a.operation)} — {automationActionStatusLabel(a.status)}{a.skipReason ? ` (${automationSkipReasonLabel(a.skipReason)})` : ''}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {editOpen && <AutomationPolicyForm draftId={draftId} policy={policy} onClose={() => setEditOpen(false)} />}

      <AlertDialog open={enableConfirmOpen} onOpenChange={setEnableConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable this automation policy?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left text-sm text-muted-foreground">
                <p>Odito will start checking this campaign against your rules on the schedule below and act according to its current mode.</p>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
                  <p><span className="font-medium text-foreground">Schedule:</span> {describeAutomationSchedule(policy.schedule)}</p>
                  <p><span className="font-medium text-foreground">Mode:</span> {automationModeLabel(policy.mode)} — {automationModeDescription(policy.mode)}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-enable"
              onClick={(e) => {
                e.preventDefault()
                enabledMutation.mutate({ policyId: policy._id, enabled: true }, { onSuccess: () => setEnableConfirmOpen(false) })
              }}
            >
              Enable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingMode} onOpenChange={(open) => { if (!open) setPendingMode(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to auto-execute?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left text-sm text-muted-foreground">
                <p>In this mode, Odito will automatically apply matching actions to your campaign — within the limits configured on this policy — without asking you first each time.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-mode-execute"
              onClick={(e) => {
                e.preventDefault()
                modeMutation.mutate({ policyId: policy._id, mode: 'execute' }, { onSuccess: () => setPendingMode(null) })
              }}
            >
              Switch to auto-execute
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this automation policy?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone. Nothing it already did to your campaign will be reversed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-delete"
              onClick={(e) => {
                e.preventDefault()
                deleteMutation.mutate(policy._id, { onSuccess: () => setDeleteConfirmOpen(false) })
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

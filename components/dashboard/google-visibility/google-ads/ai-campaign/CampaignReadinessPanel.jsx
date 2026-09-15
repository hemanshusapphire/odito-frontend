"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  ShieldCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Info,
  Loader2, RefreshCw, History,
} from 'lucide-react'
import { useAiCampaignValidation, useRunAiCampaignValidation } from '@/hooks/useAiCampaign'
import { readinessCategoryLabel, friendlyErrorMessage } from '@/lib/aiCampaignConstants'
import PublishSection from './PublishSection'

/**
 * "Campaign readiness" section of the workspace (spec §17-§22, §31; Phase 6
 * spec §23 extends it with the Publish step once ready).
 *
 * The only mutations this section can trigger are "run validation" (Phase
 * 5 — computes and persists a readiness report, never touches Google Ads)
 * and, only once the current result is `{status:'ready', isCurrent:true}`,
 * "publish" (Phase 6 — delegated entirely to PublishSection, which owns its
 * own explicit confirmation step; see that file). There is deliberately NO
 * "Fix with AI" / "Auto-fix" / "Apply recommended changes" control anywhere
 * here (spec §31).
 */

const SEVERITY_ICON = { error: XCircle, warning: AlertTriangle, info: Info }
const SEVERITY_COLOR = {
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-sky-600 dark:text-sky-400',
}

/** Maps a Phase 5 issue's own `path` to a workspace section, reusing the same navigation the client-side validation summary already uses. */
function jumpTargetForIssue(issue) {
  const path = issue?.path
  if (!path) return null
  if (path.startsWith('campaign.') || path.startsWith('campaign')) return path
  if (/^adGroups\[\d+\]/.test(path)) return path
  return null
}

function CheckRow({ check, issues, onJump }) {
  const categoryIssues = issues.filter((i) => i.category === check.category)
  const Icon = check.errorCount > 0 ? XCircle : check.warningCount > 0 ? AlertTriangle : CheckCircle2
  const color = check.errorCount > 0
    ? 'text-red-600 dark:text-red-400'
    : check.warningCount > 0
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-emerald-600 dark:text-emerald-400'

  if (categoryIssues.length === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm">
        <Icon className={`h-4 w-4 shrink-0 ${color}`} />
        <span className="text-foreground">{readinessCategoryLabel(check.category)}</span>
        <span className="ml-auto text-xs text-muted-foreground">All good</span>
      </div>
    )
  }

  return (
    <AccordionItem value={check.category} className="border-border/60">
      <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
        <span className="flex flex-1 items-center gap-2.5">
          <Icon className={`h-4 w-4 shrink-0 ${color}`} />
          <span className="text-foreground">{readinessCategoryLabel(check.category)}</span>
          <span className="ml-auto flex gap-1">
            {check.errorCount > 0 && <Badge variant="critical" className="h-4 px-1.5 text-[10px]">{check.errorCount} error{check.errorCount === 1 ? '' : 's'}</Badge>}
            {check.warningCount > 0 && <Badge variant="warning" className="h-4 px-1.5 text-[10px]">{check.warningCount} warning{check.warningCount === 1 ? '' : 's'}</Badge>}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-3">
        <ul className="space-y-2 pb-1">
          {categoryIssues.map((issue, i) => {
            const IssueIcon = SEVERITY_ICON[issue.severity] || Info
            const jumpPath = jumpTargetForIssue(issue)
            return (
              <li key={`${issue.code}-${i}`} className="flex items-start gap-2 text-xs">
                <IssueIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${SEVERITY_COLOR[issue.severity] || ''}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground">{issue.message}</p>
                  {issue.recommendation && (
                    <p className="mt-0.5 text-muted-foreground">{issue.recommendation}</p>
                  )}
                  {jumpPath && onJump && (
                    <button
                      type="button"
                      onClick={() => onJump(jumpPath)}
                      className="mt-1 text-primary underline-offset-2 hover:underline"
                    >
                      Go to this section
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </AccordionContent>
    </AccordionItem>
  )
}

export default function CampaignReadinessPanel({ draftId, draft, onJump, readOnly = false }) {
  const { data, isLoading, isError, error } = useAiCampaignValidation(draftId)
  const runMutation = useRunAiCampaignValidation(draftId)

  const result = data?.data || null
  const issues = result?.issues || []
  const checks = result?.checks || []

  const handleRun = () => runMutation.mutate()

  if (isLoading) {
    return (
      <Card className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading readiness status…
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="space-y-3 p-6">
        <p className="text-sm text-destructive">{friendlyErrorMessage(error, 'Could not load readiness status.')}</p>
        <Button type="button" size="sm" variant="outline" onClick={handleRun} disabled={runMutation.isPending}>
          Try again
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Campaign readiness
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A check of whether this campaign is complete enough to publish later. This never changes your campaign or Google Ads.
            </p>
          </div>
          {!readOnly && (
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={handleRun}
              disabled={runMutation.isPending}
            >
              {runMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {runMutation.isPending ? 'Checking your campaign…' : result ? 'Re-check readiness' : 'Check readiness'}
            </Button>
          )}
        </div>

        {runMutation.isError && (
          <p className="text-xs text-destructive">{friendlyErrorMessage(runMutation.error, 'Could not run readiness validation.')}</p>
        )}

        {!result && !runMutation.isPending && (
          <p className="text-sm text-muted-foreground">
            {readOnly ? 'This campaign was never checked before it left the draft stage.' : "This campaign hasn't been checked yet."}
          </p>
        )}

        {result && !result.isCurrent && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50/70 px-3 py-2 text-xs text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
            <History className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Your campaign has changed since this was last checked. Re-check readiness to see up-to-date results.
          </div>
        )}

        {result && (
          <div
            className={`flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm ${
              result.status === 'ready'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
            }`}
          >
            {result.status === 'ready' ? <ShieldCheck className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
            <div>
              <p className="font-medium">
                {result.status === 'ready' ? 'Ready to publish' : 'Not ready to publish yet'}
              </p>
              <p className="text-xs opacity-80">
                {result.summary.errorCount} error{result.summary.errorCount === 1 ? '' : 's'} · {result.summary.warningCount} warning{result.summary.warningCount === 1 ? '' : 's'} · {result.summary.passedCount} of {checks.length} checks passed
              </p>
            </div>
          </div>
        )}
      </Card>

      {result && checks.length > 0 && (
        <Card className="gap-0 p-2">
          <Accordion type="multiple" defaultValue={checks.filter((c) => c.errorCount > 0).map((c) => c.category)}>
            {checks.map((check) => (
              <CheckRow key={check.category} check={check} issues={issues} onJump={onJump} />
            ))}
          </Accordion>
        </Card>
      )}

      {draft && (draft.status === 'published' || (result?.status === 'ready' && result.isCurrent)) && (
        <PublishSection draftId={draftId} draft={draft} />
      )}
    </div>
  )
}

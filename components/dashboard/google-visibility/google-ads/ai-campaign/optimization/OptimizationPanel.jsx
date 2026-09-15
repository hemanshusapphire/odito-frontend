"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles, Loader2, AlertTriangle, AlertCircle, Info, RefreshCw, History, TrendingUp, TrendingDown,
} from 'lucide-react'
import GoogleAdsDateRangeSelector from '../../GoogleAdsDateRangeSelector'
import RecommendationCard from './RecommendationCard'
import {
  useAiCampaignOptimizationAnalysis, useAnalyzeAiCampaignOptimization,
  useApproveAiCampaignOptimizationRecommendation, useRejectAiCampaignOptimizationRecommendation,
  useAiCampaignOptimizationHistory,
} from '@/hooks/useAiCampaign'
import {
  opportunityTypeLabel, optimizationOperationLabel, formatMetricValue, friendlyErrorMessage,
} from '@/lib/aiCampaignConstants'

/**
 * Phase 7 — "Optimization" section of the workspace (spec §29/§50).
 *
 * Only ever mounted for a PUBLISHED campaign (see AiCampaignWorkspace.jsx —
 * Phase 7 has no meaning for a draft that was never published, spec §48).
 * The pipeline is entirely explicit: nothing here auto-refreshes, auto-
 * generates a recommendation, or auto-applies anything (spec §31/§45) — a
 * user clicks "Run analysis", reviews what Odito's own deterministic rules
 * found (and, only when something was found, what Claude proposed), and
 * separately approves or rejects each recommendation one at a time, each
 * behind its own explicit confirmation naming the exact Google Ads change.
 */

const SEVERITY_CONFIG = {
  critical: { Icon: AlertCircle, color: 'text-red-600 dark:text-red-400', badge: 'critical' },
  warning: { Icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', badge: 'warning' },
  info: { Icon: Info, color: 'text-sky-600 dark:text-sky-400', badge: 'secondary' },
}

const METRIC_TILES = [
  { key: 'impressions', label: 'Impressions' },
  { key: 'clicks', label: 'Clicks' },
  { key: 'cost', label: 'Spend' },
  { key: 'ctr', label: 'CTR', suffix: '%' },
  { key: 'conversions', label: 'Conversions' },
  { key: 'cpa', label: 'Cost / conversion' },
  { key: 'roas', label: 'ROAS' },
]

function MetricTile({ label, value, suffix, comparisonPercent }) {
  const trendUp = comparisonPercent != null && comparisonPercent > 0
  const trendDown = comparisonPercent != null && comparisonPercent < 0
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">{formatMetricValue(value, { suffix: suffix || '' })}</p>
      {comparisonPercent != null && (
        <p className={`mt-0.5 flex items-center gap-1 text-[11px] ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : trendDown ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
          {trendUp && <TrendingUp className="h-3 w-3" />}
          {trendDown && <TrendingDown className="h-3 w-3" />}
          {formatMetricValue(Math.abs(comparisonPercent), { suffix: '%', decimals: 1 })} vs previous period
        </p>
      )}
    </div>
  )
}

export default function OptimizationPanel({ draftId }) {
  const [dateRange, setDateRange] = useState({ preset: '30d', startDate: null, endDate: null })
  const [showHistory, setShowHistory] = useState(false)

  const { data, isLoading, isError, error } = useAiCampaignOptimizationAnalysis(draftId)
  const analyzeMutation = useAnalyzeAiCampaignOptimization(draftId)
  const approveMutation = useApproveAiCampaignOptimizationRecommendation(draftId)
  const rejectMutation = useRejectAiCampaignOptimizationRecommendation(draftId)
  const { data: historyData } = useAiCampaignOptimizationHistory(draftId, { enabled: showHistory })

  const analysis = data?.data || null
  const opportunities = analysis?.opportunities || []
  const recommendations = analysis?.recommendations || []
  const performance = analyzeMutation.data?.data?.performance || null

  const [approvingId, setApprovingId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)

  function runAnalysis() {
    const args = dateRange.preset === 'custom'
      ? { startDate: dateRange.startDate, endDate: dateRange.endDate }
      : { range: dateRange.preset }
    analyzeMutation.mutate(args)
  }

  function handleApprove(recommendationId) {
    setApprovingId(recommendationId)
    approveMutation.mutate(recommendationId, { onSettled: () => setApprovingId(null) })
  }
  function handleReject(recommendationId) {
    setRejectingId(recommendationId)
    rejectMutation.mutate(recommendationId, { onSettled: () => setRejectingId(null) })
  }

  const openOpportunities = [...opportunities].sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 }
    return (rank[a.severity] ?? 3) - (rank[b.severity] ?? 3)
  })

  const groupedRecommendations = {
    pending: recommendations.filter((r) => r.status === 'pending'),
    decided: recommendations.filter((r) => r.status !== 'pending'),
  }

  if (isLoading) {
    return (
      <Card className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading optimization data…
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="space-y-3 p-6">
        <p className="text-sm text-destructive">{friendlyErrorMessage(error, 'Could not load optimization data.')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Performance + optimization
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Reads your campaign's real Google Ads performance, finds opportunities, and asks AI for suggestions you can review and approve. Nothing changes until you approve it.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setShowHistory((v) => !v)}
            data-testid="toggle-history"
          >
            <History className="h-3.5 w-3.5" />
            History
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <GoogleAdsDateRangeSelector value={dateRange} onChange={setDateRange} />
          <Button type="button" size="sm" className="gap-1.5" onClick={runAnalysis} disabled={analyzeMutation.isPending} data-testid="run-analysis">
            {analyzeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {analyzeMutation.isPending ? 'Analyzing…' : 'Run analysis'}
          </Button>
        </div>

        {analyzeMutation.isError && (
          <p className="text-xs text-destructive">{friendlyErrorMessage(analyzeMutation.error, 'Could not analyze this campaign.')}</p>
        )}

        {opportunities.length === 0 && recommendations.length === 0 && !performance && !analyzeMutation.isPending && (
          <p className="text-sm text-muted-foreground">Run an analysis to see performance, opportunities, and suggestions for this campaign.</p>
        )}
      </Card>

      {performance?.hasCurrentData && (
        <Card className="gap-3 p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Performance summary</h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {METRIC_TILES.map((t) => (
              <MetricTile
                key={t.key}
                label={t.label}
                value={performance.current[t.key]}
                suffix={t.suffix}
                comparisonPercent={performance.comparison?.[t.key] ?? null}
              />
            ))}
          </div>
        </Card>
      )}

      {showHistory && (
        <Card className="gap-2 p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optimization history</h4>
          {(historyData?.data || []).length === 0 && <p className="text-sm text-muted-foreground">No optimizations have been applied yet.</p>}
          <ul className="space-y-2">
            {(historyData?.data || []).map((h) => (
              <li key={h._id} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-xs">
                <span className="font-medium text-foreground">{optimizationOperationLabel(h.operation)}</span>
                <span className="text-muted-foreground">{h.status} · {h.completedAt ? new Date(h.completedAt).toLocaleString() : '—'}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {openOpportunities.length > 0 && (
        <Card className="gap-2 p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opportunities</h4>
          <ul className="space-y-2">
            {openOpportunities.map((o) => {
              const cfg = SEVERITY_CONFIG[o.severity] || SEVERITY_CONFIG.info
              return (
                <li key={o._id} className="flex items-start gap-2.5 rounded-lg border border-border/60 px-3 py-2 text-xs">
                  <cfg.Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${cfg.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium text-foreground">{opportunityTypeLabel(o.opportunityType)}</span>
                      <Badge variant={cfg.badge} className="h-4 px-1.5 text-[10px]">{o.entityLabel || o.entityType}</Badge>
                    </div>
                    <p className="mt-0.5 text-muted-foreground">{o.message}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      {groupedRecommendations.pending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommendations awaiting review</h4>
          {groupedRecommendations.pending.map((r) => (
            <RecommendationCard
              key={r._id}
              recommendation={r}
              isApproving={approvingId === r._id && approveMutation.isPending}
              isRejecting={rejectingId === r._id && rejectMutation.isPending}
              approveError={approvingId === r._id && approveMutation.isError ? friendlyErrorMessage(approveMutation.error, 'Could not apply this recommendation.') : null}
              onApprove={() => handleApprove(r._id)}
              onReject={() => handleReject(r._id)}
            />
          ))}
        </div>
      )}

      {groupedRecommendations.decided.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Previously decided</h4>
          {groupedRecommendations.decided.map((r) => (
            <RecommendationCard key={r._id} recommendation={r} isApproving={false} isRejecting={false} onApprove={() => {}} onReject={() => {}} />
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const STAGE_LABELS = {
  started: 'Starting sync…',
  fetching_campaigns: 'Fetching campaigns…',
  fetching_metrics: 'Fetching campaign metrics…',
  fetching_search_terms: 'Fetching search terms…',
  fetching_optimization_score: 'Fetching optimization score…',
  fetching_device_performance: 'Fetching device performance…',
  fetching_geo_performance: 'Fetching geographic performance…',
  fetching_audience_performance: 'Fetching audience performance…',
  fetching_ad_performance: 'Fetching ad performance…',
  fetching_attribution_data: 'Fetching attribution data…',
  generating_budget_alerts: 'Checking budget alerts…',
  generating_aggregates: 'Finalizing…',
  updating_database: 'Saving results…',
  completed: 'Sync complete',
  failed: 'Sync failed',
}

function stageLabel(stage) {
  if (!stage) return 'Starting sync…'
  return STAGE_LABELS[stage] || stage.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function formatElapsed(startedAt) {
  if (!startedAt) return null
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}

/**
 * State 4 of the Google Ads connect flow: initial sync in progress.
 * Reflects only what the backend actually emits (stage + progress % via
 * google_ads_sync:progress) - no fabricated row counts or ETA, since
 * neither is computed server-side (see auditProgressService.js's
 * emitGoogleAdsSyncProgress: {jobId, projectId, customerId, status, stage,
 * progress, timestamp} - nothing else).
 */
export default function GoogleAdsSyncProgress({ stage, progress = 0, startedAt }) {
  const elapsed = formatElapsed(startedAt)

  return (
    <Card className="p-10 max-w-2xl mx-auto mt-6">
      <div className="flex flex-col items-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h3 className="text-lg font-semibold mt-4">Syncing your Google Ads account</h3>
        <p className="text-sm text-muted-foreground mt-1.5">
          This runs in the background - feel free to navigate away and come back later.
        </p>

        <div className="w-full max-w-sm mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{stageLabel(stage)}</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          {elapsed && <p className="text-xs text-muted-foreground mt-2">Elapsed: {elapsed}</p>}
        </div>
      </div>
    </Card>
  )
}

"use client"

import { Card } from '@/components/ui/card'
import ScoreRing from '@/components/ui/ScoreRing'
import { useGoogleAdsOptimizationScore, useGoogleAdsRecommendations } from '@/hooks/useDashboardQueries'
import { optimizationScoreLabel } from '@/lib/googleAdsFormat'

/** Sidebar widget: overall account Optimization Score - reads GET /google-ads/optimization-score. */
export default function OptimizationScoreCard({ projectId, dateRange, ready }) {
  const scoreQuery = useGoogleAdsOptimizationScore(projectId, dateRange, { enabled: !!ready })
  // Lightweight, cached separately from OptimizationCenterGrid's own fetch (different limit) -
  // just needs the pending count, not the row list.
  const recsQuery = useGoogleAdsRecommendations(projectId, { limit: 1 }, { enabled: !!ready })

  const current = scoreQuery.data?.data?.current
  const pendingCount = recsQuery.data?.data?.summary?.pending ?? 0
  const scorePercent = current?.scorePercent

  if (scoreQuery.isLoading) {
    return (
      <Card className="p-4">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Optimization Score</div>
        <div className="h-16 mt-3 animate-pulse rounded-lg bg-muted/50" />
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Optimization Score</div>
      <div className="flex items-center gap-3.5 mt-3">
        <div className="relative w-16 h-16 shrink-0">
          <ScoreRing val={scorePercent ?? 0} color="#3b82f6" color2="#60a5fa" size={64} />
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-base text-blue-500">
            {scorePercent != null ? `${Math.round(scorePercent)}%` : '—'}
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{optimizationScoreLabel(scorePercent)}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {current ? `${pendingCount} recommendation${pendingCount === 1 ? '' : 's'} available` : 'No score synced yet'}
          </div>
        </div>
      </div>
    </Card>
  )
}

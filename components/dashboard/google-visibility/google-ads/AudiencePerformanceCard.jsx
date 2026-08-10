"use client"

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { useGoogleAdsAudience } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'

const SEGMENTS = [
  { key: 'age', title: 'Age' },
  { key: 'gender', title: 'Gender' },
]

function buildBars(rows) {
  const totalCost = (rows || []).reduce((sum, r) => sum + (r.metrics?.cost || 0), 0)
  return (rows || [])
    .map((r) => ({
      key: r.dimension_value,
      label: r.label || r.dimension_value,
      pct: totalCost > 0 ? Math.round(((r.metrics?.cost || 0) / totalCost) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
}

/** Breakdown by age & gender segment - reads GET /google-ads/audience-performance. */
export default function AudiencePerformanceCard({ projectId, ready }) {
  const { data, isLoading, isError, refetch } = useGoogleAdsAudience(projectId, { enabled: !!ready })
  const raw = data?.data

  const segments = useMemo(() => {
    if (!raw) return []
    return SEGMENTS.map((seg) => ({ ...seg, bars: buildBars(raw[seg.key]) })).filter((seg) => seg.bars.length > 0)
  }, [raw])

  const status = isLoading ? 'loading' : isError ? 'error' : segments.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Audience Performance</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Breakdown by segment</p>

      {status !== 'ready' ? (
        <div className="mt-4">
          <GoogleAdsCardState status={status} icon={Users} message="No audience performance available." onRetry={refetch} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {segments.map((seg) => (
            <div key={seg.key} className="bg-muted/40 border border-border/50 rounded-xl p-3.5">
              <div className="text-xs font-semibold text-foreground mb-2.5">{seg.title}</div>
              <div className="flex flex-col gap-1.5">
                {seg.bars.map((bar) => (
                  <div key={bar.key} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="w-14 shrink-0 truncate">{bar.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${bar.pct}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono tabular-nums">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

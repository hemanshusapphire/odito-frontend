"use client"

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Globe } from 'lucide-react'
import { useGoogleAdsGeo } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

/**
 * Top countries by spend - ranked bar list, reads GET /google-ads/geo-performance?level=country.
 * A ranked list instead of a map for the same reason analytics/TopCountriesCard.jsx
 * uses one: no real map-coordinate data exists to plot honestly.
 */
export default function GeographicPerformanceCard({ projectId, ready }) {
  const { format } = useGoogleAdsCurrencyFormatter()
  const { data, isLoading, isError, refetch } = useGoogleAdsGeo(projectId, { level: 'country', limit: 10 }, { enabled: !!ready })
  const rows = data?.data || []

  const countries = useMemo(
    () => rows
      .map((r) => ({ key: r.geo_target_id, label: r.name || r.geo_target_id, code: r.country_code || '—', spend: r.metrics?.cost || 0 }))
      .sort((a, b) => b.spend - a.spend),
    [rows]
  )
  const max = Math.max(...countries.map((c) => c.spend), 1)

  const status = isLoading ? 'loading' : isError ? 'error' : countries.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Geographic Performance</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Top countries by spend</p>

      {status !== 'ready' ? (
        <div className="mt-4">
          <GoogleAdsCardState status={status} icon={Globe} message="No geographic performance available." onRetry={refetch} />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 mt-4">
          {countries.map((c) => {
            const pct = Math.round((c.spend / max) * 100)
            return (
              <div key={c.key} className="flex items-center gap-2.5 text-xs">
                <span className="w-6 shrink-0 font-mono text-[9.5px] text-muted-foreground/70">{c.code}</span>
                <span className="w-28 shrink-0 truncate text-foreground font-medium">{c.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-500 to-teal-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right font-mono tabular-nums text-muted-foreground">
                  {format(c.spend)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

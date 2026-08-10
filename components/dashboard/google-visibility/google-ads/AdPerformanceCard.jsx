"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Megaphone } from 'lucide-react'
import { useGoogleAdsAds } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { formatNumber, formatPercent, ctrPerformanceTier } from '@/lib/googleAdsFormat'

const PERFORMANCE_VARIANT = { excellent: 'success', good: 'info', average: 'warning', poor: 'critical' }
const PERFORMANCE_LABEL = { excellent: 'Excellent', good: 'Good', average: 'Average', poor: 'Poor' }

/** Impressions/clicks/CTR/conversions by ad format - reads GET /google-ads/ads?groupBy=ad_type. */
export default function AdPerformanceCard({ projectId, ready }) {
  const { data, isLoading, isError, refetch } = useGoogleAdsAds(projectId, { enabled: !!ready })
  const groups = data?.data || []
  const status = isLoading ? 'loading' : isError ? 'error' : groups.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Ad Performance</h3>
      <p className="text-xs text-muted-foreground mt-0.5">By ad format</p>

      {status !== 'ready' ? (
        <div className="mt-4">
          <GoogleAdsCardState status={status} icon={Megaphone} message="No ad performance data available." onRetry={refetch} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {groups.map((ad) => {
            const tier = ctrPerformanceTier(ad.ctr)
            return (
              <div key={ad.key} className="bg-muted/40 border border-border/50 rounded-xl p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">{ad.title}</span>
                  {tier && <Badge variant={PERFORMANCE_VARIANT[tier]}>{PERFORMANCE_LABEL[tier]}</Badge>}
                </div>
                <div className="flex flex-col gap-1 mt-2.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Impressions</span>
                    <span className="font-mono font-semibold text-foreground">{formatNumber(ad.impressions)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Clicks</span>
                    <span className="font-mono font-semibold text-foreground">{formatNumber(ad.clicks)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>CTR</span>
                    <span className="font-mono font-semibold text-foreground">{formatPercent(ad.ctr)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Conversions</span>
                    <span className="font-mono font-semibold text-foreground">{formatNumber(ad.conversions)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

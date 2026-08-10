"use client"

import ScoreRing from '@/components/ui/ScoreRing'
import { HeartPulse } from 'lucide-react'
import { useGoogleAdsCampaignHealth } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'

function ringColors(score) {
  if (score == null) return ['#94a3b8', '#cbd5e1']
  if (score >= 90) return ['#10b981', '#34d399']
  if (score >= 70) return ['#3b82f6', '#60a5fa']
  if (score >= 50) return ['#f59e0b', '#fbbf24']
  return ['#ef4444', '#f87171']
}

/** At-a-glance campaign health signals - reads GET /google-ads/campaigns/health/summary. */
export default function CampaignHealthGrid({ projectId, ready }) {
  const { data, isLoading, isError, refetch } = useGoogleAdsCampaignHealth(projectId, { enabled: !!ready })
  const health = data?.data || []
  const status = isLoading ? 'loading' : isError ? 'error' : health.length === 0 ? 'empty' : 'ready'

  return (
    <div>
      <div className="text-sm font-bold text-muted-foreground mb-2.5">Campaign Health</div>

      {status !== 'ready' ? (
        <div className="rounded-xl border bg-card p-4">
          <GoogleAdsCardState status={status} icon={HeartPulse} message="No campaign health data available yet." onRetry={refetch} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {health.map((h) => {
            const [color, color2] = ringColors(h.score)
            return (
              <div key={h.key} className="rounded-xl border bg-card p-4 flex items-center gap-3.5 shadow-sm">
                <div className="relative w-16 h-16 shrink-0">
                  <ScoreRing val={h.score ?? 0} color={color} color2={color2} size={64} />
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm">
                    {h.score != null ? `${h.score}%` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-foreground">{h.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{h.subtitle}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

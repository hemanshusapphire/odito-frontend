"use client"

import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { useGoogleAdsRecommendations } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { recommendationActionLabel } from '@/lib/googleAdsFormat'

const PRIORITY_VARIANT = { high: 'critical', medium: 'warning', low: 'secondary' }
const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }
const PRIORITY_DOT = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-slate-400' }

/** AI-suggested optimizations, ranked by priority - reads GET /google-ads/recommendations. */
export default function OptimizationCenterGrid({ projectId, ready }) {
  const { data, isLoading, isError, refetch } = useGoogleAdsRecommendations(projectId, { limit: 6 }, { enabled: !!ready })
  const recommendations = data?.data?.recommendations || []
  const status = isLoading ? 'loading' : isError ? 'error' : recommendations.length === 0 ? 'empty' : 'ready'

  return (
    <div>
      <div className="text-sm font-bold text-muted-foreground mb-2.5">AI Optimization Center</div>

      {status !== 'ready' ? (
        <div className="rounded-xl border bg-card p-4">
          <GoogleAdsCardState
            status={status}
            icon={Sparkles}
            message="No optimization recommendations available yet."
            onRetry={refetch}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {recommendations.map((rec) => (
            <div key={rec.resource_name} className="rounded-xl border bg-card p-4 flex flex-col gap-2.5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[rec.priority] || PRIORITY_DOT.low}`} />
                <Badge variant={PRIORITY_VARIANT[rec.priority] || 'secondary'}>{PRIORITY_LABEL[rec.priority] || 'Low'}</Badge>
              </div>

              <div className="text-[13px] font-bold text-foreground leading-tight">{rec.title}</div>
              <p className="text-[11.5px] text-muted-foreground leading-relaxed flex-1">{rec.description || 'No further detail available.'}</p>

              {rec.stat_label && rec.stat_value && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{rec.stat_label}</span>
                  <span className="font-mono font-bold text-emerald-500">{rec.stat_value}</span>
                </div>
              )}

              <button
                type="button"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/25 rounded-lg py-1.5 text-center hover:bg-blue-500/20 transition-colors mt-0.5"
              >
                {recommendationActionLabel(rec.category)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

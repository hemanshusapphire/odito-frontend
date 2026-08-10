"use client"

import { memo } from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

/**
 * Single KPI tile: icon, value, label, sparkline. `kpi.spark` is a real
 * per-day series derived from GET /google-ads/trends (see
 * GoogleAdsKPIGrid.jsx) - no period-over-period trend badge is shown
 * because the backend does not compute a previous-period comparison for
 * this endpoint; fabricating a "+12.3%" from nothing would violate the
 * "never substitute dummy values" rule this migration is built around.
 */
function GoogleAdsKPICard({ kpi }) {
  const Icon = kpi.icon
  const sparkData = kpi.spark.map((v, i) => ({ i, v }))
  const color = '#3b82f6'

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="text-2xl font-bold tabular-nums mt-3 font-mono">{kpi.value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
      <div className="text-[10.5px] text-muted-foreground/70 mt-0.5">last {kpi.rangeDays || 30} days</div>

      <div className="h-7 mt-2 -mx-1">
        {sparkData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`ga-spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.75}
                fill={`url(#ga-spark-${kpi.key})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  )
}

export default memo(GoogleAdsKPICard)

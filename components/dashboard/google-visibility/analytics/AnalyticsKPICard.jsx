"use client"

import { memo } from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ICON_CHIP_CLASSES, METRIC_ICONS, TREND_UP_COLOR, TREND_DOWN_COLOR } from '@/lib/analyticsChartConfig'

/**
 * Single KPI tile: icon, trend badge, headline value, label and a Recharts
 * sparkline - same shell as business-profile/KPICard.jsx so the two Google
 * Visibility dashboards read as one component family. `kpi.invertTrend`
 * flips which direction counts as "good" (e.g. bounce rate falling is a win)
 * without the caller having to pre-negate the number.
 */
function AnalyticsKPICard({ kpi }) {
  const Icon = METRIC_ICONS[kpi.icon] || METRIC_ICONS.activity
  const chipClass = ICON_CHIP_CLASSES[kpi.color] || ICON_CHIP_CLASSES.blue
  const isUp = kpi.trendDirection === 'up'
  const good = kpi.invertTrend ? !isUp : isUp
  const trendColor = good ? TREND_UP_COLOR : TREND_DOWN_COLOR
  const sparkData = kpi.spark?.map((v, i) => ({ i, v })) ?? []

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chipClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        {kpi.trend != null && (
          <span
            className="text-xs font-semibold tabular-nums flex items-center gap-0.5"
            style={{ color: trendColor }}
          >
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? '+' : ''}{kpi.trend}%
          </span>
        )}
      </div>

      <div className="text-2xl font-bold tabular-nums mt-3">{kpi.value ?? '—'}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
      {kpi.vsLabel && <div className="text-[10.5px] text-muted-foreground/70 mt-0.5">{kpi.vsLabel}</div>}

      {sparkData.length > 1 && (
        <div className="h-7 mt-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`analytics-spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={trendColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={trendColor}
                strokeWidth={1.75}
                fill={`url(#analytics-spark-${kpi.key})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default memo(AnalyticsKPICard)

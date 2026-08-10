"use client"

import { TrendingUp, TrendingDown } from 'lucide-react'
import { ICON_CHIP_CLASSES, METRIC_ICONS, TREND_UP_COLOR, TREND_DOWN_COLOR } from '@/lib/analyticsChartConfig'

/**
 * Single metric tile - icon, value, label and an optional trend delta.
 * Shared by AnalyticsStatRow (Audience/Conversions) so those two sections
 * don't each hand-roll their own tile markup, unlike the reference HTML
 * which duplicated this block ten times. `icon` is a METRIC_ICONS string
 * key (same convention as AnalyticsKPICard.kpi.icon), not a component
 * reference - keeps stat-tile config data plain/serializable.
 */
export default function AnalyticsStatTile({ icon, color = 'blue', value, label, trend, trendDirection = trend >= 0 ? 'up' : 'down' }) {
  const Icon = METRIC_ICONS[icon] || METRIC_ICONS.activity
  const chipClass = ICON_CHIP_CLASSES[color] || ICON_CHIP_CLASSES.blue
  const isUp = trendDirection === 'up'

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chipClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-xl font-bold tabular-nums mt-3">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {trend != null && (
        <span
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums mt-1.5"
          style={{ color: isUp ? TREND_UP_COLOR : TREND_DOWN_COLOR }}
        >
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isUp ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  )
}

"use client"

import { memo } from 'react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import {
  Search, MapPin, Globe, Phone, Navigation, Calendar, Star, MessageSquare,
  TrendingUp, TrendingDown,
} from 'lucide-react'

const ICONS = {
  search: Search,
  mapPin: MapPin,
  globe: Globe,
  phone: Phone,
  navigation: Navigation,
  calendar: Calendar,
  star: Star,
  messageSquare: MessageSquare,
}

function formatValue(kpi) {
  if (kpi.isDecimal) return kpi.value.toFixed(1)
  return kpi.value.toLocaleString()
}

function formatTrend(kpi) {
  const sign = kpi.trend >= 0 ? '+' : ''
  if (kpi.isAbsoluteDelta) return `${sign}${kpi.trend}`
  return `${sign}${kpi.trend}%`
}

/**
 * Single KPI tile: icon, trend badge, value, label, and a tiny sparkline
 * (Recharts AreaChart with all chrome hidden — matches the reference's
 * inline-SVG sparkline effect using the project's real charting library).
 */
function KPICard({ kpi }) {
  const Icon = ICONS[kpi.icon] || Search
  const isUp = kpi.trendDirection === 'up'
  const sparkData = kpi.spark.map((v, i) => ({ i, v }))
  const trendColor = isUp ? '#10b981' : '#ef4444'

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
        <span
          className="text-xs font-semibold tabular-nums flex items-center gap-0.5"
          style={{ color: trendColor }}
        >
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {formatTrend(kpi)}
        </span>
      </div>

      <div className="text-2xl font-bold tabular-nums mt-3">{formatValue(kpi)}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>

      <div className="h-7 mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={trendColor}
              strokeWidth={1.75}
              fill={`url(#spark-${kpi.key})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default memo(KPICard)

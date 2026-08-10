"use client"

import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Eye, Users, MousePointerClick, TrendingUp, TrendingDown } from 'lucide-react'

const ICONS = { eye: Eye, users: Users, mousePointer: MousePointerClick }

/** KPI tile: icon, large metric, trend %, previous-period comparison, mini sparkline. */
export default function ReportMetricCard({ kpi }) {
  const Icon = ICONS[kpi.icon] || Eye
  const isUp = kpi.trendPct >= 0
  const trendColor = isUp ? '#10b981' : '#ef4444'
  const sparkData = kpi.spark.map((v, i) => ({ i, v }))

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold tabular-nums flex items-center gap-0.5" style={{ color: trendColor }}>
          {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isUp ? '+' : ''}{kpi.trendPct}%
        </span>
      </div>

      <div className="text-2xl font-bold tabular-nums mt-3 font-mono">{kpi.value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
      <div className="text-[10.5px] text-muted-foreground/70 mt-0.5">vs {kpi.previous.toLocaleString()} previous period</div>

      <div className="h-7 mt-2 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`report-spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={trendColor} strokeWidth={1.75} fill={`url(#report-spark-${kpi.key})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

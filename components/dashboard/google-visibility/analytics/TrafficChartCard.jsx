"use client"

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'
import { formatDateTick } from '@/lib/analyticsChartConfig'

function ChartTooltip({ active, payload, label, series }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <div className="font-semibold text-popover-foreground mb-1.5">{formatDateTick(label)}</div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const s = series.find((item) => item.key === entry.dataKey)
          return (
            <div key={entry.dataKey} className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
              <span className="min-w-[90px]">{s?.label ?? entry.dataKey}</span>
              <span className="font-medium tabular-nums text-popover-foreground">
                {entry.value?.toLocaleString?.() ?? entry.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Multi-series traffic trend chart (users/sessions/views/conversions over
 * time) with a click-to-toggle legend. Range is driven entirely by the
 * page-level AnalyticsFilters - this card only renders whatever `series`/
 * `seriesConfig` it's given, matching business-profile/PerformanceTrendsCard's
 * "reusable chart container" shape (no internal range state, no fetching).
 */
export default function TrafficChartCard({ data = [], seriesConfig = [], loading = false }) {
  const [hidden, setHidden] = useState(() => new Set())

  const visibleConfig = useMemo(
    () => seriesConfig.filter((s) => !hidden.has(s.key)),
    [seriesConfig, hidden]
  )

  function toggleSeries(key) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Traffic Trends</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Users, sessions, views &amp; conversions over time</p>
        </div>
      </div>

      {seriesConfig.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-4">
          {seriesConfig.map((s) => {
            const isHidden = hidden.has(s.key)
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSeries(s.key)}
                className={`flex items-center gap-1.5 text-xs transition-opacity ${
                  isHidden ? 'opacity-40 text-muted-foreground' : 'text-foreground'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                {s.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="h-72 mt-4 -mx-2">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
            <BarChart3 className="h-8 w-8 opacity-40" />
            <p className="text-sm">No traffic data available for this range yet.</p>
            <p className="text-xs">Connect Analytics and sync to see live trends here.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                {seriesConfig.map((s) => (
                  <linearGradient key={s.key} id={`ga-trend-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                minTickGap={24}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                width={40}
              />
              <Tooltip content={<ChartTooltip series={seriesConfig} />} />
              {visibleConfig.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#ga-trend-${s.key})`}
                  connectNulls={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}

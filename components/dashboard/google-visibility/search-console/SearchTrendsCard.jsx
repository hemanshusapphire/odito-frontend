"use client"

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3 } from 'lucide-react'
import { trendSeriesConfig as defaultSeriesConfig } from '@/lib/searchConsoleTrends'

const RANGES = [
  { value: '7', label: '7d' },
  { value: '30', label: '30d' },
  { value: '90', label: '90d' },
  { value: '365', label: '12mo' },
]

function formatDateTick(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatSeriesValue(value, key) {
  if (key === 'ctr') return `${(value * 100).toFixed(2)}%`
  if (key === 'position') return value.toFixed(1)
  return value.toLocaleString()
}

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
                {formatSeriesValue(entry.value, entry.dataKey)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Multi-series performance trend chart with a range selector (7/30/90/365
 * days), backed by live day-by-day Google Search Console Search Analytics
 * API data (see hooks/useDashboardQueries.js useSearchConsoleTrends).
 * Mirrors business-profile/PerformanceTrendsCard.jsx.
 */
export default function SearchTrendsCard({
  series = [],
  range,
  onRangeChange,
  loading = false,
  seriesConfig = defaultSeriesConfig,
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Search Performance Trends</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clicks, impressions, CTR &amp; average position over time
          </p>
        </div>

        <Tabs value={range} onValueChange={onRangeChange}>
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger
                key={r.value}
                value={r.value}
                className="text-xs px-3 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground!"
              >
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="h-80 mt-5 -mx-2">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : series.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
            <BarChart3 className="h-8 w-8 opacity-40" />
            <p className="text-sm">No performance data available for this range yet.</p>
            <p className="text-xs">Run "Sync Now" after connecting, or check back once Google has processed recent activity.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                {seriesConfig.map((s) => (
                  <linearGradient key={s.key} id={`sc-trend-${s.key}`} x1="0" y1="0" x2="0" y2="1">
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
              {seriesConfig.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#sc-trend-${s.key})`}
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

"use client"

import { useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { useGoogleAdsTrends } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { formatDateTick } from '@/lib/analyticsChartConfig'
import { CATEGORICAL_COLORS } from '@/lib/analyticsChartConfig'
import { formatRangeLabel } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

const TREND_METRICS = [
  { key: 'impressions', label: 'Impressions', color: CATEGORICAL_COLORS[0], defaultVisible: false },
  { key: 'clicks', label: 'Clicks', color: CATEGORICAL_COLORS[1], defaultVisible: true },
  { key: 'cost', label: 'Spend', color: CATEGORICAL_COLORS[2], defaultVisible: true },
  { key: 'ctr', label: 'CTR', color: CATEGORICAL_COLORS[3], defaultVisible: false },
  { key: 'conversions', label: 'Conversions', color: CATEGORICAL_COLORS[4], defaultVisible: false },
  { key: 'roas', label: 'ROAS', color: CATEGORICAL_COLORS[5], defaultVisible: false },
]

function ChartTooltip({ active, payload, label }) {
  const { format } = useGoogleAdsCurrencyFormatter()
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <div className="font-semibold text-popover-foreground mb-1.5">{formatDateTick(label)}</div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const m = TREND_METRICS.find((item) => item.key === entry.dataKey)
          const isMoney = entry.dataKey === 'cost'
          return (
            <div key={entry.dataKey} className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
              <span className="min-w-22.5">{m?.label ?? entry.dataKey}</span>
              <span className="font-medium tabular-nums text-popover-foreground">
                {typeof entry.value !== 'number' ? entry.value : isMoney ? format(entry.value) : entry.value.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Spend/clicks/impressions/CTR/conversions/ROAS trend chart, driven by the
 * page-level GoogleAdsDateRangeSelector (Phase 2: Enterprise Historical
 * Sync) instead of owning its own separate range control - one range
 * selector for the whole page, matching every other card. Reads real daily/
 * monthly series from GET /google-ads/trends (useGoogleAdsTrends) - '12m'
 * and 'all' request monthly granularity so the chart doesn't try to plot
 * hundreds/thousands of daily bars for a multi-year range.
 */
export default function CampaignPerformanceTrendsCard({ projectId, dateRange, ready }) {
  const [hidden, setHidden] = useState(
    () => new Set(TREND_METRICS.filter((m) => !m.defaultVisible).map((m) => m.key))
  )

  const granularity = dateRange?.preset === '12m' || dateRange?.preset === 'all' ? 'monthly' : 'daily'
  const { data, isLoading, isError, refetch } = useGoogleAdsTrends(projectId, dateRange, granularity, { enabled: !!ready })
  const series = data?.data?.series || []

  const visibleMetrics = TREND_METRICS.filter((m) => !hidden.has(m.key))

  function toggleMetric(key) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const status = isLoading ? 'loading' : isError ? 'error' : series.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Campaign Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Spend, clicks, impressions, CTR, conversions &amp; ROAS over time
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted/40 border rounded-full px-2.5 py-1">
          {formatRangeLabel(dateRange)}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {TREND_METRICS.map((m) => {
          const isHidden = hidden.has(m.key)
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => toggleMetric(m.key)}
              className={`flex items-center gap-1.5 text-xs transition-opacity ${
                isHidden ? 'opacity-40 text-muted-foreground' : 'text-foreground'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: m.color }} />
              {m.label}
            </button>
          )
        })}
      </div>

      <div className="h-72 mt-4 -mx-2">
        {status !== 'ready' ? (
          <GoogleAdsCardState
            status={status}
            icon={BarChart3}
            message="No campaign performance data available for this range yet."
            onRetry={refetch}
            height="h-full flex flex-col items-center justify-center"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                {TREND_METRICS.map((m) => (
                  <linearGradient key={m.key} id={`ga-trend-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={m.color} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={m.color} stopOpacity={0.02} />
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
              {TREND_METRICS.map((m) => (
                <YAxis key={m.key} yAxisId={m.key} hide domain={['dataMin', 'dataMax']} />
              ))}
              <Tooltip content={<ChartTooltip />} />
              {visibleMetrics.map((m) => (
                <Area
                  key={m.key}
                  yAxisId={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2}
                  fill={`url(#ga-trend-${m.key})`}
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

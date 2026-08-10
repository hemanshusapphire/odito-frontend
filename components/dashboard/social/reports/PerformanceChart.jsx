"use client"

import { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { REPORT_PLATFORMS, PERIODS, performanceSeries } from '@/lib/socialReportsDummyData'

// Legend/series is the 5 core platforms per spec - YouTube is selector-only, not part of this chart's legend.
const CHART_PLATFORMS = REPORT_PLATFORMS.filter((p) => p.id !== 'youtube')

function formatTick(value, period) {
  if (period === 'day') return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric' })
  const d = new Date(value)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ChartTooltip({ active, payload, label, period }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <div className="font-semibold text-popover-foreground mb-1.5">{formatTick(label, period)}</div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const p = CHART_PLATFORMS.find((item) => item.id === entry.dataKey)
          return (
            <div key={entry.dataKey} className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
              <span className="min-w-[70px]">{p?.name ?? entry.dataKey}</span>
              <span className="font-medium tabular-nums text-popover-foreground">{entry.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Main "Impressions" chart - Day/Week/Month switcher + a click-to-toggle platform legend, Recharts Bar. */
export default function PerformanceChart({ days = 30 }) {
  const [period, setPeriod] = useState('month')
  const [hidden, setHidden] = useState(() => new Set(CHART_PLATFORMS.slice(2).map((p) => p.id)))

  const data = useMemo(() => performanceSeries(period, days), [period, days])
  const visible = CHART_PLATFORMS.filter((p) => !hidden.has(p.id))

  function toggle(id) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">Impressions</h3>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className="text-xs px-3">{p.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        {CHART_PLATFORMS.map((p) => {
          const isHidden = hidden.has(p.id)
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className={`flex items-center gap-1.5 text-xs transition-opacity ${isHidden ? 'opacity-40 text-muted-foreground' : 'text-foreground'}`}
            >
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: p.color }} />
              {p.name}
            </button>
          )
        })}
      </div>

      <div className="h-72 mt-4 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatTick(v, period)}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              minTickGap={24}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={32} allowDecimals={false} />
            <Tooltip content={<ChartTooltip period={period} />} />
            {visible.map((p) => (
              <Bar key={p.id} dataKey={p.id} name={p.name} fill={p.color} radius={[3, 3, 0, 0]} maxBarSize={18} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

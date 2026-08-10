"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Monitor, Smartphone, Tablet, MonitorSmartphone } from 'lucide-react'
import { CATEGORICAL_COLORS } from '@/lib/analyticsChartConfig'

const DEVICE_ICONS = { desktop: Monitor, mobile: Smartphone, tablet: Tablet }

// Backend (analyticsService.js's getAnalyticsBreakdowns) measures devices by
// `sessions`, not `activeUsers` - see the request body's metrics for the
// devices sub-report - and returns raw counts, not a percentage or a
// display color. Both are computed here, the same share-of-total pattern
// TrafficSourcesCard already uses, plus a categorical color per slot.
function withShareAndColor(devices) {
  const total = devices.reduce((sum, d) => sum + d.value, 0)
  return devices.map((d, i) => ({
    key: d.key,
    label: d.label,
    sessions: d.value,
    pct: total > 0 ? Math.round((d.value / total) * 100) : 0,
    color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length],
  }))
}

function DeviceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: entry } = payload[0]
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
        <span className="font-medium text-popover-foreground">{name}</span>
      </div>
      <div className="text-muted-foreground mt-1 tabular-nums">{value}% of sessions</div>
    </div>
  )
}

/** Sessions by device category - donut + a ranked tile list. */
export default function DeviceBreakdownCard({ devices = [], loading = false }) {
  const items = withShareAndColor(devices)

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Devices</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Sessions by device category</p>

      {loading ? (
        <div className="flex items-center gap-5 mt-4">
          <Skeleton className="h-[130px] w-[130px] rounded-full shrink-0" />
          <div className="flex-1 space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-lg" />)}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-8">
          <MonitorSmartphone className="h-8 w-8 opacity-40" />
          <p className="text-sm">No device data yet.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-5 items-center mt-4">
          <div className="relative h-[130px] w-[130px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={items} dataKey="pct" nameKey="label" innerRadius={0} outerRadius={65} strokeWidth={0}>
                  {items.map((d) => <Cell key={d.key} fill={d.color} />)}
                </Pie>
                <Tooltip content={<DeviceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 w-full flex flex-col gap-2">
            {items.map((d) => {
              const Icon = DEVICE_ICONS[d.key] || Monitor
              return (
                <div key={d.key} className="flex items-center justify-between bg-muted/40 border border-border/50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2.5 text-sm font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {d.label}
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm tabular-nums">{d.pct}%</div>
                    <div className="text-[10.5px] text-muted-foreground">{d.sessions?.toLocaleString()} sessions</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}

"use client"

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import { Monitor, Smartphone, Tablet, Tv, HelpCircle } from 'lucide-react'
import { useGoogleAdsDevices } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { CATEGORICAL_COLORS } from '@/lib/analyticsChartConfig'
import { deviceLabel } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

const DEVICE_ICON = {
  DESKTOP: Monitor,
  MOBILE: Smartphone,
  TABLET: Tablet,
  CONNECTED_TV: Tv,
}

function DeviceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, payload: entry } = payload[0]
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
        <span className="font-medium text-popover-foreground">{name}</span>
      </div>
      <div className="text-muted-foreground mt-1 tabular-nums">{entry.pct}% of spend</div>
    </div>
  )
}

/** Spend share by device - donut + ranked tile list. Reads GET /google-ads/device-performance. */
export default function DevicePerformanceCard({ projectId, dateRange, ready }) {
  const { format } = useGoogleAdsCurrencyFormatter()
  const { data, isLoading, isError, refetch } = useGoogleAdsDevices(projectId, dateRange, { enabled: !!ready })
  const devices = data?.data?.devices || []

  const items = useMemo(() => {
    const totalSpend = devices.reduce((sum, d) => sum + (d.cost || 0), 0)
    return devices
      .map((d, i) => ({
        key: d.device,
        label: deviceLabel(d.device),
        icon: DEVICE_ICON[d.device] || HelpCircle,
        spend: d.cost || 0,
        pct: totalSpend > 0 ? Math.round(((d.cost || 0) / totalSpend) * 100) : 0,
        color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length],
      }))
      .sort((a, b) => b.spend - a.spend)
  }, [devices])

  const status = isLoading ? 'loading' : isError ? 'error' : items.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Device Performance</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Spend share by device</p>

      {status !== 'ready' ? (
        <div className="mt-4">
          <GoogleAdsCardState status={status} icon={Monitor} message="No device performance data available." onRetry={refetch} />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-5 items-center mt-4">
          <div className="relative h-32.5 w-32.5 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={items} dataKey="pct" nameKey="label" innerRadius={40} outerRadius={65} strokeWidth={0}>
                  {items.map((d) => <Cell key={d.key} fill={d.color} />)}
                </Pie>
                <Tooltip content={<DeviceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 w-full flex flex-col gap-2">
            {items.map((d) => {
              const Icon = d.icon
              return (
                <div key={d.key} className="flex items-center justify-between bg-muted/40 border border-border/50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2.5 text-sm font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {d.label}
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm tabular-nums">{d.pct}%</div>
                    <div className="text-[10.5px] text-muted-foreground">{format(d.spend)}</div>
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

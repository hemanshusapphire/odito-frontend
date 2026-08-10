"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Radio } from 'lucide-react'
import { CATEGORICAL_COLORS } from '@/lib/analyticsChartConfig'

/**
 * Realtime active-user snapshot. Purely presentational - `activeUsers` and
 * the two lists are caller-supplied props (from useAnalyticsRealtime, which
 * itself polls on its own short interval - see useDashboardQueries.js);
 * this component does not poll, subscribe, or fake a ticking counter
 * itself. `deviceSplit` arrives as raw counts (analyticsService.js's
 * getAnalyticsRealtimeData measures activeUsers per device, not a
 * percentage) - share-of-total and color are computed here.
 */
export default function RealtimeUsersCard({ activeUsers, topPages = [], topCountries = [], deviceSplit = [], loading = false }) {
  const totalDeviceUsers = deviceSplit.reduce((sum, d) => sum + d.users, 0)
  const deviceShares = deviceSplit.map((d, i) => ({
    key: d.key,
    label: d.label,
    pct: totalDeviceUsers > 0 ? Math.round((d.users / totalDeviceUsers) * 100) : 0,
    color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length],
  }))

  return (
    <Card className="p-6 border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.06] to-card/80">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Realtime</h3>
        <Badge variant="success" className="gap-1.5 uppercase tracking-wide text-[10px]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Live
        </Badge>
      </div>

      {loading ? (
        <Skeleton className="h-10 w-24 mt-3" />
      ) : (
        <div className="text-4xl font-extrabold tabular-nums tracking-tight mt-3">{activeUsers ?? '—'}</div>
      )}
      <p className="text-xs text-muted-foreground -mt-0.5">Active users right now</p>

      <div className="grid grid-cols-2 gap-5 mt-4">
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground/80 mb-2">Top Active Pages</p>
          <ul className="space-y-1.5">
            {topPages.length === 0 && <li className="text-xs text-muted-foreground italic">No active pages</li>}
            {topPages.map((p) => (
              <li key={p.path} className="flex items-center justify-between text-xs">
                <span className="font-mono text-foreground truncate">{p.path}</span>
                <span className="font-semibold tabular-nums">{p.users}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground/80 mb-2">Top Countries</p>
          <ul className="space-y-1.5">
            {topCountries.length === 0 && <li className="text-xs text-muted-foreground italic">No active countries</li>}
            {topCountries.map((c) => (
              <li key={c.key} className="flex items-center justify-between text-xs">
                <span className="text-foreground truncate">{c.label}</span>
                <span className="font-semibold tabular-nums">{c.users}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {deviceShares.length > 0 && (
        <div className="mt-4">
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground/80 mb-2">Device Breakdown</p>
          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
            {deviceShares.map((d) => (
              <div key={d.key} style={{ width: `${d.pct}%`, background: d.color }} title={`${d.label}: ${d.pct}%`} />
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

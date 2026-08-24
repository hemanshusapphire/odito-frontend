"use client"

import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConnectionStateCard from './ConnectionStateCard'
import { PERIODS, periodRangeLabel } from '@/lib/socialMediaDummyData'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <div className="font-semibold text-popover-foreground mb-1">{label}</div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span>{entry.name}</span>
            <span className="font-medium tabular-nums text-popover-foreground">{entry.value?.toLocaleString?.() ?? entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderChart(chart, data, gradientId) {
  const axisProps = {
    axisLine: false, tickLine: false, tick: { fontSize: 11, fill: 'var(--muted-foreground)' },
  }

  if (chart.type === 'area') {
    return (
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chart.color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={chart.color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={20} />
        <YAxis {...axisProps} width={36} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="value" name={chart.title} stroke={chart.color} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    )
  }

  if (chart.type === 'bar') {
    return (
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={20} />
        <YAxis {...axisProps} width={36} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey={chart.seriesA.key} name={chart.seriesA.label} fill={chart.seriesA.color} radius={[4, 4, 0, 0]} />
        <Bar dataKey={chart.seriesB.key} name={chart.seriesB.label} fill={chart.seriesB.color} radius={[4, 4, 0, 0]} />
      </BarChart>
    )
  }

  // line
  if (chart.seriesA) {
    return (
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="label" {...axisProps} minTickGap={20} />
        <YAxis {...axisProps} width={36} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey={chart.seriesA.key} name={chart.seriesA.label} stroke={chart.seriesA.color} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey={chart.seriesB.key} name={chart.seriesB.label} stroke={chart.seriesB.color} strokeWidth={2} dot={false} />
      </LineChart>
    )
  }

  return (
    <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
      <XAxis dataKey="label" {...axisProps} minTickGap={20} />
      <YAxis {...axisProps} width={36} />
      <Tooltip content={<ChartTooltip />} />
      <Line
        type="monotone" dataKey="value" name={chart.title} stroke={chart.color} strokeWidth={2} dot={false}
        strokeDasharray={chart.dashed ? '5 4' : undefined}
      />
    </LineChart>
  )
}

/**
 * Area/Bar/Line chart with a Day/Week/Month period switcher. When the
 * platform is disconnected, the chart still renders (dimmed) behind a
 * centered ConnectionStateCard - matches the reference's own behaviour of
 * showing stale/cached-looking data under the connect prompt.
 *
 * `period`/`onPeriodChange` are controlled by the parent page (not local
 * state here) because for Facebook/Instagram, changing the period must
 * trigger a real refetch against a different backend date window — this
 * component only renders whatever data it's given for the current period,
 * it never owns the fetch. `loading` shows the existing spinner state
 * while that refetch for the newly-selected period is in flight, so a
 * period switch never silently keeps showing the previous period's data.
 */
export default function PlatformChart({ chart, connected, icon, tint, platformName, connectMessage, onConnect, emptyMessage, period = 'month', onPeriodChange = () => {}, loading = false, rangeLabel }) {
  const data = chart.series[period]
  const gradientId = `social-${platformName.toLowerCase()}-${period}`
  // Connected, but Meta genuinely has nothing to show for this metric
  // (e.g. no supported insights metric exists for this Page/API version)
  // — an honest "unavailable" state, never a fabricated flat/fake chart.
  const isEmpty = connected && emptyMessage && (!data || data.length === 0)

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h4 className="text-sm font-semibold">{chart.title}</h4>
        <div className="flex items-center gap-3">
          <Tabs value={period} onValueChange={onPeriodChange}>
            <TabsList className="h-8">
              {PERIODS.map((p) => (
                <TabsTrigger key={p.value} value={p.value} disabled={loading} className="text-xs px-2.5 h-6">{p.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {/* While a range switch is loading, `rangeLabel` (if present) still
              reflects the PREVIOUS range's backend-echoed since/until via
              placeholderData — showing it here would be exactly the "stale
              data presented as the new range" the selector must avoid, so
              this falls back to a real, live-computed label for the
              newly-selected period until the fresher one arrives. */}
          <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:inline">{!loading && rangeLabel ? rangeLabel : periodRangeLabel(period)}</span>
        </div>
      </div>

      <div className="relative h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center text-center px-6">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className={connected ? '' : 'opacity-30 pointer-events-none blur-[1px]'} style={{ height: '100%' }}>
            {/* minHeight/minWidth give Recharts a concrete floor to use on
                its first, pre-measurement paint (before its ResizeObserver
                has reported a real size) — matches the `h-64` (256px) fixed
                height on this chart's own ancestor above, so this is never
                actually rendered smaller than that; it just stops Recharts
                from measuring -1 and warning during that first frame. Still
                fully responsive: once measured, it fills 100%/100% exactly
                as before. */}
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
              {renderChart(chart, data, gradientId)}
            </ResponsiveContainer>
          </div>
        )}

        {!connected && (
          <ConnectionStateCard
            icon={icon}
            tint={tint}
            platformName={platformName}
            message={connectMessage}
            onConnect={onConnect}
          />
        )}
      </div>
    </div>
  )
}

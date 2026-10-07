"use client"

import { memo } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts'
import AnalyticsCard, { EmptyBody, Legend, TooltipShell, TooltipRow } from './AnalyticsCard'
import AnalyticsDateRange from './AnalyticsDateRange'
import { TEXT_COLORS, fmtInt, formatAxisDate, formatBucketTitle } from './analyticsFormat'

const RING_LIMIT = 31 // beyond this many points the markers just add noise

function DistTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <TooltipShell title={formatBucketTitle(p.bucket, unit)}>
      <TooltipRow color={TEXT_COLORS.withText} label="With text" value={fmtInt(p.withText)} />
      <TooltipRow color={TEXT_COLORS.withoutText} label="Without text" value={fmtInt(p.withoutText)} />
      <TooltipRow label="Total" value={fmtInt(p.withText + p.withoutText)} />
    </TooltipShell>
  )
}

/** Hollow ring marker, as in the reference. */
const ring = (color) => ({ r: 5, fill: '#fff', stroke: color, strokeWidth: 2 })

/**
 * "Reviews Distribution": reviews with written text vs rating-only over time
 * (smooth areas with ring markers) beside a thick donut with count legend.
 */
function ReviewDistribution({ distribution, unit }) {
  const { totals, series } = distribution
  const total = totals.withText + totals.withoutText
  const dots = series.length <= RING_LIMIT
  const donut = [
    { name: 'With Text', value: totals.withText, color: TEXT_COLORS.withText },
    { name: 'Without Text', value: totals.withoutText, color: TEXT_COLORS.withoutText },
  ]

  return (
    <AnalyticsCard title="Reviews Distribution" actions={<AnalyticsDateRange />}>
      {total === 0 ? (
        <EmptyBody message="No reviews available for this period." height="h-72" />
      ) : (
        <div className="grid grid-cols-1 gap-6 @min-[880px]/main:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @min-[880px]/main:gap-8">
          <div className="min-w-0">
            <Legend items={[{ label: 'With Text', color: TEXT_COLORS.withText }, { label: 'Without Text', color: TEXT_COLORS.withoutText }]} />
            <div className="mt-2 h-72" role="img" aria-label="Reviews with and without text over time">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="bucket" tickFormatter={(b) => formatAxisDate(b, unit)} tick={{ fontSize: 11, fill: '#5b6679' }} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5b6679' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<DistTooltip unit={unit} />} />
                  <Area type="monotone" dataKey="withText" stroke={TEXT_COLORS.withText} fill={TEXT_COLORS.withText} fillOpacity={0.14} strokeWidth={2.5} dot={dots ? ring(TEXT_COLORS.withText) : false} activeDot={{ r: 6 }} isAnimationActive={false} />
                  <Area type="monotone" dataKey="withoutText" stroke={TEXT_COLORS.withoutText} fill={TEXT_COLORS.withoutText} fillOpacity={0.2} strokeWidth={2.5} dot={dots ? ring(TEXT_COLORS.withoutText) : false} activeDot={{ r: 6 }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-center justify-center gap-5 @min-[1250px]/main:flex-row @min-[1250px]/main:gap-8">
            <div className="h-56 w-56 shrink-0 @min-[560px]/main:h-64 @min-[560px]/main:w-64" role="img" aria-label="With text versus without text share">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} dataKey="value" innerRadius="50%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
                    {donut.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-[15px] text-[#3b4660] dark:text-muted-foreground">
              {donut.map((d) => (
                <li key={d.name} className="flex items-center gap-2.5 whitespace-nowrap">
                  <span className="h-[18px] w-[18px] rounded-full border-[4px] bg-white" style={{ borderColor: d.color }} aria-hidden="true" />
                  {d.name} - <span className="tabular-nums text-[#1b2540] dark:text-foreground">{fmtInt(d.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AnalyticsCard>
  )
}

export default memo(ReviewDistribution)

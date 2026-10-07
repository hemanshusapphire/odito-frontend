"use client"

import { memo, useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Star } from 'lucide-react'
import AnalyticsCard, { EmptyBody, TooltipShell, TooltipRow } from './AnalyticsCard'
import AnalyticsDateRange from './AnalyticsDateRange'
import {
  STAR_COLORS, GOLD, fmtInt, fmtPercent, fmtRating, formatAxisDate, formatBucketTitle,
} from './analyticsFormat'

const STACK = [
  { key: 'one', stars: 1 }, { key: 'two', stars: 2 }, { key: 'three', stars: 3 }, { key: 'four', stars: 4 }, { key: 'five', stars: 5 },
]

function Stars({ n, className = 'h-[18px] w-[18px]' }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => <Star key={i} className={className} style={{ color: GOLD, fill: GOLD }} />)}
    </span>
  )
}

function StackTooltip({ active, payload, unit, avgByBucket }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  const total = p.one + p.two + p.three + p.four + p.five
  const avg = avgByBucket.get(p.bucket)
  return (
    <TooltipShell title={formatBucketTitle(p.bucket, unit)}>
      {[...STACK].reverse().map((s) => <TooltipRow key={s.key} color={STAR_COLORS[s.stars]} label={`${s.stars} star${s.stars > 1 ? 's' : ''}`} value={fmtInt(p[s.key])} />)}
      <TooltipRow label="Total" value={fmtInt(total)} />
      <TooltipRow label="Average rating" value={typeof avg === 'number' ? `${fmtRating(avg)} ★` : '—'} />
    </TooltipShell>
  )
}

/**
 * "Reviews Rating": stacked star counts per bucket on the left (1★ at the base,
 * 5★ on top), the period total with a star-row breakdown on the right. Shares the
 * dashboard's single range; every value is the backend's aggregate.
 */
function RatingAnalytics({ ratings, trends, total, unit }) {
  const avgByBucket = useMemo(() => new Map(trends.map((t) => [t.bucket, t.averageRating])), [trends])

  return (
    <AnalyticsCard title="Reviews Rating" actions={<AnalyticsDateRange />}>
      {total === 0 ? (
        <EmptyBody message="No reviews available for this period." height="h-72" />
      ) : (
        <div className="grid grid-cols-1 gap-6 @min-[880px]/main:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] @min-[880px]/main:gap-10">
          <div className="min-w-0">
            <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[#44546a]" aria-label="Legend">
              {STACK.map((s) => (
                <li key={s.key} className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded-[3px]" style={{ background: STAR_COLORS[s.stars] }} aria-hidden="true" />
                  <Stars n={s.stars} className="h-4 w-4" />
                  <span className="sr-only">{s.stars} star</span>
                </li>
              ))}
            </ul>
            <div className="h-[22rem]" role="img" aria-label="Reviews by star rating over time">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratings.series} margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="bucket" tickFormatter={(b) => formatAxisDate(b, unit)} tick={{ fontSize: 11, fill: '#5b6679' }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} tickMargin={8} minTickGap={20} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5b6679' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<StackTooltip unit={unit} avgByBucket={avgByBucket} />} cursor={{ fill: 'rgba(31,42,122,0.05)' }} />
                  {STACK.map((s) => (
                    <Bar key={s.key} dataKey={s.key} stackId="stars" fill={STAR_COLORS[s.stars]} maxBarSize={14} radius={s.stars === 5 ? [7, 7, 0, 0] : 0} isAnimationActive={false} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[34px] font-bold leading-none tabular-nums" style={{ color: STAR_COLORS[5] }}>{fmtInt(total)}</p>
            <p className="mt-1 text-[17px] text-[#3b4660] dark:text-muted-foreground">Total</p>
            <ul className="mt-5 space-y-[26px]" aria-label="Reviews by star rating">
              {ratings.period.map(({ stars, count, percent }) => (
                <li key={stars}>
                  <div
                    className="h-3.5 overflow-hidden rounded-full"
                    style={{ background: `${STAR_COLORS[stars]}26` }} /* 15% tint of the bar colour: pale on light, subtle on dark */
                    role="meter"
                    aria-label={`${stars} star reviews`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                  >
                    <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${percent}%`, background: STAR_COLORS[stars] }} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <Stars n={stars} />
                    <span className="text-[19px] tabular-nums text-[#1b2540] dark:text-foreground">{fmtInt(count)}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{fmtPercent(percent)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AnalyticsCard>
  )
}

export default memo(RatingAnalytics)

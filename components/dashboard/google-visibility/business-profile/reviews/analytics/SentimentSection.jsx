"use client"

import { memo } from 'react'
import { Smile, Meh, Frown } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { EmptyBody, Legend, TooltipShell, TooltipRow } from './AnalyticsCard'
import AnalyticsDateRange from './AnalyticsDateRange'
import {
  SENTIMENT_COLORS, fmtInt, fmtPercent, formatAxisDate, formatBucketTitle, netSentiment, dominantSentiment,
} from './analyticsFormat'

const RING_LIMIT = 31
const FACE = { positive: Smile, neutral: Meh, negative: Frown }
const LABEL = { positive: 'Positive', neutral: 'Neutral', negative: 'Negative' }
const TINT = {
  positive: 'border-[#2da44e] bg-[#eefaf2] dark:bg-emerald-500/10',
  neutral: 'border-[#f5a60a] bg-[#fff8e8] dark:bg-amber-500/10',
  negative: 'border-[#e5393b] bg-[#fdecec] dark:bg-red-500/10',
}
const ring = (color) => ({ r: 5, fill: '#fff', stroke: color, strokeWidth: 2 })

/** Left half: the three shares, a net-sentiment score and where it sits on the red / amber / green bar. */
function SentimentScore({ period, basis }) {
  if (!period || period.total === 0) return <EmptyBody message="No reviews available for this period." height="h-72" />
  const score = netSentiment(period)
  const dominant = dominantSentiment(period)
  const Face = FACE[dominant]
  const pointer = Math.min(100, Math.max(0, (score + 100) / 2))
  const stored = basis?.storedLabels > 0
  return (
    <div className="flex min-h-72 flex-col items-center gap-3 pt-2">
      <Face className="h-[68px] w-[68px]" strokeWidth={1.6} style={{ color: SENTIMENT_COLORS[dominant] }} aria-hidden="true" />
      <div className="w-full max-w-[22rem]">
        <div className="relative h-9">
          <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[13px] leading-none" style={{ left: `${Math.min(88, Math.max(12, pointer))}%`, color: SENTIMENT_COLORS[dominant] }}>
            {LABEL[dominant]}
          </span>
          <span className="absolute top-4 -translate-x-1/2 text-[13px] leading-none" style={{ left: `${pointer}%`, color: SENTIMENT_COLORS[dominant] }} aria-hidden="true">▼</span>
        </div>
        <div className="flex h-4 overflow-hidden rounded-full" role="img" aria-label={`Net sentiment ${score} on a scale from -100 to 100`}>
          <span className="w-1/3" style={{ background: SENTIMENT_COLORS.negative }} />
          <span className="w-1/3" style={{ background: SENTIMENT_COLORS.neutral }} />
          <span className="w-1/3" style={{ background: SENTIMENT_COLORS.positive }} />
        </div>
      </div>
      <p className="text-[19px] font-semibold text-[#1b2540] dark:text-foreground">
        Current Score: <span style={{ color: SENTIMENT_COLORS[dominant] }}>{score.toFixed(2)}</span>
      </p>
      <ul className="flex w-full flex-wrap items-stretch justify-center gap-2.5" aria-label="Sentiment shares">
        {['negative', 'neutral', 'positive'].map((k) => {
          const F = FACE[k]
          return (
            <li key={k} className={`flex min-w-[8.5rem] flex-1 items-center gap-2.5 rounded-lg border px-3 py-2 @min-[560px]/main:max-w-[10.5rem] ${TINT[k]}`}>
              <F className="h-9 w-9 shrink-0" strokeWidth={1.5} style={{ color: SENTIMENT_COLORS[k] }} aria-hidden="true" />
              <div className="leading-tight">
                <p className="text-[20px] tabular-nums text-[#1b2540] dark:text-foreground">{fmtPercent(period[`${k}Percent`])}</p>
                <p className="text-[16px]" style={{ color: SENTIMENT_COLORS[k] }}>{LABEL[k]}</p>
                <span className="sr-only">{fmtInt(period[k])} reviews</span>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="max-w-sm text-center text-[11px] text-muted-foreground">
        Score = % positive − % negative.{' '}
        {stored ? `${fmtInt(basis.storedLabels)} reviews use an analysed label; the rest follow star rating.` : 'Based on star rating: 4–5★ positive, 3★ neutral, 1–2★ negative.'}
      </p>
    </div>
  )
}

function TimelineTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <TooltipShell title={formatBucketTitle(p.bucket, unit)}>
      <TooltipRow color={SENTIMENT_COLORS.positive} label="Positive" value={fmtInt(p.positive)} />
      <TooltipRow color={SENTIMENT_COLORS.negative} label="Negative" value={fmtInt(p.negative)} />
      <TooltipRow color={SENTIMENT_COLORS.neutral} label="Neutral" value={fmtInt(p.neutral)} />
      <TooltipRow label="Total" value={fmtInt(p.total)} />
    </TooltipShell>
  )
}

/** Right half: reviews per bucket by sentiment as smooth lines with ring markers. */
function SentimentTimeline({ timeline, unit, total }) {
  if (total === 0) return <EmptyBody message="No reviews available for this period." height="h-72" />
  const dots = timeline.length <= RING_LIMIT
  const line = (key, fill) => (
    <Area
      key={key} type="monotone" dataKey={key} stroke={SENTIMENT_COLORS[key]} strokeWidth={2.5}
      fill={SENTIMENT_COLORS[key]} fillOpacity={fill} dot={dots ? ring(SENTIMENT_COLORS[key]) : false}
      activeDot={{ r: 6 }} isAnimationActive={false}
    />
  )
  return (
    <div className="min-w-0">
      <Legend items={[
        { label: 'Positive', color: SENTIMENT_COLORS.positive },
        { label: 'Negative', color: SENTIMENT_COLORS.negative },
        { label: 'Neutral', color: SENTIMENT_COLORS.neutral },
      ]} />
      <div className="mt-2 h-72" role="img" aria-label="Positive, negative and neutral reviews over time">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="bucket" tickFormatter={(b) => formatAxisDate(b, unit)} tick={{ fontSize: 11, fill: '#5b6679' }} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#5b6679' }} tickLine={false} axisLine={false} />
            <Tooltip content={<TimelineTooltip unit={unit} />} />
            {line('positive', 0.12)}
            {line('negative', 0.1)}
            {line('neutral', 0)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/**
 * One card, two halves (as in the reference): "Review Sentiment Score" on the
 * left, "Sentiment Timeline" with the range chips on the right. This is the
 * deterministic review-sentiment model - not an NPS survey.
 */
function SentimentSection({ sentiment, unit }) {
  const title = 'text-[18px] font-medium leading-tight text-[#1b2540] sm:text-[20px] dark:text-foreground'
  return (
    <section className="min-w-0 rounded-[14px] border border-[#dbe5f4] bg-card px-4 py-4 shadow-[0_1px_2px_rgba(31,42,122,0.05)] sm:px-5 dark:border-border">
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 @min-[880px]/main:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          <h3 className={`${title} flex min-h-8 items-center`}>Review Sentiment Score</h3>
          <div className="mt-3"><SentimentScore period={sentiment.period} basis={sentiment.basis} /></div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h3 className={title}>Sentiment Timeline</h3>
            <AnalyticsDateRange />
          </div>
          <div className="mt-3"><SentimentTimeline timeline={sentiment.timeline} unit={unit} total={sentiment.period.total} /></div>
        </div>
      </div>
    </section>
  )
}

export default memo(SentimentSection)

"use client"

import { memo } from 'react'
import AnalyticsCard from './AnalyticsCard'
import { SENTIMENT_COLORS, fmtInt, fmtPercent, rangeLongLabel } from './analyticsFormat'

const BOX = 'rounded-[14px] border border-[#dbe5f4] px-3 py-3 sm:px-4 dark:border-border'
const DIVIDER = 'border-l border-dotted border-[#c5d0e6] dark:border-border'

function Stat({ value, label, color }) {
  return (
    <div className="min-w-0 px-2 text-center">
      <p className="text-[22px] font-normal leading-tight tabular-nums text-[#1b2540] sm:text-[24px] dark:text-foreground">{value}</p>
      <p className="mt-1 text-[12px]" style={{ color: color || undefined }}>
        <span className={color ? '' : 'text-muted-foreground'}>{label}</span>
      </p>
    </div>
  )
}

function Half({ title, children, divided }) {
  return (
    <div className={`min-w-0 flex-1 ${divided ? 'border-t border-dotted border-[#c5d0e6] pt-3 @min-[560px]/main:border-l @min-[560px]/main:border-t-0 @min-[560px]/main:pl-2 @min-[560px]/main:pt-0 dark:border-border' : ''}`}>
      <p className="mb-2 text-center text-[16px] text-[#1b2540] sm:text-[18px] dark:text-foreground">{title}</p>
      <div className="grid grid-cols-2">{children}</div>
    </div>
  )
}

/**
 * "Reviews at a glance": three boxes. Review Glance + Review Treatment follow the
 * selected period (with the all-time figure beside it); the last-7 / last-30 day
 * boxes are fixed windows ending now. Positive / negative use the dashboard's
 * sentiment rules (stored label, else 4-5 stars positive, 1-2 negative).
 */
function ReviewGlance({ glance, response, rangeKey }) {
  const period = rangeLongLabel(rangeKey)
  return (
    <AnalyticsCard title="Reviews at a glance">
      <div className="grid grid-cols-1 gap-3 @min-[700px]/main:grid-cols-2 @min-[1400px]/main:grid-cols-[1.25fr_1fr_1fr]">
        <div className={`${BOX} flex flex-col gap-3 @min-[700px]/main:col-span-2 @min-[1400px]/main:col-span-1 @min-[560px]/main:flex-row`}>
          <Half title="Review Glance">
            <Stat value={fmtInt(glance.periodReviews)} label={period} />
            <Stat value={fmtInt(glance.lifetimeReviews)} label="Total Reviews" />
          </Half>
          <Half title="Review Treatment" divided>
            <Stat value={fmtPercent(glance.treatment.respondedPercent)} label={period} />
            <Stat value={fmtPercent(response.lifetime.responseRate)} label="Total" />
          </Half>
        </div>
        {[['Review in last 7 days', glance.last7Days], ['Review in last 30 days', glance.last30Days]].map(([title, w]) => (
          <div key={title} className={BOX}>
            <p className="mb-2 text-center text-[16px] text-[#1b2540] sm:text-[18px] dark:text-foreground">{title}</p>
            <div className="grid grid-cols-2">
              <Stat value={fmtInt(w.negative)} label="Negative" color={SENTIMENT_COLORS.negative} />
              <div className={DIVIDER}><Stat value={fmtInt(w.positive)} label="Positive" color={SENTIMENT_COLORS.positive} /></div>
            </div>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  )
}

export default memo(ReviewGlance)

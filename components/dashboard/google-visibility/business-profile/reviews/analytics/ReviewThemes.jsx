"use client"

import { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import AnalyticsCard, { EmptyBody } from './AnalyticsCard'
import AnalyticsDateRange from './AnalyticsDateRange'
import { SentimentBar } from './KeywordCloud'
import { SENTIMENT_COLORS, fmtInt, fmtPercent } from './analyticsFormat'

export const THEME_SORTS = [
  { value: 'mentioned', label: 'Most mentioned' },
  { value: 'positive', label: 'Most positive' },
  { value: 'negative', label: 'Most negative' },
]

/** Pure, client-side sort of the already-returned themes (no extra request). */
export function sortThemes(items, sort) {
  const byMentions = (a, b) => b.reviewCount - a.reviewCount || a.name.localeCompare(b.name)
  const copy = [...items]
  if (sort === 'positive') return copy.sort((a, b) => b.positivePercent - a.positivePercent || byMentions(a, b))
  if (sort === 'negative') return copy.sort((a, b) => b.negativePercent - a.negativePercent || b.negative - a.negative || byMentions(a, b))
  return copy.sort(byMentions)
}

function ThemeCard({ theme }) {
  // Lead with whichever sentiment is the headline for this topic.
  const negativeLed = theme.negativePercent > theme.positivePercent
  return (
    <li className="min-w-0 rounded-[14px] border border-[#dbe5f4] bg-card p-4 dark:border-border">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-tight">{theme.name}</h4>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{fmtPercent(theme.percentage)} of reviews</span>
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums leading-tight">
        {fmtInt(theme.reviewCount)} <span className="text-sm font-normal text-muted-foreground">{theme.reviewCount === 1 ? 'review' : 'reviews'}</span>
      </p>
      <div className="mt-3">
        <SentimentBar item={theme} className="h-2" />
      </div>
      <p className="mt-2 text-sm font-medium" style={{ color: negativeLed ? SENTIMENT_COLORS.negative : SENTIMENT_COLORS.positive }}>
        {negativeLed ? `${fmtPercent(theme.negativePercent)} negative` : `${fmtPercent(theme.positivePercent)} positive`}
      </p>
      <dl className="mt-1 flex gap-3 text-xs text-muted-foreground tabular-nums">
        <div className="flex gap-1"><dt>Positive</dt><dd className="font-medium text-foreground">{fmtInt(theme.positive)}</dd></div>
        <div className="flex gap-1"><dt>Neutral</dt><dd className="font-medium text-foreground">{fmtInt(theme.neutral)}</dd></div>
        <div className="flex gap-1"><dt>Negative</dt><dd className="font-medium text-foreground">{fmtInt(theme.negative)}</dd></div>
      </dl>
    </li>
  )
}

/**
 * Review themes for the selected period: how many reviews mention each topic
 * and how those reviews felt. A review can count toward several themes.
 */
export default function ReviewThemes({ themes, periodTotal, onRetry }) {
  const [sort, setSort] = useState('mentioned')
  const items = useMemo(() => (themes ? sortThemes(themes.items, sort) : []), [themes, sort])

  let body
  if (periodTotal === 0) {
    body = <EmptyBody message="No review insights available for this period." height="min-h-48" />
  } else if (!themes) {
    body = (
      <div className="min-h-48 flex flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
        Unable to load review insights.
        {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>}
      </div>
    )
  } else if (themes.status !== 'ok') {
    body = <EmptyBody message="No recurring themes found for this period." height="min-h-48" />
  } else {
    body = (
      <ul className="grid grid-cols-1 gap-3 @min-[560px]/main:grid-cols-2 @min-[1100px]/main:grid-cols-3" aria-label="Review themes">
        {items.map((t) => <ThemeCard key={t.id} theme={t} />)}
      </ul>
    )
  }

  const baseline = themes?.baseline
  return (
    <AnalyticsCard
      title="Review Themes"
      subtitle={
        themes?.status === 'ok' && baseline
          ? `Topics customers mention · overall ${fmtPercent(baseline.positivePercent)} positive, ${fmtPercent(baseline.negativePercent)} negative`
          : 'Topics customers mention and how they feel about them'
      }
      actions={<AnalyticsDateRange />}
    >
      {themes?.status === 'ok' && periodTotal > 0 && (
        <Tabs value={sort} onValueChange={setSort}>
          <TabsList aria-label="Sort themes">
            {THEME_SORTS.map((s) => <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      )}
      {body}
    </AnalyticsCard>
  )
}

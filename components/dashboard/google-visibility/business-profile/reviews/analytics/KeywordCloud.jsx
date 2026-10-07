"use client"

import { memo, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import AnalyticsCard, { EmptyBody } from './AnalyticsCard'
import AnalyticsDateRange from './AnalyticsDateRange'
import { layoutWordCloud } from '@/lib/wordCloudLayout'
import { SENTIMENT_COLORS, CLOUD_COLORS, fmtInt, fmtPercent } from './analyticsFormat'

const CLOUD_WORDS = 80
const CHIPS = 32
const CANVAS = { width: 800, height: 360 }

/** Dot colour by how the reviews mentioning a term felt (same sentiment rules as the dashboard). */
export function keywordTone(item) {
  const n = item.reviewCount || 1
  if (item.negative / n >= 0.25) return 'negative'
  if ((item.negative + item.neutral) / n >= 0.25) return 'mixed'
  return 'positive'
}
const TONE_COLOR = { positive: SENTIMENT_COLORS.positive, mixed: SENTIMENT_COLORS.neutral, negative: SENTIMENT_COLORS.negative }
const TONE_LABEL = { positive: 'Mostly positive', mixed: 'Mixed', negative: 'Many negative' }

/** Font size (px) for the small-screen tag cloud, sqrt-scaled so a few giants don't flatten the rest. */
export function cloudFontSize(score, min, max) {
  if (max === min) return 20
  const t = (Math.sqrt(score) - Math.sqrt(min)) / (Math.sqrt(max) - Math.sqrt(min))
  return Math.round(13 + t * 15)
}

export function SentimentBar({ item, className = 'h-2' }) {
  const n = item.reviewCount || 1
  const seg = (v, color, label) => v > 0 && (
    <span key={label} title={`${label}: ${v}`} style={{ width: `${(v / n) * 100}%`, background: color }} />
  )
  return (
    <span className={`flex w-full overflow-hidden rounded-full bg-muted ${className}`} aria-hidden="true">
      {seg(item.positive, SENTIMENT_COLORS.positive, 'Positive')}
      {seg(item.neutral, SENTIMENT_COLORS.neutral, 'Neutral')}
      {seg(item.negative, SENTIMENT_COLORS.negative, 'Negative')}
    </span>
  )
}

function KeywordDetailDialog({ item, open, onOpenChange }) {
  if (!item) return null
  const rows = [
    ['Positive', item.positive, SENTIMENT_COLORS.positive],
    ['Neutral', item.neutral, SENTIMENT_COLORS.neutral],
    ['Negative', item.negative, SENTIMENT_COLORS.negative],
  ]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="break-words">“{item.term}”</DialogTitle>
          <DialogDescription>
            Mentioned in {fmtInt(item.reviewCount)} {item.reviewCount === 1 ? 'review' : 'reviews'} ({fmtPercent(item.percentage)} of reviews with text)
            {item.mentions > item.reviewCount ? ` · ${fmtInt(item.mentions)} mentions in total` : ''}
          </DialogDescription>
        </DialogHeader>
        <SentimentBar item={item} className="h-2.5" />
        <dl className="grid grid-cols-3 gap-2 text-center">
          {rows.map(([label, value, color]) => (
            <div key={label} className="rounded-lg border p-2.5">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}
              </dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">{fmtInt(value)}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}

/** Words and phrases together, most-mentioned first (the reference mixes both in its chips). */
export function mergeKeywordItems(keywords) {
  return [...keywords.words, ...keywords.phrases]
    .sort((a, b) => b.reviewCount - a.reviewCount || b.score - a.score || a.term.localeCompare(b.term))
}

/**
 * "Keyword Cloud": a packed word cloud on the left (size = how many reviews
 * mention the term) and the exact counts as chips on the right. The chips are
 * the accessible / keyboard interface; the cloud is a decorative, clickable
 * rendering of the same data. All terms come from the backend's deterministic
 * extraction - nothing is tokenized in the browser.
 */
function KeywordCloud({ keywords, periodTotal, onRetry }) {
  const [selected, setSelected] = useState(null)
  const items = useMemo(() => (keywords ? mergeKeywordItems(keywords) : []), [keywords])
  const cloud = useMemo(
    () => layoutWordCloud(items.slice(0, CLOUD_WORDS).map((i) => ({ term: i.term, weight: i.reviewCount })), CANVAS),
    [items]
  )
  const byTerm = useMemo(() => new Map(items.map((i) => [i.term, i])), [items])
  const scores = items.slice(0, CLOUD_WORDS).map((i) => i.reviewCount)
  const [minW, maxW] = [Math.min(...scores), Math.max(...scores)]

  let body
  if (periodTotal === 0) {
    body = <EmptyBody message="No review insights available for this period." height="min-h-72" />
  } else if (!keywords) {
    body = (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
        Unable to load review insights.
        {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>}
      </div>
    )
  } else if (keywords.status !== 'ok' || items.length === 0) {
    body = <EmptyBody message="Not enough review text to identify keywords." height="min-h-72" />
  } else {
    body = (
      <div className="grid grid-cols-1 gap-6 @min-[880px]/main:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] @min-[880px]/main:gap-8">
        <div className="min-w-0">
          {/* larger screens: packed cloud */}
          <svg viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`} className="hidden h-auto w-full @min-[700px]/main:block" aria-hidden="true" data-testid="word-cloud">
            {cloud.map((w) => (
              <text
                key={w.term}
                x={w.x} y={w.y}
                fontSize={w.fontSize}
                fontWeight={600}
                fill={CLOUD_COLORS[w.index % CLOUD_COLORS.length]}
                textAnchor="middle"
                dominantBaseline="central"
                transform={w.vertical ? `rotate(-90 ${w.x} ${w.y})` : undefined}
                className="cursor-pointer transition-opacity hover:opacity-70"
                onClick={() => setSelected(byTerm.get(w.term))}
              >
                {w.term}
              </text>
            ))}
          </svg>
          {/* small screens: wrapped tags (a packed cloud would be unreadably small) */}
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 @min-[700px]/main:hidden" aria-hidden="true" data-testid="word-cloud-compact">
            {items.slice(0, 28).map((i, idx) => (
              <li key={i.term}>
                <button type="button" tabIndex={-1} onClick={() => setSelected(i)} className="font-semibold leading-tight" style={{ fontSize: cloudFontSize(i.reviewCount, minW, maxW), color: CLOUD_COLORS[idx % CLOUD_COLORS.length] }}>
                  {i.term}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <ul className="flex flex-wrap gap-2.5" aria-label="Keyword counts">
            {items.slice(0, CHIPS).map((i) => (
              <li key={i.term}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-label={`${i.term}, ${i.reviewCount} reviews`}
                  title={`${TONE_LABEL[keywordTone(i)]} · ${fmtPercent(i.percentage)} of reviews with text`}
                  className="flex items-center gap-1.5 rounded-[10px] border border-[#cfd9ec] bg-card px-3 py-1.5 text-[15px] text-[#3b4660] outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring dark:border-border dark:text-muted-foreground"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: TONE_COLOR[keywordTone(i)] }} aria-hidden="true" />
                  <span>{i.term}:</span>
                  <b className="font-bold text-[#1b2540] dark:text-foreground">{fmtInt(i.reviewCount)}</b>
                </button>
              </li>
            ))}
          </ul>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground" aria-label="Colour legend">
            {Object.keys(TONE_COLOR).map((t) => (
              <li key={t} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: TONE_COLOR[t] }} />{TONE_LABEL[t]}</li>
            ))}
            <li>Size = how many reviews mention it</li>
          </ul>
        </div>
      </div>
    )
  }

  const excluded = keywords?.basis?.excludedBrandTerms || []
  return (
    <AnalyticsCard title="Keyword Cloud" actions={<AnalyticsDateRange />}>
      {body}
      {excluded.length > 0 && keywords?.status === 'ok' && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Your business name ({excluded.join(', ')}) is left out - it appears in most reviews and says nothing about what customers talk about.
        </p>
      )}
      <KeywordDetailDialog item={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </AnalyticsCard>
  )
}

export default memo(KeywordCloud)

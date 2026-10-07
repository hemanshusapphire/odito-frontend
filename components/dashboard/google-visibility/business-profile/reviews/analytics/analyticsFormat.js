/** Shared constants + formatters for the Reviews analytics modules. */

export const DEFAULT_RANGE = '90d'

export const RANGE_OPTIONS = [
  { value: '7d', label: '7D', long: 'Last 7 days' },
  { value: '30d', label: '30D', long: 'Last 30 days' },
  { value: '90d', label: '90D', long: 'Last 90 days' },
  { value: '6m', label: '6M', long: 'Last 6 months' },
  { value: '12m', label: '12M', long: 'Last 12 months' },
]
export const isRangeKey = (v) => RANGE_OPTIONS.some((o) => o.value === v)
export const rangeLongLabel = (key) => RANGE_OPTIONS.find((o) => o.value === key)?.long || 'Selected period'

// Palette lifted from the reference dashboard (restrained blue / green / amber / red + a navy accent).
export const NAVY = '#1f2a7a'
export const SENTIMENT_COLORS = { positive: '#2da44e', neutral: '#f5a60a', negative: '#e5393b' }
/** Star colours for the stacked chart + distribution bars (1 = red ... 5 = green) and their pale tracks. */
export const STAR_COLORS = { 5: '#27b04f', 4: '#fbab06', 3: '#2f8ff0', 2: '#a07cf5', 1: '#d62b30' }
export const GOLD = '#f6b01e'
export const TEXT_COLORS = { withText: '#3399ee', withoutText: '#2faa4f' }
export const RATING_COLOR = '#f59e0b'
export const BAR_COLOR = '#3b82f6'
/** Categorical palette for the keyword cloud (viridis-like, as in the reference). */
export const CLOUD_COLORS = ['#46327e', '#365c8d', '#277f8e', '#1fa187', '#4ac16d', '#a0da39', '#3b528b', '#21908d']

export const fmtInt = (n) => (typeof n === 'number' ? n.toLocaleString() : '—')
export const fmtRating = (r) => (typeof r === 'number' ? r.toFixed(1) : '—')
/** 99.43 -> "99.4%" */
export const fmtPercent = (p) => (typeof p === 'number' ? `${(Math.round(p * 10) / 10).toFixed(1)}%` : '—')

// Bucket keys are plain 'YYYY-MM-DD' calendar dates in the viewer's timezone;
// parse them as local dates so no timezone shift can move the label by a day.
const parseKey = (key) => new Date(`${key}T00:00:00`)

/** dd/mm/yyyy axis label for day/week buckets, "Oct 2026" for months (as in the reference). */
export function formatAxisDate(bucket, unit) {
  if (!bucket) return ''
  const [y, m, d] = bucket.split('-')
  if (unit === 'month') return parseKey(bucket).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return `${d}/${m}/${y}`
}

/** "Jul 10 – Oct 7" span shown inside the active range chip. */
export function formatRangeSpan(startDate, endDate) {
  if (!startDate || !endDate) return ''
  const f = (k) => parseKey(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${f(startDate)} – ${f(endDate)}`
}

/** 99.4 -> "99.4"; 15 -> "15"; 350.0 -> "350" (no trailing zeros, like the reference table). */
export const trimNumber = (n, digits = 2) => (typeof n === 'number' && Number.isFinite(n) ? String(Number(n.toFixed(digits))) : '—')

/** Net sentiment = % positive - % negative (-100..100). A readable summary of the three shares, not an NPS survey. */
export function netSentiment(period) {
  if (!period || !period.total) return null
  return Math.round((period.positivePercent - period.negativePercent) * 100) / 100
}

/** The sentiment class holding the most reviews (ties favour positive, then neutral). */
export function dominantSentiment(period) {
  if (!period || !period.total) return null
  const { positive, neutral, negative } = period
  if (positive >= neutral && positive >= negative) return 'positive'
  return neutral >= negative ? 'neutral' : 'negative'
}

/** Short axis label. */
export function formatBucketTick(bucket, unit) {
  const d = parseKey(bucket)
  if (Number.isNaN(d.getTime())) return bucket
  if (unit === 'month') return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Full tooltip title. */
export function formatBucketTitle(bucket, unit) {
  const d = parseKey(bucket)
  if (Number.isNaN(d.getTime())) return bucket
  if (unit === 'month') return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const day = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return unit === 'week' ? `Week of ${day}` : day
}

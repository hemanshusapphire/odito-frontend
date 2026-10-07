/**
 * Display helpers for the MoM / YoY Period Comparison. The backend decides what
 * changed and whether it is good or bad (`trend`, `assessment`); this file only
 * turns that into text, units and accessible labels.
 */

/** Metrics grouped for the table (keys match the API's comparison.*.metrics). */
export const COMPARISON_GROUPS = [
  { title: 'Review performance', keys: ['totalReviews', 'averageRating', 'responseRate', 'withText', 'withoutText'] },
  { title: 'Responses', keys: ['responded', 'notResponded'] },
  { title: 'Sentiment', keys: ['positive', 'neutral', 'negative'] },
  { title: 'Rating distribution', keys: ['fiveStar', 'fourStar', 'threeStar', 'twoStar', 'oneStar'] },
]

export const COMPARISON_KINDS = [
  { value: 'mom', label: 'MoM', long: 'Month over month', earlier: 'a month earlier' },
  { value: 'yoy', label: 'YoY', long: 'Year over year', earlier: 'a year earlier' },
]

const parseKey = (key) => new Date(`${key}T00:00:00`) // calendar date, never timezone-shifted
// Pinned to en-US: the dashboard copy is English, and period labels must read the same everywhere
// ("Sep 8 – Oct 7, 2026"), not flip day/month order with the browser locale.
const fmt = (key, opts) => parseKey(key).toLocaleDateString('en-US', opts)

/** "October 2026" | "2026" | "October 1–7, 2026" | "Sep 8 – Oct 7, 2026" | "Oct 8, 2025 – Oct 7, 2026" */
export function formatPeriod(period) {
  if (!period) return ''
  const { startDate: s, endDate: e, kind } = period
  if (kind === 'calendar_month') return fmt(s, { month: 'long', year: 'numeric' })
  if (kind === 'calendar_year') return fmt(s, { year: 'numeric' })
  const [sy, sm] = [s.slice(0, 4), s.slice(5, 7)]
  const [ey, em] = [e.slice(0, 4), e.slice(5, 7)]
  if (s === e) return fmt(s, { month: 'long', day: 'numeric', year: 'numeric' })
  if (sy === ey && sm === em) return `${fmt(s, { month: 'long' })} ${parseKey(s).getDate()}–${parseKey(e).getDate()}, ${sy}`
  if (sy === ey) return `${fmt(s, { month: 'short', day: 'numeric' })} – ${fmt(e, { month: 'short', day: 'numeric' })}, ${sy}`
  return `${fmt(s, { month: 'short', day: 'numeric', year: 'numeric' })} – ${fmt(e, { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export const formatDay = (key) => (key ? fmt(key, { month: 'long', day: 'numeric', year: 'numeric' }) : '')
export const formatShortDay = (key) => (key ? fmt(key, { month: 'short', day: 'numeric' }) : '')

/** The value shown in the Current / Previous columns. */
export function formatValue(metric, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  if (metric.kind === 'rate') return `${value.toFixed(2)}%`
  if (metric.kind === 'rating') return value.toFixed(2)
  return value.toLocaleString()
}

const signed = (n, text) => (n > 0 ? `+${text}` : n < 0 ? `-${text}` : text)

/**
 * The Change column. `unit` makes percentage POINTS ("pp") impossible to
 * confuse with a percentage change ("%").
 * @returns {{ text:string, secondary:string|null, trend:'up'|'down'|'flat'|'none', assessment:string, sr:string }}
 */
export function formatChange(metric) {
  const none = (text, secondary, sr) => ({ text, secondary, trend: 'none', assessment: 'neutral', sr })
  if (metric.status === 'incomparable') return none('Not comparable', 'Metric rules changed', `${metric.label}: not comparable because the metric definition changed`)
  if (metric.status !== 'ok') return none('—', 'Not available', `${metric.label}: change not available`)

  const verdict = { improved: 'improvement', worsened: 'worse', neutral: 'neutral change', unchanged: 'no change' }[metric.assessment]
  const move = metric.trend === 'up' ? 'increased' : metric.trend === 'down' ? 'decreased' : 'did not change'

  if (metric.kind === 'rate') {
    const pp = metric.percentagePointChange
    const text = pp === 0 ? '0.00 pp' : `${signed(pp, Math.abs(pp).toFixed(2))} pp`
    return { text, secondary: null, trend: metric.trend, assessment: metric.assessment, sr: `${metric.label} ${move}${pp === 0 ? '' : ` by ${Math.abs(pp).toFixed(2)} percentage points`}, ${verdict}` }
  }

  const abs = metric.absoluteChange
  const base = metric.kind === 'rating' ? Math.abs(abs).toFixed(2) : Math.abs(abs).toLocaleString()
  const unit = metric.kind === 'rating' ? ' ★' : ''
  const text = abs === 0 ? `0${unit}` : `${signed(abs, base)}${unit}`
  let secondary = null
  let srPct = ''
  if (metric.percentageChangeState === 'new') { secondary = 'New'; srPct = ' (new, previously zero)' }
  else if (typeof metric.percentageChange === 'number' && abs !== 0) {
    secondary = `${signed(metric.percentageChange, `${Math.abs(metric.percentageChange).toFixed(2)}%`)}`
    srPct = ` (${Math.abs(metric.percentageChange).toFixed(2)} percent)`
  }
  return { text, secondary, trend: metric.trend, assessment: metric.assessment, sr: `${metric.label} ${move}${abs === 0 ? '' : ` by ${base}${metric.kind === 'rating' ? ' stars' : ''}${srPct}`}, ${verdict}` }
}

/** Human reason for each blocker the API reports. */
export function blockerText(blocker, rules, partName, period) {
  const who = blocker.period === 'current' ? 'the current period' : 'the previous period'
  if (blocker.code === 'no_snapshots') return `No daily snapshots were recorded in ${who} (${partName}).`
  if (blocker.code === 'low_coverage') return `${who[0].toUpperCase()}${who.slice(1)} (${partName}) has ${period.coverage.snapshotDays} of ${period.coverage.expectedDays} daily snapshots; at least ${rules.minCoveragePercent}% is needed.`
  if (blocker.code === 'stale_end_snapshot') return `The latest snapshot in ${who} (${partName}) is ${period.coverage.endGapDays} days before the period ends.`
  return ''
}

/** Rows in the order of the reference table, then the remaining metrics (kept from the earlier comparison). */
export const COMPARISON_ROWS = [
  'totalReviews', 'oneStar', 'twoStar', 'threeStar', 'fourStar', 'fiveStar', 'withText', 'withoutText', 'responded', 'notResponded',
  'averageRating', 'responseRate', 'positive', 'neutral', 'negative',
]
export const COMPARISON_ROW_LABELS = {
  totalReviews: 'Total Reviews', oneStar: '1 Star', twoStar: '2 Star', threeStar: '3 Star', fourStar: '4 Star', fiveStar: '5 Star',
  withText: 'With Text', withoutText: 'Without Text', responded: 'Responded', notResponded: 'Non-Responded',
  averageRating: 'Average Rating', responseRate: 'Response Rate', positive: 'Positive', neutral: 'Neutral', negative: 'Negative',
}

const trim2 = (n) => String(Number(Math.abs(n).toFixed(2)))
const sign = (n) => (n > 0 ? '+' : n < 0 ? '-' : '')

/**
 * Reference-style change cell: the PERCENT change is the headline ("-16.35 %");
 * rates show percentage POINTS ("+0.92 pp") because a rate's percent-of-a-percent
 * would mislead. The absolute change rides along as the secondary figure.
 * @returns {{ primary:string, secondary:string|null, trend:string, assessment:string, sr:string }}
 */
export function formatChangeCompact(metric) {
  const full = formatChange(metric)
  if (metric.status !== 'ok') return { primary: metric.status === 'incomparable' ? 'Not comparable' : '--', secondary: null, trend: 'none', assessment: 'neutral', sr: full.sr }

  if (metric.kind === 'rate') {
    const pp = metric.percentagePointChange
    return { primary: `${sign(pp)}${trim2(pp)} pp`, secondary: null, trend: metric.trend, assessment: metric.assessment, sr: full.sr }
  }
  const abs = metric.absoluteChange
  const absText = abs === 0 ? '0' : `${sign(abs)}${metric.kind === 'rating' ? trim2(abs) : Math.abs(abs).toLocaleString()}${metric.kind === 'rating' ? ' ★' : ''}`
  let primary
  if (metric.percentageChangeState === 'new') primary = 'New'
  else if (typeof metric.percentageChange === 'number') primary = `${sign(metric.percentageChange)}${trim2(metric.percentageChange)} %`
  else primary = '--'
  return { primary, secondary: absText, trend: metric.trend, assessment: metric.assessment, sr: full.sr }
}

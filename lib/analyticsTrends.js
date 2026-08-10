/**
 * Derives Hero KPI trend/sparkline data and Today's Summary from a single
 * GET /analytics/trends response ({ series, totals }) - mirrors
 * lib/businessProfileTrends.js's buildKpisFromTrends exactly (same
 * half-vs-half trend formula, same "not a Google-provided figure"
 * caveat), applied to GA4 metrics instead of Business Profile Performance
 * API metrics. The backend deliberately returns only raw series/totals
 * (see analyticsMapper.js's toTrendsSeries doc comment) - trend arrows are
 * a display concern computed here, not baked into the API contract.
 */

import { formatDuration, formatPercent } from './analyticsChartConfig'

const KPI_CONFIG = [
  { key: 'users', label: 'Users', icon: 'users', color: 'blue' },
  { key: 'newUsers', label: 'New Users', icon: 'userPlus', color: 'teal' },
  { key: 'sessions', label: 'Sessions', icon: 'activity', color: 'violet' },
  { key: 'engagedSessions', label: 'Engaged Sessions', icon: 'click', color: 'amber' },
  { key: 'views', label: 'Views', icon: 'eye', color: 'emerald' },
  { key: 'avgEngagementTime', label: 'Avg. Engagement Time', icon: 'clock', color: 'pink', isDuration: true },
  { key: 'bounceRate', label: 'Bounce Rate', icon: 'logOut', color: 'cyan', isPercent: true, invertTrend: true },
  { key: 'conversions', label: 'Conversions', icon: 'target', color: 'slate' },
]

function sumRange(series, key, from, to) {
  let total = 0
  for (let i = from; i < to; i++) total += series[i]?.[key] || 0
  return total
}

/** KPI grid + Traffic Trends chart sparklines, derived from one trends fetch. */
export function buildAnalyticsKpisFromTrends(trendsData) {
  if (!trendsData?.series?.length) return []
  const { series, totals } = trendsData
  const mid = Math.floor(series.length / 2)

  return KPI_CONFIG.map(({ key, label, icon, color, isDuration, isPercent, invertTrend }) => {
    const firstHalf = sumRange(series, key, 0, mid)
    const secondHalf = sumRange(series, key, mid, series.length)
    const trend = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 1000) / 10 : (secondHalf > 0 ? 100 : 0)

    const rawValue = totals?.[key] ?? 0
    const value = isDuration ? formatDuration(rawValue) : isPercent ? formatPercent(rawValue) : rawValue.toLocaleString()

    return {
      key,
      label,
      icon,
      color,
      value,
      trend,
      trendDirection: trend >= 0 ? 'up' : 'down',
      invertTrend,
      vsLabel: 'vs previous period',
      spark: series.map((row) => row[key] || 0),
    }
  })
}

/**
 * Today's Summary - the most recent day in the fetched series, not a
 * separate fetch. GA4 standard reports have inherent processing latency of
 * a few hours, so this can lag true real-time activity - a known GA4
 * characteristic (see the Phase 1 forensic report), not an Odito bug.
 */
export function buildTodaySummaryFromTrends(trendsData) {
  const last = trendsData?.series?.[trendsData.series.length - 1]
  if (!last) return []
  return [
    { key: 'users', label: 'Users today', value: last.users.toLocaleString() },
    { key: 'sessions', label: 'Sessions today', value: last.sessions.toLocaleString() },
    { key: 'conversions', label: 'Conversions today', value: last.conversions.toLocaleString() },
  ]
}

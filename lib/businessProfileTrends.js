/**
 * Derives the Performance KPI grid + trend-chart series config from a single
 * GET /business-profile/trends response ({ range, series, totals }) -
 * avoids a second Google API call just to power the KPI cards.
 *
 * "Trend" per KPI is a real, purely-arithmetic comparison of the fetched
 * series' second half vs its first half (no extra fetch, no AI/prediction) -
 * a lightweight proxy for period-over-period change, not a Google-provided
 * figure. Documented as such in the implementation report.
 */

const METRIC_CONFIG = [
  { key: 'search', label: 'Search Views', icon: 'search' },
  { key: 'maps', label: 'Maps Views', icon: 'mapPin' },
  { key: 'clicks', label: 'Website Clicks', icon: 'globe' },
  { key: 'calls', label: 'Phone Calls', icon: 'phone' },
  { key: 'directions', label: 'Direction Requests', icon: 'navigation' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar' },
]

export const trendSeriesConfig = [
  { key: 'search', label: 'Search Views', color: '#3b82f6' },
  { key: 'maps', label: 'Maps Views', color: '#14b8a6' },
  { key: 'clicks', label: 'Website Clicks', color: '#8b5cf6' },
  { key: 'calls', label: 'Calls', color: '#f59e0b' },
  { key: 'directions', label: 'Directions', color: '#10b981' },
  { key: 'bookings', label: 'Bookings', color: '#ec4899' },
]

function sumRange(series, key, from, to) {
  let total = 0
  for (let i = from; i < to; i++) total += series[i]?.[key] || 0
  return total
}

const ACTION_CONFIG = [
  { key: 'clicks', label: 'Website Clicks', color: '#3b82f6' },
  { key: 'calls', label: 'Calls', color: '#14b8a6' },
  { key: 'directions', label: 'Directions', color: '#8b5cf6' },
  { key: 'bookings', label: 'Bookings', color: '#f59e0b' },
]

/** "Customer Actions" donut breakdown - clicks/calls/directions/bookings only (not views), from the same trends totals. */
export function buildCustomerActionsFromTrends(trendsData) {
  if (!trendsData?.totals) return null
  const { totals } = trendsData

  const breakdown = ACTION_CONFIG.map(({ key, label, color }) => ({
    key, label, color, value: totals[key] ?? 0,
  }))
  const total = breakdown.reduce((sum, b) => sum + b.value, 0)

  return { total, breakdown }
}

export function buildKpisFromTrends(trendsData) {
  if (!trendsData?.series?.length) return []
  const { series, totals } = trendsData
  const mid = Math.floor(series.length / 2)

  return METRIC_CONFIG.map(({ key, label, icon }) => {
    const firstHalf = sumRange(series, key, 0, mid)
    const secondHalf = sumRange(series, key, mid, series.length)
    const trend = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 1000) / 10 : (secondHalf > 0 ? 100 : 0)

    return {
      key,
      label,
      icon,
      value: totals?.[key] ?? 0,
      trend,
      trendDirection: trend >= 0 ? 'up' : 'down',
      spark: series.map((row) => row[key] || 0),
    }
  })
}

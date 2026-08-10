/**
 * Derives the Performance KPI grid + trend-chart series config from a single
 * GET /search-console/trends response ({ series }) - avoids computing two
 * different notions of "clicks this period" from two separate endpoints
 * (the page-level /data summary is scoped to whatever date filter it was
 * called with, which may not match the chart's selected range). KPI values
 * are summed directly from the same daily series the chart renders, so the
 * headline numbers always agree with what's plotted.
 *
 * "Trend" per KPI is a real, purely-arithmetic comparison of the fetched
 * series' second half vs its first half (no extra fetch, no AI/prediction) -
 * same convention as lib/businessProfileTrends.js.
 */

export const trendSeriesConfig = [
  { key: 'clicks', label: 'Clicks', color: '#5b7fff' },
  { key: 'impressions', label: 'Impressions', color: '#22d3c7' },
  { key: 'ctr', label: 'CTR', color: '#8b7cf6' },
  { key: 'position', label: 'Avg. Position', color: '#f59e0b' },
]

const KPI_CONFIG = [
  { key: 'clicks', label: 'Total Clicks', icon: 'search' },
  { key: 'impressions', label: 'Total Impressions', icon: 'eye' },
  { key: 'ctr', label: 'Average CTR', icon: 'trendingUp', isPercent: true },
  { key: 'position', label: 'Average Position', icon: 'target', isDecimal: true, invert: true },
]

function sumRange(series, key, from, to) {
  let total = 0
  for (let i = from; i < to; i++) total += series[i]?.[key] || 0
  return total
}

/** Impression-weighted mean position across a slice of the series (falls back to a simple mean if there are no impressions). */
function weightedAvgPosition(series, from, to) {
  let weightedSum = 0
  let totalImpressions = 0
  for (let i = from; i < to; i++) {
    const row = series[i]
    if (!row) continue
    weightedSum += (row.position || 0) * (row.impressions || 0)
    totalImpressions += row.impressions || 0
  }
  if (totalImpressions > 0) return weightedSum / totalImpressions
  const slice = series.slice(from, to)
  return slice.length ? slice.reduce((sum, r) => sum + (r.position || 0), 0) / slice.length : 0
}

/**
 * Build the 4 real KPI cards (Clicks, Impressions, CTR, Avg. Position) from
 * a daily trend series. Returns [] until the series has data.
 */
export function buildKpisFromSeries(series) {
  if (!series?.length) return []
  const mid = Math.floor(series.length / 2)

  return KPI_CONFIG.map(({ key, label, icon, isPercent, isDecimal, invert }) => {
    let firstHalf, secondHalf, value

    if (key === 'ctr') {
      const firstClicks = sumRange(series, 'clicks', 0, mid)
      const firstImpr = sumRange(series, 'impressions', 0, mid)
      const secondClicks = sumRange(series, 'clicks', mid, series.length)
      const secondImpr = sumRange(series, 'impressions', mid, series.length)
      firstHalf = firstImpr > 0 ? firstClicks / firstImpr : 0
      secondHalf = secondImpr > 0 ? secondClicks / secondImpr : 0
      const totalClicks = sumRange(series, 'clicks', 0, series.length)
      const totalImpr = sumRange(series, 'impressions', 0, series.length)
      value = totalImpr > 0 ? totalClicks / totalImpr : 0
    } else if (key === 'position') {
      firstHalf = weightedAvgPosition(series, 0, mid)
      secondHalf = weightedAvgPosition(series, mid, series.length)
      value = weightedAvgPosition(series, 0, series.length)
    } else {
      firstHalf = sumRange(series, key, 0, mid)
      secondHalf = sumRange(series, key, mid, series.length)
      value = sumRange(series, key, 0, series.length)
    }

    let trend = firstHalf > 0
      ? Math.round(((secondHalf - firstHalf) / firstHalf) * 1000) / 10
      : (secondHalf > 0 ? 100 : 0)

    // Position is "good" when it goes down (closer to #1), so a falling
    // value should read as an "up"/positive trend - invert the sign only
    // for direction/color, not for the displayed number itself.
    const trendDirection = invert ? (trend <= 0 ? 'up' : 'down') : (trend >= 0 ? 'up' : 'down')

    return {
      key,
      label,
      icon,
      value,
      trend,
      trendDirection,
      isPercent,
      isDecimal,
      spark: series.map((row) => row[key] || 0),
    }
  })
}

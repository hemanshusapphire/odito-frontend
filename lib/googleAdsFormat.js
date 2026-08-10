/**
 * Shared formatting helpers for the Google Ads dashboard
 * (components/dashboard/google-visibility/google-ads/**), Phase 7.2.
 *
 * Every card renders real numbers from the backend now (googleAdsController.js) -
 * this is the one place those numbers get turned into display strings, so no
 * two cards format the same field differently and no formatting logic is
 * duplicated across 13+ components.
 */

const RANGE_LABELS = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  '12m': 'Last 12 Months',
  all: 'All Time',
}

/** Human label for a GoogleAdsDateRangeSelector value - 'custom' reads its own start/end, every other preset is a fixed string. */
export function formatRangeLabel(dateRange) {
  if (!dateRange) return RANGE_LABELS['30d']
  if (dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate) {
    return `${dateRange.startDate} to ${dateRange.endDate}`
  }
  return RANGE_LABELS[dateRange.preset] || RANGE_LABELS['30d']
}

// Last-resort only - used when the connected account's real currency is
// genuinely unavailable (never set, or a corrupted/invalid ISO 4217 code).
// Every real call path should be passing a currencyCode sourced from the
// connection (see GoogleAdsCurrencyContext) - this is not "the default
// currency", it's "what we show rather than crash or omit a symbol".
const FALLBACK_CURRENCY = 'USD'

/**
 * THE single currency formatter for the entire Google Ads module - no
 * component should ever prefix a number with a literal '$' or any other
 * hardcoded symbol. `currencyCode` must be the connected Google Ads
 * account's real ISO 4217 code (see GoogleAdsCurrencyContext /
 * useGoogleAdsCurrencyFormatter - every component gets this for free by
 * being inside GoogleAdsCurrencyProvider, no manual prop threading needed).
 * Never infers a currency from the browser's locale - `undefined` is passed
 * as the Intl locale argument specifically so the user's OWN locale still
 * controls digit grouping/decimal punctuation (1,234.56 vs 1.234,56), while
 * `currency` alone controls which symbol and how many decimals are natural
 * for it (e.g. 0 for JPY, 2 for USD/INR/EUR) - exactly matching how Google
 * Ads' own UI renders money.
 */
export function formatGoogleAdsCurrency(amount, currencyCode, { digits } = {}) {
  const value = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0
  const code = currencyCode || FALLBACK_CURRENCY
  const options = { style: 'currency', currency: code }
  if (digits != null) {
    options.minimumFractionDigits = digits
    options.maximumFractionDigits = digits
  }
  try {
    return new Intl.NumberFormat(undefined, options).format(value)
  } catch {
    // Intl throws synchronously on a currency code that isn't valid ISO
    // 4217 (e.g. a corrupted sync value) - degrade to the fallback currency
    // rather than crashing the whole card.
    return new Intl.NumberFormat(undefined, { ...options, currency: FALLBACK_CURRENCY }).format(value)
  }
}

/** Same formatter, forced to 2 decimal places - for per-unit values (Avg CPC, Cost/Conversion) where whole-currency rounding would hide real differences. */
export function formatGoogleAdsCurrencyPrecise(amount, currencyCode) {
  return formatGoogleAdsCurrency(amount, currencyCode, { digits: 2 })
}

export function formatNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0'
  return value.toLocaleString()
}

export function formatPercent(value, digits = 1) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0%'
  return `${value.toFixed(digits)}%`
}

export function formatMultiplier(value, digits = 1) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return `${value.toFixed(digits)}x`
}

/** true once a metrics-shaped object has at least one non-zero counting field - used to tell "real zero" apart from "nothing synced yet" is NOT this function's job (that's row presence), only "is this row worth rendering vs collapsing". */
export function hasActivity(metrics) {
  if (!metrics) return false
  return (metrics.impressions || 0) > 0 || (metrics.clicks || 0) > 0 || (metrics.cost || 0) > 0 || (metrics.conversions || 0) > 0
}

export const DEVICE_LABELS = {
  DESKTOP: 'Desktop',
  MOBILE: 'Mobile',
  TABLET: 'Tablet',
  CONNECTED_TV: 'Connected TV',
  OTHER: 'Other',
  UNSPECIFIED: 'Other',
  UNKNOWN: 'Other',
}

export function deviceLabel(device) {
  return DEVICE_LABELS[device] || (device ? device.charAt(0) + device.slice(1).toLowerCase() : 'Other')
}

/** Simple, honest CTR-based performance tier - computed FROM this row's own real ctr, never a fabricated rating. */
export function ctrPerformanceTier(ctr) {
  if (typeof ctr !== 'number' || Number.isNaN(ctr)) return null
  if (ctr >= 4) return 'excellent'
  if (ctr >= 2) return 'good'
  if (ctr >= 1) return 'average'
  return 'poor'
}

const RECOMMENDATION_ACTION_LABEL = {
  Budget: 'Review Budget',
  Keywords: 'Review Keywords',
  Ads: 'Review Ads',
  Bidding: 'Review Bidding',
  Targeting: 'Review Targeting',
  Extensions: 'Review Extensions',
  Tracking: 'Review Tracking',
}

export function recommendationActionLabel(category) {
  return RECOMMENDATION_ACTION_LABEL[category] || 'Review'
}

export function optimizationScoreLabel(scorePercent) {
  if (typeof scorePercent !== 'number' || Number.isNaN(scorePercent)) return 'No data'
  if (scorePercent >= 80) return 'Excellent'
  if (scorePercent >= 60) return 'Good'
  if (scorePercent >= 40) return 'Fair'
  return 'Needs attention'
}

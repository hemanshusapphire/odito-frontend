/**
 * Shared color/style tokens for the Google Analytics dashboard
 * (components/dashboard/google-visibility/analytics/**).
 *
 * Reuses the exact categorical order already shipped for Business Profile's
 * trend chart and customer-actions donut (lib/businessProfileTrends.js:
 * trendSeriesConfig / ACTION_CONFIG) so the two Google Visibility pages read
 * as one design language instead of two independently-invented palettes.
 * Extend CATEGORICAL_COLORS by appending, never by reordering - reordering
 * would repaint every series already using a slot.
 */

import { Users, UserPlus, Activity, MousePointerClick, Eye, Clock, LogOut, Target } from 'lucide-react'

export const CATEGORICAL_COLORS = [
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#06b6d4', // cyan (overflow slot)
  '#64748b', // slate - reserved for "Other" / long-tail buckets, not a hue
]

export const TREND_UP_COLOR = '#10b981'
export const TREND_DOWN_COLOR = '#ef4444'

/**
 * Static class strings per color key, keyed so callers pass a name
 * ('blue' | 'teal' | ...) instead of building `bg-${color}-500/10` at
 * runtime - Tailwind's compiler only picks up class names that appear
 * literally in source, so a template-interpolated class would silently
 * never ship any styles.
 */
export const ICON_CHIP_CLASSES = {
  blue: 'bg-blue-500/10 text-blue-500',
  teal: 'bg-teal-500/10 text-teal-500',
  violet: 'bg-violet-500/10 text-violet-500',
  amber: 'bg-amber-500/10 text-amber-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  pink: 'bg-pink-500/10 text-pink-500',
  cyan: 'bg-cyan-500/10 text-cyan-500',
  slate: 'bg-slate-500/10 text-slate-500',
}

/**
 * String key -> lucide-react component, shared by AnalyticsKPICard and
 * AnalyticsStatTile so a metric's `icon` field is always a lookup key
 * (serializable, easy to author in sample/query data) rather than a raw
 * component reference passed down through props.
 */
export const METRIC_ICONS = {
  users: Users,
  userPlus: UserPlus,
  activity: Activity,
  click: MousePointerClick,
  eye: Eye,
  clock: Clock,
  logOut: LogOut,
  target: Target,
}

/**
 * Display style (icon + color key) per Conversions category label - the
 * backend (AnalyticsMapper's CONVERSION_EVENT_CATEGORIES) decides WHICH
 * category an event belongs to; this only decides how each category is
 * drawn on the Conversions stat row. Falls back to a generic icon/color
 * for "Other Conversion Events" and any future category the backend adds
 * that this map hasn't been extended for yet - never throws on an unknown
 * label.
 */
export const CONVERSION_CATEGORY_STYLE = {
  'Purchases': { icon: 'target', color: 'emerald' },
  'Leads': { icon: 'click', color: 'blue' },
  'Newsletter': { icon: 'userPlus', color: 'amber' },
  'Downloads': { icon: 'activity', color: 'teal' },
  'Form Submissions': { icon: 'eye', color: 'violet' },
  'Other Conversion Events': { icon: 'activity', color: 'slate' },
}
export const DEFAULT_CONVERSION_STYLE = { icon: 'activity', color: 'slate' }

export function formatCompactNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatPercent(value, digits = 1) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return `${value.toFixed(digits)}%`
}

export function formatDuration(totalSeconds) {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds)) return '—'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${minutes}m ${seconds}s`
}

export function formatDateTick(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

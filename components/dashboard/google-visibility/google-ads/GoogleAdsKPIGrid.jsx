"use client"

import { useMemo } from 'react'
import {
  DollarSign, MousePointerClick, Eye, Percent, Target, TrendingUp, Wallet, Award, BarChart3,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import GoogleAdsKPICard from './GoogleAdsKPICard'
import GoogleAdsCardState from './GoogleAdsCardState'
import { formatNumber, formatPercent, formatMultiplier } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

// key -> how to read the current value off GET /overview and how to derive
// a per-day sparkline point off one row of GET /trends?granularity=daily.
// Currency fields (`money`/`moneyPrecise`) are formatted below via
// useGoogleAdsCurrencyFormatter, never a hardcoded '$' - `format` here only
// covers the non-monetary metrics, which never vary by account currency.
// costPerConversion has no dedicated field in the daily series
// (getAccountDailySeries doesn't compute it - see GoogleAdsCampaignMetrics.js),
// so its spark point is derived with the exact same cost/conversions ratio
// the backend itself uses everywhere else, applied per-day instead of
// per-range - real math over real per-day numbers, not a fabricated series.
const KPI_DEFS = [
  { key: 'spend', label: 'Spend', icon: DollarSign, field: 'cost', money: true, spark: (r) => r.cost },
  { key: 'clicks', label: 'Clicks', icon: MousePointerClick, field: 'clicks', format: formatNumber, spark: (r) => r.clicks },
  { key: 'impressions', label: 'Impressions', icon: Eye, field: 'impressions', format: formatNumber, spark: (r) => r.impressions },
  { key: 'ctr', label: 'CTR', icon: TrendingUp, field: 'ctr', format: (v) => formatPercent(v, 2), spark: (r) => r.ctr },
  { key: 'avgCpc', label: 'Average CPC', icon: Target, field: 'avgCpc', money: true, moneyPrecise: true, spark: (r) => r.avgCpc },
  { key: 'conversions', label: 'Conversions', icon: Award, field: 'conversions', format: formatNumber, spark: (r) => r.conversions },
  { key: 'costPerConversion', label: 'Cost / Conversion', icon: Wallet, field: 'costPerConversion', money: true, moneyPrecise: true, spark: (r) => (r.conversions > 0 ? r.cost / r.conversions : 0) },
  { key: 'roas', label: 'ROAS', icon: Percent, field: 'roas', format: formatMultiplier, spark: (r) => r.roas },
]

/**
 * Responsive grid of the 8 Google Ads KPI tiles - built here from the real
 * GET /overview totals + GET /trends daily series (see page.jsx), instead
 * of importing a static sample array. 1 col mobile, 2 cols tablet, 4 cols
 * desktop.
 */
export default function GoogleAdsKPIGrid({ overview, dailySeries, rangeDays, status, onRetry }) {
  const { format, formatPrecise } = useGoogleAdsCurrencyFormatter()

  const kpis = useMemo(() => {
    if (!overview) return []
    return KPI_DEFS.map((def) => ({
      key: def.key,
      label: def.label,
      icon: def.icon,
      value: def.money ? (def.moneyPrecise ? formatPrecise(overview[def.field]) : format(overview[def.field])) : def.format(overview[def.field]),
      rangeDays,
      spark: (dailySeries || []).map((row) => def.spark(row)),
    }))
  }, [overview, dailySeries, rangeDays, format, formatPrecise])

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-31 rounded-xl" />)}
      </div>
    )
  }

  if (status === 'error') {
    return <GoogleAdsCardState status="error" message="Couldn't load KPI data." onRetry={onRetry} height="py-14" />
  }

  if (!overview || overview.campaignCount === 0) {
    return (
      <GoogleAdsCardState
        status="empty"
        icon={BarChart3}
        message="No campaign activity during this date range."
        height="py-14"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {kpis.map((kpi) => (
        <GoogleAdsKPICard key={kpi.key} kpi={kpi} />
      ))}
    </div>
  )
}

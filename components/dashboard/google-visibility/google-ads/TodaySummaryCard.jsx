"use client"

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Wallet, MousePointerClick, CheckCircle2 } from 'lucide-react'
import { useGoogleAdsBudget, useGoogleAdsTrends } from '@/hooks/useDashboardQueries'
import { formatNumber } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

const ROWS = [
  { key: 'spend', icon: Wallet, label: 'Spend today' },
  { key: 'clicks', icon: MousePointerClick, label: 'Clicks today' },
  { key: 'conversions', icon: CheckCircle2, label: 'Conversions today' },
]

// Fixed 7-day window regardless of the page-level date range selector -
// "today" needs the trailing week's daily series to pick a row out of, not
// whatever range (possibly 'all'/'12m') the rest of the dashboard is
// currently showing. Module-level so the object reference (and therefore
// the React Query cache key) stays stable across renders.
const SEVEN_DAY_RANGE = { preset: '7d', startDate: null, endDate: null }

/**
 * Sidebar widget: today's spend/clicks/conversions. Spend comes from
 * GET /budget/overview (todaySpend, already computed server-side); clicks/
 * conversions have no dedicated "today" endpoint, so they're read off the
 * last row of the 7-day daily trend series (GET /trends), matched against
 * today's own date - both are real per-day numbers already being summed
 * server-side, just picking out today's row instead of fabricating one.
 */
export default function TodaySummaryCard({ projectId, ready }) {
  const { format } = useGoogleAdsCurrencyFormatter()
  const budgetQuery = useGoogleAdsBudget(projectId, { enabled: !!ready })
  const trendsQuery = useGoogleAdsTrends(projectId, SEVEN_DAY_RANGE, 'daily', { enabled: !!ready })

  const todaySpend = budgetQuery.data?.data?.overview?.todaySpend

  const todayRow = useMemo(() => {
    const series = trendsQuery.data?.data?.series || []
    if (!series.length) return null
    const todayIso = new Date().toISOString().slice(0, 10)
    return series.find((row) => String(row.date).slice(0, 10) === todayIso) || null
  }, [trendsQuery.data])

  const values = {
    spend: typeof todaySpend === 'number' ? format(todaySpend) : '—',
    clicks: todayRow ? formatNumber(todayRow.clicks) : '—',
    conversions: todayRow ? formatNumber(todayRow.conversions) : '—',
  }

  const isLoading = budgetQuery.isLoading || trendsQuery.isLoading

  return (
    <Card className="p-4">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Today&apos;s Summary</div>
      <div className="flex flex-col gap-2.5 mt-3">
        {ROWS.map((row) => {
          const Icon = row.icon
          return (
            <div key={row.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {row.label}
              </div>
              <span className="font-mono font-bold text-sm text-foreground">
                {isLoading ? '…' : values[row.key]}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

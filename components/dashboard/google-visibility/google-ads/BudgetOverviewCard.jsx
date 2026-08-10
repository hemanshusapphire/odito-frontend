"use client"

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import ScoreRing from '@/components/ui/ScoreRing'
import { Wallet } from 'lucide-react'
import { useGoogleAdsBudget, useGoogleAdsBudgetForecast } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

function clampPct(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

/** Daily/monthly/forecasted spend across all active campaigns - reads GET /google-ads/budget/overview + /budget/forecast. */
export default function BudgetOverviewCard({ projectId, ready }) {
  const { format } = useGoogleAdsCurrencyFormatter()
  const budgetQuery = useGoogleAdsBudget(projectId, { enabled: !!ready })
  const forecastQuery = useGoogleAdsBudgetForecast(projectId, { enabled: !!ready })

  const overview = budgetQuery.data?.data?.overview
  const forecast = forecastQuery.data?.data

  const isLoading = budgetQuery.isLoading || forecastQuery.isLoading
  const isError = budgetQuery.isError || forecastQuery.isError
  const status = isLoading ? 'loading' : isError ? 'error' : !overview ? 'empty' : 'ready'

  if (status !== 'ready') {
    return (
      <Card className="p-6">
        <h3 className="text-sm font-semibold">Budget Overview</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Across all active campaigns</p>
        <div className="mt-4">
          <GoogleAdsCardState
            status={status}
            icon={Wallet}
            message="No budget data available yet."
            onRetry={() => { budgetQuery.refetch(); forecastQuery.refetch() }}
          />
        </div>
      </Card>
    )
  }

  const dailySpentPct = overview.dailyBudget > 0 ? clampPct((overview.todaySpend / overview.dailyBudget) * 100) : 0
  const monthlyUsedPct = clampPct(overview.utilizationPct)
  const forecastOver = forecast?.variancePct > 0

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Budget Overview</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Across all active campaigns</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5 items-center">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">Daily Budget</div>
          <div className="text-xl font-bold font-mono">{format(overview.dailyBudget)}</div>
          <Progress value={dailySpentPct} className="h-1.5" />
          <div className="text-[10.5px] text-muted-foreground">
            {format(overview.todaySpend)} spent today ({Math.round(dailySpentPct)}%)
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">Monthly Budget</div>
          <div className="text-xl font-bold font-mono">{format(overview.monthlyBudget)}</div>
          <Progress value={monthlyUsedPct} className="h-1.5 [&>div]:bg-teal-500" />
          <div className="text-[10.5px] text-muted-foreground">
            {format(overview.spend)} spent &middot; {format(overview.remaining)} remaining
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground">Forecasted Spend</div>
          {forecast && forecast.forecastStatus !== 'no_budget_configured' ? (
            <>
              <div className={`text-xl font-bold font-mono ${forecastOver ? 'text-amber-500' : 'text-foreground'}`}>
                {format(forecast.projectedSpend)}
              </div>
              <Progress value={100} className={`h-1.5 ${forecastOver ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
              <div className="text-[10.5px] text-muted-foreground">
                {forecastOver ? '+' : ''}{forecast.variancePct}% vs monthly budget — {forecast.forecastLabel}
              </div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground mt-1">No budget configured to forecast against.</div>
          )}
        </div>

        <div className="flex items-center justify-center sm:justify-start lg:justify-center">
          <div className="relative w-23 h-23">
            <ScoreRing val={monthlyUsedPct} color="#f59e0b" color2="#fbbf24" size={92} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-extrabold font-mono">{Math.round(monthlyUsedPct)}%</span>
              <span className="text-[9px] text-muted-foreground text-center leading-tight">Monthly<br />Used</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

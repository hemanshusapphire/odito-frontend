"use client"

import AnalyticsKPICard from './AnalyticsKPICard'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Responsive KPI grid: 1 col mobile, 2 cols tablet, 4 cols desktop/large
 * screens. Mirrors business-profile/PerformanceKPIGrid.jsx.
 */
export default function AnalyticsOverviewCards({ kpis, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card/80 p-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-7 w-20 mt-3" />
            <Skeleton className="h-3 w-24 mt-2" />
            <Skeleton className="h-7 w-full mt-2" />
          </div>
        ))}
      </div>
    )
  }

  if (!kpis?.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {kpis.map((kpi) => (
        <AnalyticsKPICard key={kpi.key} kpi={kpi} />
      ))}
    </div>
  )
}

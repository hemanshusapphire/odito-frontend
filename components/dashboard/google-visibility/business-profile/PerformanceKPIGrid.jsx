"use client"

import KPICard from './KPICard'

/**
 * Responsive grid of KPI tiles: 1 col mobile, 2 cols tablet, 4 cols desktop.
 */
export default function PerformanceKPIGrid({ kpis }) {
  if (!kpis?.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {kpis.map((kpi) => (
        <KPICard key={kpi.key} kpi={kpi} />
      ))}
    </div>
  )
}

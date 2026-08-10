"use client"

import MetricCard from './MetricCard'

/** Responsive grid of a platform's KPI tiles - 2/3/4 columns depending on count. */
export default function PlatformStatsGrid({ kpis, tint }) {
  const cols = kpis.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
  return (
    <div className={`grid grid-cols-2 ${cols} gap-3`}>
      {kpis.map((kpi) => (
        <MetricCard key={kpi.key} label={kpi.label} value={kpi.value} icon={kpi.icon} tint={tint} />
      ))}
    </div>
  )
}

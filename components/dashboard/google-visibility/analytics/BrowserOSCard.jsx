"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import RankedBarList from './RankedBarList'

// Backend (analyticsService.js's getAnalyticsBreakdowns) returns raw
// session counts per browser/OS, not a pre-computed percentage - true
// "share of sessions" is computed here from the list's own total, the same
// share-of-total pattern TrafficSourcesCard already uses internally.
function withShareOfTotal(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  return items.map((item) => ({
    key: item.key,
    label: item.label,
    value: total > 0 ? Math.round((item.value / total) * 100) : 0,
  }))
}

/** Share of sessions by browser and by operating system, side by side. */
export default function BrowserOSCard({ browsers = [], operatingSystems = [], loading = false }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Browsers &amp; Operating Systems</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Share of sessions, last 30 days</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-4">
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground/80 mb-2.5">Browsers</p>
          {loading ? (
            <div className="space-y-2.5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
          ) : (
            <RankedBarList items={withShareOfTotal(browsers)} valueSuffix="%" barColor="#3b82f6" />
          )}
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground/80 mb-2.5">Operating Systems</p>
          {loading ? (
            <div className="space-y-2.5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
          ) : (
            <RankedBarList items={withShareOfTotal(operatingSystems)} valueSuffix="%" barColor="#8b5cf6" />
          )}
        </div>
      </div>
    </Card>
  )
}

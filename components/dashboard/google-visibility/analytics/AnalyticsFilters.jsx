"use client"

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const RANGES = [
  { value: '7', label: '7 Days' },
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
  { value: '365', label: '12 Months' },
]

/**
 * Page-level date range selector. One control drives every card below it
 * (KPIs, trends, tables) rather than each card owning its own range picker.
 * Refresh lives in the header ("Refresh Data") and the Quick Actions
 * sidebar - not duplicated here. Purely presentational: range/onRangeChange
 * are caller-supplied, no fetching or state lives here.
 */
export default function AnalyticsFilters({ range, onRangeChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Tabs value={range} onValueChange={onRangeChange}>
        <TabsList>
          {RANGES.map((r) => (
            <TabsTrigger
              key={r.value}
              value={r.value}
              className="text-xs px-3 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground!"
            >
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

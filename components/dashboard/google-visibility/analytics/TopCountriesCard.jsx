"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe2 } from 'lucide-react'
import RankedBarList from './RankedBarList'

/**
 * Top locations by users, last selected range - ranked list. Backend
 * (analyticsService.js's getAnalyticsBreakdowns) supplies `countryId` (an
 * ISO-ish code from GA4's own `countryId` dimension), not a flag emoji -
 * no flag asset/lookup exists in this codebase, so the code is shown as a
 * small mono badge instead of fabricating a flag.
 */
export default function TopCountriesCard({ countries = [], loading = false, rangeLabel = 'the selected period' }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Countries</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Top locations by users, {rangeLabel}</p>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        ) : countries.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-8">
            <Globe2 className="h-8 w-8 opacity-40" />
            <p className="text-sm">No location data yet.</p>
          </div>
        ) : (
          <RankedBarList
            items={countries.map((c) => ({
              key: c.key,
              label: c.label,
              value: c.value,
              leading: c.countryId ? (
                <span className="text-[9.5px] font-mono text-muted-foreground/70 w-5 inline-block">{c.countryId}</span>
              ) : undefined,
            }))}
            barColor="#3b82f6"
          />
        )}
      </div>
    </Card>
  )
}

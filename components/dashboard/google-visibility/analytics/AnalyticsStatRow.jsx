"use client"

import { Skeleton } from '@/components/ui/skeleton'
import AnalyticsStatTile from './AnalyticsStatTile'

/**
 * Labeled row of AnalyticsStatTiles - used for both "Audience" and
 * "Conversions" in the reference HTML (which duplicated the same five-tile
 * markup for each). One reusable {title, stats[]} component instead.
 */
export default function AnalyticsStatRow({ title, stats = [], loading = false }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card/80 p-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-6 w-16 mt-3" />
              <Skeleton className="h-3 w-20 mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {stats.map(({ key, ...stat }) => (
            <AnalyticsStatTile key={key} {...stat} />
          ))}
        </div>
      )}
    </div>
  )
}

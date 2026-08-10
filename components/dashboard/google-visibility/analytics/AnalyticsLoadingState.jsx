"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Full-page skeleton mirroring the real dashboard's layout - same
 * "no layout shift" approach as business-profile/BusinessProfileLoadingState.jsx,
 * so content pops into its final position rather than reflowing the page.
 */
export default function AnalyticsLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6 min-w-0">
          <Card className="p-6"><Skeleton className="h-28 w-full" /></Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card/80 p-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-7 w-20 mt-3" />
                <Skeleton className="h-3 w-24 mt-2" />
              </div>
            ))}
          </div>

          <Card className="p-6"><Skeleton className="h-72 w-full" /></Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-6"><Skeleton className="h-56 w-full" /></Card>
            <Card className="p-6"><Skeleton className="h-56 w-full" /></Card>
          </div>

          <Card className="p-6"><Skeleton className="h-56 w-full" /></Card>
        </div>

        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-20 w-full" /></Card>
          ))}
        </div>
      </div>
    </div>
  )
}

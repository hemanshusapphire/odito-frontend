"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Full-page skeleton mirroring the real dashboard's layout, shown while
 * Search Console data is loading. Mirrors BusinessProfileLoadingState.jsx.
 */
export default function SearchConsoleLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <Card className="p-6"><Skeleton className="h-24 w-full" /></Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4"><Skeleton className="h-24 w-full" /></Card>
        ))}
      </div>

      <Card className="p-6"><Skeleton className="h-80 w-full" /></Card>
      <Card className="p-6"><Skeleton className="h-56 w-full" /></Card>
    </div>
  )
}

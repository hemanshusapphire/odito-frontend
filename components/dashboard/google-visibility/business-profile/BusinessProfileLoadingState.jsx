"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Full-page skeleton mirroring the real dashboard's layout, shown while
 * Business Profile data is loading.
 */
export default function BusinessProfileLoadingState() {
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">
          <Card className="p-6"><Skeleton className="h-40 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-80 w-full" /></Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card className="p-6"><Skeleton className="h-48 w-full" /></Card>
            <Card className="p-6"><Skeleton className="h-48 w-full" /></Card>
          </div>

          <Card className="p-6"><Skeleton className="h-56 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-40 w-full" /></Card>
          <Card className="p-6"><Skeleton className="h-40 w-full" /></Card>
        </div>

        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-20 w-full" /></Card>
          ))}
        </div>
      </div>
    </div>
  )
}

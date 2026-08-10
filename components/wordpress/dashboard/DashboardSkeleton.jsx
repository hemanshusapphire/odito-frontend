"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function CardSkeleton({ lines = 4 }) {
  return (
    <Card className="p-6 flex flex-col gap-3">
      <Skeleton className="h-4 w-28" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </Card>
  )
}

/** Brief loading skeleton shown while the "dashboard" mounts, before the mock data reveals. */
export default function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <CardSkeleton lines={5} />
      <CardSkeleton lines={3} />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={3} />
      <CardSkeleton lines={3} />
    </div>
  )
}

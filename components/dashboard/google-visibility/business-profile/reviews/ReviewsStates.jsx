"use client"

import { MessageSquare, AlertCircle, SearchX } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/** Same footprint as ReviewCard so the list doesn't jump when data lands. */
export function ReviewsListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading reviews">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4 sm:p-5 gap-0">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full mt-3" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function StateCard({ icon: Icon, iconClass = 'text-muted-foreground', title, description, children }) {
  return (
    <Card className="p-10 sm:p-14 flex flex-col items-center text-center gap-2">
      <Icon className={`h-8 w-8 ${iconClass}`} aria-hidden="true" />
      <p className="text-base font-semibold mt-1">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {children}
    </Card>
  )
}

export function ReviewsEmptyState() {
  return (
    <StateCard
      icon={MessageSquare}
      title="No reviews yet"
      description="Your Google Business Profile doesn't have any customer reviews yet."
    />
  )
}

export function ReviewsNoMatchState({ onClear }) {
  return (
    <StateCard icon={SearchX} title="No matching reviews" description="No reviews match your current search or filters.">
      <Button variant="outline" size="sm" onClick={onClear} className="mt-2">Clear filters</Button>
    </StateCard>
  )
}

export function ReviewsErrorState({ onRetry, retrying }) {
  return (
    <StateCard
      icon={AlertCircle}
      iconClass="text-red-500"
      title="Unable to load reviews"
      description="Something went wrong while loading your Google Business Profile reviews."
    >
      <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying} className="mt-2">Retry</Button>
    </StateCard>
  )
}

/** Google restricts review access for this app/location - not an error. */
export function ReviewsUnavailableState({ reason }) {
  return (
    <StateCard
      icon={MessageSquare}
      title="Reviews unavailable"
      description={reason || 'Google does not provide review access for this application.'}
    />
  )
}

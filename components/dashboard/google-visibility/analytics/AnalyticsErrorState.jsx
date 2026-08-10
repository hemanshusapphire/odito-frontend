"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ServerCrash, RotateCw } from 'lucide-react'

/**
 * Enterprise-style error state for a failed Analytics data load (distinct
 * from AnalyticsEmptyState, which covers "no connection yet" - this is for
 * "we tried to load data and it failed"). Retry is the only action, per the
 * brief - no dismiss/report-a-bug affordances that would need real wiring.
 */
export default function AnalyticsErrorState({ message, onRetry, retrying = false }) {
  return (
    <Card className="p-12 flex flex-col items-center text-center max-w-md mx-auto mt-10 border-red-500/25">
      <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
        <ServerCrash className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold mt-4">Couldn't load Analytics data</h3>
      <p className="text-sm text-muted-foreground mt-1.5">
        {message || 'Something went wrong while fetching your Google Analytics data. Please try again.'}
      </p>
      <Button onClick={onRetry} disabled={retrying} variant="outline" className="gap-2 mt-5">
        <RotateCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
        {retrying ? 'Retrying…' : 'Retry'}
      </Button>
    </Card>
  )
}

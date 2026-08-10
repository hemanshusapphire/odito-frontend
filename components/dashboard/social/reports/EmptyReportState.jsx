"use client"

import { BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Premium empty state shown when no report rows match the current filters. */
export default function EmptyReportState({ onSync }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <BarChart3 className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">No report data available.</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        Try a different platform or date range, or sync your social accounts to pull in the latest data.
      </p>
      <Button onClick={onSync} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Sync Social Data
      </Button>
    </div>
  )
}

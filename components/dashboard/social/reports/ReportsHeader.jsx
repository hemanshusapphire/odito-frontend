"use client"

import { Download, RefreshCw, Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Standard Odito page header for the Reports tab: title/subtitle + Export/Refresh/date-range actions. */
export default function ReportsHeader({ dateRangeLabel, onExport, onRefresh, refreshing }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Monitor social media performance, engagement, impressions and audience growth across all connected platforms.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/40 border rounded-lg px-3 py-2">
          <Calendar className="h-3.5 w-3.5" />
          {dateRangeLabel}
        </span>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
        <Button size="sm" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>
  )
}

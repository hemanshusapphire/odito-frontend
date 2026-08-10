"use client"

import { Download, Filter, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUICK_RANGES, dateRangeLabel } from '@/lib/socialReportsDummyData'

/** Quick-range chips + custom date inputs + export/filter/refresh icon buttons, matching the reference toolbar. */
export default function DateToolbar({ range, onRangeChange, onExport, onToggleFilters, onRefresh, refreshing }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{dateRangeLabel(range)}</span>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-muted/40 border rounded-lg p-1">
          {QUICK_RANGES.map((n) => (
            <button
              key={n}
              onClick={() => onRangeChange(n)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                range === n ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <Input type="date" className="h-8 w-[132px] text-xs" />

        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onToggleFilters}>
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onExport}>
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

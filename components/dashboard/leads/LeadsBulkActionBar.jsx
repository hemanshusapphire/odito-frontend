"use client"

import { UserPlus, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Sticky bar shown whenever one or more rows are selected. */
export default function LeadsBulkActionBar({ count, onClear, onBulkAssign, onExportSelected, onBulkDelete }) {
  if (count === 0) return null

  return (
    <div className="sticky top-3 z-30">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/5 shadow-md px-4 py-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{count} selected</span>
          <button onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
            Clear
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onBulkAssign} className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            Bulk Assign
          </Button>
          <Button variant="outline" size="sm" onClick={onExportSelected} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export Selected
          </Button>
          <Button variant="outline" size="sm" onClick={onBulkDelete} className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

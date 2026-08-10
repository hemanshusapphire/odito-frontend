"use client"

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Power, PowerOff, RefreshCw, Trash2, Download } from 'lucide-react'

/** Sticky bulk-action footer - always visible, buttons disabled until something is selected. */
export default function BulkActionBar({ allSelected, someSelected, selectedCount, onToggleAll, onActivate, onDeactivate, onUpdate, onDelete, onExport }) {
  const disabled = selectedCount === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t bg-card/95 backdrop-blur px-4 py-3.5 rounded-b-xl"
    >
      <div className="flex items-center gap-3">
        <Checkbox checked={someSelected ? 'indeterminate' : allSelected} onCheckedChange={onToggleAll} />
        <span className="text-xs text-muted-foreground">Select all</span>
        <span className="text-xs font-medium">{selectedCount > 0 ? `${selectedCount} selected` : 'None selected'}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" disabled={disabled} onClick={onActivate} className="gap-1.5">
          <Power className="h-3.5 w-3.5" />
          Activate
        </Button>
        <Button variant="outline" size="sm" disabled={disabled} onClick={onDeactivate} className="gap-1.5">
          <PowerOff className="h-3.5 w-3.5" />
          Deactivate
        </Button>
        <Button variant="outline" size="sm" disabled={disabled} onClick={onUpdate} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Update
        </Button>
        <Button variant="outline" size="sm" disabled={disabled} onClick={onExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export List
        </Button>
        <Button variant="destructive" size="sm" disabled={disabled} onClick={onDelete} className="gap-1.5">
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </motion.div>
  )
}

"use client"

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Info, Power, PowerOff, RefreshCw, Trash2 } from 'lucide-react'

/** Sticky bulk-action footer - always visible, buttons disabled until something is selected. */
export default function BulkActionBar({ allSelected, someSelected, selectedCount, onToggleAll, onActivate, onDeactivate, onUpdate, onDelete }) {
  const disabled = selectedCount === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 z-10 flex flex-col gap-2 border-t bg-card/95 backdrop-blur px-4 py-3.5 rounded-b-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <Button variant="destructive" size="sm" disabled={disabled} onClick={onDelete} className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Info className="h-3 w-3" />
        One theme must always be active
      </p>
    </motion.div>
  )
}

"use client"

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { UserCog, ChevronDown, PowerOff, Trash2, Download } from 'lucide-react'
import { ROLES } from '@/lib/wordpressUsersDummyData'

/** Sticky bulk-action footer - always visible, buttons disabled until something is selected. */
export default function BulkActionBar({ allSelected, someSelected, selectedCount, onToggleAll, onChangeRole, onDeactivate, onDelete, onExport }) {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={disabled} className="gap-1.5">
              <UserCog className="h-3.5 w-3.5" />
              Change Role
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ROLES.map((r) => <DropdownMenuItem key={r} onClick={() => onChangeRole(r)}>{r}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" disabled={disabled} onClick={onDeactivate} className="gap-1.5">
          <PowerOff className="h-3.5 w-3.5" />
          Deactivate
        </Button>
        <Button variant="outline" size="sm" disabled={disabled} onClick={onExport} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export Users
        </Button>
        <Button variant="destructive" size="sm" disabled={disabled} onClick={onDelete} className="gap-1.5">
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </motion.div>
  )
}

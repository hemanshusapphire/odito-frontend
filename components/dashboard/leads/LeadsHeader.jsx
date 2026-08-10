"use client"

import { Upload, Download, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

/**
 * Page header: title/subtitle + Import/Export/More/Add Lead actions.
 * Mirrors the border-b title block every other dashboard page uses
 * (e.g. google-ads/GoogleAdsHeader.jsx) rather than the mockup's own
 * "ODITO / Leads" breadcrumb chip, which duplicates chrome the app shell's
 * sidebar/topbar already provides.
 */
export default function LeadsHeader({ onImport, onExport, onAddLead, onComingSoon }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Manage, organize, and track all incoming leads from one place.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <Button variant="outline" size="sm" onClick={onImport} className="gap-2 hidden sm:flex">
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2 hidden sm:flex">
          <Download className="h-4 w-4" />
          Export
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onImport} className="sm:hidden gap-2">
              <Upload className="h-4 w-4" />
              Import Leads
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport} className="sm:hidden gap-2">
              <Download className="h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem onClick={() => onComingSoon('Merge tool')}>Merge Duplicate Leads</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onComingSoon('Field settings')}>Manage Custom Fields</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onComingSoon('Automation rules')}>Automation Rules</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={onAddLead} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>
    </div>
  )
}

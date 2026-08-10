"use client"

import { Plus, RefreshCw, Loader2, ScanSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Plugins page header: title + Add Plugin / Refresh / Scan Updates actions. */
export default function PluginsHeader({ onAddPlugin, onRefresh, refreshing, onScanUpdates, scanning }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plugins</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Manage, update and audit every plugin installed on your WordPress site.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <Button variant="outline" size="sm" onClick={onScanUpdates} disabled={scanning} className="gap-2">
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
          {scanning ? 'Scanning…' : 'Scan Updates'}
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
        <Button size="sm" onClick={onAddPlugin} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Plugin
        </Button>
      </div>
    </div>
  )
}

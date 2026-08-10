"use client"

import { Plus, RefreshCw, Loader2, ScanSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Themes page header: title + Add Theme / Refresh / Check Updates actions. */
export default function ThemesHeader({ onAddTheme, onRefresh, refreshing, onCheckUpdates, checking }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Themes</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Manage installed themes, preview changes and keep your active theme up to date.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <Button variant="outline" size="sm" onClick={onCheckUpdates} disabled={checking} className="gap-2">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
          {checking ? 'Checking…' : 'Check Updates'}
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
        <Button size="sm" onClick={onAddTheme} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Theme
        </Button>
      </div>
    </div>
  )
}

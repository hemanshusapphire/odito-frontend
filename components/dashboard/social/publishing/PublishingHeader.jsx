"use client"

import { Plus, RefreshCw, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Page header for the Publishing tab: title/subtitle + Create/Refresh/Export actions. */
export default function PublishingHeader({ onCreatePost, onRefresh, refreshing, onExport }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Publishing</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Create, schedule and manage your social media content across all connected platforms.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
        <Button size="sm" onClick={onCreatePost} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>
    </div>
  )
}

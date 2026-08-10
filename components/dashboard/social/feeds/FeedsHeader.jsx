"use client"

import { RefreshCw, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Page header for the Feeds tab: title/subtitle + Refresh/Create New Post actions. */
export default function FeedsHeader({ onRefresh, refreshing, onCreatePost }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feeds</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          View all posts published across your connected social media platforms.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
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

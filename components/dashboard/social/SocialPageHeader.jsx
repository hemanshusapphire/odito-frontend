"use client"

import { Link2, Plus, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Page header: title/subtitle + Connect Account / Create New Post / Refresh actions. */
export default function SocialPageHeader({ onConnectAccount, onCreatePost, onRefresh, refreshing }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Social Media Management</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Monitor and publish across all your connected social channels from one place.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <Button variant="outline" size="sm" onClick={onConnectAccount} className="gap-2">
          <Link2 className="h-4 w-4" />
          Connect Account
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

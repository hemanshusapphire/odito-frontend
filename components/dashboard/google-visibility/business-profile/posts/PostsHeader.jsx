"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, RefreshCw, Loader2, Sparkles, Building2 } from 'lucide-react'

export default function PostsHeader({
  businessName,
  lastSyncedAt,
  syncing,
  onSync,
  onCreatePost
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Google Business Profile Posts</h1>
          <Badge variant="outline" className="text-xs font-normal">
            Updates & Announcements
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm">
          Publish manual updates, announcements, events, and offers directly to your Google Business Profile listing and track their engagement performance.
        </p>

        {businessName && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">{businessName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={syncing}
          className="gap-2"
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {syncing ? 'Syncing…' : 'Sync Posts'}
        </Button>

        <Button
          size="sm"
          onClick={onCreatePost}
          className="gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>
    </div>
  )
}

"use client"

import { Rss, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Premium empty state shown when filters/search leave zero posts. */
export default function EmptyFeeds({ onCreatePost }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border bg-card">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <Rss className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">No posts found.</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        Try adjusting your filters or search, or create a new post to get your feed going.
      </p>
      <Button onClick={onCreatePost} className="gap-2">
        <Plus className="h-4 w-4" />
        Create New Post
      </Button>
    </div>
  )
}

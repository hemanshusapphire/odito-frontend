"use client"

import { Star, MessageSquare, ThumbsUp, Reply } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function SummaryTile({ icon: Icon, label, value, loading }) {
  return (
    <Card className="p-4 sm:p-5 gap-0 flex-row items-center">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 flex items-center justify-center">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight leading-tight">{value}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

const fmtCount = (n) => (typeof n === 'number' ? n.toLocaleString() : '—')

/**
 * Summary strip. `rating` is the existing /business-profile/rating payload
 * (Google's average + total, plus the synced-review distribution and replied
 * count) - nothing here is computed from the currently visible page.
 */
export default function ReviewsSummary({ rating, loading }) {
  const avg = typeof rating?.averageRating === 'number' ? rating.averageRating.toFixed(1) : '—'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryTile icon={MessageSquare} label="Total Reviews" value={fmtCount(rating?.totalReviewCount)} loading={loading} />
      <SummaryTile icon={Star} label="Average Rating" value={avg} loading={loading} />
      <SummaryTile icon={ThumbsUp} label="5★ Reviews" value={fmtCount(rating?.distribution?.[5])} loading={loading} />
      <SummaryTile icon={Reply} label="Responded" value={fmtCount(rating?.repliedCount)} loading={loading} />
    </div>
  )
}

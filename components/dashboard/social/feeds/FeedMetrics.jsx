"use client"

import { ThumbsUp, MessageCircle, Repeat2, Eye, Heart } from 'lucide-react'

function compact(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}

const METRIC_DEFS = [
  { key: 'likes', icon: ThumbsUp },
  { key: 'comments', icon: MessageCircle },
  { key: 'shares', icon: Repeat2 },
  { key: 'reach', icon: Eye },
  { key: 'reactions', icon: Heart },
]

/**
 * Elegant icon+count pill row, replacing plain "0 Like | 0 Comments" text.
 * `keys` narrows which metrics render (e.g. Post History shows reach as
 * its own table column, so it only needs likes/comments/shares here) -
 * defaults to all five for the Feeds grid's original use.
 */
export default function FeedMetrics({ metrics, keys }) {
  const defs = keys ? METRIC_DEFS.filter((d) => keys.includes(d.key)) : METRIC_DEFS
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {defs.map(({ key, icon: Icon }) => (
        <span key={key} className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Icon className="h-3 w-3" />
          {compact(metrics[key] || 0)}
        </span>
      ))}
    </div>
  )
}

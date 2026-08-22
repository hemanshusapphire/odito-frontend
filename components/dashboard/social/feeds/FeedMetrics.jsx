"use client"

import { ThumbsUp, MessageCircle, Repeat2, Eye } from 'lucide-react'

function compact(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}

const METRIC_DEFS = [
  { key: 'likes', icon: ThumbsUp },
  { key: 'comments', icon: MessageCircle },
  { key: 'shares', icon: Repeat2 },
  { key: 'views', icon: Eye },
]

/**
 * Icon+count pill row for real, Meta-reported engagement only. A metric
 * Meta didn't report (null) is OMITTED entirely rather than shown as a
 * fabricated "0" — a real, Meta-confirmed zero (e.g. 0 shares) still
 * renders as "0", since that IS what Meta reported. `keys` narrows which
 * metrics are eligible to render at all (e.g. a future reuse that only
 * cares about likes/comments) — defaults to all four for the Feeds grid.
 */
export default function FeedMetrics({ metrics, keys }) {
  const defs = (keys ? METRIC_DEFS.filter((d) => keys.includes(d.key)) : METRIC_DEFS)
    .filter((d) => metrics?.[d.key] !== null && metrics?.[d.key] !== undefined)

  if (defs.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {defs.map(({ key, icon: Icon }) => (
        <span key={key} className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Icon className="h-3 w-3" />
          {compact(metrics[key])}
        </span>
      ))}
    </div>
  )
}

"use client"

import { platformConfig } from '@/lib/socialFeedsDummyData'
import { STATUS_STYLE } from '@/lib/publishingDummyData'

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** One scheduled/published/draft/failed post chip inside a calendar day cell, with a hover preview. */
export default function ScheduleCard({ post }) {
  const platform = platformConfig(post.platform)
  const Icon = platform.icon
  const dot = STATUS_STYLE[post.status]?.dot || '#94A3B8'

  return (
    <div className="relative group/card">
      <button
        type="button"
        className="w-full flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] font-medium truncate transition-colors hover:brightness-95"
        style={{ background: `${platform.color}14`, color: platform.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{post.title}</span>
      </button>

      <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border bg-popover shadow-lg p-3 text-xs opacity-0 scale-95 origin-top transition-all group-hover/card:opacity-100 group-hover/card:scale-100 group-hover/card:pointer-events-auto">
        <div className="flex items-center gap-1.5 font-semibold text-popover-foreground mb-1">
          <Icon className="h-3.5 w-3.5" style={{ color: platform.color }} />
          {platform.name}
        </div>
        <p className="text-popover-foreground/90 mb-1.5 line-clamp-2">{post.title}</p>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{formatTime(post.scheduledAt)}</span>
          <span className="font-medium">{post.author}</span>
        </div>
      </div>
    </div>
  )
}

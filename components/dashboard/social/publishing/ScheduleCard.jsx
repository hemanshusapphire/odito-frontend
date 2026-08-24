"use client"

import { DateTime } from 'luxon'
import { platformConfig } from '@/lib/socialFeedsDummyData'
import { STATUS_STYLE } from './StatusBadge'

// A stored scheduledAt is an absolute UTC instant; show it back in the
// zone the user actually picked (matching DayAgenda's/PostsTable's own
// logic) rather than the viewer's browser zone, which could show a
// different hour than the one the user chose. publishedAt has no "chosen
// zone" concept, so it falls back to the viewer's own timezone.
function formatTime(iso, timezone) {
  if (!iso) return null
  const dt = timezone
    ? DateTime.fromJSDate(new Date(iso)).setZone(timezone)
    : DateTime.fromJSDate(new Date(iso))
  return dt.isValid ? dt.toFormat('h:mm a') : null
}

/**
 * One scheduled/published/draft/failed post chip inside a calendar day
 * cell, with a hover preview. `post.content` is a real SocialPublication
 * (see app/app/social/publishing/page.jsx) — there is no `author` field
 * on that model (no team/assignment concept exists yet), so the preview
 * shows the post's time instead.
 */
export default function ScheduleCard({ post }) {
  const platform = platformConfig(post.platform)
  const Icon = platform.icon
  const dot = STATUS_STYLE[post.status]?.dot || '#94A3B8'
  const displayText = post.content?.trim() || '(No text)'
  const time = formatTime(post.scheduledAt || post.publishedAt, post.scheduledAt ? post.timezone : null)

  return (
    <div className="relative group/card">
      <button
        type="button"
        className="w-full flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] font-medium truncate transition-colors hover:brightness-95"
        style={{ background: `${platform.color}14`, color: platform.color }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{displayText}</span>
      </button>

      <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border bg-popover shadow-lg p-3 text-xs opacity-0 scale-95 origin-top transition-all group-hover/card:opacity-100 group-hover/card:scale-100 group-hover/card:pointer-events-auto">
        <div className="flex items-center gap-1.5 font-semibold text-popover-foreground mb-1">
          <Icon className="h-3.5 w-3.5" style={{ color: platform.color }} />
          {platform.name}
        </div>
        <p className="text-popover-foreground/90 mb-1.5 line-clamp-2">{displayText}</p>
        <div className="flex items-center justify-between text-muted-foreground">
          {time && <span>{time}</span>}
          <span className="font-medium capitalize">{post.status}</span>
        </div>
      </div>
    </div>
  )
}

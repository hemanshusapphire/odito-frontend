"use client"

import { Badge } from '@/components/ui/badge'
import PlatformBadge from './PlatformBadge'
import FeedMedia from './FeedMedia'
import FeedMetrics from './FeedMetrics'

const STATUS_VARIANT = { Published: 'success', Scheduled: 'info', Draft: 'secondary' }

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** Highlights #hashtags and @mentions inline, without any HTML injection. */
function renderText(text) {
  const parts = text.split(/(\s+)/)
  return parts.map((part, i) => {
    if (/^#\w+/.test(part)) return <span key={i} className="text-primary font-medium">{part}</span>
    if (/^@\w+/.test(part)) return <span key={i} className="text-blue-500 font-medium">{part}</span>
    return part
  })
}

/** One modern social post card - header (avatar/platform/date), body (text), media, metric pills. */
export default function FeedCard({ post, platform }) {
  const Icon = platform.icon

  return (
    <div className="rounded-2xl border bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
              {post.author.initials}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card"
              style={{ background: platform.color }}
            >
              <Icon className="h-2.5 w-2.5 text-white" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{post.author.name}</div>
            <div className="text-[11px] text-muted-foreground whitespace-nowrap">
              {formatDate(post.publishedAt)} &middot; {formatTime(post.publishedAt)}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <PlatformBadge platform={platform} />
          <Badge variant={STATUS_VARIANT[post.status]} className="text-[10px]">{post.status}</Badge>
        </div>
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line line-clamp-6">
        {renderText(post.text)}
      </p>

      <FeedMedia media={post.media} />

      <div className="pt-1 border-t">
        <div className="pt-3">
          <FeedMetrics metrics={post.metrics} />
        </div>
      </div>
    </div>
  )
}

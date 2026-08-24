"use client"

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import PlatformBadge from './PlatformBadge'
import FeedMedia from './FeedMedia'
import FeedMetrics from './FeedMetrics'
import { normalizeImageUrl } from '@/lib/security/sanitize'

const STATUS_VARIANT = { published: 'success' }
const STATUS_LABEL = { published: 'Published' }

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatTime(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function initialsFor(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
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

/**
 * One real post card — real account name/avatar, real caption, real
 * media (or none, if the post has none), real engagement, and a link out
 * to the actual post on Facebook/Instagram. Every field is optional-safe:
 * Meta doesn't guarantee every field on every post (see
 * socialPostMapper.js), so nothing here assumes text/media/metrics exist.
 */
export default function FeedCard({ post, platform }) {
  const [avatarFailed, setAvatarFailed] = useState(false)
  const Icon = platform?.icon
  const date = formatDate(post.publishedAt)
  const time = formatTime(post.publishedAt)
  const displayName = post.accountName || (post.username ? `@${post.username}` : 'Unknown account')
  const accountPictureUrl = normalizeImageUrl(post.accountPicture)

  return (
    <div className="rounded-2xl border bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {accountPictureUrl && !avatarFailed ? (
              // eslint-disable-next-line @next/next/no-img-element -- real, dynamic Meta CDN URL
              <img
                src={accountPictureUrl}
                alt={displayName}
                className="w-11 h-11 rounded-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                {initialsFor(displayName)}
              </div>
            )}
            {Icon && (
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card"
                style={{ background: platform.color }}
              >
                <Icon className="h-2.5 w-2.5 text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{displayName}</div>
            <div className="text-[11px] text-muted-foreground whitespace-nowrap">
              {date ? <>{date}{time ? <> &middot; {time}</> : null}</> : 'Date unavailable'}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {platform && <PlatformBadge platform={platform} />}
          {STATUS_LABEL[post.status] && (
            <Badge variant={STATUS_VARIANT[post.status] || 'secondary'} className="text-[10px]">{STATUS_LABEL[post.status]}</Badge>
          )}
        </div>
      </div>

      {post.text && (
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line line-clamp-6">
          {renderText(post.text)}
        </p>
      )}

      <FeedMedia post={post} />

      <div className="pt-1 border-t">
        <div className="pt-3 flex items-center justify-between gap-2">
          <FeedMetrics metrics={post.metrics} />
          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary shrink-0"
            >
              View post <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

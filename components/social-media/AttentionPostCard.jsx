"use client"

import Link from 'next/link'
import { Facebook, Instagram, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SocialMediaImage } from './SocialMediaImage'

const PLATFORM_ICON = { facebook: Facebook, instagram: Instagram }

/**
 * One row in the "Needs your attention" list — a REAL failed publication
 * (mapped by lib/socialMedia/postMapper.js). The badge reflects why it needs
 * attention (reconnect / unknown outcome / missed / failed) and Review opens
 * it in Scheduled Posts' Failed tab.
 */
export function AttentionPostCard({ post }) {
  const PlatformIcon = PLATFORM_ICON[post.platform] || ImageIcon
  const kind = post.failure?.kind
  const badge = kind === 'reconnect' ? 'Reconnect required'
    : kind === 'unknown' ? 'Outcome unknown'
      : kind === 'missed' ? 'Missed schedule'
        : kind === 'approval' ? 'Approval required'
          : 'Failed to publish'
  const badgeClass = kind === 'unknown' || kind === 'reconnect' || kind === 'missed' || kind === 'approval'
    ? 'border-amber-200 bg-amber-50 text-amber-700'
    : 'border-red-200 bg-red-50 text-red-700'

  return (
    <div className="flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50" data-testid={`attention-${post.id}`}>
      <SocialMediaImage src={post.imageSrc} className="h-14 w-14 shrink-0 rounded-lg" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800" title={post.title}>{post.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-400">
          <span>{post.media.length ? (post.mediaType === 'video' ? 'Video' : 'Photo') : 'Text'}</span>
          <span aria-hidden>&bull;</span>
          <span className="inline-flex items-center gap-1 capitalize">
            <PlatformIcon className="h-3 w-3" />
            {post.platform}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClass}`}>{badge}</span>
        </div>
      </div>

      <Button asChild size="sm" className="shrink-0 rounded-lg bg-violet-600 text-white shadow-sm hover:bg-violet-700">
        <Link href={`/app/social-media/scheduled-posts?tab=failed&post=${encodeURIComponent(post.id)}`}>Review</Link>
      </Button>
    </div>
  )
}

export default AttentionPostCard

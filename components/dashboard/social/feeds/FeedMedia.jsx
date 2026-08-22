"use client"

import { useState } from 'react'
import { Image as ImageIcon, Play, Layers } from 'lucide-react'

/**
 * Real post media (mediaUrl/thumbnailUrl from Meta's Graph API — see
 * socialPostMapper.js). No fake preview is ever synthesized: if Meta gave
 * us no media URL (a text-only Facebook post, or an Instagram video still
 * processing), nothing renders here at all — never a gradient/placeholder
 * standing in for a real image, which is what the old dummy version did.
 * A real image that fails to actually load (broken/expired Meta CDN URL)
 * falls back to a neutral icon tile rather than a broken-image glyph.
 */
export default function FeedMedia({ post }) {
  const [failed, setFailed] = useState(false)
  const src = post.thumbnailUrl || post.mediaUrl
  if (!src) return null

  return (
    <div className="relative rounded-xl overflow-hidden h-52 bg-muted">
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <ImageIcon className="h-8 w-8" />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- real, dynamic Meta CDN URLs, not a local/optimizable asset
        <img
          src={src}
          alt={post.text ? post.text.slice(0, 80) : 'Post media'}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}

      {post.type === 'video' && !failed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white">
            <Play className="h-6 w-6 fill-white" />
          </span>
        </div>
      )}

      {post.type === 'carousel_album' && !failed && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5">
          <Layers className="h-3 w-3" />
          Album
        </span>
      )}
    </div>
  )
}

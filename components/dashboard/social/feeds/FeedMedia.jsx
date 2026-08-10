"use client"

import { Image as ImageIcon, Play, Layers } from 'lucide-react'

/**
 * Post media block. No real assets exist for mock posts, so each media
 * type renders a tasteful gradient placeholder (tinted per-platform) with
 * an icon watermark instead of a broken <img> - a deliberate upgrade over
 * the reference's plain "Media not found" boxes.
 */
export default function FeedMedia({ media }) {
  if (!media || media.type === 'none') return null

  return (
    <div className="relative rounded-xl overflow-hidden group/media h-52">
      <div
        className="absolute inset-0 transition-transform duration-300 group-hover/media:scale-105"
        style={{ background: `linear-gradient(135deg, ${media.tone}33, ${media.tone}0d)` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {media.type === 'video' ? (
          <span className="w-14 h-14 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white">
            <Play className="h-6 w-6 fill-white" />
          </span>
        ) : (
          <ImageIcon className="h-10 w-10" style={{ color: `${media.tone}55` }} />
        )}
      </div>

      {media.type === 'carousel' && (
        <>
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5">
            <Layers className="h-3 w-3" />
            1/{media.count}
          </span>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {Array.from({ length: media.count }).map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

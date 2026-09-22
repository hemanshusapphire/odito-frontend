"use client"

import { Facebook, Instagram, Image as ImageIcon, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SocialMediaImage } from './SocialMediaImage'
import { PILLAR_STYLES } from '@/lib/socialMediaAIDummyData'

const PLATFORM_ICON = { facebook: Facebook, instagram: Instagram }

/** One row in the "Needs your attention" list. */
export function AttentionPostCard({ post, onReview }) {
  const PlatformIcon = PLATFORM_ICON[post.platform] || ImageIcon
  const pillarClass = PILLAR_STYLES[post.pillar] || 'bg-slate-50 text-slate-600 border-slate-200'

  return (
    <div className="flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50">
      <SocialMediaImage imageId={post.imageId} className="h-14 w-14 shrink-0 rounded-lg" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{post.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-slate-400">
          <span>{post.type}</span>
          <span aria-hidden>&bull;</span>
          <span className="inline-flex items-center gap-1 capitalize">
            <PlatformIcon className="h-3 w-3" />
            {post.platform}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            {post.status}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${pillarClass}`}>
            {post.pillar}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 border-slate-200 bg-white text-slate-700 shadow-lg">
          <DropdownMenuItem className="text-sm focus:bg-violet-50 focus:text-violet-700">Preview</DropdownMenuItem>
          <DropdownMenuItem className="text-sm focus:bg-violet-50 focus:text-violet-700">Duplicate</DropdownMenuItem>
          <DropdownMenuItem className="text-sm text-red-500 focus:bg-red-50 focus:text-red-600">Discard</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        size="sm"
        onClick={() => onReview?.(post)}
        className="shrink-0 rounded-lg bg-violet-600 text-white shadow-sm hover:bg-violet-700"
      >
        Review
      </Button>
    </div>
  )
}

export default AttentionPostCard

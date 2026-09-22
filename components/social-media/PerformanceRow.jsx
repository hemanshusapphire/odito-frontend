"use client"

import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'
import { SocialMediaImage } from './SocialMediaImage'

/** One row of the Top-performing content table. */
export function PerformanceRow({ post, onViewDetails, onOpenInStudio, onDuplicate }) {
  const platform = CALENDAR_PLATFORM_META[post.platform]
  const PlatformIcon = platform.icon

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_auto] items-center gap-4 border-b border-slate-100 py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <SocialMediaImage imageId={post.imageId} className="h-11 w-11 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{post.title}</p>
          <p className="text-xs text-slate-400">{post.date}</p>
        </div>
      </div>

      <span className="flex items-center gap-1.5 text-sm text-slate-600">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${platform.badgeClass}`}>
          <PlatformIcon className="h-2.5 w-2.5" />
        </span>
        {platform.label}
      </span>

      <span className="text-sm font-medium text-slate-700">{post.reach}</span>
      <span className="text-sm font-medium text-slate-700">{post.engagement}</span>
      <span className="text-sm font-medium text-slate-700">{post.clicks}</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Post options"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 border-slate-200 bg-white text-slate-700 shadow-lg">
          <DropdownMenuItem onClick={() => onViewDetails?.(post)} className="text-sm focus:bg-violet-50 focus:text-violet-700">
            View post details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onOpenInStudio?.(post)} className="text-sm focus:bg-violet-50 focus:text-violet-700">
            Open in Creative Studio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate?.(post)} className="text-sm focus:bg-violet-50 focus:text-violet-700">
            Duplicate for next month
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default PerformanceRow

"use client"

import { Facebook, Instagram, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SocialMediaImage } from './SocialMediaImage'

const PLATFORM_META = {
  facebook: { Icon: Facebook, className: 'bg-[#1877F2] text-white' },
  instagram: { Icon: Instagram, className: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white' },
}

/** Horizontal card for one item in the "Upcoming posts" strip. */
export function UpcomingPostCard({ post }) {
  const meta = PLATFORM_META[post.platform]
  const PlatformIcon = meta?.Icon

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <SocialMediaImage imageId={post.imageId} className="h-32 w-full">
        {PlatformIcon && (
          <span className={`absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full shadow-sm ${meta.className}`}>
            <PlatformIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </SocialMediaImage>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            {post.date} &middot; {post.time}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-800">{post.title}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 border-slate-200 bg-white text-slate-700 shadow-lg">
            <DropdownMenuItem className="text-sm focus:bg-violet-50 focus:text-violet-700">Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-sm focus:bg-violet-50 focus:text-violet-700">Reschedule</DropdownMenuItem>
            <DropdownMenuItem className="text-sm text-red-500 focus:bg-red-50 focus:text-red-600">Cancel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default UpcomingPostCard

"use client"

import { CALENDAR_PLATFORM_META, CALENDAR_STATUS_META } from '@/lib/socialMediaAIDummyData'
import { SocialMediaImage } from './SocialMediaImage'

/** Compact post card rendered inside a CalendarColumn. */
export function CalendarPostCard({ post, selected, onSelect }) {
  const platform = CALENDAR_PLATFORM_META[post.platform]
  const status = CALENDAR_STATUS_META[post.status]
  const PlatformIcon = platform.icon

  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      aria-pressed={selected}
      className={`w-full rounded-xl border bg-white p-2.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected ? 'border-violet-400 ring-2 ring-violet-100' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-xs font-semibold text-slate-500">{post.time}</span>
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${platform.badgeClass}`}>
          <PlatformIcon className="h-3 w-3" />
        </span>
      </div>

      <p className="mt-1 truncate text-sm font-semibold text-slate-800">{post.title}</p>

      {post.imageId ? (
        <SocialMediaImage imageId={post.imageId} className="mt-2 h-16 w-full rounded-lg" />
      ) : (
        <div className="mt-2 flex h-16 w-full flex-col justify-center gap-1.5 rounded-lg bg-slate-50 px-2.5">
          <span className="h-1.5 w-4/5 rounded-full bg-slate-200" />
          <span className="h-1.5 w-3/5 rounded-full bg-slate-200" />
          <span className="h-1.5 w-2/3 rounded-full bg-slate-200" />
        </div>
      )}

      <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${status.badgeClass}`}>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dotClass}`} />
        {status.label}
      </span>
    </button>
  )
}

export default CalendarPostCard

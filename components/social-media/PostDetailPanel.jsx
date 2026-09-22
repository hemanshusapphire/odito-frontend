import { X, Calendar, Clock } from 'lucide-react'
import { CALENDAR_PLATFORM_META, CALENDAR_STATUS_META } from '@/lib/socialMediaAIDummyData'

function formatFullDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${weekday}, ${d} ${month} ${y}`
}

/** Detail content for the selected calendar post - rendered inline on desktop and inside a Sheet on mobile. */
export function PostDetailPanel({ post, onClose, onReview }) {
  if (!post) return null

  const platform = CALENDAR_PLATFORM_META[post.platform]
  const status = CALENDAR_STATUS_META[post.status]
  const PlatformIcon = platform.icon

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{post.title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-sm text-slate-700">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
          {formatFullDate(post.date)}
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-700">
          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
          {post.time}
        </div>
        <div className="flex items-center gap-2.5 text-sm text-slate-700">
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${platform.badgeClass}`}>
            <PlatformIcon className="h-3 w-3" />
          </span>
          {platform.label}
        </div>
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.badgeClass}`}>
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dotClass}`} />
          {status.label}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Content pillar</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{post.contentPillar}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Content format</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{post.contentFormat}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Caption (excerpt)</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{post.caption}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onReview?.(post)}
        className="mt-6 w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800"
      >
        Review content
      </button>
    </div>
  )
}

export default PostDetailPanel

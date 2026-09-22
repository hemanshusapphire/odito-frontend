import { Calendar, Clock } from 'lucide-react'
import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'
import { PostActionMenu } from './PostActionMenu'
import { SocialMediaImage } from './SocialMediaImage'

function formatDateShort(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  return `${weekday}, ${d} ${month} ${y}`
}

const STATUS_BADGES = {
  scheduled: [
    { label: 'Content approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Design approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ],
  published: [{ label: 'Published', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }],
  failed: [{ label: 'Failed to publish', className: 'bg-red-50 text-red-700 border-red-200' }],
}

/** One post row in the scheduled/published/failed list. */
export function ScheduledPostCard({ post, selected, onSelect, onEditSchedule, onView, onDuplicate, onCancel, onRetry, onDiscard }) {
  const platform = CALENDAR_PLATFORM_META[post.platform]
  const PlatformIcon = platform.icon
  const badges = STATUS_BADGES[post.status] || []

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center ${
        selected ? 'border-violet-400 bg-violet-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <button type="button" onClick={() => onSelect(post.id)} className="flex flex-1 items-start gap-3 text-left">
        <SocialMediaImage imageId={post.imageId} className="h-14 w-14 shrink-0 rounded-lg">
          <span className={`absolute -bottom-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white ${platform.badgeClass}`}>
            <PlatformIcon className="h-2.5 w-2.5" />
          </span>
        </SocialMediaImage>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">{post.title}</p>
          <p className="mt-0.5 truncate text-sm text-slate-500">{post.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {badges.map((badge) => (
              <span key={badge.label} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
            ))}
          </div>
          {post.status === 'failed' && post.failReason && (
            <p className="mt-1.5 text-xs text-red-600">{post.failReason}</p>
          )}
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
        <div className="text-right">
          <p className="flex items-center justify-end gap-1.5 text-sm font-medium text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatDateShort(post.date)}
          </p>
          <p className="flex items-center justify-end gap-1.5 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {post.time}
          </p>
        </div>

        {!selected && (
          <div className="flex items-center gap-1.5">
            {post.status === 'scheduled' && (
              <button
                type="button"
                onClick={() => onEditSchedule(post.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                <Calendar className="h-3.5 w-3.5" />
                Edit schedule
              </button>
            )}
            {post.status === 'failed' && (
              <button
                type="button"
                onClick={() => onRetry?.(post)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
              >
                Retry
              </button>
            )}
            <PostActionMenu
              post={post}
              onEditSchedule={onEditSchedule}
              onView={onView}
              onDuplicate={onDuplicate}
              onCancel={onCancel}
              onRetry={onRetry}
              onDiscard={onDiscard}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ScheduledPostCard

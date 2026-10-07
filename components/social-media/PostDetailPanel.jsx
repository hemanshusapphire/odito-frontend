import Link from 'next/link'
import { X, Calendar, Clock, ExternalLink } from 'lucide-react'
import { CALENDAR_PLATFORM_META, CALENDAR_STATUS_META } from '@/lib/socialMediaAIDummyData'

function formatFullDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${weekday}, ${d} ${month} ${y}`
}

/**
 * Detail content for the selected REAL calendar post — rendered inline on
 * desktop and inside a Sheet on mobile. Only fields the backend actually has
 * are shown (content pillar has no backend, so it is not shown); the action
 * opens the post in Scheduled Posts, where it can really be edited/retried.
 */
export function PostDetailPanel({ post, onClose }) {
  if (!post) return null

  const platform = CALENDAR_PLATFORM_META[post.platform]
  const status = CALENDAR_STATUS_META[post.status]
  const PlatformIcon = platform?.icon
  const tab = post.status === 'published' ? 'published' : post.status === 'failed' ? 'failed' : 'scheduled'

  return (
    <div className="flex h-full flex-col" data-testid="post-detail-panel">
      <div className="flex items-start justify-between gap-2">
        <h2 className="line-clamp-3 break-words text-lg font-bold text-slate-900">{post.title}</h2>
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
          {post.time}{post.zone ? ` ${post.zone}` : ''}
        </div>
        {platform && (
          <div className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${platform.badgeClass}`}>
              <PlatformIcon className="h-3 w-3" />
            </span>
            {platform.label}
          </div>
        )}
        {status && (
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.badgeClass}`}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dotClass}`} />
            {status.label}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Content format</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{post.contentFormat}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Caption</p>
          <p className="mt-1 line-clamp-6 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">{post.caption || '(no text)'}</p>
        </div>
        {post.status === 'published' && post.permalink && (
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" data-testid="view-on-facebook" className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100">
            View on Facebook
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {post.failure && (
          <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <p className="font-semibold">{post.failure.headline}</p>
            {post.failure.detail && post.failure.detail !== post.failure.headline && <p className="mt-0.5 text-amber-800">{post.failure.detail}</p>}
          </div>
        )}
      </div>

      <Link
        href={`/app/social-media/scheduled-posts?tab=${tab}&post=${encodeURIComponent(post.id)}`}
        className="mt-6 block w-full rounded-lg bg-violet-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800"
      >
        Open in Scheduled Posts
      </Link>
    </div>
  )
}

export default PostDetailPanel

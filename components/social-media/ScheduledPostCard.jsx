import Link from 'next/link'
import { Calendar, Clock, Loader2, RefreshCw } from 'lucide-react'
import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'
import { PostActionMenu } from './PostActionMenu'
import { SocialMediaImage } from './SocialMediaImage'

function formatDateShort(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  return `${weekday}, ${d} ${month} ${y}`
}

const GREEN = 'bg-emerald-50 text-emerald-700 border-emerald-200'
const AMBER = 'bg-amber-50 text-amber-700 border-amber-200'
const RED = 'bg-red-50 text-red-700 border-red-200'
const SKY = 'bg-sky-50 text-sky-700 border-sky-200'

/** Status badges for a real post — derived only from backend state, never from a hardcoded "approved" claim. */
function badgesFor(post, accountIssue) {
  if (post.status === 'publishing') return [{ label: 'Publishing…', className: SKY, spinner: true }]
  if (post.status === 'published') return [{ label: 'Published', className: GREEN }]
  if (post.status === 'failed') {
    const kind = post.failure?.kind
    if (kind === 'unknown') return [{ label: 'Outcome unknown', className: AMBER }]
    if (kind === 'reconnect') return [{ label: 'Reconnect required', className: AMBER }]
    if (kind === 'missed') return [{ label: 'Missed schedule', className: AMBER }]
    if (kind === 'approval') return [{ label: 'Approval required', className: AMBER }]
    return [{ label: 'Failed to publish', className: RED }]
  }
  // A scheduled post that is in the approval workflow but not fully approved will NOT be published
  // (the backend blocks it); say so instead of an unqualified green "Scheduled".
  const awaiting = post.approval?.managed && !post.approval.publishable
  const badges = [awaiting ? { label: 'Awaiting approval', className: AMBER } : { label: 'Scheduled', className: GREEN }]
  if (awaiting) badges.push({ label: post.approval.label, className: AMBER })
  else if (post.approval?.managed) badges.push({ label: 'Approved', className: GREEN })
  if (post.retry) badges.push({ label: `Retry scheduled · attempt ${post.retry.attempts}`, className: AMBER })
  if (accountIssue) badges.push({ label: accountIssue === 'permission' ? 'Permission needed' : 'Reconnect required', className: AMBER })
  return badges
}

/** One real post row in the scheduled/published/failed list. */
export function ScheduledPostCard({
  post, selected, busy = false, accountIssue = null,
  onSelect, onEditSchedule, onView, onDuplicate, onCancel, onRetry, onDiscard, onReconnect,
}) {
  const platform = CALENDAR_PLATFORM_META[post.platform]
  const PlatformIcon = platform?.icon
  const badges = badgesFor(post, accountIssue)
  const failure = post.status === 'failed' ? post.failure : null
  const retryAllowed = failure && failure.canRetry
  const showReconnect = failure?.kind === 'reconnect'

  return (
    <div
      data-testid={`post-${post.id}`}
      data-status={post.status}
      className={`flex flex-col gap-3 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center ${
        selected ? 'border-violet-400 bg-violet-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
      } ${busy ? 'opacity-70' : ''}`}
    >
      <button type="button" onClick={() => onSelect(post.id)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <SocialMediaImage src={post.imageSrc} className="h-14 w-14 shrink-0 rounded-lg">
          {PlatformIcon && (
            <span className={`absolute -bottom-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white ${platform.badgeClass}`}>
              <PlatformIcon className="h-2.5 w-2.5" />
            </span>
          )}
        </SocialMediaImage>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 break-words text-sm font-semibold text-slate-800">{post.title}</p>
          {post.description && <p className="mt-0.5 truncate text-sm text-slate-500">{post.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {badges.map((badge) => (
              <span key={badge.label} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                {badge.spinner && <Loader2 className="h-3 w-3 animate-spin" />}
                {badge.label}
              </span>
            ))}
          </div>

          {post.status === 'scheduled' && post.approval?.managed && !post.approval.publishable && (
            <p className="mt-1.5 text-xs text-amber-700" data-testid="awaiting-approval-note">
              This post will not be published until it is approved.{' '}
              <Link href={`/app/social-media/content-approvals?tab=${post.approval.state === 'design_review' ? 'design-review' : post.approval.state === 'content_review' ? 'content-review' : 'approved'}`} className="font-semibold underline">
                Review approval
              </Link>
            </p>
          )}

          {post.retry && post.retry.nextRetryLabel && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-700">
              <RefreshCw className="h-3 w-3" />
              Next attempt {post.retry.nextRetryLabel}{post.retry.lastError ? ` — ${post.retry.lastError}` : ''}
            </p>
          )}

          {failure && (
            <div className={`mt-1.5 text-xs ${failure.kind === 'unknown' || failure.kind === 'reconnect' || failure.kind === 'missed' || failure.kind === 'approval' ? 'text-amber-800' : 'text-red-600'}`} data-testid="failure-info">
              <p className="font-semibold break-words">{failure.headline}</p>
              {failure.detail && failure.detail !== failure.headline && <p className="mt-0.5 break-words opacity-90">{failure.detail}</p>}
            </div>
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
            {post.time || '—'}{post.zone ? ` ${post.zone}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* The quick "Edit schedule" shortcut hides only while its own side
              panel is already open for this row; every other action stays
              available whether or not the row is selected (a failed post has no
              side panel, so selecting it must never hide Retry/Reconnect). */}
          {post.canEditSchedule && !selected && (
            <button
              type="button"
              onClick={() => onEditSchedule(post.id)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Calendar className="h-3.5 w-3.5" />
              Edit schedule
            </button>
          )}
          {retryAllowed && (
            <button
              type="button"
              onClick={() => onRetry?.(post)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="h-3 w-3 animate-spin" />}
              Retry
            </button>
          )}
          {showReconnect && (
            <button
              type="button"
              onClick={() => onReconnect?.(post)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm transition-colors hover:bg-amber-100"
            >
              Reconnect account
            </button>
          )}
          {post.isPublishing ? null : (
            <PostActionMenu
              post={post}
              disabled={busy}
              onEditSchedule={onEditSchedule}
              onView={onView}
              onDuplicate={onDuplicate}
              onCancel={onCancel}
              onRetry={onRetry}
              onDiscard={onDiscard}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ScheduledPostCard


import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'
import { SocialMediaImage } from './SocialMediaImage'

function formatDay(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** One row in the left-hand approvals post list — a REAL post. */
export function ApprovalPostItem({ post, selected, onSelect }) {
  const platform = CALENDAR_PLATFORM_META[post.platform]
  const PlatformIcon = platform?.icon
  const when = post.status === 'scheduled' && post.date ? `Scheduled ${post.date}` : `Created ${formatDay(post.createdAt)}`

  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      aria-pressed={selected}
      data-testid={`approval-post-${post.id}`}
      className={`flex w-full items-center gap-3 border-l-[3px] px-3 py-3 text-left transition-colors ${
        selected ? 'border-violet-600 bg-violet-50' : 'border-transparent hover:bg-slate-50'
      }`}
    >
      <SocialMediaImage src={post.imageSrc} className="h-11 w-11 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${selected ? 'text-violet-800' : 'text-slate-800'}`}>{post.title}</p>
        <p className="text-xs text-slate-400">{when}</p>
        <div className="mt-1 flex items-center gap-1.5">
          {platform && (
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${platform.badgeClass}`}>
              <PlatformIcon className="h-3 w-3" />
            </span>
          )}
          {post.generation && (
            <span data-testid="ai-badge" className="rounded-full border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">AI-generated</span>
          )}
          {post.approval.needsChanges && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">Changes requested</span>
          )}
        </div>
      </div>
    </button>
  )
}

export default ApprovalPostItem

import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'
import { SocialMediaImage } from './SocialMediaImage'

/** One row in the left-hand approvals post list. */
export function ApprovalPostItem({ post, selected, onSelect }) {
  const platform = CALENDAR_PLATFORM_META[post.platform]
  const PlatformIcon = platform.icon

  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 border-l-[3px] px-3 py-3 text-left transition-colors ${
        selected ? 'border-violet-600 bg-violet-50' : 'border-transparent hover:bg-slate-50'
      }`}
    >
      <SocialMediaImage imageId={post.imageId} className="h-11 w-11 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${selected ? 'text-violet-800' : 'text-slate-800'}`}>{post.title}</p>
        <p className="text-xs text-slate-400">{post.date}</p>
        <span className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full ${platform.badgeClass}`}>
          <PlatformIcon className="h-3 w-3" />
        </span>
      </div>
    </button>
  )
}

export default ApprovalPostItem

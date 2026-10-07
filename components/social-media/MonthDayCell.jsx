import { CALENDAR_STATUS_META } from '@/lib/socialMediaAIDummyData'

const MAX_VISIBLE = 3

/** One day cell in the MonthCalendar grid - date number + up to 3 post chips. */
export function MonthDayCell({ day, posts, selectedPostId, onSelectPost }) {
  const visible = posts.slice(0, MAX_VISIBLE)
  const overflow = posts.length - visible.length

  return (
    <div
      className={`flex min-h-[104px] flex-col gap-1 border-b border-r border-slate-100 p-1.5 ${
        day.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60'
      }`}
    >
      <span className={`text-xs font-semibold ${day.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
        {day.dayNum}
      </span>

      <div className="flex flex-1 flex-col gap-1">
        {visible.map((post) => {
          const status = CALENDAR_STATUS_META[post.status] || CALENDAR_STATUS_META.scheduled
          const selected = post.id === selectedPostId
          return (
            <button
              key={post.id}
              type="button"
              data-testid={`calendar-post-${post.id}`}
              onClick={() => onSelectPost(post.id)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-1 truncate rounded-md px-1.5 py-1 text-left text-[11px] font-medium transition-colors ${
                selected ? 'bg-violet-100 text-violet-800 ring-1 ring-violet-300' : `${status.badgeClass} hover:opacity-80`
              }`}
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dotClass}`} />
              <span className="truncate">{post.title}</span>
            </button>
          )
        })}
        {overflow > 0 && <span className="px-1.5 text-[10px] font-medium text-slate-400">+{overflow} more</span>}
      </div>
    </div>
  )
}

export default MonthDayCell

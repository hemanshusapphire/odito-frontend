"use client"

import { Plus } from 'lucide-react'
import ScheduleCard from './ScheduleCard'

const MAX_VISIBLE = 3

/**
 * One month-view day cell: date number, up to MAX_VISIBLE post chips (+
 * overflow count), and a "Compose Message" affordance for today/future
 * dates only (matching the reference, where past days never offer one).
 */
export default function CalendarDay({ date, isCurrentMonth, isToday, isPast, posts, onCompose }) {
  const visible = posts.slice(0, MAX_VISIBLE)
  const overflow = posts.length - visible.length

  return (
    <div
      className={`group min-h-28 border-r border-b p-2 flex flex-col gap-1 last:border-r-0 ${
        isCurrentMonth ? 'bg-card' : 'bg-muted/20'
      } ${isToday ? 'bg-amber-50 dark:bg-amber-500/10' : ''}`}
    >
      <span className={`text-xs font-semibold ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'} ${isToday ? 'text-amber-600 dark:text-amber-400' : ''}`}>
        {date.getDate()}
      </span>

      <div className="flex flex-col gap-1 flex-1">
        {visible.map((post) => <ScheduleCard key={post.id} post={post} />)}
        {overflow > 0 && <span className="text-[10.5px] text-muted-foreground pl-1">+{overflow} more</span>}
      </div>

      {!isPast && (
        <button
          type="button"
          onClick={() => onCompose(date)}
          className="mt-auto flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <Plus className="h-2.5 w-2.5" />
          Compose Message
        </button>
      )}
    </div>
  )
}

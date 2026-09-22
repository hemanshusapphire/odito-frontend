import { CalendarPostCard } from './CalendarPostCard'

/** One weekday column of the WeekCalendar grid. */
export function CalendarColumn({ day, posts, selectedPostId, onSelectPost, isLast }) {
  return (
    <div className={`flex min-w-[150px] flex-1 flex-col ${isLast ? '' : 'border-r border-slate-200'}`}>
      <div className="border-b border-slate-200 px-3 py-2.5 text-center">
        <p className="text-sm font-semibold text-slate-700">{day.dayLabel}</p>
        <p className="text-xs text-slate-400">{day.dateLabel}</p>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-2.5">
        {posts.map((post) => (
          <CalendarPostCard key={post.id} post={post} selected={post.id === selectedPostId} onSelect={onSelectPost} />
        ))}
      </div>
    </div>
  )
}

export default CalendarColumn

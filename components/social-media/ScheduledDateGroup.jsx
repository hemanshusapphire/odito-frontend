import { ScheduledPostCard } from './ScheduledPostCard'

function formatDateGroup(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  return `${weekday}, ${d} ${month} ${y}`
}

/** One date-grouped section of the scheduled/published/failed list. */
export function ScheduledDateGroup({ date, posts, selectedPostId, ...cardHandlers }) {
  return (
    <div>
      <h3 className="mb-3 text-base font-bold text-slate-900">{formatDateGroup(date)}</h3>
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <ScheduledPostCard key={post.id} post={post} selected={post.id === selectedPostId} {...cardHandlers} />
        ))}
      </div>
    </div>
  )
}

export default ScheduledDateGroup

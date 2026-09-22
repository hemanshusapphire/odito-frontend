import { ScheduledDateGroup } from './ScheduledDateGroup'

/** Groups a tab's posts by date and renders each ScheduledDateGroup in order. */
export function ScheduledPostList({ posts, selectedPostId, ...cardHandlers }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center">
        <p className="text-sm font-semibold text-slate-700">Nothing here right now</p>
        <p className="text-sm text-slate-400">Posts will show up here as they move through the workflow.</p>
      </div>
    )
  }

  const groups = []
  const indexByDate = new Map()
  for (const post of posts) {
    if (!indexByDate.has(post.date)) {
      indexByDate.set(post.date, groups.length)
      groups.push({ date: post.date, posts: [] })
    }
    groups[indexByDate.get(post.date)].posts.push(post)
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <ScheduledDateGroup key={group.date} date={group.date} posts={group.posts} selectedPostId={selectedPostId} {...cardHandlers} />
      ))}
    </div>
  )
}

export default ScheduledPostList

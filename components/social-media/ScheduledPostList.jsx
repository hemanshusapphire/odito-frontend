import { ScheduledDateGroup } from './ScheduledDateGroup'
import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder rows with the same footprint as a post card. */
export function PostListSkeleton({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading posts" data-testid="posts-loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <Skeleton className="h-14 w-14 shrink-0 rounded-lg bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/5 bg-slate-200" />
            <Skeleton className="h-3 w-4/5 bg-slate-100" />
            <Skeleton className="h-4 w-24 rounded-full bg-slate-100" />
          </div>
          <Skeleton className="hidden h-8 w-28 bg-slate-100 sm:block" />
        </div>
      ))}
    </div>
  )
}

/** Error state with a retry action. */
export function PostListError({ message, onRetry, retrying }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-10 text-center" data-testid="posts-error">
      <p className="text-sm font-semibold text-red-700">Couldn&apos;t load your posts</p>
      <p className="max-w-md text-sm text-red-600/90">{message || 'The request to Odito failed. Your posts were not changed.'}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-1 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {retrying ? 'Retrying…' : 'Try again'}
      </button>
    </div>
  )
}

/** Groups a tab's posts by date and renders each ScheduledDateGroup in order. */
export function ScheduledPostList({
  posts, selectedPostId, busyPostId, accountIssues,
  emptyTitle = 'Nothing here right now',
  emptyMessage = 'Posts will show up here as they move through the workflow.',
  emptyAction = null,
  ...cardHandlers
}) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center" data-testid="posts-empty">
        <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
        <p className="text-sm text-slate-400">{emptyMessage}</p>
        {emptyAction}
      </div>
    )
  }

  const groups = []
  const indexByDate = new Map()
  for (const post of posts) {
    const key = post.date || 'none'
    if (!indexByDate.has(key)) {
      indexByDate.set(key, groups.length)
      groups.push({ date: post.date, key, posts: [] })
    }
    groups[indexByDate.get(key)].posts.push(post)
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <ScheduledDateGroup
          key={group.key}
          date={group.date}
          posts={group.posts}
          selectedPostId={selectedPostId}
          busyPostId={busyPostId}
          accountIssues={accountIssues}
          {...cardHandlers}
        />
      ))}
    </div>
  )
}

export default ScheduledPostList

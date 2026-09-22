import { PerformanceRow } from './PerformanceRow'

/** Column header + rows for the Top-performing content table, horizontally scrollable on small screens. */
export function PerformanceTable({ posts, ...rowHandlers }) {
  if (posts.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No posts in the selected period.</p>
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto_auto_auto] gap-4 border-b border-slate-200 pb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>Post</span>
          <span>Platform</span>
          <span>Reach</span>
          <span>Engagement</span>
          <span>Clicks</span>
          <span>Actions</span>
        </div>
        {posts.map((post) => (
          <PerformanceRow key={post.id} post={post} {...rowHandlers} />
        ))}
      </div>
    </div>
  )
}

export default PerformanceTable

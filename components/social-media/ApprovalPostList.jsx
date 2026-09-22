import { ApprovalPostItem } from './ApprovalPostItem'

/** Scrollable list of posts for the active approval tab. */
export function ApprovalPostList({ posts, selectedPostId, onSelectPost }) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center">
        <p className="text-sm font-semibold text-slate-700">Nothing here right now</p>
        <p className="text-sm text-slate-400">Posts will show up here as they move through the workflow.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {posts.map((post) => (
        <ApprovalPostItem key={post.id} post={post} selected={post.id === selectedPostId} onSelect={onSelectPost} />
      ))}
    </div>
  )
}

export default ApprovalPostList

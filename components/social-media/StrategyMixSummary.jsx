/** Compact chip recap of the current post-type mix - "Your content mix". */
export function StrategyMixSummary({ postTypes, selectedIds, distribution }) {
  const selectedPostTypes = postTypes.filter((pt) => selectedIds.has(pt.id))
  if (selectedPostTypes.length === 0) return null

  return (
    <div className="rounded-xl border border-violet-100 bg-white/60 p-3.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your content mix</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedPostTypes.map((postType) => {
          const Icon = postType.icon
          return (
            <span
              key={postType.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm"
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${postType.tint}`}>
                <Icon className="h-2.5 w-2.5" />
              </span>
              {postType.name}
              <span className="font-semibold text-violet-600">{distribution[postType.id] || 0}%</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default StrategyMixSummary

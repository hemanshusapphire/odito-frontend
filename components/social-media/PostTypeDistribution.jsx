"use client"

import { DistributionSlider } from './DistributionSlider'

/** "Post type distribution" sliders - one row per currently selected post type, always summing to 100. */
export function PostTypeDistribution({ postTypes, selectedIds, distribution, onChange }) {
  const selectedPostTypes = postTypes.filter((pt) => selectedIds.has(pt.id))

  return (
    <div className="border-t border-slate-200 pt-4">
      <p className="text-sm font-semibold text-slate-800">Post type distribution</p>
      <p className="mt-0.5 text-sm text-slate-500">
        Choose how much of each selected post type should appear in your content calendar.
      </p>

      {selectedPostTypes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">Select at least one post type above to set its distribution.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3.5">
          {selectedPostTypes.map((postType) => (
            <DistributionSlider
              key={postType.id}
              postType={postType}
              value={distribution[postType.id] || 0}
              onChange={(value) => onChange(postType.id, value)}
              disabled={selectedPostTypes.length === 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PostTypeDistribution

"use client"

import { PostTypeCard } from './PostTypeCard'

/** "Choose your post types" multi-select grid - any combination of the four post types can be active. */
export function PostTypeSelector({ postTypes, selectedIds, onToggle }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">Choose your post types</p>
      <p className="mt-0.5 text-sm text-slate-500">
        Select the types of posts you want AI to create for your social media strategy.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {postTypes.map((postType) => (
          <PostTypeCard key={postType.id} postType={postType} selected={selectedIds.has(postType.id)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

export default PostTypeSelector

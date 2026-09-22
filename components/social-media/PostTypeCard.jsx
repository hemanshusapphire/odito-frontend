"use client"

import { Check } from 'lucide-react'

/** One selectable post-type card in the "Choose your post types" grid - multi-select, not mutually exclusive. */
export function PostTypeCard({ postType, selected, onToggle }) {
  const Icon = postType.icon

  return (
    <button
      type="button"
      onClick={() => onToggle(postType.id)}
      aria-pressed={selected}
      className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
        selected ? 'border-violet-500 bg-violet-50/70' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? 'border-violet-600 bg-violet-600' : 'border-slate-300 bg-white'
        }`}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${postType.tint}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold text-slate-900">{postType.name}</span>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">{postType.description}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {postType.examples.map((example) => (
            <span key={example} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
              {example}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

export default PostTypeCard

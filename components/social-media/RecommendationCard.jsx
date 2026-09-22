import { ChevronRight } from 'lucide-react'

/** One actionable insight row inside the AI recommendations card. */
export function RecommendationCard({ recommendation, onSelect }) {
  const Icon = recommendation.icon

  return (
    <button
      type="button"
      onClick={() => onSelect?.(recommendation)}
      className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-colors hover:border-violet-200 hover:bg-violet-50/40"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-800">{recommendation.title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-slate-500">{recommendation.description}</span>
      </span>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500" />
    </button>
  )
}

export default RecommendationCard

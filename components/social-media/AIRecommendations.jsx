import { Sparkles } from 'lucide-react'
import { RecommendationCard } from './RecommendationCard'

/** "AI recommendations" card listing actionable insights. */
export function AIRecommendations({ recommendations, onSelectRecommendation }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <h2 className="text-base font-bold text-slate-900">AI recommendations</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">Actionable insights based on your performance.</p>

      <div className="mt-4 flex flex-col gap-3">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} onSelect={onSelectRecommendation} />
        ))}
      </div>
    </div>
  )
}

export default AIRecommendations

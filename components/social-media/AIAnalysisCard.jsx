import { Lock } from 'lucide-react'

/** "What AI will analyze" summary card shown beside the business profile form. */
export function AIAnalysisCard({ items }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
      <h2 className="text-base font-bold text-slate-900">What AI will analyze</h2>
      <p className="mt-1 text-sm text-slate-500">
        We&apos;ll analyze your connected accounts and business information to create personalized recommendations.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="mt-0.5 text-sm text-slate-500">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-800">You stay in control.</p>
          <p className="mt-0.5 text-xs text-emerald-700/80">Nothing publishes without approval.</p>
        </div>
      </div>
    </div>
  )
}

export default AIAnalysisCard

import Link from 'next/link'
import { Target, ChevronRight } from 'lucide-react'

/** "This month's strategy" card: primary goal + content-mix breakdown. */
export function StrategyCard({ strategy }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Target className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">{strategy.goalLabel}</p>
          <p className="truncate text-sm font-bold text-slate-900">{strategy.goal}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-500">{strategy.description}</p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Content mix</p>
        <div className="flex flex-col gap-1">
          {strategy.contentMix.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.id}
                href="/app/social-media/ai-strategy"
                className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{item.label}</span>
                <span className="text-sm font-semibold text-slate-900">{item.percentage}%</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StrategyCard

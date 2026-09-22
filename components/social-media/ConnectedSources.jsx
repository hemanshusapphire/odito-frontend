import { CheckCircle2 } from 'lucide-react'

/** "Based on your connected sources:" bar shown at the top of AI Strategy. */
export function ConnectedSources({ sources }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
      <p className="shrink-0 text-sm font-medium text-slate-500">Based on your connected sources:</p>

      <div className="flex flex-1 flex-col divide-y divide-slate-100 sm:flex-row sm:divide-x sm:divide-y-0">
        {sources.map((source) => {
          const Icon = source.icon
          return (
            <div key={source.id} className="flex items-center gap-2.5 py-3 first:pt-0 sm:py-0 sm:px-5 sm:first:pl-0">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${source.iconClass}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-800">{source.label}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                </div>
                <p className="truncate text-xs text-slate-400">{source.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ConnectedSources

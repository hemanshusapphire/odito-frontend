import { ArrowUp } from 'lucide-react'

/** One KPI card in the Analytics summary row (Reach, Engagements, Link clicks, Tracked leads). */
export function MetricCard({ metric }) {
  const Icon = metric.icon
  const positive = metric.change.trim().startsWith('+')

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.tint}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-slate-500">{metric.label}</span>
      </div>
      <div>
        <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className={`flex items-center gap-0.5 font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
          <ArrowUp className={`h-3 w-3 ${positive ? '' : 'rotate-180'}`} />
          {metric.change}
        </span>
        <span className="text-slate-400">{metric.supportingText}</span>
      </div>
    </div>
  )
}

export default MetricCard

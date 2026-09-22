import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const ICON_TINTS = [
  'bg-violet-50 text-violet-600',
  'bg-rose-50 text-rose-500',
  'bg-emerald-50 text-emerald-600',
  'bg-sky-50 text-sky-600',
]

/** One of the four Overview summary tiles (Content reviews, Designs to approve, ...). */
export function OverviewStatCard({ stat, tintIndex = 0 }) {
  const Icon = stat.icon
  const tint = ICON_TINTS[tintIndex % ICON_TINTS.length]

  return (
    <Link
      href={stat.href}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-2xl font-bold leading-none text-slate-900">{stat.value}</div>
          <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500" />
    </Link>
  )
}

export default OverviewStatCard

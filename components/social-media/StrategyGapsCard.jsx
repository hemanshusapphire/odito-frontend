import Link from 'next/link'
import { Info } from 'lucide-react'
import { gapLabel, PRIORITY_LABELS } from '@/lib/socialMedia/aiStrategy'

const TONE = { high: 'border-red-200 bg-red-50 text-red-700', medium: 'border-amber-200 bg-amber-50 text-amber-700', low: 'border-slate-200 bg-slate-50 text-slate-600' }
const ORDER = { high: 0, medium: 1, low: 2 }

/**
 * Information the strategy could not rely on. Each gap is real: the server computes them from the
 * Business Profile (and the AI may add more it noticed) — the AI never filled the hole with an invention.
 */
export function StrategyGapsCard({ gaps, title = 'Missing information', subtitle = 'Add these to your Business profile for a more specific strategy.' }) {
  if (!gaps?.length) return null
  const sorted = [...gaps].sort((a, b) => ORDER[a.importance] - ORDER[b.importance])
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5" data-testid="strategy-gaps">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Info className="h-5 w-5" /></span>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col divide-y divide-slate-100">
        {sorted.map((gap) => (
          <li key={`${gap.field}-${gap.source}`} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:gap-3" data-testid={`gap-${gap.field}`}>
            <span className={`inline-flex w-fit shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TONE[gap.importance]}`}>{PRIORITY_LABELS[gap.importance]}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">{gapLabel(gap.field)}</p>
              <p className="text-sm text-slate-500">{gap.reason}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/app/social-media/business-profile" className="mt-3 inline-block text-sm font-semibold text-violet-600 hover:text-violet-700">Open Business profile</Link>
    </div>
  )
}

export default StrategyGapsCard

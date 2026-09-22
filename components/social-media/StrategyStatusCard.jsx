"use client"

import { Check, ChevronRight } from 'lucide-react'

/** Green "Analysis complete" status card shown top-right of the AI Strategy header. */
export function StrategyStatusCard({ status, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left transition-colors hover:bg-emerald-100/70"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-900">{status.title}</span>
        <span className="block text-xs text-emerald-700">{status.subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-emerald-600" />
    </button>
  )
}

export default StrategyStatusCard

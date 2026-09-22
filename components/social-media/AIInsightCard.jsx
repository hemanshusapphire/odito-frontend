"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, X, ArrowRight } from 'lucide-react'

/** AI-generated strategy insight card, dismissible for this session. */
export function AIInsightCard({ insight }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-emerald-50/40 p-5">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss insight"
        className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full text-emerald-700/50 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
        <Sparkles className="h-4 w-4" />
        AI insight
      </div>

      <h3 className="pr-6 text-lg font-bold leading-snug text-slate-900">{insight.title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{insight.body}</p>

      <Link
        href={insight.ctaHref}
        className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50"
      >
        {insight.ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>

      <p className="mt-auto pt-5 text-xs italic leading-relaxed text-slate-500">{insight.quote}</p>
    </div>
  )
}

export default AIInsightCard

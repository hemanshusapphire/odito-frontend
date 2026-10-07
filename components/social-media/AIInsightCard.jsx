"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, X, ArrowRight } from 'lucide-react'

/**
 * Overview insight card. Its content is the first recommendation of the project's REAL AI strategy.
 * There is no separate "insight" generator, so with no strategy (or no recommendations) it says so and
 * points to AI Strategy instead of showing sample advice. Dismissible for this session.
 */
export function AIInsightCard({ state }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const recommendation = state?.strategy?.strategy?.recommendations?.[0]
  const hasStrategy = !!state?.strategy

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-emerald-50/40 p-5" data-testid="overview-insight">
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
        AI strategy
      </div>

      {recommendation ? (
        <>
          <h3 className="pr-6 text-lg font-bold leading-snug text-slate-900">Top recommendation</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600" data-testid="overview-insight-body">{recommendation}</p>
        </>
      ) : (
        <>
          <h3 className="pr-6 text-lg font-bold leading-snug text-slate-900">{hasStrategy ? 'No recommendations yet' : 'No AI strategy yet'}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600" data-testid="overview-insight-body">
            {hasStrategy ? 'Your strategy has no recommendations. Regenerate it after updating your Business profile.' : 'Generate an AI strategy from your Business profile to get tailored recommendations here.'}
          </p>
        </>
      )}

      <Link
        href="/app/social-media/ai-strategy"
        className="mt-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50"
      >
        {hasStrategy ? 'Review strategy' : 'Create strategy'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default AIInsightCard

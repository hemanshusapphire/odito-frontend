"use client"

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

/**
 * "Adjust strategy" / "Approve & create calendar" buttons. Frontend-only:
 * approving just walks local state through a loading -> success sequence,
 * no API call, no navigation.
 */
export function StrategyActions({ onAdjust }) {
  const [state, setState] = useState('idle') // idle | approving | approved

  function handleApprove() {
    if (state !== 'idle') return
    setState('approving')
    setTimeout(() => setState('approved'), 1000)
  }

  return (
    <>
      <button
        type="button"
        onClick={onAdjust}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
      >
        Adjust strategy
      </button>
      <button
        type="button"
        onClick={handleApprove}
        disabled={state !== 'idle'}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed ${
          state === 'approved' ? 'bg-emerald-600' : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-80'
        }`}
      >
        {state === 'approving' && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === 'idle' && <Check className="h-4 w-4" />}
        {state === 'approved' && <Check className="h-4 w-4" />}
        {state === 'approving' ? 'Creating calendar…' : state === 'approved' ? 'Strategy approved' : 'Approve & create calendar'}
      </button>
    </>
  )
}

export default StrategyActions

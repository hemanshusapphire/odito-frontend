"use client"

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { CONTENT_FIELD_CLASS } from './ContentField'

/** "Need a fresh take?" AI regeneration prompt shown below the hashtags field. */
export function AIRegeneratePanel({ onRegenerate }) {
  const [instruction, setInstruction] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  function handleClick() {
    if (regenerating) return
    setRegenerating(true)
    setTimeout(() => {
      onRegenerate(instruction)
      setInstruction('')
      setRegenerating(false)
    }, 900)
  }

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
      <p className="text-sm font-semibold text-slate-800">Need a fresh take?</p>
      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Tell AI what to change..."
          className={`${CONTENT_FIELD_CLASS} flex-1`}
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={regenerating}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-violet-300 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Regenerating…' : 'Regenerate content'}
        </button>
      </div>
    </div>
  )
}

export default AIRegeneratePanel

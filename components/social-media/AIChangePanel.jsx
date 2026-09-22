"use client"

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

/** "Tell the AI what to change" instruction bar below the regenerate controls. */
export function AIChangePanel({ onApply }) {
  const [instruction, setInstruction] = useState('Make the headline larger and use a lighter background')
  const [applying, setApplying] = useState(false)

  function handleApply() {
    if (applying || !instruction.trim()) return
    setApplying(true)
    setTimeout(() => {
      onApply(instruction)
      setApplying(false)
    }, 900)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <label className="text-sm font-semibold text-slate-800">
        Tell the AI what to change <span className="font-normal text-slate-400">(optional)</span>
      </label>
      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. Use a bolder headline"
          className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 hover:border-slate-300"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={applying || !instruction.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {applying ? 'Applying…' : 'Apply changes'}
        </button>
      </div>
    </div>
  )
}

export default AIChangePanel

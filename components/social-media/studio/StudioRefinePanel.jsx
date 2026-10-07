"use client"

import { useId } from 'react'
import { Loader2, Wand2 } from 'lucide-react'
import { MAX_INSTRUCTION_LENGTH, creativeLabel, instructionProblem } from '@/lib/socialMedia/studio'

// Suggestions only fill the box; they are the user's text to edit, not an action.
const SUGGESTIONS = ['Make the headline larger', 'Use a darker background', 'Make it look more premium', 'Use more white space']

/**
 * "Tell the AI what to change": a real refinement of the chosen design. The text goes to the server with the design's own id; the server
 * loads the post, the brief, the current image and the brand, makes a new image and returns it to Design Review - never approved.
 */
export function StudioRefinePanel({ target, value, onChange, busy, canAct, onApply }) {
  const id = useId()
  const problem = instructionProblem(value)
  const ready = !!target && value.trim().length > 0 && !problem
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="studio-refine" aria-label="Tell the AI what to change">
      <h3 className="text-base font-bold text-slate-900">Tell the AI what to change</h3>
      <p className="mt-1 text-sm text-slate-500" data-testid="refine-target">
        {target ? <>Changing the <span className="font-semibold text-slate-700">{creativeLabel(target)}</span> design.</> : 'Choose one of the designs above, then describe the change.'}
      </p>
      <label htmlFor={id} className="sr-only">What should change?</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_INSTRUCTION_LENGTH + 100}
        rows={3}
        disabled={!target}
        placeholder="e.g. Make the headline larger and use a darker background"
        data-testid="refine-input"
        className="mt-3 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
      />
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className={problem ? 'text-red-600' : 'text-slate-400'} role={problem ? 'alert' : undefined}>{problem || 'The AI changes only what you ask. Your brand rules and facts stay the same.'}</span>
        <span className="text-slate-400">{value.length}/{MAX_INSTRUCTION_LENGTH}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" disabled={!target} onClick={() => onChange(s)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">{s}</button>
        ))}
      </div>
      <button type="button" onClick={onApply} disabled={!ready || busy || !canAct} data-testid="apply-ai-changes" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Wand2 className="h-4 w-4" aria-hidden />}Apply AI changes
      </button>
    </section>
  )
}

export default StudioRefinePanel

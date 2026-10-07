"use client"

import { Check } from 'lucide-react'
import { STUDIO_STATES, STUDIO_STATE_LABEL } from '@/lib/socialMedia/studio'

// Which steps are done, decided only from the studio state the server's data is in.
const STEPS = [
  { id: 'content', label: 'Content approved' },
  { id: 'designs', label: 'Choose a design' },
  { id: 'review', label: 'Design review' },
  { id: 'approved', label: 'Design approved' },
]

const CURRENT_STEP = {
  [STUDIO_STATES.CONTENT_PENDING]: 0,
  [STUDIO_STATES.READY]: 1,
  [STUDIO_STATES.GENERATING]: 1,
  [STUDIO_STATES.FAILED]: 1,
  [STUDIO_STATES.DESIGNS_READY]: 1,
  [STUDIO_STATES.DESIGN_SELECTED]: 2,
  [STUDIO_STATES.DESIGN_REVIEW]: 2,
  [STUDIO_STATES.DESIGN_APPROVED]: 4,
}

/** A real stepper: where THIS post is in the workflow, plus the state's name. */
export function StudioProgress({ state }) {
  const current = CURRENT_STEP[state] ?? 0
  return (
    <div data-testid="studio-progress" data-state={state}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status: <span className="text-slate-700" data-testid="studio-state-label">{STUDIO_STATE_LABEL[state]}</span></p>
      <ol className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Workflow">
        {STEPS.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={step.id} className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-emerald-600 text-white' : active ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={`text-sm ${active ? 'font-semibold text-slate-900' : done ? 'text-slate-600' : 'text-slate-400'}`}>{step.label}</span>
              {i < STEPS.length - 1 && <span className="hidden h-px w-6 bg-slate-200 sm:block" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default StudioProgress

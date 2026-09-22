import { Check } from 'lucide-react'

/**
 * Bottom workflow indicator (Content approved -> Design review -> Schedule).
 * Unlike SetupStepper (Connect Accounts), completed steps here render green,
 * not purple - Creative Studio's reference treats "done" and "current" as
 * visually distinct states.
 */
export function WorkflowStepper({ steps, currentStepId }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId)

  return (
    <div className="flex items-center gap-3">
      {steps.map((step, index) => {
        const complete = index < currentIndex
        const current = index === currentIndex
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className={`flex items-center gap-3 ${isLast ? '' : 'flex-1'}`}>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  complete
                    ? 'bg-emerald-500 text-white'
                    : current
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {complete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index + 1}
              </span>
              <span className={`whitespace-nowrap text-sm font-medium ${
                complete ? 'text-emerald-700' : current ? 'text-violet-700' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {!isLast && <div className={`h-px flex-1 ${complete ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default WorkflowStepper

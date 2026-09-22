import { Check } from 'lucide-react'

/** Horizontal 3-step progress indicator shared by the account setup flow. */
export function SetupStepper({ steps, currentStepId }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId)

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex
        const isCurrent = index === currentIndex
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isComplete
                    ? 'bg-violet-600 text-white'
                    : isCurrent
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className={`whitespace-nowrap text-sm font-medium ${isCurrent ? 'text-violet-700' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`mx-3 mb-6 h-px flex-1 ${isComplete ? 'bg-violet-300' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SetupStepper

"use client"

import { useState } from 'react'
import { Target, AlertCircle, Check, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

/** Bottom-of-page "Strategy update" banner with a Review changes dialog and Apply action. */
export function StrategyUpdateBanner({ update, onApplied }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [applyState, setApplyState] = useState('idle') // idle | applying | applied

  function handleApply() {
    if (applyState !== 'idle') return
    setApplyState('applying')
    setTimeout(() => {
      setApplyState('applied')
      onApplied?.()
    }, 1000)
  }

  return (
    <>
      <div className="flex flex-col gap-5 rounded-2xl border border-violet-200 bg-violet-50/60 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Target className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">{update.eyebrow}</p>
            <h2 className="mt-0.5 text-lg font-bold text-slate-900">{update.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{update.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:w-[340px] lg:shrink-0">
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-700">{update.alertTitle}</p>
              <p className="text-xs text-red-600">{update.alertDescription}</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Review changes
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={applyState !== 'idle'}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed ${
                applyState === 'applied' ? 'bg-emerald-600' : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-80'
              }`}
            >
              {applyState === 'applying' && <Loader2 className="h-4 w-4 animate-spin" />}
              {applyState === 'applied' && <Check className="h-4 w-4" />}
              {applyState === 'applied' ? 'Applied' : applyState === 'applying' ? 'Applying…' : 'Apply to next calendar'}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-800 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900">{update.title}</DialogTitle>
            <DialogDescription className="text-slate-500">
              Here&apos;s what would change if you apply this to next month&apos;s calendar.
            </DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-2.5">
            {update.reviewSummary.map((item) => (
              <li key={item} className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                {item}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default StrategyUpdateBanner

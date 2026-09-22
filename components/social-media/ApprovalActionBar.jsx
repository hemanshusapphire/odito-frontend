"use client"

import { useState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'

/**
 * Bottom "Save draft" / "Approve content & generate designs" bar. Visual
 * loading/success state is local to this component; the actual field +
 * status commit happens in the parent's onSaveDraft/onApprove callbacks.
 */
export function ApprovalActionBar({ postStatus, onSaveDraft, onApprove }) {
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved
  const [approveState, setApproveState] = useState('idle') // idle | approving | approved
  const alreadyApproved = postStatus === 'approved'

  function handleSaveDraft() {
    if (saveState === 'saving') return
    setSaveState('saving')
    onSaveDraft()
    setTimeout(() => {
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1800)
    }, 500)
  }

  function handleApprove() {
    if (approveState !== 'idle' || alreadyApproved) return
    setApproveState('approving')
    setTimeout(() => {
      onApprove()
      setApproveState('approved')
    }, 1000)
  }

  return (
    <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={handleSaveDraft}
        disabled={saveState === 'saving'}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
        {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Save draft'}
      </button>

      <button
        type="button"
        onClick={handleApprove}
        disabled={approveState !== 'idle' || alreadyApproved}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed ${
          alreadyApproved || approveState === 'approved'
            ? 'bg-emerald-600'
            : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-80'
        }`}
      >
        {approveState === 'approving' && <Loader2 className="h-4 w-4 animate-spin" />}
        {(alreadyApproved || approveState === 'approved') && <Check className="h-4 w-4" />}
        {alreadyApproved || approveState === 'approved'
          ? 'Approved'
          : approveState === 'approving'
            ? 'Approving…'
            : 'Approve content & generate designs'}
        {approveState === 'idle' && !alreadyApproved && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default ApprovalActionBar

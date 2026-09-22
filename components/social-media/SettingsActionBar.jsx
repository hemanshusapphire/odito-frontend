"use client"

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

/** Bottom-right "Cancel" / "Save changes" bar for the Brand kit tab. */
export function SettingsActionBar({ onCancel, onSave }) {
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved

  function handleSave() {
    if (saveState !== 'idle') return
    setSaveState('saving')
    setTimeout(() => {
      onSave()
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1800)
    }, 700)
  }

  return (
    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={saveState !== 'idle'}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed ${
          saveState === 'saved' ? 'bg-emerald-600' : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-80'
        }`}
      >
        {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
        {saveState === 'saved' && <Check className="h-4 w-4" />}
        {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}

export default SettingsActionBar

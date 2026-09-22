"use client"

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { SchedulePreview } from './SchedulePreview'
import { PlatformSelector } from './PlatformSelector'
import { DateSelector } from './DateSelector'
import { TimeSelector } from './TimeSelector'
import { TimezoneSelector } from './TimezoneSelector'
import { SCHEDULE_TIMEZONE_OPTIONS } from '@/lib/socialMediaAIDummyData'

function formatDateLong(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Right-side "Confirm schedule" panel for the currently selected post.
 * Keyed by post.id from the parent, so every field naturally resets to
 * that post's own values when the selection changes (no effect needed).
 */
export function ConfirmSchedulePanel({ post, onConfirm, onSaveForLater }) {
  const [date, setDate] = useState(formatDateLong(post.date))
  const [time, setTime] = useState(post.time)
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [platforms, setPlatforms] = useState(() => new Set(['facebook', 'instagram']))
  const [confirmState, setConfirmState] = useState('idle') // idle | confirming | confirmed
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved

  function togglePlatform(id) {
    setPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleConfirm() {
    if (confirmState !== 'idle') return
    setConfirmState('confirming')
    setTimeout(() => {
      onConfirm({ date, time, timezone })
      setConfirmState('confirmed')
      setTimeout(() => setConfirmState('idle'), 2000)
    }, 900)
  }

  function handleSaveForLater() {
    if (saveState === 'saving') return
    setSaveState('saving')
    onSaveForLater()
    setTimeout(() => {
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1800)
    }, 500)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-bold text-slate-900">Confirm schedule</h2>
      <p className="mt-1 text-sm text-slate-500">Review your post details and confirm the schedule.</p>

      <div className="mt-4">
        <SchedulePreview post={post} />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Post to</p>
          <PlatformSelector platforms={['facebook', 'instagram']} selected={platforms} onToggle={togglePlatform} />
        </div>

        <DateSelector value={date} onChange={setDate} />
        <TimeSelector value={time} onChange={setTime} />
        <TimezoneSelector options={SCHEDULE_TIMEZONE_OPTIONS} value={timezone} onChange={setTimezone} />
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirmState !== 'idle'}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors disabled:cursor-not-allowed ${
            confirmState === 'confirmed' ? 'bg-emerald-600' : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-80'
          }`}
        >
          {confirmState === 'confirming' && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmState === 'confirmed' && <Check className="h-4 w-4" />}
          {confirmState === 'confirmed' ? 'Schedule confirmed' : confirmState === 'confirming' ? 'Confirming…' : 'Confirm schedule'}
        </button>

        <button
          type="button"
          onClick={handleSaveForLater}
          disabled={saveState === 'saving'}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Save for later'}
        </button>
      </div>
    </div>
  )
}

export default ConfirmSchedulePanel

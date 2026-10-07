"use client"

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { REGEN_FIELDS, REGEN_FIELD_LABELS } from '@/lib/socialMedia/calendarItemForm'

/**
 * "Regenerate this plan?" - asks which planning fields Odito may rewrite for ONE post. Fields the user has edited are never
 * pre-selected, and choosing one is an explicit, visible decision to replace it (the server enforces the same rule, so a
 * stale client cannot overwrite an edit by accident). It rewrites planning fields only: no caption, design or post is created.
 */
export function CalendarRegenerateDialog({ editedFields = [], pending = false, error = null, onCancel, onConfirm }) {
  const [selected, setSelected] = useState(() => REGEN_FIELDS.filter((f) => !editedFields.includes(f)))
  const overwrites = selected.filter((f) => editedFields.includes(f))

  const toggle = (field) => setSelected((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : REGEN_FIELDS.filter((f) => prev.includes(f) || f === field)))

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onCancel() }}>
      <DialogContent className="max-w-md border-slate-200 bg-white text-slate-800" data-testid="regenerate-dialog">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Regenerate this plan?</DialogTitle>
          <DialogDescription className="text-slate-500">
            Odito writes new ideas for the fields you choose, for this post only. Nothing is created, scheduled or published.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="grid grid-cols-1 gap-1.5 sm:grid-cols-2" disabled={pending}>
          <legend className="sr-only">Fields to regenerate</legend>
          {REGEN_FIELDS.map((field) => {
            const edited = editedFields.includes(field)
            return (
              <label key={field} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${selected.includes(field) ? (edited ? 'border-amber-300 bg-amber-50' : 'border-violet-300 bg-violet-50/60') : 'border-slate-200 bg-white'}`}>
                <input type="checkbox" checked={selected.includes(field)} onChange={() => toggle(field)} className="mt-0.5 h-4 w-4 accent-violet-600" />
                <span>
                  <span className="font-medium">{REGEN_FIELD_LABELS[field]}</span>
                  {edited && <span className="block text-xs text-amber-700">You edited this</span>}
                </span>
              </label>
            )
          })}
        </fieldset>

        {overwrites.length > 0 && (
          <p role="alert" data-testid="regenerate-overwrite-warning" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This will replace your edits to the {overwrites.map((f) => REGEN_FIELD_LABELS[f].toLowerCase()).join(', ')}.
          </p>
        )}
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" data-testid="regenerate-error">{error}</p>}

        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onCancel} disabled={pending} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">Cancel</button>
          <button
            type="button"
            onClick={() => onConfirm({ fields: selected, overwriteEdited: overwrites.length > 0 })}
            disabled={pending || !selected.length}
            data-testid="regenerate-confirm"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}Regenerate
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarRegenerateDialog

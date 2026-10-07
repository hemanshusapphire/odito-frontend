"use client"

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CONTENT_FIELD_CLASS } from './ContentField'

/** Same bound the backend enforces (approvalWorkflow.js MAX_REASON_LENGTH); the backend is still authoritative. */
export const MAX_REASON_LENGTH = 2000

/**
 * "Request changes" dialog for a content or design review. The reason is
 * REQUIRED and is stored by the backend with the actor and time, then shown to
 * whoever edits the post. While `pending` it cannot be dismissed or submitted
 * twice. `error` is the backend's own refusal (stale version, state changed...).
 */
export function RequestChangesDialog({ open, stage, pending = false, error = null, onOpenChange, onSubmit }) {
  const [reason, setReason] = useState('')

  // A fresh dialog every time it opens: never carry a previous post's text over.
  useEffect(() => { if (open) setReason('') }, [open])

  const trimmed = reason.trim()
  const tooLong = reason.length > MAX_REASON_LENGTH
  const noun = stage === 'design' ? 'design' : 'content'

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!pending) onOpenChange(next) }}>
      <DialogContent className="border-slate-200 bg-white text-slate-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Request {noun} changes</DialogTitle>
          <DialogDescription className="text-slate-500">
            Tell the author what to change. The post stays in {noun} review until a new version is submitted and approved.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label htmlFor="request-changes-reason" className="mb-1.5 block text-sm font-medium text-slate-700">Reason</label>
          <textarea
            id="request-changes-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            disabled={pending}
            placeholder={stage === 'design' ? 'e.g. The logo is cropped on the left.' : 'e.g. The tone is too casual for our brand.'}
            className={`${CONTENT_FIELD_CLASS} resize-none`}
          />
          <p className={`mt-1 text-xs ${tooLong ? 'text-red-600' : 'text-slate-400'}`}>{reason.length}/{MAX_REASON_LENGTH}</p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(trimmed)}
            disabled={pending || !trimmed || tooLong}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Request changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RequestChangesDialog

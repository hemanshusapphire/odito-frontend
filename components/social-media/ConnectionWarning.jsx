"use client"

import { useState } from 'react'
import { AlertTriangle, Instagram, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

/** Yellow banner warning about an expired platform connection blocking scheduled posts. */
export function ConnectionWarning({ warning, onReconnected }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  function handleReconnect() {
    if (reconnecting) return
    setReconnecting(true)
    setTimeout(() => {
      setReconnecting(false)
      setDialogOpen(false)
      onReconnected()
    }, 1000)
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900">{warning.title}</p>
            <p className="text-sm text-amber-700">{warning.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          {warning.actionLabel}
        </button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Reconnect Instagram</DialogTitle>
            <DialogDescription className="text-slate-500">
              This refreshes Sapphire Digital Agency&apos;s Instagram connection so scheduled posts can publish again.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white">
              <Instagram className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">@sapphiredigitalagency</p>
              <p className="text-xs text-slate-400">Preview only - no real Meta connection is made.</p>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={handleReconnect}
              disabled={reconnecting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {reconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
              {reconnecting ? 'Reconnecting…' : 'Reconnect Instagram'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ConnectionWarning

"use client"

import { useState } from 'react'
import { ImageIcon, Maximize2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

/**
 * A post's design image, shown WHOLE (never cropped: object-contain on a neutral backdrop, whatever its shape) and
 * clickable: a click opens the same image large in a centered preview, so a reviewer can check the design properly
 * before approving it. The image is the post's real uploaded media; nothing is fetched or generated here.
 * A file that fails to load shows a neutral placeholder instead of a broken-image icon.
 */
export function DesignPreview({ src, alt = 'Post design', maxHeightClass = 'max-h-[460px]' }) {
  const [open, setOpen] = useState(false)
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-100 text-slate-300" data-testid="design-preview-fallback">
        <ImageIcon className="h-10 w-10" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="View design full size"
        data-testid="design-preview-button"
        className="group relative flex w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} onError={() => setErrored(true)} data-testid="design-preview-image" className={`block h-auto w-auto max-w-full object-contain ${maxHeightClass}`} />
        <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-slate-900/70 px-2 py-1 text-xs font-semibold text-white opacity-90 transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />Click to enlarge
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-testid="design-preview-dialog"
          className="flex max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-[1200px] flex-col items-center gap-3 border-slate-200 bg-white p-3 sm:p-4"
        >
          <DialogTitle className="sr-only">Design preview</DialogTitle>
          <DialogDescription className="sr-only">The post&apos;s design at full size.</DialogDescription>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} data-testid="design-preview-large" className="block h-auto max-h-[85vh] w-auto max-w-full rounded-lg object-contain" />
          <a href={src} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-violet-700 hover:text-violet-800">Open the original in a new tab</a>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DesignPreview

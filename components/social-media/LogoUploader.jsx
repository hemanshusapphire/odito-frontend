"use client"

import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { SapphireLogoMark } from './SapphireLogoMark'

/** "Logo" section of the Brand kit card - mock upload only, no backend. */
export function LogoUploader({ logoLabel, previewUrl, colors, onReplace }) {
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onReplace(URL.createObjectURL(file))
    e.target.value = ''
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Logo</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <SapphireLogoMark primary={colors.primary} accent={colors.accent} size={36} />
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight text-slate-900">Sapphire</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-slate-400">Digital Agency</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50"
        >
          <Upload className="h-4 w-4" />
          Replace logo
        </button>
        <input ref={fileInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={handleFileChange} />
      </div>
      <p className="mt-1.5 text-xs text-slate-400">Recommended: 512 &times; 512 PNG or SVG, transparent background.</p>
    </div>
  )
}

export default LogoUploader

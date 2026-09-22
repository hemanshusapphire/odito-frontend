"use client"

import { useState } from 'react'
import { X, ImagePlus } from 'lucide-react'
import { BrandColorPicker } from './BrandColorPicker'
import { BrandFontSelect } from './BrandFontSelect'
import { FormatSelect } from './FormatSelect'

/** Right-side "Brand settings" card that guides the AI designs. */
export function BrandSettingsPanel({ settings, font, onFontChange, format, onFormatChange }) {
  const [logoVisible, setLogoVisible] = useState(true)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-bold text-slate-900">Brand settings</h2>
      <p className="mt-1 text-sm text-slate-500">These settings guide the AI designs</p>

      <div className="mt-5">
        <p className="mb-1.5 text-sm font-medium text-slate-700">Logo</p>
        {logoVisible ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0b2a52] text-sm font-bold text-white">
              S
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{settings.logoLabel}</span>
            <button
              type="button"
              onClick={() => setLogoVisible(false)}
              aria-label="Remove logo"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLogoVisible(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm font-medium text-slate-500 transition-colors hover:border-violet-300 hover:text-violet-600"
          >
            <ImagePlus className="h-4 w-4" />
            Add logo
          </button>
        )}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-slate-700">Brand colors</p>
        <BrandColorPicker colors={settings.colors} />
      </div>

      <div className="mt-5">
        <p className="mb-1.5 text-sm font-medium text-slate-700">Font</p>
        <BrandFontSelect options={settings.fontOptions} value={font} onChange={onFontChange} />
      </div>

      <div className="mt-5">
        <p className="mb-1.5 text-sm font-medium text-slate-700">Format</p>
        <FormatSelect options={settings.formatOptions} value={format} onChange={onFormatChange} />
      </div>
    </div>
  )
}

export default BrandSettingsPanel

"use client"

import { Check, ArrowRight } from 'lucide-react'
import { SocialMediaImage } from './SocialMediaImage'

const THEME = {
  photo: {
    kicker: 'text-slate-700/80',
    headline: 'text-violet-700',
    body: 'text-slate-700',
    footerText: 'text-slate-700',
    footerNote: 'text-slate-500',
  },
  dark: {
    kicker: 'text-violet-300',
    headline: 'text-white',
    body: 'text-slate-300',
    footerText: 'text-white',
    footerNote: 'text-slate-400',
  },
  light: {
    kicker: 'text-slate-500',
    headline: 'text-slate-900',
    body: 'text-slate-700',
    footerText: 'text-slate-700',
    footerNote: 'text-slate-500 italic',
  },
}

/**
 * One AI-generated creative in the "Choose from 3 AI designs" grid.
 * The 'dark' brandStyle (design-2) is a deliberate typography-only card -
 * no photo, just a solid brand color - so it keeps its plain background.
 * 'photo'/'light' designs render a real image behind the text, with a
 * light scrim so the copy stays legible regardless of what the sourced
 * photo actually looks like (the old gradients were hand-picked for
 * contrast; a real photo can't guarantee that on its own).
 */
export function DesignCard({ design, selected, onSelect }) {
  const theme = THEME[design.brandStyle] || THEME.photo
  const hasPhoto = design.brandStyle !== 'dark'
  const headlineBase = design.titleAccent
    ? design.title.slice(0, design.title.lastIndexOf(design.titleAccent)).trim()
    : design.title

  return (
    <button
      type="button"
      onClick={() => onSelect(design.id)}
      aria-pressed={selected}
      className={`group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border-2 p-6 text-left shadow-sm transition-all ${
        selected
          ? 'border-violet-500 shadow-lg shadow-violet-200/60'
          : 'border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
      }`}
      style={hasPhoto ? undefined : { background: design.background }}
    >
      {hasPhoto && (
        <>
          <SocialMediaImage imageId={design.imageId} className="absolute inset-0" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-white/0" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white/85 to-white/0" />
        </>
      )}

      {selected && (
        <span className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
      )}

      <div className="relative">
        {design.kicker && <p className={`text-xs font-semibold uppercase tracking-wide ${theme.kicker}`}>{design.kicker}</p>}
        <h3 className={`mt-2 text-2xl font-extrabold leading-tight sm:text-3xl ${theme.headline}`}>
          {headlineBase}
          {design.titleAccent && (
            <>
              <br />
              <span className="text-violet-400">{design.titleAccent}</span>
            </>
          )}
        </h3>
        <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed ${theme.body}`}>{design.description}</p>
      </div>

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
          {design.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0b2a52] text-[10px] font-bold text-white">
              S
            </span>
            <span className={`truncate text-xs font-medium ${theme.footerText}`}>Sapphire Digital Agency</span>
          </div>
          {design.footerNote && (
            <span className={`shrink-0 text-[10px] uppercase tracking-wide ${theme.footerNote}`}>{design.footerNote}</span>
          )}
        </div>
      </div>
    </button>
  )
}

export default DesignCard

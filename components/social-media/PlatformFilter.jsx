"use client"

import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'

/** Toggleable platform chip row (Facebook / Instagram) for the calendar toolbar. */
export function PlatformFilter({ platforms, activePlatforms, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {platforms.map((platform) => {
        const meta = CALENDAR_PLATFORM_META[platform.id]
        const Icon = meta.icon
        const active = activePlatforms.has(platform.id)
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onToggle(platform.id)}
            aria-pressed={active}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-slate-200 bg-white text-slate-800 shadow-sm'
                : 'border-slate-100 bg-slate-50 text-slate-400 hover:text-slate-500'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${active ? meta.badgeClass : 'bg-slate-200 text-slate-400'}`}>
              <Icon className="h-3 w-3" />
            </span>
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}

export default PlatformFilter

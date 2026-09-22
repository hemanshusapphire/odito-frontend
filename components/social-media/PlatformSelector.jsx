"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'

/** "Post to" platform checkboxes in the Confirm Schedule panel. */
export function PlatformSelector({ platforms, selected, onToggle }) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {platforms.map((id) => {
        const meta = CALENDAR_PLATFORM_META[id]
        const Icon = meta.icon
        const checked = selected.has(id)
        return (
          <label key={id} className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={checked}
              onCheckedChange={() => onToggle(id)}
              className="border-slate-300 data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600"
            />
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${meta.badgeClass}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-medium text-slate-700">{meta.label}</span>
          </label>
        )
      })}
    </div>
  )
}

export default PlatformSelector

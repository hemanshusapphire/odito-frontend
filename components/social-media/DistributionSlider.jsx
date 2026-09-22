"use client"

import { Slider } from '@/components/ui/slider'

/** One row of the post-type distribution mix (icon + name, slider, live percentage). */
export function DistributionSlider({ postType, value, onChange, disabled }) {
  const Icon = postType.icon

  return (
    <div className="flex items-center gap-3">
      <span className="flex w-36 shrink-0 items-center gap-2 text-sm font-medium text-slate-700">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${postType.tint}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="truncate">{postType.name}</span>
      </span>

      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        max={100}
        step={1}
        disabled={disabled}
        className="flex-1 [&_[data-slot=slider-range]]:bg-violet-500 [&_[data-slot=slider-thumb]]:border-violet-600 [&_[data-slot=slider-track]]:bg-slate-100"
      />

      <span className="w-11 shrink-0 text-right text-sm font-semibold text-slate-800">{value}%</span>
    </div>
  )
}

export default DistributionSlider

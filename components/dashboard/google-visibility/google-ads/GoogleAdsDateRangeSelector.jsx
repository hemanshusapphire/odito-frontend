"use client"

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarRange } from 'lucide-react'

export const PRESETS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '12m', label: '12 Months' },
  { value: 'all', label: 'All Time' },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Reusable Google Ads date-range selector (Phase 2: Enterprise Historical
 * Sync) - 7 Days / 30 Days / 90 Days / 12 Months / All Time presets plus a
 * Custom range popover. Every value this emits maps directly onto the
 * backend's range=7d|30d|90d|12m|all / startDate&endDate query contract
 * (see odito_backend/src/utils/googleAdsDateRange.js) - the caller never
 * needs to translate between UI labels and API params.
 *
 * Purely presentational/controlled: `value` is {preset, startDate, endDate}
 * ('custom' preset carries startDate/endDate as 'YYYY-MM-DD' strings, every
 * other preset carries them as null), `onChange` receives the same shape.
 * Changing the range NEVER triggers a sync - it only ever changes query
 * params passed to hooks already reading from MongoDB (see page.jsx).
 */
export default function GoogleAdsDateRangeSelector({ value, onChange }) {
  const [customOpen, setCustomOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(value.startDate || '')
  const [draftEnd, setDraftEnd] = useState(value.endDate || todayIso())

  const isCustom = value.preset === 'custom'

  function selectPreset(preset) {
    onChange({ preset, startDate: null, endDate: null })
  }

  function openCustom() {
    setDraftStart(value.startDate || '')
    setDraftEnd(value.endDate || todayIso())
    setCustomOpen(true)
  }

  function applyCustom() {
    if (!draftStart || !draftEnd || draftStart > draftEnd) return
    onChange({ preset: 'custom', startDate: draftStart, endDate: draftEnd })
    setCustomOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs value={isCustom ? '' : value.preset} onValueChange={selectPreset}>
        <TabsList>
          {PRESETS.map((p) => (
            <TabsTrigger
              key={p.value}
              value={p.value}
              className="text-xs px-3 data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground!"
            >
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Popover open={customOpen} onOpenChange={setCustomOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? 'default' : 'outline'}
            size="sm"
            onClick={openCustom}
            className="gap-1.5 text-xs h-9"
          >
            <CalendarRange className="h-3.5 w-3.5" />
            {isCustom ? `${value.startDate} → ${value.endDate}` : 'Custom'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="start">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-foreground">Custom date range</p>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={draftStart}
                max={draftEnd || todayIso()}
                onChange={(e) => setDraftStart(e.target.value)}
                className="h-8 text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={draftEnd}
                min={draftStart}
                max={todayIso()}
                onChange={(e) => setDraftEnd(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <Button
              size="sm"
              className="text-xs"
              disabled={!draftStart || !draftEnd || draftStart > draftEnd}
              onClick={applyCustom}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

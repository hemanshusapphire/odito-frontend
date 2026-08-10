"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const VIEWS = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
]

function titleFor(viewDate, view) {
  if (view === 'day') return viewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  if (view === 'week') {
    const start = new Date(viewDate)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const sameMonth = start.getMonth() === end.getMonth()
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: sameMonth ? undefined : 'short', day: 'numeric', year: 'numeric' })}`
  }
  return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/** Prev/Next/Today navigation + Month/Week/Day view switcher + current-range title. */
export default function CalendarToolbar({ viewDate, view, onPrev, onNext, onToday, onViewChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>Today</Button>
      </div>

      <h3 className="text-lg font-bold tracking-tight order-first w-full text-center sm:order-none sm:w-auto">
        {titleFor(viewDate, view)}
      </h3>

      <Tabs value={view} onValueChange={onViewChange}>
        <TabsList>
          {VIEWS.map((v) => (
            <TabsTrigger key={v.value} value={v.value} className="text-xs px-3">{v.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

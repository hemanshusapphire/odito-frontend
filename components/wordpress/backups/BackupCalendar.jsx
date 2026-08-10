"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BACKUP_DATES, TODAY_ISO } from '@/lib/wordpressBackupsDummyData'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function buildMonthGrid(viewDate) {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  // Monday-first grid (reference uses Mon..Sun columns).
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7
  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - mondayOffset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    return d
  })
}

/** Monthly backup calendar - highlighted backup dates, today indicator, prev/next month, click-to-select. */
export default function BackupCalendar({ selectedDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(() => new Date(2026, 6, 1))
  const backupSet = new Set(BACKUP_DATES)

  function shiftMonth(amount) {
    setViewDate((prev) => {
      const next = new Date(prev)
      next.setMonth(next.getMonth() + amount)
      return next
    })
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => shiftMonth(-1)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold uppercase tracking-wide">
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => shiftMonth(1)} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="text-[10px] font-semibold text-muted-foreground text-center">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {buildMonthGrid(viewDate).map((date) => {
          const key = toDateKey(date)
          const inMonth = date.getMonth() === viewDate.getMonth()
          const hasBackup = backupSet.has(key)
          const isToday = key === TODAY_ISO
          const isSelected = key === selectedDate

          return (
            <button
              key={key}
              onClick={() => hasBackup && onSelectDate(key)}
              disabled={!hasBackup}
              className={`h-8 rounded-md text-xs flex items-center justify-center transition-colors relative ${
                !inMonth ? 'text-muted-foreground/30' : hasBackup ? 'font-semibold cursor-pointer' : 'text-muted-foreground/70'
              } ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/50'
                  : hasBackup
                    ? 'hover:bg-muted'
                    : ''
              } ${isToday && !isSelected ? 'text-primary font-bold' : ''}`}
            >
              {date.getDate()}
              {hasBackup && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

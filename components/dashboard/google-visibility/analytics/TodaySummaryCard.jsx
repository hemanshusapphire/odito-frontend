"use client"

import { Card } from '@/components/ui/card'
import { Users, Activity, Target } from 'lucide-react'

const ICONS = { users: Users, sessions: Activity, conversions: Target }

/** Sidebar "today at a glance" tile - three quick counters. */
export default function TodaySummaryCard({ stats = [] }) {
  return (
    <Card className="p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today's Summary</h3>
      <div className="flex flex-col gap-2.5 mt-3">
        {stats.map((s) => {
          const Icon = ICONS[s.key] || Activity
          return (
            <div key={s.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              <span className="font-mono font-bold text-sm text-foreground tabular-nums">{s.value}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

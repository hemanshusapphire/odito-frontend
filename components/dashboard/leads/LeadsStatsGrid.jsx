"use client"

import { useMemo } from 'react'
import { Building2, Plus, CheckCircle2, CalendarClock, Trophy, XCircle } from 'lucide-react'
import { TODAY_ISO } from '@/lib/leadsDummyData'

const STAT_DEFS = [
  { key: 'total', label: 'Total Leads', icon: Building2, tint: '#7C6CF6' },
  { key: 'newToday', label: 'New Today', icon: Plus, tint: '#5B8DEF' },
  { key: 'qualified', label: 'Qualified', icon: CheckCircle2, tint: '#34D399' },
  { key: 'followUpsDue', label: 'Follow-ups Due', icon: CalendarClock, tint: '#F0B429' },
  { key: 'won', label: 'Won', icon: Trophy, tint: '#34D399' },
  { key: 'lost', label: 'Lost', icon: XCircle, tint: '#F1665F' },
]

/** Six pipeline-at-a-glance tiles, computed live from the current `leads` array. */
export default function LeadsStatsGrid({ leads }) {
  const values = useMemo(() => ({
    total: leads.length,
    newToday: leads.filter((l) => l.created === TODAY_ISO).length,
    qualified: leads.filter((l) => l.status === 'Qualified').length,
    followUpsDue: leads.filter((l) => l.tasks.some((t) => !t.done)).length,
    won: leads.filter((l) => l.status === 'Won').length,
    lost: leads.filter((l) => l.status === 'Lost').length,
  }), [leads])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {STAT_DEFS.map((s) => {
        const Icon = s.icon
        return (
          <div key={s.key} className="rounded-xl border bg-card hover:border-muted-foreground/30 transition-colors shadow-sm px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">{s.label}</span>
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: `${s.tint}18`, color: s.tint }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums font-mono">{values[s.key]}</div>
          </div>
        )
      })}
    </div>
  )
}

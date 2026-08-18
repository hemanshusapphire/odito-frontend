"use client"

import { Building2, Plus, CheckCircle2, Trophy, XCircle, PhoneCall } from 'lucide-react'

const STAT_DEFS = [
  { key: 'total', label: 'Total Leads', icon: Building2, tint: '#7C6CF6' },
  { key: 'newToday', label: 'New Today', icon: Plus, tint: '#5B8DEF' },
  { key: 'follow_up', label: 'Follow Up', icon: PhoneCall, tint: '#F0B429' },
  { key: 'qualified', label: 'Qualified', icon: CheckCircle2, tint: '#34D399' },
  { key: 'won', label: 'Won', icon: Trophy, tint: '#34D399' },
  { key: 'lost', label: 'Lost', icon: XCircle, tint: '#F1665F' },
]

/**
 * Six pipeline-at-a-glance tiles — real MongoDB aggregation
 * (GET /api/leads/stats, see leadService.getLeadStats), not computed
 * client-side from a locally-held array. `stats` is the response's `data`
 * object: { total, newToday, new, contacted, qualified, follow_up, won, lost }.
 * `null` while loading renders a skeleton dash rather than a misleading 0.
 */
export default function LeadsStatsGrid({ stats }) {
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
            <div className="text-2xl font-bold text-foreground tabular-nums font-mono">
              {stats ? (stats[s.key] ?? 0) : '—'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

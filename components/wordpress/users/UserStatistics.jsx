"use client"

import { Users, ShieldCheck, Pencil, FileText, UserCheck, UserX } from 'lucide-react'

const TILE_DEFS = [
  { key: 'total', label: 'Total Users', icon: Users, tint: '#3b82f6' },
  { key: 'administrators', label: 'Administrators', icon: ShieldCheck, tint: '#8b5cf6' },
  { key: 'editors', label: 'Editors', icon: Pencil, tint: '#0d9488' },
  { key: 'authors', label: 'Authors', icon: FileText, tint: '#f59e0b' },
  { key: 'subscribers', label: 'Subscribers', icon: UserCheck, tint: '#10b981' },
  { key: 'inactive', label: 'Inactive Users', icon: UserX, tint: '#ef4444' },
]

/** Six user KPI tiles: total, administrators, editors, authors, subscribers, inactive. */
export default function UserStatistics({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {TILE_DEFS.map((tile) => {
        const Icon = tile.icon
        return (
          <div key={tile.key} className="rounded-xl border bg-card px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{tile.label}</span>
              <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${tile.tint}18`, color: tile.tint }}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="text-xl font-bold tabular-nums font-mono">{stats[tile.key]}</div>
          </div>
        )
      })}
    </div>
  )
}

"use client"

import { REPORT_PLATFORMS } from '@/lib/socialReportsDummyData'

/** Single-select platform picker driving every KPI/chart/table on the page. */
export default function PlatformSelector({ active, onSelect }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {REPORT_PLATFORMS.map((p) => {
        const Icon = p.icon
        const isActive = active === p.id
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
              isActive ? 'shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted/50'
            }`}
            style={isActive ? { background: `${p.color}18`, color: p.color, borderColor: `${p.color}40` } : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            {p.name}
          </button>
        )
      })}
    </div>
  )
}

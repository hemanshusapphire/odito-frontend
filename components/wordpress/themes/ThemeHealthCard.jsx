"use client"

import { Card } from '@/components/ui/card'
import ScoreRing from '@/components/ui/ScoreRing'
import { THEMES } from '@/lib/wordpressThemesDummyData'

function ringColors(score) {
  if (score >= 90) return ['#10b981', '#34d399']
  if (score >= 70) return ['#3b82f6', '#60a5fa']
  if (score >= 50) return ['#f59e0b', '#fbbf24']
  return ['#ef4444', '#f87171']
}

/** Installed/active/inactive/updates/child-theme counts + a theme health score gauge. */
export default function ThemeHealthCard() {
  const activeTheme = THEMES.find((t) => t.status === 'active' && !t.parentTheme)
  const inactiveCount = THEMES.filter((t) => t.status === 'inactive').length
  const updatesCount = THEMES.filter((t) => t.hasUpdate).length
  const childThemesCount = THEMES.filter((t) => t.parentTheme).length

  // Deterministic score: fewer outdated/updates-pending themes -> higher score.
  const score = Math.max(40, 100 - updatesCount * 12 - Math.round((inactiveCount / THEMES.length) * 20))
  const [color, color2] = ringColors(score)

  const rows = [
    { label: 'Installed Themes', value: THEMES.length },
    { label: 'Active Theme', value: activeTheme?.name || '—' },
    { label: 'Inactive Themes', value: inactiveCount },
    { label: 'Updates Available', value: updatesCount },
    { label: 'Child Themes', value: childThemesCount },
  ]

  return (
    <Card className="p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Theme Health</h3>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <ScoreRing val={score} color={color} color2={color2} size={64} />
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm">{score}</div>
        </div>
        <div>
          <div className="text-sm font-semibold">Theme Health Score</div>
          <div className="text-xs text-muted-foreground">Out of 100</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-mono font-semibold truncate max-w-[55%] text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

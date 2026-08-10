"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ScoreRing from '@/components/ui/ScoreRing'
import { PLUGIN_HEALTH } from '@/lib/wordpressPluginsDummyData'

function ringColors(score) {
  if (score >= 90) return ['#10b981', '#34d399']
  if (score >= 70) return ['#3b82f6', '#60a5fa']
  if (score >= 50) return ['#f59e0b', '#fbbf24']
  return ['#ef4444', '#f87171']
}

const ROWS = [
  { label: 'Outdated Plugins', value: PLUGIN_HEALTH.outdatedPlugins },
  { label: 'Critical Updates', value: PLUGIN_HEALTH.criticalUpdates },
  { label: 'Security Risk', value: PLUGIN_HEALTH.securityRisk, badge: PLUGIN_HEALTH.securityRisk === 'Low' ? 'success' : 'warning' },
  { label: 'Compatibility', value: PLUGIN_HEALTH.compatibilityStatus, badge: 'success' },
]

/** Plugin health score gauge + outdated/critical/security/compatibility metrics. */
export default function PluginHealthCard() {
  const [color, color2] = ringColors(PLUGIN_HEALTH.score)

  return (
    <Card className="p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Plugin Health</h3>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <ScoreRing val={PLUGIN_HEALTH.score} color={color} color2={color2} size={64} />
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm">{PLUGIN_HEALTH.score}</div>
        </div>
        <div>
          <div className="text-sm font-semibold">Health Score</div>
          <div className="text-xs text-muted-foreground">Out of 100</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            {row.badge ? (
              <Badge variant={row.badge} className="text-[10px]">{row.value}</Badge>
            ) : (
              <span className="font-mono font-semibold">{row.value}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

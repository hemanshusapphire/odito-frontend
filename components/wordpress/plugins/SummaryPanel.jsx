"use client"

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PLUGINS } from '@/lib/wordpressPluginsDummyData'

/** Right-side summary: totals + progress bars for active/updates/premium/security. */
export default function SummaryPanel() {
  const total = PLUGINS.length
  const active = PLUGINS.filter((p) => p.status === 'active').length
  const inactive = total - active
  const updates = PLUGINS.filter((p) => p.hasUpdate).length
  const premium = PLUGINS.filter((p) => p.isPremium).length
  const securityAlerts = PLUGINS.filter((p) => p.hasSecurityWarning).length

  // Full arbitrary-variant class strings written out literally (not built
  // via template interpolation) - Tailwind's static scanner needs the
  // complete token to appear verbatim in source to generate its CSS.
  const rows = [
    { label: 'Total Plugins', value: total, pct: 100, barClass: '[&>div]:bg-primary' },
    { label: 'Active', value: active, pct: Math.round((active / total) * 100), barClass: '[&>div]:bg-emerald-500' },
    { label: 'Inactive', value: inactive, pct: Math.round((inactive / total) * 100), barClass: '[&>div]:bg-slate-400' },
    { label: 'Updates Available', value: updates, pct: Math.round((updates / total) * 100), barClass: '[&>div]:bg-amber-500' },
    { label: 'Premium Plugins', value: premium, pct: Math.round((premium / total) * 100), barClass: '[&>div]:bg-violet-500' },
    { label: 'Security Alerts', value: securityAlerts, pct: Math.round((securityAlerts / total) * 100), barClass: '[&>div]:bg-destructive' },
  ]

  return (
    <Card className="p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Summary</h3>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-mono font-semibold">{row.value}</span>
            </div>
            <Progress value={row.pct} className={`h-1.5 ${row.barClass}`} />
          </div>
        ))}
      </div>
    </Card>
  )
}

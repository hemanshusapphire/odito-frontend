"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { COMPATIBILITY } from '@/lib/wordpressThemesDummyData'

const ROWS = [
  { key: 'wordpress', label: 'WordPress Compatibility' },
  { key: 'php', label: 'PHP Compatibility' },
  { key: 'plugins', label: 'Plugin Compatibility' },
  { key: 'security', label: 'Security Status' },
]

/** WordPress/PHP/Plugin compatibility + security status + performance rating, as badges. */
export default function CompatibilityCard() {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold mb-1">Compatibility</h3>
      {ROWS.map((row) => (
        <div key={row.key} className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{row.label}</span>
          <Badge variant={COMPATIBILITY[row.key].variant} className="text-[10px]">{COMPATIBILITY[row.key].status}</Badge>
        </div>
      ))}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Performance Rating</span>
        <Badge variant={COMPATIBILITY.performance.variant} className="text-[10px]">{COMPATIBILITY.performance.rating}</Badge>
      </div>
    </Card>
  )
}

"use client"

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PERFORMANCE } from '@/lib/wordpressDummyData'

const BARS = [
  { key: 'pageSpeed', label: 'Page Speed', value: PERFORMANCE.pageSpeed, suffix: '/100' },
  { key: 'databaseHealth', label: 'Database Health', value: PERFORMANCE.databaseHealth, suffix: '%' },
  { key: 'objectCache', label: 'Object Cache', value: PERFORMANCE.objectCache.hitRate, suffix: '% hit rate' },
]

/** Page speed / database health / object cache progress bars + CDN + response time. */
export default function PerformanceCard() {
  return (
    <Card className="p-6 flex flex-col gap-5">
      <h3 className="text-sm font-semibold">Performance</h3>

      <div className="flex flex-col gap-4">
        {BARS.map((bar) => (
          <div key={bar.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{bar.label}</span>
              <span className="font-mono font-semibold">{bar.value}{bar.suffix}</span>
            </div>
            <Progress value={bar.value} className="h-2" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-xl border bg-muted/30 px-3 py-2.5">
          <div className="text-[11px] text-muted-foreground mb-1">CDN</div>
          <Badge variant="success" className="text-[10px]">{PERFORMANCE.cdn.provider}</Badge>
        </div>
        <div className="rounded-xl border bg-muted/30 px-3 py-2.5">
          <div className="text-[11px] text-muted-foreground mb-1">Response Time</div>
          <span className="font-mono font-bold text-sm">{PERFORMANCE.responseTimeMs}ms</span>
        </div>
      </div>
    </Card>
  )
}

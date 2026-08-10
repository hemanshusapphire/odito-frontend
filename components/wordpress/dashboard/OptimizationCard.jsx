"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Trash2 } from 'lucide-react'
import { OPTIMIZATION } from '@/lib/wordpressDummyData'

/** Post revisions / database size / cache status + optimization suggestions and actions. */
export default function OptimizationCard({ onNotify }) {
  return (
    <Card className="p-6 flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Optimization</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-muted/30 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Post Revisions</span>
          <span className="font-mono font-bold text-amber-500 text-sm">{OPTIMIZATION.postRevisions.toLocaleString()}</span>
        </div>
        <div className="rounded-xl border bg-muted/30 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Database Size</span>
          <span className="font-mono font-bold text-sm">{OPTIMIZATION.databaseSizeMb} MB</span>
        </div>
        <div className="rounded-xl border bg-muted/30 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Cache Status</span>
          <Badge variant="success" className="text-[10px]">{OPTIMIZATION.cacheStatus}</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Suggestions</span>
        <ul className="flex flex-col gap-1.5">
          {OPTIMIZATION.suggestions.map((s, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" className="gap-2" onClick={() => onNotify('Optimization complete', 'success')}>
          <Sparkles className="h-3.5 w-3.5" />
          Optimize
        </Button>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => onNotify('Cache cleared', 'success')}>
          <Trash2 className="h-3.5 w-3.5" />
          Clear Cache
        </Button>
      </div>
    </Card>
  )
}

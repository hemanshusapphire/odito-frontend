"use client"

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Cloud } from 'lucide-react'
import { STORAGE } from '@/lib/wordpressBackupsDummyData'

/** Large storage-usage progress bar: available/used/remaining + cloud provider. */
export default function StorageCard() {
  const pct = Math.round((STORAGE.usedGb / STORAGE.totalGb) * 100)
  const remaining = STORAGE.totalGb - STORAGE.usedGb

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Storage Usage</h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cloud className="h-3.5 w-3.5" />
          {STORAGE.provider}
        </span>
      </div>

      <Progress value={pct} className="h-3" />

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-lg font-bold font-mono">{STORAGE.totalGb} GB</div>
          <div className="text-[11px] text-muted-foreground">Available Storage</div>
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-primary">{STORAGE.usedGb} GB</div>
          <div className="text-[11px] text-muted-foreground">Used ({pct}%)</div>
        </div>
        <div>
          <div className="text-lg font-bold font-mono text-emerald-500">{remaining.toFixed(1)} GB</div>
          <div className="text-[11px] text-muted-foreground">Remaining</div>
        </div>
      </div>
    </Card>
  )
}

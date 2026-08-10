"use client"

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { DatabaseBackup, Loader2, Info } from 'lucide-react'
import { LAST_BACKUP, NEXT_BACKUP, AUTOMATIC_BACKUPS_ENABLED, BACKUP_FREQUENCIES } from '@/lib/wordpressBackupsDummyData'

/** Automatic backups toggle + last/next backup timestamps + frequency + a large "Backup Now" CTA. */
export default function BackupStatusCard({ onBackupNow, backingUp }) {
  const [enabled, setEnabled] = useState(AUTOMATIC_BACKUPS_ENABLED)
  const [frequency, setFrequency] = useState(BACKUP_FREQUENCIES[0])

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Automatic Backups</span>
        <div className="flex items-center gap-2">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <Badge variant={enabled ? 'success' : 'secondary'} className="text-[10px]">{enabled ? 'Enabled' : 'Disabled'}</Badge>
          <button title="Automatic backups run on the schedule below.">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last Backup</span>
          <span className="font-medium font-mono">{LAST_BACKUP.date}, {LAST_BACKUP.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Next Scheduled Backup</span>
          <span className="font-medium font-mono">{NEXT_BACKUP.date}, {NEXT_BACKUP.time}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Backup Frequency</span>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BACKUP_FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button size="lg" onClick={onBackupNow} disabled={backingUp} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
        {backingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseBackup className="h-4 w-4" />}
        {backingUp ? 'Backing up…' : 'Backup Now'}
      </Button>
    </div>
  )
}

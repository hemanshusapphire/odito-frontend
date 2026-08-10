"use client"

import { useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, Globe } from 'lucide-react'
import RestoreConfirmDialog from './RestoreConfirmDialog'
import { LAST_BACKUP, BACKUP_DATES, RESTORE_INFO, BACKUP_SNAPSHOT } from '@/lib/wordpressBackupsDummyData'

/** Restore workflow: latest backup summary, restore point picker, target/estimate, warnings, danger action. */
export default function BackupRestore({ onNotify }) {
  const [restorePoint, setRestorePoint] = useState(LAST_BACKUP.date)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [restoring, setRestoring] = useState(false)

  function handleConfirmRestore() {
    setRestoring(true)
    setTimeout(() => {
      setRestoring(false)
      setConfirmOpen(false)
      onNotify(`Site restored to ${restorePoint} snapshot`, 'success')
    }, 1200)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border bg-muted/20 px-4 py-3">
          <div className="text-[11px] text-muted-foreground mb-1">Latest Backup</div>
          <div className="text-sm font-semibold font-mono">{LAST_BACKUP.date}, {LAST_BACKUP.time}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{BACKUP_SNAPSHOT.backupSizeGb} GB</div>
        </div>

        <div className="rounded-xl border bg-muted/20 px-4 py-3">
          <div className="text-[11px] text-muted-foreground mb-1">Restore Point</div>
          <Select value={restorePoint} onValueChange={setRestorePoint}>
            <SelectTrigger className="h-8 w-full text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BACKUP_DATES.slice().reverse().map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-muted/20 px-4 py-3">
          <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Globe className="h-3 w-3" />Target Website</div>
          <div className="text-sm font-medium truncate">{RESTORE_INFO.targetWebsite}</div>
        </div>

        <div className="rounded-xl border bg-muted/20 px-4 py-3">
          <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Estimated Time</div>
          <div className="text-sm font-medium">~{RESTORE_INFO.estimatedMinutes} minutes</div>
        </div>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" />
          Before you restore
        </span>
        <ul className="flex flex-col gap-1.5">
          {RESTORE_INFO.warnings.map((w, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-destructive mt-1.5 shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      </div>

      <Button variant="destructive" size="lg" className="w-fit gap-2" onClick={() => setConfirmOpen(true)}>
        <AlertTriangle className="h-4 w-4" />
        Restore Website
      </Button>

      <RestoreConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        restorePoint={restorePoint}
        loading={restoring}
        onConfirm={handleConfirmRestore}
      />
    </div>
  )
}

"use client"

import { DatabaseBackup, RefreshCw, Loader2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Backups page header: title + Backup Now / Refresh / Settings actions. */
export default function BackupsHeader({ onBackupNow, backingUp, onRefresh, refreshing, onSettings }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Backups</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Automatic and manual backups, restore points and storage usage for your WordPress site.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <Button variant="outline" size="sm" onClick={onSettings} className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
        <Button size="sm" onClick={onBackupNow} disabled={backingUp} className="gap-2">
          {backingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseBackup className="h-4 w-4" />}
          {backingUp ? 'Backing up…' : 'Backup Now'}
        </Button>
      </div>
    </div>
  )
}

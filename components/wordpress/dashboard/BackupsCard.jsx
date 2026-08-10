"use client"

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatabaseBackup, CheckCircle2 } from 'lucide-react'
import { BACKUP_STATUS } from '@/lib/wordpressDummyData'

/** Backup status: large green success state, last/next backup timestamps, View Backups action. */
export default function BackupsCard() {
  return (
    <Card className="p-6 flex flex-col gap-5">
      <h3 className="text-sm font-semibold">Backups</h3>

      <div className="flex items-start gap-4">
        <span className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <DatabaseBackup className="h-6 w-6" />
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Backups are successful
          </span>
          <p className="text-xs text-muted-foreground">
            Last backup was: <span className="font-medium text-foreground">{BACKUP_STATUS.lastBackup.relative}</span> ({BACKUP_STATUS.lastBackup.absolute})
          </p>
          <p className="text-xs text-muted-foreground">
            Next Backup: <span className="font-medium text-foreground">{BACKUP_STATUS.nextBackup}</span>
          </p>
        </div>
      </div>

      <Button asChild className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white">
        <Link href="/app/wordpress/backups">View Backups</Link>
      </Button>
    </Card>
  )
}

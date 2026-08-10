"use client"

import { Archive, HardDrive, Cloud, ShieldCheck, Scale, History } from 'lucide-react'
import { BACKUP_STATS } from '@/lib/wordpressBackupsDummyData'

const TILES = [
  { key: 'total', label: 'Total Backups', value: BACKUP_STATS.totalBackups, icon: Archive, tint: '#3b82f6' },
  { key: 'storage', label: 'Storage Used', value: `${BACKUP_STATS.storageUsedGb} GB`, icon: HardDrive, tint: '#f59e0b' },
  { key: 'cloud', label: 'Cloud Usage', value: `${BACKUP_STATS.cloudUsageGb} GB`, icon: Cloud, tint: '#06b6d4' },
  { key: 'success', label: 'Restore Success Rate', value: `${BACKUP_STATS.restoreSuccessRate}%`, icon: ShieldCheck, tint: '#10b981' },
  { key: 'avgSize', label: 'Average Backup Size', value: `${BACKUP_STATS.averageBackupSizeGb} GB`, icon: Scale, tint: '#8b5cf6' },
  { key: 'lastRestore', label: 'Last Restore', value: BACKUP_STATS.lastRestore, icon: History, tint: '#64748b' },
]

/** Six backup KPI tiles: totals, storage, cloud usage, restore success rate, average size, last restore. */
export default function BackupStatistics() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {TILES.map((tile) => {
        const Icon = tile.icon
        return (
          <div key={tile.key} className="rounded-xl border bg-card px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{tile.label}</span>
              <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${tile.tint}18`, color: tile.tint }}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="text-xl font-bold tabular-nums font-mono">{tile.value}</div>
          </div>
        )
      })}
    </div>
  )
}

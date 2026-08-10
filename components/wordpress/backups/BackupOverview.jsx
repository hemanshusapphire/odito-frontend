"use client"

import BackupActions from './BackupActions'
import { BACKUP_SNAPSHOT, WEBSITE_PREVIEW } from '@/lib/wordpressBackupsDummyData'

const SNAPSHOT_ROWS = [
  { label: 'WordPress Version', value: BACKUP_SNAPSHOT.wpVersion },
  { label: 'PHP Version', value: BACKUP_SNAPSHOT.phpVersion },
  { label: 'Backup Size', value: `${BACKUP_SNAPSHOT.backupSizeGb} GB` },
  { label: 'Theme', value: BACKUP_SNAPSHOT.theme },
  { label: 'Plugin Count', value: BACKUP_SNAPSHOT.activePlugins },
  { label: 'Published Posts', value: BACKUP_SNAPSHOT.publishedPosts },
  { label: 'Pages', value: BACKUP_SNAPSHOT.pages },
  { label: 'Media Files', value: BACKUP_SNAPSHOT.mediaFiles },
  { label: 'Comments', value: BACKUP_SNAPSHOT.approvedComments },
]

/**
 * Overview tab: action grid + a two-column website snapshot + a stylized
 * website preview. No real site screenshot exists for a mock backup, so
 * the preview is a CSS-built approximation of the reference's hero
 * (browser-chrome frame + gradient hero + the reference's own headline).
 */
export default function BackupOverview({ onRestore, onDownload, onClone, onDelete }) {
  return (
    <div className="flex flex-col gap-6">
      <BackupActions onRestore={onRestore} onDownload={onDownload} onClone={onClone} onDelete={onDelete} />

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Website Snapshot</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {SNAPSHOT_ROWS.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-right truncate max-w-[60%]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Website Preview</h4>
        <div className="rounded-xl border overflow-hidden">
          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-2 border-b">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="relative h-48 flex items-center justify-center text-center px-6 bg-linear-to-br from-slate-900 via-slate-800 to-amber-900/40">
            <div className="relative z-10 flex flex-col items-center gap-3">
              <h3 className="text-white text-lg font-bold leading-snug max-w-sm">
                {WEBSITE_PREVIEW.siteName} — {WEBSITE_PREVIEW.tagline}
              </h3>
              <span className="inline-block rounded-md bg-red-600 text-white text-[11px] font-semibold px-3 py-1.5">
                {WEBSITE_PREVIEW.cta}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

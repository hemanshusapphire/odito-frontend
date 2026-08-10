/**
 * Static/dummy data for the WordPress Management → Backups page
 * (components/wordpress/backups/**, app/app/wordpress/backups/page.jsx).
 *
 * Frontend-only: no API calls, no React Query, no backend, no persistence,
 * no backup engine. Dates/sizes below are realistic mock values matching
 * the approved reference screenshot where it specified them explicitly.
 */

import { TODAY_ISO } from './leadsDummyData'

export { TODAY_ISO }

export const CALENDAR_MONTH = { year: 2026, monthIndex: 6 } // July 2026 (0-indexed)

export const BACKUP_DATES = [
  '2026-07-02', '2026-07-05', '2026-07-09', '2026-07-12', '2026-07-16',
  '2026-07-19', '2026-07-23', '2026-07-26', '2026-07-30',
]

export const LAST_BACKUP = { date: '2026-07-16', time: '20:25:50' }
export const NEXT_BACKUP = { date: '2026-08-03', time: '19:55:20' }

export const AUTOMATIC_BACKUPS_ENABLED = true
export const BACKUP_FREQUENCIES = ['Daily', 'Weekly', 'Monthly']

const HISTORY_BY_DATE = {
  '2026-07-02': [{ time: '20:24:10', type: 'Scheduled', status: 'Completed', sizeGb: 0.98 }],
  '2026-07-05': [{ time: '20:26:40', type: 'Scheduled', status: 'Completed', sizeGb: 0.99 }],
  '2026-07-09': [{ time: '20:22:05', type: 'Scheduled', status: 'Completed', sizeGb: 1.0 }],
  '2026-07-12': [
    { time: '14:03:12', type: 'Manual', status: 'Completed', sizeGb: 1.01 },
    { time: '20:25:33', type: 'Scheduled', status: 'Completed', sizeGb: 1.01 },
  ],
  '2026-07-16': [{ time: '20:25:50', type: 'Scheduled', status: 'Completed', sizeGb: 1.02 }],
  '2026-07-19': [{ time: '20:27:02', type: 'Scheduled', status: 'Completed', sizeGb: 1.02 }],
  '2026-07-23': [
    { time: '09:41:55', type: 'Manual', status: 'Completed', sizeGb: 1.03 },
    { time: '20:24:48', type: 'Scheduled', status: 'Failed', sizeGb: 0 },
  ],
  '2026-07-26': [{ time: '20:26:15', type: 'Scheduled', status: 'Completed', sizeGb: 1.03 }],
  '2026-07-30': [{ time: '20:25:59', type: 'Scheduled', status: 'Completed', sizeGb: 1.04 }],
}

export function backupHistoryFor(dateIso) {
  return (HISTORY_BY_DATE[dateIso] || []).slice().sort((a, b) => (a.time < b.time ? 1 : -1))
}

// ── Website snapshot (Overview tab) ──────────────────────────────────
export const BACKUP_SNAPSHOT = {
  wpVersion: '7.0.1',
  phpVersion: '8.2',
  backupSizeGb: 1.02,
  theme: 'Divi Child Theme v1.0.0',
  activePlugins: 5,
  publishedPosts: 1,
  pages: 8,
  mediaFiles: 214,
  approvedComments: 6,
}

export const WEBSITE_PREVIEW = {
  siteName: '24/7 Business Directory',
  tagline: 'Your One-Stop Shop for Finding Local Businesses',
  cta: 'Contact Us',
}

// ── Content tab ───────────────────────────────────────────────────────
export const BACKUP_CONTENT = [
  { id: 'database', name: 'Database', included: true, sizeMb: 42 },
  { id: 'themes', name: 'Themes', included: true, sizeMb: 68 },
  { id: 'plugins', name: 'Plugins', included: true, sizeMb: 156 },
  { id: 'uploads', name: 'Uploads', included: true, sizeMb: 512 },
  { id: 'media', name: 'Media', included: true, sizeMb: 284 },
  { id: 'wp-content', name: 'wp-content', included: true, sizeMb: 980 },
  { id: 'core', name: 'Core Files', included: false, sizeMb: 46 },
]

// ── Settings tab ──────────────────────────────────────────────────────
export const RETENTION_OPTIONS = ['7 days', '30 days', '90 days', 'Forever']
export const CLOUD_STORAGE_OPTIONS = ['Google Drive', 'Dropbox', 'Amazon S3', 'Local Storage']

export const BACKUP_SETTINGS_DEFAULTS = {
  frequency: 'Daily',
  retention: '30 days',
  cloudStorage: 'Google Drive',
  compression: true,
  notifications: true,
  encryption: true,
}

// ── Restore tab ───────────────────────────────────────────────────────
export const RESTORE_INFO = {
  estimatedMinutes: 8,
  targetWebsite: '247businessdirectory.net',
  warnings: [
    'Restoring will overwrite the current live site with this backup snapshot.',
    'Any content published after this backup was taken will be lost.',
    'The site will be in maintenance mode for the duration of the restore.',
  ],
}

// ── Backup Statistics ─────────────────────────────────────────────────
export const BACKUP_STATS = {
  totalBackups: 47,
  storageUsedGb: 46.8,
  cloudUsageGb: 46.8,
  restoreSuccessRate: 100,
  averageBackupSizeGb: 1.0,
  lastRestore: 'Never',
}

// ── Storage ───────────────────────────────────────────────────────────
export const STORAGE = {
  provider: 'Google Drive',
  usedGb: 46.8,
  totalGb: 100,
}

// ── Recent Backup Activity ────────────────────────────────────────────
export const BACKUP_ACTIVITY = [
  { id: 'ba1', text: 'Scheduled Backup Completed — 1.04 GB', time: '1 day ago' },
  { id: 'ba2', text: 'Manual Backup Created — 1.03 GB', time: '8 days ago' },
  { id: 'ba3', text: 'Backup Downloaded — 2026-07-16 snapshot', time: '10 days ago' },
  { id: 'ba4', text: 'Scheduled Backup Completed — 1.02 GB', time: '15 days ago' },
  { id: 'ba5', text: 'Backup Deleted — 2026-06-18 snapshot', time: '18 days ago' },
]

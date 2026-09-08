/**
 * Bulk Upload wizard — client-side constants.
 *
 * The backend (odito_backend social_meta bulk-upload, Phases 2 & 3) is
 * the single source of truth for validation, parsing, row errors, CSV
 * escaping and the template/error-report contents. Everything here is
 * UX-only: an immediate hint before the file is sent, and display
 * metadata for statuses the backend already assigned.
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB — mirrors the backend limit
export const MAX_FILE_MB = 10
export const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx']
export const FILE_ACCEPT_ATTR =
  '.csv,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const IMPORT_MODES = [
  {
    value: 'valid-only',
    label: 'Valid rows — preserve actions',
    description:
      'Import valid rows using their configured draft, schedule, or publish action.',
  },
  {
    value: 'all-as-draft',
    label: 'Import all valid rows as drafts',
    description:
      'Import every valid row as a draft. Scheduled and publish actions will not execute.',
  },
]
export const DEFAULT_IMPORT_MODE = 'valid-only'

/**
 * Display metadata for a SocialImportRow.status. `tone` maps to a Badge
 * variant; every pill also carries an icon + text label so status is
 * never conveyed by colour alone.
 */
export const ROW_STATUS_META = {
  valid: { label: 'Ready', tone: 'success', icon: 'check' },
  invalid: { label: 'Invalid', tone: 'critical', icon: 'x' },
  imported: { label: 'Imported', tone: 'success', icon: 'check' },
  failed: { label: 'Failed', tone: 'critical', icon: 'alert' },
  skipped: { label: 'Skipped', tone: 'secondary', icon: 'minus' },
}

export const WIZARD_STEPS = [
  { key: 'upload', label: 'Upload' },
  { key: 'review', label: 'Review' },
  { key: 'result', label: 'Results' },
]

/** Client-side pre-check only — the backend re-checks everything. */
export function quickFileCheck(file) {
  if (!file) return { ok: false, message: 'Choose a .csv or .xlsx file to continue.' }
  const name = String(file.name || '')
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return { ok: false, message: 'Unsupported file type. Upload a .csv or .xlsx file.' }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false, message: `That file is larger than ${MAX_FILE_MB} MB. Split it into smaller imports.` }
  }
  return { ok: true }
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

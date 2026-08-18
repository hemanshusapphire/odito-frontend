/**
 * Real Lead constants — replaces frontend/lib/leadsDummyData.js (Phase 3B).
 *
 * The backend's Lead model (odito_backend/src/modules/lead/model/Lead.js)
 * is the single source of truth for status/priority: 6 lowercase statuses,
 * 3 lowercase priorities — not the old mock's 7 Title-Case statuses
 * (including a two-word "Proposal Sent") or 3 Title-Case priorities. Per
 * the Phase 1 report's own documented mismatch: the backend enum is
 * authoritative, the frontend conforms to it, not the other way around.
 */

export const STATUSES = ['new', 'contacted', 'qualified', 'follow_up', 'won', 'lost']
export const PRIORITIES = ['low', 'medium', 'high']

export const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  follow_up: 'Follow Up',
  won: 'Won',
  lost: 'Lost',
}

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

// Status pill styling — mapped onto the app's existing Badge variants
// (success/warning/critical/info/secondary), matching the same convention
// leadsDummyData.js originally used, keyed on the real lowercase values now.
export const STATUS_BADGE_VARIANT = {
  new: 'info',
  contacted: 'secondary',
  qualified: 'success',
  follow_up: 'warning',
  won: 'success',
  lost: 'critical',
}

export const PRIORITY_COLOR_CLASS = {
  high: 'text-destructive',
  medium: 'text-amber-500',
  low: 'text-muted-foreground',
}

// Sources are a free-form string on the backend (Lead.source has no locked
// enum — see Lead.js), not a closed set. These are just the values the
// filter dropdown and the manual "Add Lead" form offer; 'wordpress' is
// what Phase 3B's WordPress submission capture always sets.
export const SOURCES = ['manual', 'wordpress', 'referral', 'other']
export const SOURCE_LABELS = {
  manual: 'Manual',
  wordpress: 'WordPress',
  referral: 'Referral',
  other: 'Other',
}

export function fmtDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function fmtDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Relative "2d ago"/"Today" label against the real current time (not a fixed mock date). */
export function relDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const now = new Date()
  const diffMs = now.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)
  const diffDays = Math.round(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays}d ago`
  return fmtDate(value)
}

export function initials(name) {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
}

const AVATAR_PALETTE = ['#7C6CF6', '#5B8DEF', '#34D399', '#F0B429', '#F1665F', '#9C8CFF', '#4FC3D9', '#E97CC1']

export function hashColor(str) {
  let h = 0
  const s = String(str || '')
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

/**
 * Normalizes a raw API lead (Mongo `_id`) into the shape every existing
 * Leads component reads (`id`) — done once at the fetch boundary so
 * LeadRow.jsx/LeadDetailDrawer.jsx/etc. don't need a find/replace of every
 * `.id` read site. See Phase 3B report for why this was the lower-risk
 * choice over changing every component.
 */
export function normalizeLead(raw) {
  if (!raw) return raw
  return { ...raw, id: raw._id || raw.id }
}

// Leads.name/message/etc. are visitor-controlled text (Phase 3B — real
// WordPress submissions land here) — a value starting with =, +, -, or @
// can be interpreted as a formula by Excel/Sheets/LibreOffice when the CSV
// is opened, a well-known "CSV injection" vector (e.g. a lead named
// `=cmd|'/c calc'!A1` or `@SUM(1+1)`). Prefixing with a single quote is the
// standard mitigation — every affected spreadsheet application treats a
// leading `'` as "force text", and it's invisible in the rendered cell.
const CSV_FORMULA_PREFIX_RE = /^[=+\-@]/;

function csvEscape(value) {
  let s = value === null || value === undefined ? '' : String(value)
  if (CSV_FORMULA_PREFIX_RE.test(s)) {
    s = `'${s}`
  }
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * A real, working CSV export generated client-side from whatever leads are
 * currently loaded (the export button in the old mock was a pure toast
 * simulation — this genuinely downloads a file). Bulk import was NOT
 * implemented (see Phase 3B report's Known Limitations): it would need a
 * new bulk-create backend endpoint, which is out of this phase's scope.
 */
export function exportLeadsToCsv(leads, filename = 'leads.csv') {
  const columns = ['name', 'email', 'phone', 'company', 'status', 'priority', 'source', 'message', 'createdAt']
  const header = columns.join(',')
  const rows = leads.map((lead) => columns.map((col) => csvEscape(lead[col])).join(','))
  const csv = [header, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

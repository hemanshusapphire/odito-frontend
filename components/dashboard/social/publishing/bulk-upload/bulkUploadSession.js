/**
 * Tiny per-tab persistence for the Bulk Upload wizard so a browser
 * refresh during (or right after) an import can recover the batch from
 * the backend instead of dropping the user back to step 1.
 *
 * sessionStorage (per-tab, cleared on tab close) — NOT localStorage.
 * Stores only NON-SENSITIVE bookkeeping: the opaque batch id, the wizard
 * step, the chosen mode, and the {total,valid,invalid} summary. Never a
 * file, raw rows, tokens, or content. Every access is wrapped — private
 * mode / disabled storage must never break the wizard.
 */

const PREFIX = 'odito.bulkUpload.'

function key(projectId) {
  return `${PREFIX}${projectId || 'unknown'}`
}

export function saveBulkUploadSession(projectId, data) {
  if (!projectId || typeof window === 'undefined') return
  try {
    const safe = {
      batchId: data.batchId || null,
      step: data.step || 'upload',
      mode: data.mode || null,
      validation: data.validation
        ? {
            total: Number(data.validation.total) || 0,
            valid: Number(data.validation.valid) || 0,
            invalid: Number(data.validation.invalid) || 0,
          }
        : null,
      savedAt: Date.now(),
    }
    window.sessionStorage.setItem(key(projectId), JSON.stringify(safe))
  } catch {
    /* storage unavailable — recovery just won't be possible, which is fine */
  }
}

export function loadBulkUploadSession(projectId) {
  if (!projectId || typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(key(projectId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.batchId) return null
    return parsed
  } catch {
    return null
  }
}

export function clearBulkUploadSession(projectId) {
  if (!projectId || typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(key(projectId))
  } catch {
    /* no-op */
  }
}

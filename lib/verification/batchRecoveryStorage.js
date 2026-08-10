/**
 * F4-019 §5 — persists the active Verification Batch's batchId across a
 * full browser reload (a BatchVerificationController instance itself does
 * not survive one). sessionStorage, not localStorage: a batch is scoped to
 * this browser tab's session, not something that should resurface days
 * later in a different tab. Keyed per-project so switching projects never
 * resumes the wrong one.
 *
 * Every call is defensive (typeof window check, try/catch) — storage access
 * can throw in private-browsing/quota-exceeded edge cases, and losing the
 * ability to resume is far preferable to crashing the page over it.
 */

const KEY_PREFIX = 'odito.verificationBatch.'

export function storeBatchId(projectId, batchId) {
  if (typeof window === 'undefined' || !projectId || !batchId) return
  try {
    window.sessionStorage.setItem(KEY_PREFIX + projectId, batchId)
  } catch {
    /* storage unavailable — resume simply won't be offered next reload */
  }
}

export function readBatchId(projectId) {
  if (typeof window === 'undefined' || !projectId) return null
  try {
    return window.sessionStorage.getItem(KEY_PREFIX + projectId)
  } catch {
    return null
  }
}

export function clearBatchId(projectId) {
  if (typeof window === 'undefined' || !projectId) return
  try {
    window.sessionStorage.removeItem(KEY_PREFIX + projectId)
  } catch {
    /* nothing to do — worst case a stale id is retried and 404s harmlessly */
  }
}

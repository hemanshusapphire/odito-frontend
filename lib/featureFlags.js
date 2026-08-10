/**
 * Frontend-only feature flags (F4-019). A single, testable source of truth
 * for each flag rather than scattered `process.env.NEXT_PUBLIC_*` reads —
 * callers get a mockable function, not a raw env lookup.
 */

/**
 * Verification Batch migration (F4-019): when true, Bulk Verification uses
 * POST /start-verification-batch (one request, backend-orchestrated) via
 * BatchVerificationController. When false (default), the legacy N-request
 * BulkVerificationController is used, completely unchanged. No backend
 * branching — this only selects which frontend controller class runs.
 */
export function isBatchVerificationEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION === 'true'
}

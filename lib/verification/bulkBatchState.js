/**
 * Bulk Verification batch state machine.
 *
 * Explicit states, explicit transition table — no ad hoc status strings.
 * IDLE/PREPARING/CONFIRMING are pre-batch UI states (owned by
 * useBulkVerificationController before any BulkVerificationController
 * instance exists); STARTING onward are owned by the controller once a
 * batch actually begins.
 *
 *   IDLE -> PREPARING -> CONFIRMING -> STARTING -> RUNNING -> COMPLETING -> COMPLETED
 *                              ^            |                     |
 *                              |            |                     |
 *                         (cancel)          +--------> RUNNING -> FAILED
 *
 * FAILED is reached directly from RUNNING (every URL failed to complete
 * successfully) — not routed through COMPLETING, which implies at least
 * one success.
 */
export const BatchState = Object.freeze({
  IDLE: 'IDLE',
  PREPARING: 'PREPARING',
  CONFIRMING: 'CONFIRMING',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  COMPLETING: 'COMPLETING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
})

const TRANSITIONS = {
  [BatchState.IDLE]: [BatchState.PREPARING],
  [BatchState.PREPARING]: [BatchState.CONFIRMING, BatchState.IDLE],
  [BatchState.CONFIRMING]: [BatchState.PREPARING, BatchState.STARTING],
  [BatchState.STARTING]: [BatchState.RUNNING],
  [BatchState.RUNNING]: [BatchState.COMPLETING, BatchState.FAILED],
  [BatchState.COMPLETING]: [BatchState.COMPLETED],
  [BatchState.COMPLETED]: [BatchState.IDLE],
  [BatchState.FAILED]: [BatchState.IDLE],
}

export function isValidBatchTransition(from, to) {
  return Boolean(TRANSITIONS[from]?.includes(to))
}

/**
 * Applies a transition, returning the next state. Invalid transitions are
 * rejected (dev warning, state unchanged) rather than silently allowed.
 */
export function reduceBatchState(current, next) {
  if (!isValidBatchTransition(current, next)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[BulkVerification] Ignored invalid state transition: ${current} -> ${next}`)
    }
    return current
  }
  return next
}

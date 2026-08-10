import { BatchState, reduceBatchState } from './bulkBatchState'
import {
  trackBatchStarted,
  trackBatchCompleted,
  trackBatchFailed,
  trackRecoveryUsed,
  trackWebsocketReconnect,
} from './batchAnalytics'

/**
 * Batch-mode Bulk Verification controller (F4-019). Owns the same
 * responsibilities as BulkVerificationController — the aggregated progress
 * model and the single shared websocket subscription for the whole batch —
 * but issues exactly ONE POST /start-verification-batch request instead of
 * N independent /start-url-verification requests, and treats
 * verification:batch-completed (not local queue/count bookkeeping) as the
 * sole source of truth for when the batch itself is done.
 *
 * Public interface (start/destroy/getSnapshot) and snapshot shape
 * ({batchId, state, total, queued, running, completed, failed, urls}) are
 * IDENTICAL to BulkVerificationController's, so useBulkVerificationController
 * can swap between the two behind a feature flag with no change to any
 * consumer (buildBulkModalProps, VerifyUrlModal, the Optimization Center
 * page) — the migration is invisible above this layer.
 *
 * Differences from the legacy controller, by design:
 *   - No client-side queue/concurrency pump. The backend dispatches every
 *     accepted URL's own pipeline from the single start request; "queued"
 *     here only ever describes a URL still awaiting its first
 *     verification:started event, not a client-side throttle.
 *   - The batch's own terminal state (COMPLETED/FAILED) is decided ONLY by
 *     the verification:batch-completed event (live) or the batch's
 *     persisted `status` (recovery) — never inferred from per-page counts.
 *   - Survives both a mid-session websocket reconnect and a full browser
 *     reload by resyncing via the read-only REST recovery endpoints
 *     (GET /verification-batches/:batchId[/runs]) — no polling; recovery
 *     only ever runs in reaction to a reconnect or an explicit resume().
 */
export class BatchVerificationController {
  constructor({ projectId, urls = [], apiService, socketService, onUpdate }) {
    this.projectId = projectId
    this.apiService = apiService
    this.socketService = socketService
    this.onUpdate = onUpdate

    this.batchId = null
    this.state = BatchState.STARTING
    this._destroyed = false
    this._listenersAttached = false
    this._connectionStateUnsubscribe = null
    // Becomes true the first time we observe the socket leave CONNECTED
    // after listeners are attached — distinguishes a genuine reconnect from
    // the very first connection, which must never trigger a recovery fetch.
    this._sawNonConnected = false

    this.urlStates = new Map(
      urls.map((url) => [url, { status: 'queued', stage: null, percentage: 0, errorMessage: null, runId: null }])
    )

    this._handleStarted = this._handleStarted.bind(this)
    this._handleProgress = this._handleProgress.bind(this)
    this._handleCompleted = this._handleCompleted.bind(this)
    this._handleFailed = this._handleFailed.bind(this)
    this._handleBatchCompleted = this._handleBatchCompleted.bind(this)
    this._handleConnectionStateChange = this._handleConnectionStateChange.bind(this)
  }

  /** Normal path: create + dispatch a brand-new batch for the constructor's `urls`. */
  async start() {
    this._attachListeners()
    this.socketService.joinProject(this.projectId)
    this._transition(BatchState.RUNNING)

    const urls = Array.from(this.urlStates.keys())
    try {
      const response = await this.apiService.startVerificationBatch(this.projectId, urls)
      if (this._destroyed) return
      if (!response?.success || !response?.batchId) {
        throw new Error(response?.message || 'Failed to start verification batch')
      }

      this.batchId = response.batchId
      this._applyStartResponse(response)
      trackBatchStarted({
        batchId: this.batchId,
        projectId: this.projectId,
        totalUrls: response.totalUrls,
        dispatchedUrls: response.dispatchedUrls,
      })

      if (!response.dispatchedUrls) {
        // Every accepted URL failed to dispatch — no job was ever created,
        // so no verification:batch-completed will ever arrive. Finish now,
        // matching the legacy controller's own "zero completed -> FAILED".
        this._finishTerminal(BatchState.FAILED)
      }
    } catch (error) {
      if (this._destroyed) return
      for (const url of this.urlStates.keys()) {
        this._setUrlState(url, { status: 'failed', errorMessage: mapStartError(error) })
      }
      trackBatchFailed({ batchId: this.batchId, projectId: this.projectId, reason: error.message, stage: 'start' })
      this._finishTerminal(BatchState.FAILED)
    }
  }

  /**
   * Recovery path: an existing batchId — persisted across a websocket
   * reconnect this same session, or across a full browser reload — resync
   * state via REST instead of starting a new batch, then keep listening for
   * further live updates exactly as the normal path does.
   */
  async resume(batchId) {
    this.batchId = batchId
    this._attachListeners()
    this.socketService.joinProject(this.projectId)
    this._transition(BatchState.RUNNING)

    const recovered = await this._recoverFromRest({ isInitialResume: true })
    if (!recovered) {
      // Expired/unknown batch — nothing meaningful left to resume.
      this._finishTerminal(BatchState.FAILED)
    }
  }

  /** Detaches websocket listeners without touching any in-flight server-side runs. */
  destroy() {
    this._destroyed = true
    this._detachListeners()
  }

  getSnapshot() {
    let queued = 0, running = 0, completed = 0, failed = 0
    for (const s of this.urlStates.values()) {
      if (s.status === 'queued') queued++
      else if (s.status === 'running') running++
      else if (s.status === 'completed') completed++
      else if (s.status === 'failed') failed++
    }
    return {
      batchId: this.batchId,
      state: this.state,
      total: this.urlStates.size,
      queued,
      running,
      completed,
      failed,
      urls: new Map(this.urlStates),
    }
  }

  _applyStartResponse(response) {
    for (const rejected of response.rejected || []) {
      if (this.urlStates.has(rejected.url)) {
        this._setUrlState(rejected.url, { status: 'failed', errorMessage: rejected.message || 'Not eligible for verification' })
      }
    }
    for (const run of response.runs || []) {
      if (!this.urlStates.has(run.url)) continue
      if (run.dispatched) {
        this._setUrlState(run.url, { status: 'running', stage: 'Queued', percentage: 0, runId: run.runId })
      } else {
        this._setUrlState(run.url, { status: 'failed', errorMessage: 'Failed to start verification', runId: run.runId })
      }
    }
  }

  _attachListeners() {
    if (this._listenersAttached) return
    this.socketService.onVerificationStarted(this._handleStarted)
    this.socketService.onVerificationProgress(this._handleProgress)
    this.socketService.onVerificationCompleted(this._handleCompleted)
    this.socketService.onVerificationFailed(this._handleFailed)
    this.socketService.onVerificationBatchCompleted(this._handleBatchCompleted)
    this._connectionStateUnsubscribe = this.socketService.onConnectionStateChange(this._handleConnectionStateChange)
    this._listenersAttached = true
  }

  _detachListeners() {
    if (!this._listenersAttached) return
    this.socketService.offVerificationStarted(this._handleStarted)
    this.socketService.offVerificationProgress(this._handleProgress)
    this.socketService.offVerificationCompleted(this._handleCompleted)
    this.socketService.offVerificationFailed(this._handleFailed)
    this.socketService.offVerificationBatchCompleted(this._handleBatchCompleted)
    this._connectionStateUnsubscribe?.()
    this._connectionStateUnsubscribe = null
    this._listenersAttached = false
  }

  _handleStarted(payload) {
    this._applyPageEvent(payload, { status: 'running', stage: payload?.currentStage || 'Queued', percentage: payload?.progress ?? 0 })
  }

  _handleProgress(payload) {
    this._applyPageEvent(payload, { status: 'running', stage: payload?.currentStage, percentage: payload?.progress ?? 0 })
  }

  _handleCompleted(payload) {
    this._applyPageEvent(payload, { status: 'completed', stage: 'Completed', percentage: 100 })
  }

  _handleFailed(payload) {
    this._applyPageEvent(payload, {
      status: 'failed',
      stage: payload?.currentStage || 'Failed',
      percentage: payload?.progress ?? null,
      errorMessage: payload?.errorMessage || 'Verification failed',
    })
  }

  /**
   * Same drop-safety as BulkVerificationController: ignore events for URLs
   * this batch isn't tracking, or a stale run for a tracked URL. Per-page
   * state only — never decides the batch's OWN terminal state, that is
   * _handleBatchCompleted's job alone (§4: "do not infer completion from
   * page counts").
   */
  _applyPageEvent(payload, patch) {
    const url = payload?.pageUrl
    if (!url || !this.urlStates.has(url)) {
      this._warnDropped('untracked pageUrl', payload)
      return
    }
    const tracked = this.urlStates.get(url)
    if (tracked.runId && payload.runId && payload.runId !== tracked.runId) {
      this._warnDropped(`runId mismatch (tracked=${tracked.runId})`, payload)
      return
    }
    this._setUrlState(url, patch)
  }

  /** The ONLY thing that decides the batch's own terminal state. */
  _handleBatchCompleted(payload) {
    if (!payload || payload.batchId !== this.batchId) return

    const nextState = payload.status === 'failed' ? BatchState.FAILED : BatchState.COMPLETED
    const didFinish = this._finishTerminal(nextState)

    // Only track once — _finishTerminal's own already-terminal guard means
    // a duplicate/redelivered batch-completed event returns false here.
    if (didFinish) {
      trackBatchCompleted({
        batchId: this.batchId,
        projectId: this.projectId,
        status: payload.status,
        totalUrls: payload.totalUrls,
        completedUrls: payload.completedUrls,
        failedUrls: payload.failedUrls,
      })
    }
  }

  _handleConnectionStateChange(next) {
    // 'connected' — socketService.ConnectionState.CONNECTED's own value.
    // Compared as a literal (not imported) so this class stays decoupled
    // from socketService's module (apiService/socketService are already
    // dependency-injected here, never imported directly — same reason).
    if (next !== 'connected') {
      this._sawNonConnected = true
      return
    }
    if (!this._sawNonConnected) return // the very first connect — not a reconnect
    this._sawNonConnected = false

    trackWebsocketReconnect({ batchId: this.batchId, projectId: this.projectId })

    if (this.state === BatchState.RUNNING && this.batchId) {
      this._recoverFromRest({ isInitialResume: false })
    }
  }

  /**
   * Resyncs urlStates + the batch's own status from REST — used both for
   * resume() after a browser reload and for a mid-session websocket
   * reconnect (events emitted while disconnected are lost forever; there is
   * no replay). Returns true if the batch was found and applied, false if
   * it no longer exists (expired/unknown batchId).
   */
  async _recoverFromRest({ isInitialResume }) {
    try {
      const [batchRes, runsRes] = await Promise.all([
        this.apiService.getVerificationBatch(this.batchId),
        this.apiService.getVerificationBatchRuns(this.batchId),
      ])
      if (this._destroyed) return true
      if (!batchRes?.success || !batchRes?.data) return false

      const batch = batchRes.data
      const runs = runsRes?.data || []

      if (isInitialResume) {
        // resume() starts with an empty urlStates map — seed it from the
        // batch's own persisted url list before applying run-level detail.
        for (const url of batch.urls || []) {
          if (!this.urlStates.has(url)) {
            this.urlStates.set(url, { status: 'queued', stage: null, percentage: 0, errorMessage: null, runId: null })
          }
        }
      }

      for (const run of runs) {
        if (!this.urlStates.has(run.pageUrl)) continue
        if (run.status === 'completed') {
          this._setUrlState(run.pageUrl, { status: 'completed', stage: 'Completed', percentage: 100, runId: run.runId })
        } else if (run.status === 'failed') {
          this._setUrlState(run.pageUrl, { status: 'failed', errorMessage: run.errorMessage || 'Verification failed', runId: run.runId })
        } else {
          this._setUrlState(run.pageUrl, { status: 'running', runId: run.runId })
        }
      }

      trackRecoveryUsed({ batchId: this.batchId, projectId: this.projectId, isInitialResume, batchStatus: batch.status })

      const TERMINAL_STATUSES = ['completed', 'partial', 'failed']
      if (TERMINAL_STATUSES.includes(batch.status)) {
        const nextState = batch.status === 'failed' ? BatchState.FAILED : BatchState.COMPLETED
        this._finishTerminal(nextState)
      }

      return true
    } catch (error) {
      if (error?.status === 404) return false
      // Transient recovery failure (network blip) — stay RUNNING; the next
      // reconnect (or the websocket event, if the connection recovers on
      // its own) will retry. Never surfaced as a batch failure.
      return true
    }
  }

  // Dev-only — mirrors BulkVerificationController's own diagnostic, same
  // rationale: a silently-dropped event here is exactly what makes "the
  // modal stuck at Running forever" undiagnosable from the browser side.
  _warnDropped(reason, payload) {
    if (process.env.NODE_ENV === 'production') return
    console.warn(`[BatchVerificationController] Dropped event for batch ${this.batchId} — ${reason}`, {
      payload,
      trackedUrls: Array.from(this.urlStates.keys()),
    })
  }

  /** @returns {boolean} true if this call actually performed the terminal
   * transition (false if the batch was already terminal — a safe,
   * idempotent no-op for a duplicate/redelivered event). */
  _finishTerminal(nextState) {
    if (this.state !== BatchState.RUNNING) return false // already finished
    if (nextState === BatchState.COMPLETED) {
      // The state machine requires RUNNING -> COMPLETING -> COMPLETED (only
      // FAILED is reachable directly from RUNNING) — same two-step sequence
      // BulkVerificationController's own _maybeFinish uses.
      this._transition(BatchState.COMPLETING)
      this._transition(BatchState.COMPLETED)
    } else {
      this._transition(nextState)
    }
    this._detachListeners()
    return true
  }

  _setUrlState(url, patch) {
    const prev = this.urlStates.get(url) || {}
    this.urlStates.set(url, { ...prev, ...patch })
    this._emit()
  }

  _transition(next) {
    this.state = reduceBatchState(this.state, next)
    this._emit()
  }

  _emit() {
    if (this._destroyed) return
    this.onUpdate?.(this.getSnapshot())
  }
}

function mapStartError(error) {
  switch (error?.status) {
    case 409:
      return 'Already running'
    case 403:
      return 'Permission denied'
    case 400:
      return error.message || 'Not eligible for verification'
    default:
      return error?.message || 'Failed to start'
  }
}

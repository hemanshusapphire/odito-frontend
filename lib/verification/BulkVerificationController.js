import { BatchState, reduceBatchState } from './bulkBatchState'

// Frontend-only throttle — the backend already permits unlimited concurrent
// URL Verifications for different pages on the same project (confirmed:
// isProjectWideAuditInProgress() excludes input_data.mode:'url_verification'
// jobs from its guard). This bounds how many START requests this controller
// has in flight at once, purely so a 500-URL selection doesn't fire 500
// simultaneous POSTs.
export const BULK_VERIFICATION_CONCURRENCY = 3

/**
 * Owns everything about running one bulk verification batch: the queue,
 * which URLs are currently running/completed/failed, the aggregated
 * progress model, and the single shared websocket subscription for the
 * whole batch. Framework-agnostic — no React, no React Query — so the
 * queue/scheduling logic lives in exactly one place and components never
 * implement it themselves.
 *
 * `apiService`/`socketService` are injected (not imported directly) so
 * this class can be unit-tested with plain mocks, no module mocking.
 */
export class BulkVerificationController {
  constructor({ projectId, urls, concurrency = BULK_VERIFICATION_CONCURRENCY, apiService, socketService, onUpdate }) {
    this.batchId = crypto.randomUUID()
    this.projectId = projectId
    this.concurrency = concurrency
    this.apiService = apiService
    this.socketService = socketService
    this.onUpdate = onUpdate

    this.state = BatchState.STARTING
    this.queue = [...urls]
    this.running = new Set()
    // url -> { status: 'queued'|'running'|'completed'|'failed', stage, percentage, errorMessage, runId }
    this.urlStates = new Map(urls.map((url) => [url, { status: 'queued', stage: null, percentage: 0, errorMessage: null, runId: null }]))

    this._listenersAttached = false
    this._destroyed = false

    // Bind once so off*(this._handleX) always removes the exact reference
    // that was registered — same discipline useUrlVerification.js relies on.
    this._handleStarted = this._handleStarted.bind(this)
    this._handleProgress = this._handleProgress.bind(this)
    this._handleCompleted = this._handleCompleted.bind(this)
    this._handleFailed = this._handleFailed.bind(this)
  }

  start() {
    this._attachListeners()
    this.socketService.joinProject(this.projectId)
    this._transition(BatchState.RUNNING)
    this._pump()
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

  _pump() {
    if (this._destroyed) return
    while (this.running.size < this.concurrency && this.queue.length > 0) {
      const url = this.queue.shift()
      this._startOne(url)
    }
    this._maybeFinish()
  }

  async _startOne(url) {
    this.running.add(url)
    this._setUrlState(url, { status: 'running', stage: 'Queued', percentage: 0 })

    try {
      const response = await this.apiService.verifyUrl(this.projectId, url)
      if (this._destroyed) return
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to start verification')
      }
      // Record the runId immediately — every subsequent websocket event for
      // this url is matched against it, so a stale/foreign run for the same
      // URL (e.g. started independently via the single-page Verify button)
      // can never be mistaken for this batch's run.
      this._setUrlState(url, { runId: response.data?.runId || null })
    } catch (error) {
      if (this._destroyed) return
      this.running.delete(url)
      this._setUrlState(url, { status: 'failed', errorMessage: mapStartError(error) })
      this._pump()
    }
  }

  _attachListeners() {
    this.socketService.onVerificationStarted(this._handleStarted)
    this.socketService.onVerificationProgress(this._handleProgress)
    this.socketService.onVerificationCompleted(this._handleCompleted)
    this.socketService.onVerificationFailed(this._handleFailed)
    this._listenersAttached = true
  }

  _detachListeners() {
    if (!this._listenersAttached) return
    this.socketService.offVerificationStarted(this._handleStarted)
    this.socketService.offVerificationProgress(this._handleProgress)
    this.socketService.offVerificationCompleted(this._handleCompleted)
    this.socketService.offVerificationFailed(this._handleFailed)
    this._listenersAttached = false
  }

  _handleStarted(payload) {
    this._applyEvent(payload, { status: 'running', stage: payload?.currentStage || 'Queued', percentage: payload?.progress ?? 0 })
  }

  _handleProgress(payload) {
    this._applyEvent(payload, { status: 'running', stage: payload?.currentStage, percentage: payload?.progress ?? 0 })
  }

  _handleCompleted(payload) {
    const url = payload?.pageUrl
    this._applyEvent(payload, { status: 'completed', stage: 'Completed', percentage: 100 }, () => {
      this.running.delete(url)
      this._pump()
    })
  }

  _handleFailed(payload) {
    const url = payload?.pageUrl
    this._applyEvent(payload, { status: 'failed', stage: payload?.currentStage || 'Failed', percentage: payload?.progress ?? null, errorMessage: payload?.errorMessage || 'Verification failed' }, () => {
      this.running.delete(url)
      this._pump()
    })
  }

  /** Ignores events for URLs this batch isn't tracking, or a stale run for a tracked URL. */
  _applyEvent(payload, patch, onTerminal) {
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
    onTerminal?.()
    this._maybeFinish()
  }

  // Dev-only — a silently-dropped websocket event here is exactly what makes
  // "the modal stuck at Running forever even though the backend finished"
  // undiagnosable from the browser side. Never throws, never runs in
  // production.
  _warnDropped(reason, payload) {
    if (process.env.NODE_ENV === 'production') return
    console.warn(`[BulkVerificationController] Dropped event for batch ${this.batchId} — ${reason}`, {
      payload,
      trackedUrls: Array.from(this.urlStates.keys()),
    })
  }

  _maybeFinish() {
    const snapshot = this.getSnapshot()
    if (snapshot.queued > 0 || snapshot.running > 0) return
    if (this.state !== BatchState.RUNNING) return // already finished

    if (snapshot.completed > 0) {
      this._transition(BatchState.COMPLETING)
      this._transition(BatchState.COMPLETED)
    } else {
      this._transition(BatchState.FAILED)
    }
    this._detachListeners()
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

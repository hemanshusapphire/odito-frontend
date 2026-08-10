import { io } from 'socket.io-client';
import API_BASE_URL from "@/lib/apiConfig";
import { logger } from "@/lib/monitoring/logger";

// ─── Resilience tuning ──────────────────────────────────────
const INITIAL_DELAY = 1000;       // first reconnect delay (ms)
const MAX_DELAY = 30000;          // backoff ceiling (ms)
const MAX_RETRIES = 10;           // give up after this many attempts
const HEARTBEAT_INTERVAL = 30000; // app-level ping cadence (ms)
const HEARTBEAT_TIMEOUT = 10000;  // ack must arrive within this (ms)
const MAX_MISSED_HEARTBEATS = 2;  // consecutive misses before forcing reconnect

// ─── Connection state machine ───────────────────────────────
export const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
};

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();   // Map<event, Set<callback>>
    this.joinedRooms = new Set(); // 🔒 Track active room memberships
    this.serverUrl = API_BASE_URL.replace('/api', '');
    this.token = null;

    this.state = ConnectionState.DISCONNECTED;
    this.stateListeners = new Set(); // subscribers to connection lifecycle

    this.heartbeatTimer = null;
    this.missedHeartbeats = 0;
    this.heartbeatSupported = false; // becomes true after first successful ack
  }

  // ── State machine ─────────────────────────────────────────
  /** @returns {string} current ConnectionState */
  getState() {
    return this.state;
  }

  _setState(next) {
    if (this.state === next) return;
    const prev = this.state;
    this.state = next;
    logger.debug('socket state change', { from: prev, to: next });
    this.stateListeners.forEach((cb) => {
      try {
        cb(next, prev);
      } catch (err) {
        logger.error('connection state listener threw', null, err);
      }
    });
  }

  /** Subscribe to connection lifecycle changes. Returns an unsubscribe fn. */
  onConnectionStateChange(cb) {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  offConnectionStateChange(cb) {
    this.stateListeners.delete(cb);
  }

  /**
   * Initialize the WebSocket connection.
   * Relies on socket.io's native reconnection for exponential backoff,
   * bounded by INITIAL_DELAY..MAX_DELAY and capped at MAX_RETRIES attempts.
   * @param {string} token - Authentication token (optional)
   */
  connect(token = null) {
    if (token) this.token = token;

    if (this.socket && this.connected) {
      logger.debug('socket already connected');
      return Promise.resolve(this.socket);
    }

    // Reuse an existing (reconnecting) socket instead of stacking instances.
    if (this.socket) {
      this._setState(ConnectionState.CONNECTING);
      this.socket.connect();
      return Promise.resolve(this.socket);
    }

    logger.info('connecting to WebSocket', { url: this.serverUrl });
    this._setState(ConnectionState.CONNECTING);

    const options = {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      // Native exponential backoff with bounded delay + attempt cap.
      reconnection: true,
      reconnectionAttempts: MAX_RETRIES,
      reconnectionDelay: INITIAL_DELAY,
      reconnectionDelayMax: MAX_DELAY,
      randomizationFactor: 0.5,
    };

    if (this.token) {
      options.auth = { token: this.token };
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, options);

        // Bind all already-registered listeners exactly once. The socket
        // instance persists across reconnections, so listeners must NOT be
        // re-bound on every 'connect' (that caused duplicate event handling).
        this._bindStoredListeners();

        this.socket.on('connect', () => {
          this.connected = true;
          this._setState(ConnectionState.CONNECTED);
          logger.info('WebSocket connected');

          // Re-join all tracked rooms after (re)connection.
          this.joinedRooms.forEach((roomId) => {
            if (roomId.startsWith('project:')) {
              const projectId = roomId.replace('project:', '');
              this.socket.emit('join-project', projectId);
              logger.debug('reconnect: re-joined project room', { projectId });
            } else {
              this.socket.emit('join-audit', roomId);
              logger.debug('reconnect: re-joined audit room', { jobId: roomId });
            }
          });

          this._startHeartbeat();
          resolve(this.socket);
        });

        // socket.io drives reconnection; we surface it through the state machine.
        this.socket.io.on('reconnect_attempt', (attempt) => {
          this._setState(ConnectionState.RECONNECTING);
          const delay = Math.min(INITIAL_DELAY * 2 ** (attempt - 1), MAX_DELAY);
          logger.warn('socket reconnect attempt', { attempt, approxDelayMs: delay });
        });

        this.socket.io.on('reconnect_failed', () => {
          this._setState(ConnectionState.FAILED);
          logger.error('socket reconnection failed after max retries', {
            maxRetries: MAX_RETRIES,
          });
          this._emitLocal('connection:failed');
        });

        this.socket.on('disconnect', (reason) => {
          this.connected = false;
          this._stopHeartbeat();
          logger.warn('WebSocket disconnected', { reason });

          if (reason === 'io server disconnect') {
            // Server forcibly closed the socket; socket.io won't auto-reconnect
            // in this case, so kick it off manually.
            this._setState(ConnectionState.RECONNECTING);
            this.socket.connect();
          } else {
            this._setState(ConnectionState.RECONNECTING);
          }
        });

        this.socket.on('connect_error', (error) => {
          this.connected = false;
          logger.error('socket connection error', null, error);
          // Don't reject after the socket exists — reconnection will retry.
          if (this.state === ConnectionState.CONNECTING) {
            reject(error);
          }
        });

        // Initial connection timeout guard.
        setTimeout(() => {
          if (!this.connected && this.state === ConnectionState.CONNECTING) {
            reject(new Error('Socket connection timeout'));
          }
        }, options.timeout);
      } catch (error) {
        logger.error('socket initialization error', null, error);
        this._setState(ConnectionState.DISCONNECTED);
        reject(error);
      }
    });
  }

  // ── Heartbeat ─────────────────────────────────────────────
  // Tolerant by design: if the server never acks a heartbeat we assume it
  // doesn't implement the 'heartbeat' event and stop forcing reconnects, so an
  // unsupported server can never trigger a reconnect loop.
  _startHeartbeat() {
    this._stopHeartbeat();
    this.missedHeartbeats = 0;
    this.heartbeatTimer = setInterval(() => {
      if (!this.socket || !this.connected) return;
      this.socket
        .timeout(HEARTBEAT_TIMEOUT)
        .emit('heartbeat', (err) => {
          if (err) {
            if (!this.heartbeatSupported) return; // server doesn't implement it
            this.missedHeartbeats += 1;
            logger.warn('heartbeat missed', { missed: this.missedHeartbeats });
            if (this.missedHeartbeats >= MAX_MISSED_HEARTBEATS) {
              logger.error('stale connection detected, forcing reconnect');
              this.missedHeartbeats = 0;
              this._setState(ConnectionState.RECONNECTING);
              this.socket.disconnect().connect();
            }
          } else {
            this.heartbeatSupported = true;
            this.missedHeartbeats = 0;
          }
        });
    }, HEARTBEAT_INTERVAL);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ── Listener binding (dedup) ──────────────────────────────
  _bindStoredListeners() {
    if (!this.socket) return;
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket.off(event, callback); // guard against double-bind
        this.socket.on(event, callback);
      });
    });
  }

  /** Notify local (non-socket) subscribers of a lifecycle event. */
  _emitLocal(event) {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;
    callbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        logger.error('local event listener threw', { event }, err);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect() {
    if (this.socket) {
      this._stopHeartbeat();
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
      this.joinedRooms.clear();
      this._setState(ConnectionState.DISCONNECTED);
      logger.info('WebSocket disconnected (manual)');
    }
  }

  /**
   * Join an audit room to receive progress updates.
   * @param {string} jobId - Job ID to join
   */
  joinAudit(jobId) {
    if (!this.socket || !this.connected) {
      logger.warn('cannot join audit: socket not connected', { jobId });
      return;
    }
    this.socket.emit('join-audit', jobId);
    this.joinedRooms.add(jobId);
    logger.debug('joined audit room', { jobId });
  }

  /**
   * Leave an audit room.
   * @param {string} jobId - Job ID to leave (optional)
   */
  leaveAudit(jobId = null) {
    if (!this.socket || !this.connected) {
      logger.warn('cannot leave audit: socket not connected', { jobId });
      return;
    }
    if (jobId) {
      this.socket.emit('leave-audit', jobId);
      this.joinedRooms.delete(jobId);
      logger.debug('left audit room', { jobId });
    } else {
      this.socket.emit('leave-audit');
      logger.debug('left current audit room');
    }
  }

  /**
   * 🔒 Join a project room for project-scoped events (e.g., audit:completed).
   * @param {string} projectId - Project ID to join
   */
  joinProject(projectId) {
    // Track the room regardless of connection state so reconnect re-joins it.
    this.joinedRooms.add(`project:${projectId}`);
    if (!this.socket || !this.connected) {
      logger.warn('cannot join project room: socket not connected (will join on reconnect)', { projectId });
      return;
    }
    this.socket.emit('join-project', projectId);
    logger.debug('joined project room', { projectId });
  }

  /**
   * 🔒 Leave a project room.
   * @param {string} projectId - Project ID to leave
   */
  leaveProject(projectId) {
    if (!this.socket || !this.connected) {
      logger.warn('cannot leave project room: socket not connected', { projectId });
      return;
    }
    this.socket.emit('leave-project', projectId);
    this.joinedRooms.delete(`project:${projectId}`);
    logger.debug('left project room', { projectId });
  }

  /**
   * 🔒 Leave all rooms (for project switching).
   */
  leaveAllRooms() {
    if (!this.socket || !this.connected) {
      return;
    }
    const count = this.joinedRooms.size;
    this.joinedRooms.forEach((roomId) => {
      if (roomId.startsWith('project:')) {
        const projectId = roomId.replace('project:', '');
        this.socket.emit('leave-project', projectId);
      } else {
        this.socket.emit('leave-audit', roomId);
      }
    });
    logger.debug('left all rooms', { count });
    this.joinedRooms.clear();
  }

  // ── Audit event subscriptions ─────────────────────────────
  onAuditProgress(callback) { this.addEventListener('audit:progress', callback); }
  onAuditStarted(callback) { this.addEventListener('audit:started', callback); }
  onAuditCompleted(callback) { this.addEventListener('audit:completed', callback); }
  onAuditError(callback) { this.addEventListener('audit:error', callback); }
  onAuditStageChanged(callback) { this.addEventListener('audit:stageChanged', callback); }

  offAuditStageChanged(callback) { this.removeEventListener('audit:stageChanged', callback); }
  offAuditStarted(callback) { this.removeEventListener('audit:started', callback); }
  offAuditProgress(callback) { this.removeEventListener('audit:progress', callback); }
  offAuditCompleted(callback) { this.removeEventListener('audit:completed', callback); }
  offAuditError(callback) { this.removeEventListener('audit:error', callback); }

  // ── URL Verification event subscriptions (F4-001) ──────────
  // Same generic addEventListener/removeEventListener plumbing as the audit:*
  // events above — emitted to the project-{projectId} room, same room
  // joinProject() already joins, so no new room-joining logic is needed.
  onVerificationStarted(callback) { this.addEventListener('verification:started', callback); }
  onVerificationProgress(callback) { this.addEventListener('verification:progress', callback); }
  onVerificationCompleted(callback) { this.addEventListener('verification:completed', callback); }
  onVerificationFailed(callback) { this.addEventListener('verification:failed', callback); }

  offVerificationStarted(callback) { this.removeEventListener('verification:started', callback); }
  offVerificationProgress(callback) { this.removeEventListener('verification:progress', callback); }
  offVerificationCompleted(callback) { this.removeEventListener('verification:completed', callback); }
  offVerificationFailed(callback) { this.removeEventListener('verification:failed', callback); }

  // ── Verification Batch event subscription (F4-019) ─────────
  // Same project-{projectId} room, same generic plumbing as the per-page
  // verification:* events above — emitted exactly once per batch, after the
  // backend's own project-level aggregation chain finishes.
  onVerificationBatchCompleted(callback) { this.addEventListener('verification:batch-completed', callback); }
  offVerificationBatchCompleted(callback) { this.removeEventListener('verification:batch-completed', callback); }

  // ── Google Ads sync event subscriptions (Phase 7.1) ─────────
  // Same project-{projectId} room, same generic addEventListener/
  // removeEventListener plumbing as every event group above - emitted by
  // auditProgressService.emitGoogleAdsSync* (odito_backend), already wired
  // up server-side since Phase 6.3; these are the first client-side
  // listeners for them.
  onGoogleAdsSyncStarted(callback) { this.addEventListener('google_ads_sync:started', callback); }
  onGoogleAdsSyncProgress(callback) { this.addEventListener('google_ads_sync:progress', callback); }
  onGoogleAdsSyncCompleted(callback) { this.addEventListener('google_ads_sync:completed', callback); }
  onGoogleAdsSyncFailed(callback) { this.addEventListener('google_ads_sync:failed', callback); }

  offGoogleAdsSyncStarted(callback) { this.removeEventListener('google_ads_sync:started', callback); }
  offGoogleAdsSyncProgress(callback) { this.removeEventListener('google_ads_sync:progress', callback); }
  offGoogleAdsSyncCompleted(callback) { this.removeEventListener('google_ads_sync:completed', callback); }
  offGoogleAdsSyncFailed(callback) { this.removeEventListener('google_ads_sync:failed', callback); }

  /**
   * Add an event listener. Stored for re-use across reconnections and bound to
   * the live socket exactly once (off-then-on) to prevent duplicate handling.
   * @param {string} event
   * @param {Function} callback
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.off(event, callback);
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove an event listener.
   * @param {string} event
   * @param {Function} callback - specific callback (optional; omit to remove all)
   */
  removeEventListener(event, callback = null) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);

    if (callback) {
      callbacks.delete(callback);
      if (this.socket) this.socket.off(event, callback);
      if (callbacks.size === 0) this.listeners.delete(event);
    } else {
      callbacks.forEach((cb) => {
        if (this.socket) this.socket.off(event, cb);
      });
      this.listeners.delete(event);
    }
  }

  /**
   * @returns {boolean} connection status
   */
  isConnected() {
    return this.connected && !!this.socket;
  }

  /**
   * @returns {Object} socket instance
   */
  getSocket() {
    return this.socket;
  }
}

export default new SocketService();

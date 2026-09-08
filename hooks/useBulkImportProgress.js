"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import socketService, { ConnectionState } from '@/lib/socketService'
import { bulkKeys } from '@/hooks/useBulkUpload'

/**
 * Live bulk-import progress from Socket.IO — used by the Bulk Upload
 * wizard while an import is running (and while recovering one after a
 * refresh).
 *
 * Design (matches useGoogleAdsSyncProgress's socket handling, minus the
 * poll — the backend import is synchronous and bounded):
 *   - subscribes ONLY while `active` is true;
 *   - no fake percentage — it surfaces real counts (`processed` / `total`);
 *   - duplicate / out-of-order events are safe: progress only moves
 *     forward (`processed` never decreases), and `completed` / `error`
 *     are terminal;
 *   - on a Socket.IO RECONNECT it re-joins the room and invalidates the
 *     authoritative batch + rows queries so the wizard re-reads real
 *     state (never assumes it saw every event);
 *   - filters strictly by `batchId` — a sibling batch's events are ignored.
 *
 * @returns {{ status: 'idle'|'importing'|'completed'|'error', processed, total,
 *   attempted, imported, failed, drafts, scheduled, currentRowNumber,
 *   code: string|null, message: string|null, lastEventAt: number|null,
 *   reconnectedAt: number|null }}
 */
const EMPTY = {
  status: 'idle', processed: 0, total: 0, attempted: 0, imported: 0, failed: 0,
  drafts: 0, scheduled: 0, currentRowNumber: null, code: null, message: null,
  lastEventAt: null, reconnectedAt: null,
}

export function useBulkImportProgress(projectId, batchId, { active = false } = {}) {
  const queryClient = useQueryClient()
  const [state, setState] = useState(EMPTY)
  const stateRef = useRef(EMPTY)
  useEffect(() => { stateRef.current = state }, [state])

  const isTerminal = (s) => s === 'completed' || s === 'error'

  const onStarted = useCallback((p) => {
    if (!p || String(p.batchId) !== String(batchId)) return
    setState((prev) => (isTerminal(prev.status) ? prev : {
      ...prev, status: 'importing', total: Number(p.total) || prev.total, lastEventAt: Date.now(),
    }))
  }, [batchId])

  const onProgress = useCallback((p) => {
    if (!p || String(p.batchId) !== String(batchId)) return
    setState((prev) => {
      if (isTerminal(prev.status)) return prev
      const processed = Number(p.processed) || 0
      if (processed < prev.processed) return prev // stale / out-of-order
      return {
        ...prev,
        status: 'importing',
        processed,
        total: Number(p.total) || prev.total,
        attempted: Number(p.attempted) || prev.attempted,
        imported: Number(p.imported) || prev.imported,
        failed: Number(p.failed) || prev.failed,
        drafts: Number(p.drafts) || prev.drafts,
        scheduled: Number(p.scheduled) || prev.scheduled,
        currentRowNumber: p.currentRowNumber ?? prev.currentRowNumber,
        lastEventAt: Date.now(),
      }
    })
  }, [batchId])

  const onCompleted = useCallback((p) => {
    if (!p || String(p.batchId) !== String(batchId)) return
    setState((prev) => ({
      ...prev,
      status: 'completed',
      total: Number(p.total) || prev.total,
      processed: Number(p.processed) || Number(p.total) || prev.processed,
      attempted: Number(p.attempted) || prev.attempted,
      imported: Number(p.imported) || prev.imported,
      failed: Number(p.failed) || prev.failed,
      drafts: Number(p.drafts) || prev.drafts,
      scheduled: Number(p.scheduled) || prev.scheduled,
      lastEventAt: Date.now(),
    }))
    if (projectId && batchId) {
      queryClient.invalidateQueries({ queryKey: bulkKeys.batch(projectId, batchId) })
      queryClient.invalidateQueries({ queryKey: bulkKeys.rowsForBatch(projectId, batchId) })
    }
  }, [batchId, projectId, queryClient])

  const onError = useCallback((p) => {
    if (!p || String(p.batchId) !== String(batchId)) return
    setState((prev) => ({
      ...prev, status: 'error', code: p.code || 'IMPORT_FAILED', message: p.message || null, lastEventAt: Date.now(),
    }))
    if (projectId && batchId) {
      queryClient.invalidateQueries({ queryKey: bulkKeys.batch(projectId, batchId) })
    }
  }, [batchId, projectId, queryClient])

  useEffect(() => {
    if (!projectId || !batchId || !active) return undefined

    setState({ ...EMPTY, status: 'importing' })
    socketService.joinProject(projectId)
    socketService.onBulkImportStarted(onStarted)
    socketService.onBulkImportProgress(onProgress)
    socketService.onBulkImportCompleted(onCompleted)
    socketService.onBulkImportError(onError)

    // On a reconnect (transient drop → CONNECTED again): re-join the room
    // and refetch the authoritative batch/rows — we cannot assume every
    // event that fired while disconnected was received.
    const unsubscribeState = socketService.onConnectionStateChange((next, prev) => {
      if (next === ConnectionState.CONNECTED && prev && prev !== ConnectionState.CONNECTING) {
        socketService.joinProject(projectId)
        queryClient.invalidateQueries({ queryKey: bulkKeys.batch(projectId, batchId) })
        queryClient.invalidateQueries({ queryKey: bulkKeys.rowsForBatch(projectId, batchId) })
        setState((s) => ({ ...s, reconnectedAt: Date.now() }))
      }
    })

    return () => {
      socketService.offBulkImportStarted(onStarted)
      socketService.offBulkImportProgress(onProgress)
      socketService.offBulkImportCompleted(onCompleted)
      socketService.offBulkImportError(onError)
      if (typeof unsubscribeState === 'function') unsubscribeState()
    }
  }, [projectId, batchId, active, onStarted, onProgress, onCompleted, onError, queryClient])

  return state
}

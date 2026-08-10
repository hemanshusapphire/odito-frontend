"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import socketService from '@/lib/socketService'
import { queryKeys } from '@/lib/query/keys'

const POLL_INTERVAL_MS = 5000 // fallback status poll every 5s, same cadence as useAuditTrigger.js

/**
 * Tracks a Google Ads initial sync (Phase 7.1, State 4) while it's in
 * flight: live stage/progress from the google_ads_sync:* socket events,
 * with a polling fallback against GET /google-ads/sync-status in case an
 * event is missed - same hybrid socket+poll pattern as useAuditTrigger.js.
 *
 * Kept in its own file (not hooks/useDashboardQueries.js) because it wires
 * up socketService directly, matching useAuditTrigger.js's precedent -
 * useDashboardQueries.js is pure React Query, no socket imports.
 *
 * Only subscribes/polls while `active` is true (i.e. the page's
 * useGoogleAdsConnection().syncing) - on completion/failure it invalidates
 * the shared google-ads sync-status query key so useGoogleAdsConnection
 * picks up the terminal state and the page transitions out of this view.
 */
export function useGoogleAdsSyncProgress(projectId, { active } = {}) {
  const queryClient = useQueryClient()
  const [state, setState] = useState({ stage: null, progress: 0, startedAt: null })

  const pollTimerRef = useRef(null)
  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])

  const settle = useCallback(() => {
    clearInterval(pollTimerRef.current)
    pollTimerRef.current = null
    queryClient.invalidateQueries({ queryKey: queryKeys.googleAds.syncStatus(projectId) })
  }, [queryClient, projectId])

  const onStarted = useCallback((payload) => {
    setState({
      stage: payload.stage || 'started',
      progress: payload.progress || 0,
      startedAt: payload.timestamp || new Date().toISOString(),
    })
  }, [])

  const onProgress = useCallback((payload) => {
    setState((prev) => ({ ...prev, stage: payload.stage, progress: payload.progress ?? prev.progress }))
  }, [])

  const onCompleted = useCallback(() => settle(), [settle])
  const onFailed = useCallback(() => settle(), [settle])

  useEffect(() => {
    if (!projectId || !active) return undefined

    socketService.onGoogleAdsSyncStarted(onStarted)
    socketService.onGoogleAdsSyncProgress(onProgress)
    socketService.onGoogleAdsSyncCompleted(onCompleted)
    socketService.onGoogleAdsSyncFailed(onFailed)
    socketService.joinProject(projectId)

    pollTimerRef.current = setInterval(async () => {
      if (!activeRef.current) return
      try {
        const res = await apiService.getGoogleAdsSyncStatus(projectId)
        if (res?.data && !res.data.inProgress) settle()
      } catch {
        // Polling errors are non-fatal - the socket (or the next poll) will still deliver completion.
      }
    }, POLL_INTERVAL_MS)

    return () => {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
      socketService.offGoogleAdsSyncStarted(onStarted)
      socketService.offGoogleAdsSyncProgress(onProgress)
      socketService.offGoogleAdsSyncCompleted(onCompleted)
      socketService.offGoogleAdsSyncFailed(onFailed)
    }
  }, [projectId, active, onStarted, onProgress, onCompleted, onFailed])

  return state
}

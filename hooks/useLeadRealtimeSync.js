"use client"

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import socketService from '@/lib/socketService'
import { queryKeys } from '@/lib/query/keys'

const POLL_INTERVAL_MS = 30000 // safety-net refetch in case a socket event is missed

/**
 * Listens for `lead:created` (emitted by
 * wordPressSubmissionService.notifyLeadCreated when a WordPress form
 * submission becomes a real Lead — see Phase 3B) and invalidates the leads
 * list + stats queries for the active project, so a new WordPress lead
 * shows up on /app/leads without a manual refresh.
 *
 * Kept in its own file, not hooks/useDashboardQueries.js, matching
 * useGoogleAdsSyncProgress.js's precedent — useDashboardQueries.js stays
 * pure React Query with no socket imports.
 *
 * Deliberately lightweight compared to useGoogleAdsSyncProgress.js: a lead
 * is either created or not (no multi-stage "progress" to track), so this
 * just invalidates on the event, with a 30s poll-refetch as a safety net
 * per Section 35 ("use query invalidation/polling first" where a fuller
 * socket architecture isn't warranted).
 */
export function useLeadRealtimeSync(projectId, { active = true } = {}) {
  const queryClient = useQueryClient()

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leads.all(projectId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.leads.stats(projectId) })
  }, [queryClient, projectId])

  const onLeadCreated = useCallback((payload) => {
    if (payload?.projectId && String(payload.projectId) !== String(projectId)) return
    invalidate()
  }, [projectId, invalidate])

  useEffect(() => {
    if (!projectId || !active) return undefined

    socketService.onLeadCreated(onLeadCreated)
    socketService.joinProject(projectId)

    const pollTimer = setInterval(invalidate, POLL_INTERVAL_MS)

    return () => {
      socketService.offLeadCreated(onLeadCreated)
      clearInterval(pollTimer)
    }
  }, [projectId, active, onLeadCreated, invalidate])
}

export default useLeadRealtimeSync

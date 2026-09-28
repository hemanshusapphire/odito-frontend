"use client"

import { useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import socketService from '@/lib/socketService'
import { queryKeys } from '@/lib/query/keys'

const POLL_INTERVAL_MS = 30000 // safety-net refetch in case a socket event is missed

/**
 * Listens for `task:implemented`/`task:verified`/`task:reopened` (emitted by
 * taskController.js and TaskVerificationService.js — see Task.js) and
 * invalidates the task queries IssueDetailView.jsx already reads, so a task
 * that gets verified or reopened by a background recrawl shows up without a
 * manual refresh.
 *
 * Closes a pre-existing gap, not a WordPress-specific one: every task
 * transition (manual "Mark as Implemented", the DIY guide, or the
 * WordPress-automated flow) reaches the UI through these same three events
 * — there is no separate "WordPress fix" event, because a WordPress-applied
 * fix IS a Task transition (origin: 'wordpress_auto'), not a new lifecycle.
 *
 * Mirrors useLeadRealtimeSync.js's shape exactly: its own file (not
 * hooks/useDashboardQueries.js, which stays pure React Query with no socket
 * imports), invalidate-on-event with a 30s poll-refetch safety net rather
 * than a fuller optimistic-update architecture (Section 17/35 — minimize
 * flicker via cache invalidation + a toast, not optimistic local state).
 */
/**
 * What to tell the user once the crawler has checked a WordPress-applied fix,
 * for the fixes whose outcome deserves its own wording. Only automated
 * (`wordpress_auto`) fixes qualify: "WordPress saved it" would be false for a
 * manually implemented one. Returns null for everything else.
 */
export function describeVerificationNotice(eventName, payload) {
  if (payload?.issueKey !== 'sameas_array' || payload?.origin !== 'wordpress_auto') return null
  if (eventName === 'verified') return { message: 'Organization sameAs verified.', type: 'success' }
  if (eventName === 'reopened') {
    return { message: 'WordPress value was saved, but the Organization schema output could not be verified.', type: 'warning' }
  }
  return null
}

export function useTaskRealtimeSync(projectId, { active = true, onNotice } = {}) {
  const queryClient = useQueryClient()
  // Kept in a ref so a new callback identity on each render never re-subscribes the sockets.
  const noticeRef = useRef(onNotice)
  noticeRef.current = onNotice

  const invalidate = useCallback((payload) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.summary(projectId) })
    if (payload?.issueKey) {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.activeUrls(projectId, payload.issueKey) })
    }
    if (payload?.taskId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(payload.taskId) })
    }
  }, [queryClient, projectId])

  const onTaskImplemented = useCallback((payload) => invalidate(payload), [invalidate])
  const onTaskVerified = useCallback((payload) => {
    invalidate(payload)
    const notice = describeVerificationNotice('verified', payload)
    if (notice) noticeRef.current?.(notice)
  }, [invalidate])
  const onTaskReopened = useCallback((payload) => {
    invalidate(payload)
    const notice = describeVerificationNotice('reopened', payload)
    if (notice) noticeRef.current?.(notice)
  }, [invalidate])

  useEffect(() => {
    if (!projectId || !active) return undefined

    socketService.onTaskImplemented(onTaskImplemented)
    socketService.onTaskVerified(onTaskVerified)
    socketService.onTaskReopened(onTaskReopened)
    socketService.joinProject(projectId)

    const pollTimer = setInterval(() => invalidate(), POLL_INTERVAL_MS)

    return () => {
      socketService.offTaskImplemented(onTaskImplemented)
      socketService.offTaskVerified(onTaskVerified)
      socketService.offTaskReopened(onTaskReopened)
      clearInterval(pollTimer)
    }
  }, [projectId, active, onTaskImplemented, onTaskVerified, onTaskReopened, invalidate])
}

export default useTaskRealtimeSync

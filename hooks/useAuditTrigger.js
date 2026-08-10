"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/apiService'
import socketService from '@/lib/socketService'
import { invalidateProject, refetchProject } from '@/lib/query/keys'

const POLL_INTERVAL_MS = 5000 // fallback status poll every 5s

/**
 * Shared audit-trigger logic (Full Recrawl + Quick Recheck): starts the audit,
 * subscribes to socket completion/error events, joins the project's socket
 * room, and runs a polling fallback in case a socket event is missed.
 * On completion, invalidates + refetches all cached project queries.
 *
 * Extracted from the dashboard so any page (Dashboard, Project Settings) can
 * trigger an audit with identical behavior — do not duplicate this logic.
 */
export function useAuditTrigger(projectId) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const [isRecrawling, setIsRecrawling] = useState(false)
  const [recrawlError, setRecrawlError] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState(null)

  // Refs so callbacks inside effects always see the latest values without
  // needing to re-register socket listeners on every render.
  const projectIdRef = useRef(projectId)
  const pollTimerRef = useRef(null)
  const isRecrawlRef = useRef(false)
  const isVerifyRef = useRef(false)

  useEffect(() => { projectIdRef.current = projectId }, [projectId])
  useEffect(() => { isRecrawlRef.current = isRecrawling }, [isRecrawling])
  useEffect(() => { isVerifyRef.current = isVerifying }, [isVerifying])

  const onAuditFinished = useCallback(() => {
    const pid = projectIdRef.current
    clearInterval(pollTimerRef.current)
    pollTimerRef.current = null

    socketService.offAuditCompleted(onAuditFinished)
    socketService.offAuditError(onAuditFailed)

    if (pid) {
      invalidateProject(queryClient, pid)
      refetchProject(queryClient, pid)
    }
    setIsRecrawling(false)
    setIsVerifying(false)
    setRecrawlError(null)
    setVerifyError(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient])

  const onAuditFailed = useCallback((err) => {
    clearInterval(pollTimerRef.current)
    pollTimerRef.current = null

    socketService.offAuditCompleted(onAuditFinished)
    socketService.offAuditError(onAuditFailed)

    const message = err?.message || 'Audit failed. Please try again.'
    if (isVerifyRef.current) {
      setIsVerifying(false)
      setVerifyError(message)
    } else {
      setIsRecrawling(false)
      setRecrawlError(message)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAuditFinished])

  // Polling fallback: checks /seo/scraping-status while an audit is running.
  // Stops as soon as the status reaches a terminal state.
  const startPolling = useCallback((pid) => {
    if (pollTimerRef.current) return
    pollTimerRef.current = setInterval(async () => {
      if (!isRecrawlRef.current && !isVerifyRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
        return
      }
      try {
        const status = await apiService.getAuditStatus(pid)
        const data = status?.data || {}
        const scoring = data.seo_scoring || {}
        const aiScoring = data.ai_visibility_scoring || {}
        const pageAnalysis = data.page_analysis || {}
        const scoringDone = (scoring.completed || 0) >= 1 && (scoring.processing || 0) === 0
        const aiScoringDone = (aiScoring.completed || 0) >= 1 && (aiScoring.processing || 0) === 0
        const scoringFailed = (scoring.failed || 0) >= 1 && (scoring.processing || 0) === 0 && (scoring.completed || 0) === 0
        const aiScoringFailed = (aiScoring.failed || 0) >= 1 && (aiScoring.processing || 0) === 0 && (aiScoring.completed || 0) === 0
        const analysisFailed = (pageAnalysis.failed || 0) >= 1 && (pageAnalysis.processing || 0) === 0 && (pageAnalysis.completed || 0) === 0
        if (scoringDone || aiScoringDone) {
          onAuditFinished()
        } else if (scoringFailed || aiScoringFailed || analysisFailed) {
          onAuditFailed({ message: 'Audit failed during processing.' })
        }
      } catch {
        // polling errors are non-fatal; socket will still deliver completion
      }
    }, POLL_INTERVAL_MS)
  }, [onAuditFinished, onAuditFailed])

  // Cleanup on unmount so we don't leak timers or socket listeners
  useEffect(() => {
    return () => {
      clearInterval(pollTimerRef.current)
      socketService.offAuditCompleted(onAuditFinished)
      socketService.offAuditError(onAuditFailed)
    }
  }, [onAuditFinished, onAuditFailed])

  const startRecrawl = useCallback(async () => {
    const pid = projectIdRef.current
    if (!pid || isRecrawlRef.current) return

    setIsRecrawling(true)
    setRecrawlError(null)

    try {
      const response = await apiService.startAudit(pid)
      if (!response.success) {
        throw new Error(response.message || 'Failed to start recrawl')
      }

      socketService.onAuditCompleted(onAuditFinished)
      socketService.onAuditError(onAuditFailed)
      socketService.joinProject(pid)
      startPolling(pid)

      // Mirror the initial-audit flow (ARIAChat.jsx): navigate to the
      // processing screen so its existing poll loop can pick up the
      // awaiting_url_selection / completed transitions and redirect
      // accordingly. Without this, a recrawl triggered from Settings has
      // nothing watching crawl_status once the pipeline reaches the URL
      // Selection gate.
      router.push(`/processing/${pid}`)
    } catch (error) {
      console.error('[RECRAWL] Failed to start:', error)
      setRecrawlError(error.message || 'Failed to start recrawl. Please try again.')
      setIsRecrawling(false)
    }
  }, [onAuditFinished, onAuditFailed, startPolling, router])

  const startQuickRecheck = useCallback(async () => {
    const pid = projectIdRef.current
    if (!pid || isRecrawlRef.current || isVerifyRef.current) return

    setIsVerifying(true)
    setVerifyError(null)

    try {
      const response = await apiService.startVerification(pid)
      if (!response.success) {
        throw new Error(response.message || 'Failed to start Quick Recheck')
      }

      socketService.onAuditCompleted(onAuditFinished)
      socketService.onAuditError(onAuditFailed)
      socketService.joinProject(pid)
      startPolling(pid)
    } catch (error) {
      console.error('[QUICK_RECHECK] Failed to start:', error)
      setVerifyError(error.message || 'Failed to start Quick Recheck. Please try again.')
      setIsVerifying(false)
    }
  }, [onAuditFinished, onAuditFailed, startPolling])

  return {
    isRecrawling,
    recrawlError,
    startRecrawl,
    isVerifying,
    verifyError,
    startQuickRecheck,
  }
}

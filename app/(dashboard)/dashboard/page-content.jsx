"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import ScoreGrid from "@/components/dashboard/overview/ScoreGrid"
import AISummaryCard from "@/components/dashboard/overview/AISummaryCard"
import SEOSummaryPanel from "@/components/dashboard/overview/SEOSummaryPanel"
import AIVisibilityPanel from "@/components/dashboard/overview/AIVisibilityPanel"
import AuditTimeline from "@/components/dashboard/overview/AuditTimeline"
import { useProjectOverview, useIssueCounts, useLatestComparison } from '@/hooks/useDashboardQueries'
import { invalidateProject, refetchProject } from '@/lib/query/keys'
import apiService from '@/lib/apiService'
import socketService from '@/lib/socketService'

const POLL_INTERVAL_MS = 5000  // fallback status poll every 5 s

/**
 * Dashboard page client island.
 *
 * Handles all interactivity:
 * - Data fetching via TanStack Query
 * - Background Recrawl (no navigation, no reload)
 * - Score display
 */
export default function DashboardPageContent() {
  const { user } = useAuth()
  const { activeProject } = useProject()
  const queryClient = useQueryClient()

  const [isRecrawling, setIsRecrawling] = useState(false)
  const [recrawlError, setRecrawlError] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState(null)

  // Refs so callbacks inside effects always see the latest values without
  // needing to re-register socket listeners on every render.
  const projectIdRef  = useRef(activeProject?._id)
  const pollTimerRef  = useRef(null)
  const isRecrawlRef  = useRef(false)
  const isVerifyRef   = useRef(false)

  useEffect(() => { projectIdRef.current = activeProject?._id }, [activeProject?._id])
  useEffect(() => { isRecrawlRef.current = isRecrawling }, [isRecrawling])
  useEffect(() => { isVerifyRef.current = isVerifying }, [isVerifying])

  // Use React Query for cached data fetching
  const { data: overviewResponse, isLoading: overviewLoading } = useProjectOverview(activeProject?._id)
  const { data: issueCountsResponse, isLoading: issueCountsLoading } = useIssueCounts(activeProject?._id)
  const { data: comparisonRes } = useLatestComparison(activeProject?._id)

  // Extract data from query results
  const project = overviewResponse?.data?.project || null
  const dashboardData = overviewResponse?.data?.performance ? { performance: overviewResponse.data.performance } : null
  const technicalHealth = overviewResponse?.data?.technical?.summary?.healthScore || 0
  const issueCounts = issueCountsResponse?.data || issueCountsResponse || {
    critical: 0, warnings: 0, informational: 0, passed: 0,
  }

  const loading = overviewLoading || issueCountsLoading

  // Called when the audit finishes (via socket OR poll).
  // Invalidates all project query cache so every panel refreshes automatically.
  const onAuditFinished = useCallback(() => {
    const projectId = projectIdRef.current
    clearInterval(pollTimerRef.current)
    pollTimerRef.current = null

    socketService.offAuditCompleted(onAuditFinished)
    socketService.offAuditError(onAuditFailed)

    if (projectId) {
      invalidateProject(queryClient, projectId)
      refetchProject(queryClient, projectId)
    }
    setIsRecrawling(false)
    setIsVerifying(false)
    setRecrawlError(null)
    setVerifyError(null)
    console.log('[AUDIT] Complete — dashboard data refreshed')
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
    console.error('[AUDIT] Error:', err)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAuditFinished])

  // Polling fallback: checks /seo/scraping-status while a recrawl is running.
  // Stops as soon as the status reaches a terminal state.
  const startPolling = useCallback((projectId) => {
    if (pollTimerRef.current) return
    pollTimerRef.current = setInterval(async () => {
      if (!isRecrawlRef.current && !isVerifyRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
        return
      }
      try {
        const status = await apiService.getAuditStatus(projectId)
        // Response is { success, data: { page_analysis: {completed,processing,...}, seo_scoring: {...}, ... } }
        // Audit is done when seo_scoring has completed and is no longer processing.
        const data = status?.data || {}
        const scoring = data.seo_scoring || {}
        const aiScoring = data.ai_visibility_scoring || {}
        const pageAnalysis = data.page_analysis || {}
        // Either terminal branch completing is enough to trigger refresh.
        // Both jobs also emit audit:completed via socket; onAuditFinished is idempotent.
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

  // Recrawl handler — starts audit, stays on dashboard
  const handleRecrawl = async () => {
    const projectId = activeProject?._id
    if (!projectId || isRecrawling) return

    setIsRecrawling(true)
    setRecrawlError(null)

    try {
      const response = await apiService.startAudit(projectId)
      if (!response.success) {
        throw new Error(response.message || 'Failed to start recrawl')
      }

      // Subscribe to socket completion events
      socketService.onAuditCompleted(onAuditFinished)
      socketService.onAuditError(onAuditFailed)

      // Join the project room so socket events are routed here.
      // Always call — joinProject now tracks the room even when disconnected
      // so reconnect will re-join automatically.
      socketService.joinProject(projectId)

      // Polling fallback — handles cases where socket event is missed
      startPolling(projectId)

      console.log('[RECRAWL] Audit started — listening for completion')
    } catch (error) {
      console.error('[RECRAWL] Failed to start:', error)
      setRecrawlError(error.message || 'Failed to start recrawl. Please try again.')
      setIsRecrawling(false)
    }
  }

  // Quick Recheck handler — lightweight re-analysis without full crawl
  const handleQuickRecheck = async () => {
    const projectId = activeProject?._id
    if (!projectId || isRecrawling || isVerifying) return

    setIsVerifying(true)
    setVerifyError(null)

    try {
      const response = await apiService.startVerification(projectId)
      if (!response.success) {
        throw new Error(response.message || 'Failed to start Quick Recheck')
      }

      socketService.onAuditCompleted(onAuditFinished)
      socketService.onAuditError(onAuditFailed)
      socketService.joinProject(projectId)
      startPolling(projectId)

      console.log('[QUICK_RECHECK] Verification started — listening for completion')
    } catch (error) {
      console.error('[QUICK_RECHECK] Failed to start:', error)
      setVerifyError(error.message || 'Failed to start Quick Recheck. Please try again.')
      setIsVerifying(false)
    }
  }

  // Map backend data to dashboard metrics
  const seoHealth = project ? Math.round(project.website_score || 0) : 0
  const aiVisibility = project ? Math.round(project.ai_visibility?.score || 0) : 0
  const performance = dashboardData?.performance?.summary?.performanceScore || 0
  const technicalHealthScore = technicalHealth

  // SEO summary data
  const pagesCrawled = project ? (project.pages_crawled || 0) : 0
  // Use the DB-computed total directly — never reconstruct from severity buckets,
  // because issues with severity='critical' (AXE/WCAG vocabulary) would be missed.
  const totalIssues = issueCounts?.totalIssues ?? (project?.total_issues ?? 0)
  const criticalIssues = issueCounts ? (issueCounts.critical || 0) : 0

  // AI visibility summary data
  const aiReadiness = project ? Math.round(project.ai_visibility?.categories?.llm_readiness || 0) : 0
  const aiCitation = project ? Math.round(project.ai_visibility?.categories?.citation_probability || 0) : 0
  const topicalAuthority = project ? Math.round(project.ai_visibility?.categories?.topical_authority || 0) : 0

  if (loading) {
    return (
      <div className="flex-1 space-y-6 skeleton-fade-in">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border p-6 space-y-3">
              <div className="w-20 h-3 skeleton-base skeleton-shimmer rounded" />
              <div className="w-16 h-10 skeleton-base skeleton-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 skeleton-fade-in">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Overview Dashboard</h1>
            <p className="text-muted-foreground">SEO & AI Visibility Audit</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleQuickRecheck}
                disabled={isRecrawling || isVerifying || !activeProject?._id || activeProject?.crawl_status === 'running'}
                variant="secondary"
                size="default"
                className="gap-2 rounded-full text-base"
                title="Refresh SEO, Accessibility and AI Visibility without running a full audit"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Rechecking...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Quick Recheck
                  </>
                )}
              </Button>
              <Button
                onClick={handleRecrawl}
                disabled={isRecrawling || isVerifying || !activeProject?._id || activeProject?.crawl_status === 'running'}
                variant="outline"
                size="default"
                className="gap-2 rounded-full text-base"
              >
                {isRecrawling ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Recrawling...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Recrawl
                  </>
                )}
              </Button>
            </div>
            {verifyError && (
              <span className="text-xs text-destructive max-w-55 text-right leading-tight">
                {verifyError}
              </span>
            )}
            {recrawlError && (
              <span className="text-xs text-destructive max-w-55 text-right leading-tight">
                {recrawlError}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div>
        <ScoreGrid
          seoHealth={seoHealth}
          aiVisibility={aiVisibility}
          performance={performance}
          technicalHealth={technicalHealthScore}
          deltas={comparisonRes?.data?.delta ?? null}
        />
        <AISummaryCard />
        <div className="two-col">
          <SEOSummaryPanel
            pagesCrawled={pagesCrawled}
            totalIssues={totalIssues}
            criticalIssues={criticalIssues}
            mediumIssues={issueCounts?.warnings || 0}
            infoIssues={issueCounts?.informational || 0}
          />
          <AIVisibilityPanel
            aiReadiness={aiReadiness}
            aiCitation={aiCitation}
            topicalAuthority={topicalAuthority}
          />
        </div>
        <AuditTimeline />
      </div>
    </div>
  )
}

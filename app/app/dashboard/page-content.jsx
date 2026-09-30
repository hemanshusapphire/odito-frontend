"use client"

import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import ScoreGrid from "@/components/dashboard/overview/ScoreGrid"
import AISummaryCard from "@/components/dashboard/overview/AISummaryCard"
import SEOSummaryPanel from "@/components/dashboard/overview/SEOSummaryPanel"
import AuditTimeline from "@/components/dashboard/overview/AuditTimeline"
import { useProjectOverview, useIssueCounts, useLatestComparison } from '@/hooks/useDashboardQueries'
import { useAuditTrigger } from '@/hooks/useAuditTrigger'

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

  const {
    isVerifying,
    verifyError,
    startQuickRecheck,
  } = useAuditTrigger(activeProject?._id)

  // Use React Query for cached data fetching
  const { data: overviewResponse, isLoading: overviewLoading } = useProjectOverview(activeProject?._id)
  const { data: issueCountsResponse, isLoading: issueCountsLoading, isError: issueCountsErrored } = useIssueCounts(activeProject?._id)
  const { data: comparisonRes } = useLatestComparison(activeProject?._id)

  // Extract data from query results
  const project = overviewResponse?.data?.project || null
  const dashboardData = overviewResponse?.data?.performance ? { performance: overviewResponse.data.performance } : null
  const technicalHealth = overviewResponse?.data?.technical?.summary?.healthScore || 0
  // No silent all-zero fallback object here anymore — `issueCounts` is either
  // the live result or null. A failed request must render as an explicit
  // error/stale state below, never as a fabricated "0 issues" result (see
  // IssueCountsService.getIssueCounts, which now throws instead of doing that).
  const issueCounts = issueCountsResponse?.data || null

  const loading = overviewLoading || issueCountsLoading

  // Map backend data to dashboard metrics
  const seoHealth = project ? Math.round(project.website_score || 0) : 0
  const aiVisibility = overviewResponse?.data?.ai_visibility?.score != null
    ? Math.round(overviewResponse.data.ai_visibility.score)
    : 0
  const performance = dashboardData?.performance?.summary?.performanceScore || 0
  const technicalHealthScore = technicalHealth

  // SEO summary data
  const pagesCrawled = project ? (project.pages_crawled || 0) : 0

  // Total Issues has three explicit states — never a silent fake zero:
  //  - LIVE:   the live issue-counts query succeeded — use it, this is current.
  //  - STALE:  the live query failed, but the project document has a cached
  //            total_issues snapshot from the last completed crawl — show it,
  //            clearly labeled as cached/possibly out of date.
  //  - ERROR:  the live query failed and there's no cached value either —
  //            show "unavailable", never a number.
  // This replaces a prior `issueCounts?.totalIssues ?? project?.total_issues ?? 0`
  // chain that could silently render a stale cached count — or even a bare 0 —
  // as if it were a fresh, current result.
  let totalIssuesState = 'loading'
  let totalIssuesValue = null
  if (issueCounts?.totalIssues != null) {
    totalIssuesState = 'live'
    totalIssuesValue = issueCounts.totalIssues
  } else if (issueCountsErrored) {
    if (project?.total_issues != null) {
      totalIssuesState = 'stale'
      totalIssuesValue = project.total_issues
    } else {
      totalIssuesState = 'error'
    }
  }
  const criticalIssues = issueCounts ? (issueCounts.critical || 0) : 0

  if (loading) {
    return (
      <div className="flex-1 space-y-6 skeleton-fade-in">
        <div className="grid grid-cols-2 @min-[641px]/main:grid-cols-4 gap-4">
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
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">Overview Dashboard</h1>
            <p className="text-muted-foreground">SEO & AI Visibility Audit</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <Button
                onClick={startQuickRecheck}
                disabled={isVerifying || !activeProject?._id || activeProject?.crawl_status === 'running'}
                variant="secondary"
                size="default"
                className="tap-target gap-2 rounded-full text-base"
                title="Refresh SEO, Accessibility and AI Visibility without running a full audit. Does not use a manual recrawl credit."
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
            </div>
            {verifyError && (
              <span className="text-xs text-destructive max-w-55 text-right leading-tight">
                {verifyError}
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
        <AISummaryCard
          pagesCrawled={pagesCrawled}
          totalIssues={totalIssuesValue}
          totalIssuesState={totalIssuesState}
          criticalIssues={criticalIssues}
        />
        <div className="two-col">
          <SEOSummaryPanel
            pagesCrawled={pagesCrawled}
            totalIssues={totalIssuesValue}
            totalIssuesState={totalIssuesState}
            criticalIssues={criticalIssues}
            mediumIssues={issueCounts?.warnings || 0}
            infoIssues={issueCounts?.informational || 0}
          />
        </div>
        <AuditTimeline />
      </div>
    </div>
  )
}

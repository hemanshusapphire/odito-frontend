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

  // Map backend data to dashboard metrics
  const seoHealth = project ? Math.round(project.website_score || 0) : 0
  const aiVisibility = overviewResponse?.data?.ai_visibility?.score != null
    ? Math.round(overviewResponse.data.ai_visibility.score)
    : 0
  const performance = dashboardData?.performance?.summary?.performanceScore || 0
  const technicalHealthScore = technicalHealth

  // SEO summary data
  const pagesCrawled = project ? (project.pages_crawled || 0) : 0
  // Use the DB-computed total directly — never reconstruct from severity buckets,
  // because issues with severity='critical' (AXE/WCAG vocabulary) would be missed.
  const totalIssues = issueCounts?.totalIssues ?? (project?.total_issues ?? 0)
  const criticalIssues = issueCounts ? (issueCounts.critical || 0) : 0

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
                onClick={startQuickRecheck}
                disabled={isVerifying || !activeProject?._id || activeProject?.crawl_status === 'running'}
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
        <AISummaryCard />
        <div className="two-col">
          <SEOSummaryPanel
            pagesCrawled={pagesCrawled}
            totalIssues={totalIssues}
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

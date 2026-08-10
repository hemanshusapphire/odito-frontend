"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProject } from "@/contexts/ProjectContext"
import AEOHubPageContent from "@/components/dashboard/ai-audit/aeo/AEOHubPageContent"
import UnifiedIssueDetailView from "@/components/dashboard/issues/UnifiedIssueDetailView"
import PageDetailView from "@/app/onpage/components/PageDetailView"
import { useAEOHubIssueDetail, usePageAIIssues } from "@/hooks/useDashboardQueries"

function AEOHubContent() {
  const { activeProject } = useProject()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const ruleId       = searchParams.get('issue')
  const projectId    = activeProject?._id
  const [selectedUrl, setSelectedUrl] = useState(null)

  // Only fetch detail when ?issue= is present
  const { data: detailResponse, isLoading: detailLoading } = useAEOHubIssueDetail(
    ruleId ? projectId : null,
    ruleId,
  )

  const { data: pageAIData, isLoading: pageLoading, error: pageError } = usePageAIIssues(
    selectedUrl ? projectId : null,
    selectedUrl,
  )

  const handleBack = () => router.push('/app/aeo-hub')

  const derivePageNameFromUrl = (url) => {
    if (!url) return ''
    if (url === '/' || url === '') return 'Home'
    const segments = url.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    return lastSegment ? lastSegment.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : 'Page'
  }

  const pageData = pageAIData?.data ? (() => {
    const issuesData = pageAIData.data
    const pageIssues = issuesData.issues || []
    const pData = issuesData.page_data || {}

    return {
      url: selectedUrl,
      name: pData.title ? pData.title.split(' | ')[0] : derivePageNameFromUrl(selectedUrl),
      title: pData.title || derivePageNameFromUrl(selectedUrl),
      description: pData.meta_description || 'No meta description available',
      statusCode: pData.status_code || 200,
      wordCount: pData.word_count || 0,
      loadTime: pData.response_time ? `${Math.round(pData.response_time)}ms` : '0s',
      issues: {
        critical: pageIssues.filter(i => i.severity === 'critical').length,
        high: pageIssues.filter(i => i.severity === 'high').length,
        medium: pageIssues.filter(i => i.severity === 'medium' || i.severity === 'warning').length,
        low: pageIssues.filter(i => i.severity === 'low').length,
        // Fallbacks for OnPage components that read .crit, .warn, .low
        crit: pageIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length,
        warn: pageIssues.filter(i => i.severity === 'warning' || i.severity === 'medium').length,
      },
      issues_list: pageIssues
    }
  })() : null

  // ── URL detail view (takes precedence over issue details) ────────────────
  if (selectedUrl) {
    return (
      <PageDetailView
        url={selectedUrl}
        pageData={pageData}
        loading={pageLoading}
        error={pageError}
        onBack={() => setSelectedUrl(null)}
        projectId={projectId}
      />
    )
  }

  // ── Issue detail view ────────────────────────────────────────────────────
  if (ruleId) {
    if (detailLoading) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            Loading issue…
          </p>
        </div>
      )
    }

    const issue = detailResponse?.data
    if (!issue) {
      return (
        <div className="flex items-center justify-center min-h-96">
          <p className="text-sm" style={{ color: "var(--color-status-error)" }}>
            Issue not found.{" "}
            <button
              className="underline"
              style={{ color: "var(--color-brand-violet)" }}
              onClick={handleBack}
            >
              Back to AEO Hub
            </button>
          </p>
        </div>
      )
    }

    return (
      <UnifiedIssueDetailView
        issue={issue}
        onBack={handleBack}
        onOpenUrl={(url) => setSelectedUrl(url)}
        issueTypeName="AEO Hub"
      />
    )
  }

  // ── Hub dashboard ────────────────────────────────────────────────────────
  return <AEOHubPageContent />
}

export default function AEOHubPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 skeleton-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-28 h-7 skeleton-base skeleton-shimmer rounded" />
            <div className="w-40 h-6 skeleton-base skeleton-shimmer rounded-full" />
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6 h-72 skeleton-base skeleton-shimmer rounded-xl" />
            <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 skeleton-base skeleton-shimmer rounded-xl" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 skeleton-base skeleton-shimmer rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <AEOHubContent />
    </Suspense>
  )
}

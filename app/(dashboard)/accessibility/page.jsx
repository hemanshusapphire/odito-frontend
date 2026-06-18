"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useProject } from "@/contexts/ProjectContext"
import IssueTable from "@/components/dashboard/issues/IssueTable"
import IssueDetailView from "@/components/dashboard/issues/IssueDetailView"
import PageDetailView from "@/app/onpage/components/PageDetailView"
import { useAccessibilityIssues, usePageIssues } from '@/hooks/useDashboardQueries'

function AccessibilityContent() {
  const { activeProject } = useProject()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedUrl, setSelectedUrl] = useState(null)

  const { data: accessibilityResponse, isLoading: loading } = useAccessibilityIssues(activeProject?._id)
  const { data: pageIssuesData, isLoading: pageLoading, error: pageError } = usePageIssues(activeProject?._id, selectedUrl)

  const issues = accessibilityResponse?.issues || []
  const summary = accessibilityResponse?.summary || null

  if (loading) {
    return (
      <div className="space-y-4 skeleton-fade-in">
        <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
        <div className="rounded-xl border p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-12 skeleton-base skeleton-shimmer rounded" />
          ))}
        </div>
      </div>
    )
  }

  const pageData = pageIssuesData?.data ? (() => {
    const issuesData = pageIssuesData.data
    const pageIssues = issuesData.issues || []
    const pData = issuesData.page_data || {}
    const pageMetadata = issuesData.page_metadata || {}

    return {
      url: selectedUrl,
      name: pData.title ? pData.title.split(' | ')[0] : derivePageNameFromUrl(selectedUrl),
      title: pData.title || derivePageNameFromUrl(selectedUrl),
      description: pData.meta_description || pageMetadata.meta_description || 'No meta description available',
      statusCode: pData.status_code || pageMetadata.http_status_code || 200,
      wordCount: pData.word_count || 0,
      loadTime: pData.response_time ? `${Math.round(pData.response_time)}ms` : '0s',
      issues: {
        crit: pageIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length,
        warn: pageIssues.filter(i => i.severity === 'warning' || i.severity === 'medium').length,
        low: pageIssues.filter(i => i.severity === 'low').length,
        pass: pageIssues.filter(i => i.severity === 'pass' || i.severity === 'info').length,
      },
      issues_list: pageIssues
    }
  })() : null

  const issueCode  = searchParams.get('issue')
  const urlParam   = searchParams.get('url')
  const modeParam  = searchParams.get('mode')
  const selectedIssue = issueCode ? issues.find(issue => issue.issue_code === issueCode) : null
  const selected = selectedIssue ? issues.findIndex(issue => issue.issue_code === issueCode) : null

  const handleIssueSelect = (index) => {
    const issue = issues[index]
    if (selected === index) {
      router.push('/accessibility')
    } else {
      router.push(`/accessibility?issue=${issue.issue_code}`)
    }
  }

  const derivePageNameFromUrl = (url) => {
    if (url === '/' || url === '') return 'Home'
    const segments = url.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    return lastSegment ? lastSegment.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : 'Page'
  }

  return (
    <div className="space-y-6">
      {selectedUrl ? (
        <PageDetailView
          url={selectedUrl}
          pageData={pageData}
          loading={pageLoading}
          error={pageError}
          onBack={() => setSelectedUrl(null)}
        />
      ) : selectedIssue ? (
        <IssueDetailView
          issue={selectedIssue}
          onBack={() => router.push('/accessibility')}
          onOpenUrl={(url) => setSelectedUrl(url)}
          issueTypeName="Accessibility Issues"
          initialSelUrl={urlParam || null}
          initialMode={modeParam || 'ai'}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Accessibility Issues</h1>
              <p className="text-muted-foreground">
                {summary
                  ? `${summary.total_issue_types ?? 0} issue types · ${summary.total_issues_found ?? 0} total issues · ${summary.total_pages_analyzed ?? 0} pages analyzed`
                  : "View and manage accessibility issues"}
              </p>
            </div>
            {issues.length > 0 && (
              <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary">
                {issues.length} FOUND
              </span>
            )}
          </div>
          <div className="bg-card rounded-lg border p-6">
            {issues.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No accessibility issues found. Your site looks great!
              </div>
            ) : (
              <IssueTable issues={issues} selected={selected} onSelect={handleIssueSelect} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function AccessibilityPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 skeleton-fade-in">
        <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
        <div className="rounded-xl border p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-12 skeleton-base skeleton-shimmer rounded" />
          ))}
        </div>
      </div>
    }>
      <AccessibilityContent />
    </Suspense>
  )
}

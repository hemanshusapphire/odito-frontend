"use client"

import { Suspense, useState, useEffect } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/contexts/AuthContext"

import { useProject } from "@/contexts/ProjectContext"

import DashboardLayout from "@/components/layout/dashboard-layout"

import IssueTable from "@/components/dashboard/issues/IssueTable"

import IssueDetailView from "@/components/dashboard/issues/IssueDetailView"

import PageDetailView from "@/app/onpage/components/PageDetailView"

import apiService from "@/lib/apiService"

function AccessibilityPageContent() {

  const { user, isLoading: authLoading } = useAuth()
  const { activeProject } = useProject()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [selectedUrl, setSelectedUrl] = useState(null)
  const [pageData, setPageData] = useState(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [pageError, setPageError] = useState(null)

  // Derive selected issue from URL (same as On-Page)
  const issueCode = searchParams.get('issue')
  const selectedIssue = issueCode ? issues.find(issue => issue.issue_code === issueCode) : null
  const selected = selectedIssue ? issues.findIndex(issue => issue.issue_code === issueCode) : null

  // Fetch accessibility issues from API
  useEffect(() => {
    const fetchAccessibilityIssues = async () => {
      try {
        setLoading(true)
        
        if (!activeProject) {
          setLoading(false)
          return
        }
        
        const response = await apiService.getAccessibilityIssues({ projectId: activeProject._id })

        if (response.success && response.issues) {
          // Backend now returns grouped data directly (same structure as On-Page)
          setIssues(response.issues)
          setSummary(response.summary)
        }
      } catch (error) {
        console.error('[Accessibility] Failed to fetch accessibility issues:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && activeProject) {
      fetchAccessibilityIssues()
    }
  }, [user, activeProject])

  const handleIssueSelect = (index) => {
    const issue = issues[index]
    if (selected === index) {
      // Navigate back to list view
      router.push('/accessibility')
    } else {
      // Navigate to issue detail view
      router.push(`/accessibility?issue=${issue.issue_code}`)
    }
  }

  const handleBack = () => {
    router.push('/accessibility')
  }

  const handleUrlSelect = async (url) => {
    setSelectedUrl(url)
    setPageLoading(true)
    setPageError(null)

    try {
      const response = await apiService.getPageIssues(activeProject._id, url)
      if (response.success) {
        const issuesData = response.data
        const pageIssues = issuesData.issues || []
        const pageData = issuesData.page_data || {}
        const pageMetadata = issuesData.page_metadata || {}

        const finalPageData = {
          url: url,
          name: pageData.title ? pageData.title.split(' | ')[0] : derivePageNameFromUrl(url),
          title: pageData.title || deriveTitleFromUrl(url),
          description: pageData.meta_description || pageMetadata.meta_description || 'No meta description available',
          statusCode: pageData.status_code || pageMetadata.http_status_code || 200,
          wordCount: pageData.word_count || 0,
          loadTime: pageData.response_time ? `${Math.round(pageData.response_time)}ms` : '0s',
          issues: {
            crit: pageIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length,
            warn: pageIssues.filter(i => i.severity === 'warning' || i.severity === 'medium').length,
            low: pageIssues.filter(i => i.severity === 'low').length,
            pass: pageIssues.filter(i => i.severity === 'pass' || i.severity === 'info').length,
          },
          issues_list: pageIssues
        }

        setPageData(finalPageData)
      }
    } catch (err) {
      console.error('Failed to load page details:', err)
      setPageError(err.message)
    } finally {
      setPageLoading(false)
    }
  }

  const handlePageDetailBack = () => {
    setSelectedUrl(null)
    setPageData(null)
  }

  // Helper functions to derive values from URL when API doesn't provide them
  const derivePageNameFromUrl = (url) => {
    if (url === '/' || url === '') return 'Home'
    const segments = url.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    return lastSegment ? lastSegment.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : 'Page'
  }

  const deriveTitleFromUrl = (url) => {
    const name = derivePageNameFromUrl(url)
    return name
  }



  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access this page</h1>
          <button onClick={() => window.location.href = '/login'} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                {selectedUrl ? (
                  <PageDetailView
                    url={selectedUrl}
                    pageData={pageData}
                    loading={pageLoading}
                    error={pageError}
                    onBack={handlePageDetailBack}
                  />
                ) : selectedIssue ? (
                  <IssueDetailView
                    issue={selectedIssue}
                    onBack={handleBack}
                    onOpenUrl={handleUrlSelect}
                    issueTypeName="Accessibility Issues"
                  />
                ) : (
                  <>
                    {/* Header */}
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

                    {/* Content */}
                    <div className="bg-card rounded-lg border p-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                          <span className="text-muted-foreground">Loading issues...</span>
                        </div>
                      ) : issues.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          No accessibility issues found. Your site looks great!
                        </div>
                      ) : (
                        <IssueTable
                          issues={issues}
                          selected={selected}
                          onSelect={handleIssueSelect}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )

}

// Export the page wrapped in Suspense
export default function AccessibilityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccessibilityPageContent />
    </Suspense>
  )
}

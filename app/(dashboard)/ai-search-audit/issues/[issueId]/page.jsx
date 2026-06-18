"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import { queryKeys } from '@/lib/query/keys'
import { ISSUES, getCategoryIcon } from '@/app/ai-search-audit/data/issuesData'
import styles from '../../ai-search-audit.module.css'
import DashboardLayout from "@/components/layout/dashboard-layout"
import PageDetailView from "@/app/onpage/components/PageDetailView"
import { IssueRecommendationPanel } from "@/components/recommendations"
import DIYRenderer from "@/components/diy/DIYRenderer"
import CurrentStateRenderer from "@/components/issue-context/CurrentStateRenderer"
import { useIssueContext } from "@/hooks/useIssueContext"
import { useAISearchAuditIssues, useAISearchAuditIssuePages, useFixedUrls } from '@/hooks/useDashboardQueries'

// ── Simple toast component ────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])

  const bg    = type === 'success' ? 'rgba(0,245,160,0.12)'  : 'rgba(255,56,96,0.12)'
  const border= type === 'success' ? 'rgba(0,245,160,0.28)'  : 'rgba(255,56,96,0.28)'
  const color = type === 'success' ? '#00f5a0'               : '#ff3860'
  const icon  = type === 'success' ? '✓' : '✕'

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 9999,
      background: bg,
      border: `1px solid ${border}`,
      color,
      borderRadius: 10,
      padding: '11px 18px',
      fontSize: 13,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <span>{icon}</span>
      {message}
    </div>
  )
}

export default function AISearchAuditIssuePage() {
  const { user } = useAuth()
  const { activeProject } = useProject()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlParam  = searchParams.get('url')
  const modeParam = searchParams.get('mode')
  const [selectedUrl, setSelectedUrl] = useState(null)
  const [pageData, setPageData] = useState(null)
  const [pageDetailsLoading, setPageDetailsLoading] = useState(false)
  const [pageDetailsError, setPageDetailsError] = useState(null)

  // Fetch issues list using TanStack Query
  const { data: issuesResponse, isLoading: loadingIssues, error: issuesError } = useAISearchAuditIssues(activeProject?._id)

  const issue = useMemo(() => {
    if (!activeProject?._id || !params.issueId) return null

    // Find the issue details
    let issueData = null
    if (issuesResponse?.success && issuesResponse?.data) {
      issueData = issuesResponse.data.find(i => i.issueId === params.issueId)
    }

    // Fallback to static data if needed
    if (!issueData) {
      issueData = ISSUES.find(i => i.id === params.issueId)
    }

    if (!issueData) return null

    // Transform issue data to expected format
    return {
      id: issueData.issueId || issueData.id,
      title: issueData.title,
      severity: issueData.severity === 'crit' ? 'critical' :
               issueData.severity === 'warn' ? 'warning' : 'info',
      category: issueData.cat || issueData.category,
      description: issueData.desc || `This issue affects ${issueData.pagesAffected || issueData.pages} pages. +${issueData.impact_percentage || 0}% impact. Difficulty: ${issueData.difficulty || issueData.diff}.`,
      pagesAffected: issueData.pagesAffected || issueData.pages,
      impact: `+${issueData.impact_percentage || 0}%`,
      difficulty: issueData.difficulty || issueData.diff,
      pages: issueData.pagesAffected || issueData.pages,
      diff: issueData.difficulty || issueData.diff,
      icon: getCategoryIcon(issueData.cat || issueData.category),
      fixProgress: 15,
      affectedUrlsCount: issueData.pagesAffected || issueData.pages
    }
  }, [issuesResponse, params.issueId, activeProject?._id])

  const loading = !activeProject?._id || loadingIssues
  const error = issuesError ? "Failed to load issue data" : (!loading && !issue ? "Issue not found" : null)

  // Handle URL selection for Page Details View
  const handleUrlSelect = async (url) => {
    setSelectedUrl(url)
    setPageDetailsLoading(true)
    setPageDetailsError(null)

    try {
      // Use AI Visibility API for AI Search Audit context
      const response = await apiService.getAIVisibilityPageIssues(activeProject._id, url)

      if (response.success) {
        const issuesData = response.data
        const aiIssues = issuesData.aiIssues || []

        // Safety check for empty issues
        if (!aiIssues || aiIssues.length === 0) {
          setPageData({
            url: url,
            name: url.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Page',
            title: `AI Search Audit - ${url}`,
            description: `AI visibility analysis for ${url}`,
            statusCode: 200,
            wordCount: 0,
            loadTime: '0s',
            issues: {
              crit: 0,
              warn: 0,
              low: 0,
              pass: 0,
            },
            issues_list: []
          })
          return
        }

        // Map AI issues to the expected UI structure
        const mappedIssues = aiIssues.map(issue => ({
          id: issue.id,
          issue_message: issue.message,
          rule_id: issue.issueId,
          severity: issue.severity,
          category: issue.category,
          issue_code: issue.issueId,
          detected_value: issue.details?.detected_value,
          expected_value: issue.details?.expected_value,
          created_at: issue.createdAt,
          score: issue.score
        }))

        const getSeverity = (issue) => {
          const severity = (
            issue.severity ||
            issue.priority ||
            issue.level ||
            issue.impact ||
            ''
          ).toString().toLowerCase().trim();

          return severity;
        };

        const normalizedIssues = mappedIssues.map(issue => ({
          ...issue,
          normalizedSeverity: getSeverity(issue)
        }));

        const criticalCount = normalizedIssues.filter(i => i.normalizedSeverity === 'critical').length
        const mediumCount   = normalizedIssues.filter(i => i.normalizedSeverity === 'medium').length
        const lowCount      = normalizedIssues.filter(i => i.normalizedSeverity === 'low').length
        const infoCount     = normalizedIssues.filter(i => i.normalizedSeverity === 'info').length
        const highCount     = normalizedIssues.filter(i => i.normalizedSeverity === 'high').length
        const warningCount  = normalizedIssues.filter(i => i.normalizedSeverity === 'warning').length

        setPageData({
          url: url,
          name: url.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Page',
          title: `AI Search Audit - ${url}`,
          description: `AI visibility analysis for ${url}`,
          statusCode: 200,
          wordCount: 0,
          loadTime: '0s',
          issues: {
            crit: criticalCount + highCount,
            warn: mediumCount + warningCount,
            low: lowCount,
            pass: infoCount,
          },
          issues_list: mappedIssues
        })
      }
    } catch (err) {
      console.error('Failed to load AI page details:', err)
      setPageDetailsError(`Failed to load AI issues: ${err.message}`)
    } finally {
      setPageDetailsLoading(false)
    }
  }

  const handlePageDetailBack = () => {
    setSelectedUrl(null)
    setPageData(null)
  }

  if (loading) {
    return (
      <div className="glass-card">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading issue details...</p>
        </div>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="glass-card">
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-3">Issue Not Found</h3>
          <p className="text-muted-foreground mb-4">{error || "The requested issue could not be found."}</p>
          <button
            onClick={() => router.push('/ai-search-audit')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to AI Search Audit
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {selectedUrl ? (
        <PageDetailView
          url={selectedUrl}
          pageData={pageData}
          loading={pageDetailsLoading}
          error={pageDetailsError}
          onBack={handlePageDetailBack}
          projectId={activeProject?._id}
        />
      ) : (
        <AIssueDetailView
          issue={issue}
          onBack={() => router.push('/ai-search-audit')}
          onOpenUrl={handleUrlSelect}
          initialSelUrl={urlParam || null}
          initialMode={modeParam || 'ai'}
        />
      )}
    </>
  )
}

// Reuse the same IssueDetailView component but adapted for AI Search Audit
function AIssueDetailView({ issue, onBack, onOpenUrl, initialSelUrl = null, initialMode = "ai" }) {
  const { activeProject } = useProject()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState(initialMode)
  const [selUrl, setSelUrl] = useState(initialSelUrl)
  const [toast, setToast] = useState(null)
  const diffLower = (issue.difficulty || issue.diff || "").toLowerCase()

  const issueId = issue.id || issue.issue_code || issue.rule_id

  // ── Fixed URLs — API-backed ─────────────────────────────────────────────
  const { data: fixedUrlsResponse } = useFixedUrls(activeProject?._id, issueId)
  const fixedUrlsSet = useMemo(() => {
    const list = fixedUrlsResponse?.data?.fixedUrls || []
    return new Set(list)
  }, [fixedUrlsResponse])
  const fixedCount = fixedUrlsResponse?.data?.fixedCount || 0

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])

  // ── Mark as Fixed mutation ──────────────────────────────────────────────
  const fixMutation = useMutation({
    mutationFn: (url) => {
      const payload = {
        projectId:     activeProject._id,
        issueKey:      issueId,
        issueName:     issue.title,
        issueCategory: issue.category || '',
        pageUrl:       url,
      }
      console.log('[FIX_LOG] FIX CLICK', payload)
      return apiService.markFixed(payload)
    },
    onSuccess: (response) => {
      console.log('[FIX_LOG] FIX RESPONSE', response)
      // Invalidate fixed-urls so the list and counter refresh immediately,
      // and the broad all() key so History Logs page also updates
      queryClient.invalidateQueries({ queryKey: queryKeys.fixLogs.fixedUrls(activeProject._id, issueId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.fixLogs.all(activeProject._id) })
      setSelUrl(null)
      showToast('Marked as fixed — URL removed from active list')
    },
    onError: (err) => {
      console.error('[FIX_LOG] FIX ERROR', err)
      showToast('Failed to mark as fixed. Please try again.', 'error')
    },
  })

  const markFixed = useCallback(() => {
    console.log('[FIX_LOG] MARK FIX START', { selUrl, isPending: fixMutation.isPending })
    if (selUrl && !fixMutation.isPending) {
      fixMutation.mutate(selUrl)
    }
  }, [selUrl, fixMutation])

  // Fetch issue context for the selected URL
  const { data: issueContextData } = useIssueContext(activeProject?._id, issueId, selUrl)

  // Mutation state lifted to parent (persists across tab switches)
  const recommendationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiService.request('/recommendations/generate', {
        method: 'POST',
        body: JSON.stringify({
          projectId: activeProject?._id,
          issueId,
          issueSource: "ai_visibility",
          pageUrl: selUrl || undefined,
          ruleMetadata: {
            title: issue.title || issue.issue || issue.issue_message,
            description: issue.description || issue.issue_message,
            category: issue.category,
            severity: issue.severity,
            difficulty: issue.difficulty,
          },
          issueContext: issueContextData ? {
            currentState: issueContextData.currentState,
            expectedState: issueContextData.expectedState,
            pageContext: issueContextData.pageContext,
          } : undefined,
        }),
      });
      if (!response.success) throw new Error(response.message || 'Generation failed');
      return response;
    },
    retry: 1,
  });

  const { data, isIdle, isPending, isSuccess, isError, error } = recommendationMutation;
  const recommendation = data?.data;
  const meta = data?.meta;

  // Fetch affected URLs using TanStack Query
  const { data: pagesResponse, isLoading: loadingUrls } = useAISearchAuditIssuePages(
    activeProject?._id,
    issue?.id,
    { page: 1, limit: 50 }
  )

  const allUrls = useMemo(() => {
    if (pagesResponse?.success && pagesResponse?.data?.pages) {
      return pagesResponse.data.pages.map(page => ({
        url: page.url,
        sub: page.title || 'Affected by this issue'
      }))
    }
    return issue?.urls || []
  }, [pagesResponse, issue])

  // Filter out fixed URLs — only show active (not fixed) URLs in the list
  const urls = useMemo(
    () => allUrls.filter(u => !fixedUrlsSet.has(typeof u === 'string' ? u : u.url)),
    [allUrls, fixedUrlsSet]
  )

  const totalUrls   = allUrls.length
  const progress    = totalUrls > 0 ? Math.round((fixedCount / totalUrls) * 100) : 0

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
      @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
    `
    document.head.appendChild(style)
    return () => { if (style?.parentNode) document.head.removeChild(style) }
  }, [])

  // ── Current State Section ──────────────────────────────────────────────
  function IssueCurrentStateSection({ projectId, issueId, pageUrl }) {
    const { data: issueContext, isLoading, error } = useIssueContext(projectId, issueId, pageUrl)

    if (!pageUrl) return null

    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: '9px',
          fontWeight: 700,
          color: 'var(--t3)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ flex: 1, height: 1, background: 'var(--b)' }} />
          Detected Issue
          <span style={{ flex: 1, height: 1, background: 'var(--b)' }} />
        </div>

        <CurrentStateRenderer
          issueContext={issueContext}
          isLoading={isLoading}
          error={error}
        />

        <div style={{ height: 14, borderBottom: '1px solid var(--b)', marginTop: 14 }} />
      </div>
    )
  }

  function selectUrl(url) {
    setSelUrl(url)
  }

  return (
    <div className="fi">
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
        <button
          className="task-btn secondary"
          style={{ fontSize: "11.5px" }}
          onClick={onBack}
        >
          ← AI Search Audit
        </button>
        <span style={{ color: "var(--t3)", fontSize: "12px" }}>›</span>
        <span style={{ fontSize: "12px", color: "var(--t2)", fontWeight: "500" }}>
          {issue.title}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: 13,
          display: "grid",
          placeItems: "center",
          fontSize: 22,
          background: issue.severity === "critical" ? "var(--color-status-error-surface)" :
                   issue.severity === "warning" ? "var(--color-status-warning-surface)" :
                   "var(--color-status-info-surface)",
          color: issue.severity === "critical" ? "var(--re)" :
                 issue.severity === "warning" ? "var(--am)" :
                 "var(--cy)",
          flexShrink: 0
        }}>
          {issue.icon}
        </div>
        <h2 style={{
          fontFamily: "var(--font-metric)",
          fontSize: 28,
          fontWeight: 800,
          flex: 1,
          color: "var(--t)"
        }}>
          {issue.title}
        </h2>
        <span style={{
          background: "var(--color-brand-cyan-surface)",
          border: "1px solid var(--color-brand-cyan-border)",
          color: "var(--cy)",
          borderRadius: 20,
          padding: "4px 13px",
          fontSize: 11,
          fontWeight: 600
        }}>🗂 AI Search Audit</span>
      </div>

      {/* 4 Stat Tiles */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{ background: "var(--s)", border: "1px solid var(--b)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>PAGES AFFECTED</div>
          <div style={{ fontFamily: "var(--font-metric)", fontWeight: 800, fontSize: 32, lineHeight: 1, color: "var(--re)" }}>{issue.pages}</div>
        </div>
        <div style={{ background: "var(--s)", border: "1px solid var(--b)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>SEO IMPACT</div>
          <div style={{ fontFamily: "var(--font-metric)", fontWeight: 800, fontSize: 32, lineHeight: 1, color: "var(--cy)" }}>{issue.impact || `+${issue.impact_percentage || 0}%`}</div>
        </div>
        <div style={{ background: "var(--s)", border: "1px solid var(--b)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>DIFFICULTY</div>
          <div style={{ fontFamily: "var(--font-metric)", fontWeight: 800, fontSize: 32, lineHeight: 1, color: diffLower === "easy" ? "var(--gr)" : diffLower === "medium" ? "var(--am)" : "var(--re)" }}>{issue.diff}</div>
        </div>
        <div style={{ background: "var(--s)", border: "1px solid var(--b)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>FIXED</div>
          <div style={{ fontFamily: "var(--font-metric)", fontWeight: 800, fontSize: 32, lineHeight: 1, color: "var(--vi)" }}>{fixedCount}/{totalUrls}</div>
        </div>
      </div>

      {/* AI Issue Breakdown */}
      <div style={{
        marginBottom: 22,
        background: "linear-gradient(135deg, var(--color-brand-violet-surface), var(--color-brand-cyan-surface))",
        border: "1px solid var(--color-brand-violet-border)",
        borderRadius: 14,
        padding: "18px 22px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", right: 14, top: 12, fontSize: 20, opacity: 0.1, color: "var(--cy)", pointerEvents: "none" }}>✦</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--vi)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>✦ AI SEARCH AUDIT — ISSUE BREAKDOWN</div>
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.65 }}>
          This issue affects {issue.pages} pages.
          {issue.desc}
          Fixing this is rated {issue.diff} difficulty and can recover an estimated
          {issue.impact || `+${issue.impact_percentage || 0}%`}.
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 mt-1 min-w-0">
        {/* Left Column - URLs */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="font-dashboard text-base font-bold text-foreground">
                Affected URLs
              </div>
              <div className="bg-[var(--color-brand-cyan-surface)] border border-[var(--color-brand-cyan-border)] text-[var(--cy)] rounded-full text-[9px] font-bold px-2.5 py-0.5 ml-2">
                {loadingUrls ? "Loading..." : `${urls.length} OPEN`}
              </div>
            </div>
          </div>

          {loadingUrls ? (
            <div className="flex justify-center items-center p-10 text-muted-foreground text-sm">
              <div className="flex items-center gap-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Loading affected URLs...
              </div>
            </div>
          ) : urls.length === 0 && totalUrls > 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <div style={{ fontSize: 28, marginBottom: 10 }}>🎉</div>
              <div className="font-semibold text-[var(--gr)] mb-1">All URLs Fixed!</div>
              <div className="text-xs text-muted-foreground">All {totalUrls} affected URLs have been marked as fixed.</div>
            </div>
          ) : (
            urls.map((urlData, index) => {
              const url = typeof urlData === 'string' ? urlData : urlData.url
              const subtitle = typeof urlData === 'object' ? urlData.sub : 'Issue detected on this page'
              const isSelected = selUrl === url

              return (
                <div
                  key={index}
                  className={`
                    flex items-center gap-2.5 p-3 mb-2 bg-card rounded-xl cursor-pointer
                    transition-all duration-200 border min-w-0
                    ${isSelected ? 'bg-[var(--color-brand-violet-surface)] border-[var(--color-brand-violet-border)]' : 'border-border hover:bg-[var(--color-surface-hover)]'}
                  `}
                  onClick={() => setSelUrl(isSelected ? null : url)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-dashboard text-[var(--cy)] font-medium truncate" style={{ fontSize: "13px" }}>
                      {url}
                    </div>
                    <div className="text-[10.5px] text-muted-foreground mt-0.5 truncate">
                      {subtitle}
                    </div>
                  </div>
                  <button
                    className="bg-[var(--color-status-error-surface)] text-[var(--re)] border border-[var(--color-status-error-border)]
                             text-[10px] font-medium px-2.5 py-1 rounded-md flex-shrink-0 mr-1.5
                             transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)]"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (typeof onOpenUrl === 'function') {
                        onOpenUrl(url)
                      } else {
                        window.open(url, '_blank')
                      }
                    }}
                  >
                    Open
                  </button>
                  <button
                    className="bg-gradient-to-r from-[#7730ed] to-[#00dfff] text-white border-none
                              text-[10px] font-bold px-3 py-1 rounded-md flex-shrink-0
                              shadow-[0_0_12px_rgba(0,223,255,0.2)] transition-all duration-200
                              hover:-translate-y-px hover:shadow-[0_3px_16px_rgba(0,223,255,0.3)]"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelUrl(url)
                      setMode("ai")
                    }}
                  >
                    ✦ Fix
                  </button>
                </div>
              )
            })
          )}

          {/* Progress Card */}
          <div className="mt-3.5 bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between mb-2.5">
              <span className="text-xs text-muted-foreground">Remediation Progress</span>
              <span className="text-xs font-bold text-[var(--gr)]">{fixedCount}/{totalUrls} Fixed</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-[var(--gr)] transition-all duration-1100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && totalUrls > 0 && (
              <div className="text-xs text-[var(--gr)] font-semibold text-center mt-2.5">
                🎉 All issues resolved! Re-audit to confirm.
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Fix Panel */}
        <div className={`w-full ${selUrl ? "lg:w-[500px] xl:w-[600px]" : "lg:w-96 xl:w-[460px]"} flex-shrink-0 transition-all duration-200`}>
          <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-0">
            {/* Panel Header */}
            <div className="px-4.5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-dashboard text-sm font-bold text-foreground">
                  {selUrl ? "✦ AI Recommendation" : "Fix Assistant"}
                </div>
              </div>
              {selUrl && (
                <button
                  className="bg-muted border border-border
                           rounded-md px-2 py-0.5 text-xs text-muted-foreground cursor-pointer
                           hover:bg-accent transition-colors"
                  onClick={() => setSelUrl(null)}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Panel Body */}
            <div className="p-4.5 max-h-[calc(100vh-180px)] overflow-y-auto">

              {/* ── Current State Section ────────────────────────────── */}
              <IssueCurrentStateSection
                projectId={activeProject?._id}
                issueId={issueId}
                pageUrl={selUrl}
              />

            {/* 3-Tab Switcher */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              border: "1px solid var(--b)",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 18
            }}>
              {[
                { key: "ai",   label: "✦ Fix with AI" },
                { key: "diy",  label: "🛠 DIY Guide" },
                { key: "help", label: "🤝 AuditIQ" },
              ].map(({ key, label }, i) => (
                <button
                  key={key}
                  style={{
                    padding: "9px 6px",
                    fontSize: 11,
                    fontWeight: 600,
                    border: "none",
                    background: mode === key ? "linear-gradient(135deg,#7730ed,#00dfff)" : "transparent",
                    color: mode === key ? "#fff" : "var(--t3)",
                    cursor: "pointer",
                    lineHeight: 1.3,
                    transition: "all 0.2s",
                    borderRight: i < 2 ? "1px solid var(--b)" : undefined,
                  }}
                  onClick={() => setMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab 1: AI Recommendation */}
            {mode === "ai" && (
              <IssueRecommendationPanel
                projectId={activeProject?._id}
                issueId={issue.id || issue.issue_code || issue.rule_id}
                issueSource="ai_visibility"
                selUrl={selUrl}
                issue={issue}
                onMarkFixed={markFixed}
                isMarkingFixed={fixMutation.isPending}
                mutationState={{ isIdle, isPending, isSuccess, isError, error, recommendation, meta }}
                onGenerate={() => recommendationMutation.mutate()}
                onReset={() => recommendationMutation.reset()}
              />
            )}

            {/* Tab 2: DIY Guide */}
            {mode === "diy" && recommendation && (
              <DIYRenderer recommendation={recommendation} issue={issue} />
            )}

            {mode === "diy" && !recommendation && (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--t2)", fontSize: "11.5px", lineHeight: 1.65 }}>
                Generate an AI recommendation first to access the DIY guide.
              </div>
            )}

            {/* Tab 3: AuditIQ Help */}
            {mode === "help" && (
              <div>
                <div style={{ textAlign: "center", padding: "16px 0 18px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7730ed,#00dfff)", display: "grid", placeItems: "center", fontSize: 24, margin: "0 auto 12px" }}>🤝</div>
                  <div style={{ fontFamily: "var(--font-metric)", fontSize: 17, fontWeight: 800, marginBottom: 6, color: "var(--t)" }}>Let AuditIQ Fix It</div>
                  <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
                    Our technical team will resolve <strong style={{ color: "var(--t)" }}>{issue.title}</strong> across all {issue.pages || 0} affected pages — with QA verification and a before/after report.
                  </div>
                </div>

                {[
                  { icon: "⚡", title: "Express Fix", desc: "Fix all pages in 24 hours", tag: "Most Popular", tc: "var(--cy)", bg: "var(--color-brand-cyan-surface)" },
                  { icon: "🔍", title: "Technical Audit + Fix", desc: "Full review then implement fixes with docs", tag: "Comprehensive", tc: "var(--vi)", bg: "var(--color-brand-violet-surface)" },
                  { icon: "♾", title: "Monthly Maintenance", desc: "Ongoing fixes + monitoring + alerts", tag: "Best Value", tc: "var(--gr)", bg: "var(--color-status-success-surface)" }
                ].map((option, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", marginBottom: 9, background: "var(--s)", border: "1px solid var(--b)", borderRadius: 11, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateX(2px)" }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--b)"; e.currentTarget.style.transform = "translateX(0)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 20, background: option.bg, flexShrink: 0 }}>{option.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: "var(--t)" }}>{option.title}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)" }}>{option.desc}</div>
                    </div>
                    <span style={{ borderRadius: 20, padding: "2px 9px", fontSize: "9.5px", fontWeight: 600, color: option.tc, background: "var(--color-brand-cyan-surface)", border: "1px solid var(--color-brand-cyan-border)" }}>{option.tag}</span>
                  </div>
                ))}

                <button style={{ width: "100%", padding: 10, borderRadius: 9, fontSize: "12.5px", fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "var(--font-metric)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 7, background: "linear-gradient(135deg,#7730ed,#00dfff)", color: "#fff", boxShadow: "0 0 18px rgba(0,223,255,0.16)" }}>
                  🚀 Request Expert Fix
                </button>
                <button style={{ width: "100%", padding: 10, borderRadius: 9, fontSize: "12.5px", fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "var(--font-metric)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 7, background: "linear-gradient(135deg, var(--color-brand-violet-surface), rgba(157,78,221,0.2))", color: "var(--vi)", border: "1px solid var(--color-brand-violet-border)" }}>
                  📅 Book a Strategy Call
                </button>
                <button style={{ width: "100%", padding: 10, borderRadius: 9, fontSize: "12.5px", fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "var(--font-metric)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "var(--s2)", color: "var(--t2)", border: "1px solid var(--b)" }}
                  onClick={() => setMode("ai")}>
                  ← Back to AI Fix
                </button>

                <div style={{ background: "var(--color-status-success-surface)", border: "1px solid var(--color-status-success-border)", borderRadius: 9, padding: "10px 12px", marginTop: 12, fontSize: 11, color: "var(--gr)", textAlign: "center" }}>
                  ✓ Includes before/after screenshots + 30-day rank tracking
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

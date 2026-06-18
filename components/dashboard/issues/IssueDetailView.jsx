"use client"

import { useState, useEffect, useMemo, useCallback } from "react"

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [onClose])
  const bg     = type === 'success' ? 'rgba(0,245,160,0.12)'  : 'rgba(255,56,96,0.12)'
  const border = type === 'success' ? 'rgba(0,245,160,0.28)'  : 'rgba(255,56,96,0.28)'
  const color  = type === 'success' ? '#00f5a0'               : '#ff3860'
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: bg, border: `1px solid ${border}`, color,
      borderRadius: 10, padding: '11px 18px', fontSize: 13, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 8,
      backdropFilter: 'blur(8px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  )
}
import { createPortal } from "react-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useProject } from "@/contexts/ProjectContext"
import apiService from "@/lib/apiService"
import { queryKeys } from "@/lib/query/keys"
import { IssueRecommendationPanel } from "@/components/recommendations"
import DIYRenderer from "@/components/diy/DIYRenderer"
import CurrentStateRenderer from "@/components/issue-context/CurrentStateRenderer"
import { useIssueContext } from "@/hooks/useIssueContext"
import { useIssueUrls, useActiveTaskUrls } from "@/hooks/useDashboardQueries"

export default function IssueDetailView({
  issue,
  onBack,
  onOpenUrl,
  issueTypeName = "On-Page Issues",
  initialSelUrl = null,
  initialMode = "ai",
}) {
  const { activeProject } = useProject()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState(initialMode)
  const [selUrl, setSelUrl] = useState(initialSelUrl)
  const [toast, setToast] = useState(null)

  // Resolve issueId once for reuse in both the issue context hook and mutation
  const issueId = issue.issue_code || issue.rule_id || issue.issue

  // API-backed task/fix tracking
  const { data: activeTaskUrlsResponse } = useActiveTaskUrls(activeProject?._id, issueId)
  const taskMap = activeTaskUrlsResponse?.data?.taskMap || {}
  const fixedUrlsSet = useMemo(() => new Set(activeTaskUrlsResponse?.data?.fixedUrls || []), [activeTaskUrlsResponse])
  const fixedCount = activeTaskUrlsResponse?.data?.fixedCount || 0

  // Creates a new task with status TASK_CREATED (AI recommendation panel "Create Task" button)
  const createTaskMutation = useMutation({
    mutationFn: async (url) => {
      const existingTask = taskMap[url]
      if (existingTask) {
        return { success: true, data: existingTask, alreadyExists: true }
      }
      return apiService.createTask({
        projectId: activeProject._id,
        issueKey: issueId,
        issueName: issue.title || issue.issue || issue.issue_message || issueId,
        issueCategory: issue.category || issueTypeName,
        pageUrl: url,
        status: 'task_created',
        origin: 'ai_fix',
        recommendationId: recommendation?._id || null,
      })
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.activeUrls(activeProject._id, issueId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(activeProject._id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.summary(activeProject._id) })
      if (result?.alreadyExists) {
        setToast({ message: 'Task already exists — use DIY Guide or History Logs to mark as implemented', type: 'success' })
      } else {
        setToast({ message: 'Task created — use the DIY Guide or History Logs to mark as implemented', type: 'success' })
      }
    },
    onError: (err) => {
      setToast({ message: err?.message || 'Failed to create task.', type: 'error' })
    },
  })

  // Transitions an existing task to IMPLEMENTED (DIY Guide "Mark as Implemented" button)
  const markImplementedMutation = useMutation({
    mutationFn: async (url) => {
      const existingTask = taskMap[url]
      if (existingTask?._id) {
        return apiService.updateTaskStatus(existingTask._id, 'implemented')
      }
      return apiService.createTask({
        projectId: activeProject._id,
        issueKey: issueId,
        issueName: issue.title || issue.issue || issue.issue_message || issueId,
        issueCategory: issue.category || issueTypeName,
        pageUrl: url,
        status: 'implemented',
        origin: 'diy_guide',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.activeUrls(activeProject._id, issueId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(activeProject._id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.summary(activeProject._id) })
      setToast({ message: 'Task marked as implemented — pending verification on next recrawl', type: 'success' })
    },
    onError: (err) => {
      setToast({ message: err?.message || 'Failed to mark as implemented.', type: 'error' })
    },
  })

  // Fetch the live issue context (same query that CurrentStateRenderer uses).
  // React Query deduplicates this — no extra network call when the sub-component
  // also renders CurrentStateRenderer for the same key.
  const { data: issueContextData } = useIssueContext(activeProject?._id, issueId, selUrl)

  // Resolve the issueCode
  const issueCode = useMemo(() => {
    if (issue.issue_code) return issue.issue_code
    const codeMap = {
      "Images missing ALT text": "missing_alt",
      "Meta descriptions missing / empty": "missing_meta_description",
      "H1 missing or empty": "missing_h1",
      "Schema markup missing / invalid": "missing_schema",
      "Broken links (404)": "broken_links",
      "Noindex on key pages": "noindex_key_pages",
      "Canonical misconfigurations": "canonical_issues",
      "Multiple title tags": "multiple_titles"
    }
    return codeMap[issue.issue] || issue.issue
  }, [issue])

  // Fetch issue URLs using the centralized TanStack Query hook
  const { data: urlsResponse, isLoading: loadingUrls } = useIssueUrls(
    activeProject?._id,
    issue.affected_urls && Array.isArray(issue.affected_urls) ? null : issueCode
  )

  const urls = useMemo(() => {
    if (issue.affected_urls && Array.isArray(issue.affected_urls)) {
      return issue.affected_urls
    }
    if (urlsResponse?.success && Array.isArray(urlsResponse.data)) {
      return urlsResponse.data
    }
    if (Array.isArray(urlsResponse)) {
      return urlsResponse
    }
    // Fallback to mock data if query fails or loading is done and we have no data
    if (!loadingUrls && !urlsResponse) {
      return [
        "/about-us",
        "/services/seo-audit",
        "/blog/ai-search-2025",
        "/team",
        "/case-studies/techcorp",
        "/pricing",
        "/contact",
        "/features/white-label"
      ]
    }
    return []
  }, [urlsResponse, issue.affected_urls, loadingUrls])

  const openUrls = useMemo(
    () => urls.filter(u => !fixedUrlsSet.has(u)),
    [urls, fixedUrlsSet]
  )

  // Mutation state lifted to parent (persists across tab switches)
  const recommendationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiService.request('/recommendations/generate', {
        method: 'POST',
        body: JSON.stringify({
          projectId: activeProject?._id,
          issueId,
          issueSource: issue.rule_id ? "ai_visibility" : "on_page",
          pageUrl: selUrl || undefined,
          ruleMetadata: {
            title: issue.title || issue.issue || issue.issue_message,
            description: issue.description || issue.issue_message,
            category: issue.category,
            severity: issue.severity,
            difficulty: issue.difficulty,
          },
          // Pass resolved issue context so Claude generates from actual detected values,
          // not just issue metadata. Only sent when a URL is selected and context loaded.
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

  // Calculate progress
  const totalUrls = fixedCount + openUrls.length
  const progress = totalUrls > 0 ? Math.round((fixedCount / totalUrls) * 100) : 0

  // Inject custom fonts
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
    `
    document.head.appendChild(style)

    return () => {
      if (style && style.parentNode) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // ── Current State Section ──────────────────────────────────────────────

  /**
   * Isolated sub-component so the React Query hook runs at component level
   * and doesn't cause hook-order violations when selUrl changes.
   */
  function IssueCurrentStateSection({ projectId, issueId, pageUrl }) {
    const {
      data: issueContext,
      isLoading,
      error,
    } = useIssueContext(projectId, issueId, pageUrl)

    if (!pageUrl) return null

    return (
      <div style={{ marginBottom: 16 }}>
        {/* Divider label */}
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

        {/* Spacer before tabs */}
        <div style={{ height: 14, borderBottom: '1px solid var(--b)', marginTop: 14 }} />
      </div>
    )
  }

  const onCreateTask = useCallback(() => {
    if (selUrl && !createTaskMutation.isPending) {
      createTaskMutation.mutate(selUrl)
    }
  }, [selUrl, createTaskMutation])

  const onMarkImplemented = useCallback(() => {
    if (selUrl && !markImplementedMutation.isPending) {
      markImplementedMutation.mutate(selUrl)
    }
  }, [selUrl, markImplementedMutation])

  return (
    <div className="fi">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
        <button
          className="task-btn secondary"
          style={{ fontSize: "11.5px" }}
          onClick={onBack}
        >
          ← {issueTypeName}
        </button>
        <span style={{ color: "var(--t3)", fontSize: "12px" }}>›</span>
        <span style={{ fontSize: "12px", color: "var(--t2)", fontWeight: "500" }}>
          {issue.title || issue.issue || issue.issue_message}
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
          background: issue.severity === "high" ? "var(--color-status-error-surface)" :
            issue.severity === "medium" ? "var(--color-status-warning-surface)" :
              "var(--color-status-info-surface)",
          color: issue.severity === "high" ? "var(--re)" :
            issue.severity === "medium" ? "var(--am)" :
              "var(--cy)",
          flexShrink: 0
        }}>
          {issue.severity === "high" ? "⚠" : issue.severity === "medium" ? "⚡" : "✓"}
        </div>
        <h2 style={{
          fontFamily: "/dashboard",
          fontSize: 28,
          fontWeight: 800,
          flex: 1,
          color: "var(--t)"
        }}>
          {issue.title || issue.issue || issue.issue_message}
        </h2>
        <span style={{
          background: "var(--color-brand-cyan-surface)",
          border: "1px solid var(--color-brand-cyan-border)",
          color: "var(--cy)",
          borderRadius: 20,
          padding: "4px 13px",
          fontSize: 11,
          fontWeight: 600
        }}>🗂 {issueTypeName}</span>
      </div>

      {/* 4 Stat Tiles */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{
          background: "var(--s)",
          border: "1px solid var(--b)",
          borderRadius: 14,
          padding: "16px 18px"
        }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "var(--t3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8
          }}>PAGES AFFECTED</div>
          <div style={{
            fontFamily: "/dashboard",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "var(--re)"
          }}>{issue.pages || issue.pages_affected || 0}</div>
        </div>
        <div style={{
          background: "var(--s)",
          border: "1px solid var(--b)",
          borderRadius: 14,
          padding: "16px 18px"
        }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "var(--t3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8
          }}>SEO IMPACT</div>
          <div style={{
            fontFamily: "/dashboard",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "var(--cy)"
          }}>+{issue.impact || issue.impact_percentage || 0}%</div>
        </div>
        <div style={{
          background: "var(--s)",
          border: "1px solid var(--b)",
          borderRadius: 14,
          padding: "16px 18px"
        }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "var(--t3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8
          }}>DIFFICULTY</div>
          <div style={{
            fontFamily: "/dashboard",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: issue.difficulty === "Easy" ? "var(--gr)" :
              issue.difficulty === "Medium" ? "var(--am)" : "var(--re)"
          }}>{issue.difficulty || "Medium"}</div>
        </div>
        <div style={{
          background: "var(--s)",
          border: "1px solid var(--b)",
          borderRadius: 14,
          padding: "16px 18px"
        }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "var(--t3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8
          }}>FIXED</div>
          <div style={{
            fontFamily: "/dashboard",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "var(--vi)"
          }}>{fixedCount}/{totalUrls}</div>
        </div>
      </div>

      {/* ARIA Issue Breakdown */}
      <div style={{
        marginBottom: 22,
        background: "linear-gradient(135deg, var(--color-brand-violet-surface), var(--color-brand-cyan-surface))",
        border: "1px solid var(--color-brand-violet-border)",
        borderRadius: 14,
        padding: "18px 22px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          right: 14,
          top: 12,
          fontSize: 20,
          opacity: 0.1,
          color: "var(--cy)",
          pointerEvents: "none"
        }}>✦</div>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          color: "var(--vi)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 8
        }}>✦ ARIA — ISSUE BREAKDOWN</div>
        <div style={{
          fontSize: 13,
          color: "var(--t2)",
          lineHeight: 1.65
        }}>
          This issue affects {issue.pages || issue.pages_affected || 0} pages.
          Missing or empty attributes reduce both search engine understanding and AI citation probability.
          Fixing this is rated {issue.difficulty || "Medium"} difficulty and can recover an estimated
          +{issue.impact || issue.impact_percentage || 0}% SEO impact.
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
                {openUrls.length} OPEN
              </div>
            </div>
          </div>

          {openUrls.map(url => {
            const isSelected = selUrl === url
            const task = taskMap[url]
            let badge = null
            if (task) {
              if (task.status === 'implemented') {
                badge = (
                  <span className="bg-[rgba(157,78,221,0.08)] border border-[rgba(157,78,221,0.18)] text-[#b580ff] rounded-full text-[9px] font-bold px-2 py-0.5 ml-2 uppercase tracking-wide">
                    Implemented
                  </span>
                )
              } else if (task.status === 'reopened') {
                badge = (
                  <span className="bg-[rgba(255,56,96,0.08)] border border-[rgba(255,56,96,0.18)] text-[#ff6080] rounded-full text-[9px] font-bold px-2 py-0.5 ml-2 uppercase tracking-wide">
                    Reopened
                  </span>
                )
              } else if (task.status === 'task_created') {
                badge = (
                  <span className="bg-[rgba(0,223,255,0.08)] border border-[rgba(0,223,255,0.18)] text-[#00dfff] rounded-full text-[9px] font-bold px-2 py-0.5 ml-2 uppercase tracking-wide">
                    Active Task
                  </span>
                )
              }
            }

            return (
              <div
                key={url}
                className={`
                  flex items-center gap-2.5 p-3 mb-2 bg-card rounded-xl cursor-pointer
                  transition-all duration-200 border min-w-0
                  ${isSelected ? 'bg-[var(--color-brand-violet-surface)] border-[var(--color-brand-violet-border)]' : 'border-border hover:bg-[var(--color-surface-hover)]'}
                `}
                onClick={() => setSelUrl(isSelected ? null : url)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 min-w-0">
                    <div
                      className="font-dashboard text-[var(--cy)] font-medium truncate"
                      style={{ fontSize: "13px" }}
                    >
                      {url}
                    </div>
                    {badge}
                  </div>
                  <div className="text-[10.5px] mt-0.5 truncate" style={{ color: 'var(--t2)' }}>
                    {issue.issue || issue.issue_message || 'Issue detected on this page'}
                  </div>
                </div>
                <button
                  className="bg-[var(--color-status-error-surface)] text-[var(--re)] border border-[var(--color-status-error-border)]
                           text-[10px] font-medium px-2.5 py-1 rounded-md flex-shrink-0 mr-1.5
                           transition-all duration-200 hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)]"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenUrl?.(url)
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
          })}

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
            {progress === 100 && (
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
                <button
                  style={{
                    padding: "9px 6px",
                    fontSize: 11,
                    fontWeight: 600,
                    border: "none",
                    background: mode === "ai" ? "linear-gradient(135deg,#7730ed,#00dfff)" : "transparent",
                    color: mode === "ai" ? "#fff" : "var(--t3)",
                    cursor: "pointer",
                    lineHeight: 1.3,
                    transition: "all 0.2s",
                    borderRight: "1px solid var(--b)"
                  }}
                  onClick={() => setMode("ai")}
                >
                  ✦ Fix with AI
                </button>
                <button
                  style={{
                    padding: "9px 6px",
                    fontSize: 11,
                    fontWeight: 600,
                    border: "none",
                    background: mode === "diy" ? "linear-gradient(135deg,#7730ed,#00dfff)" : "transparent",
                    color: mode === "diy" ? "#fff" : "var(--t3)",
                    cursor: "pointer",
                    lineHeight: 1.3,
                    transition: "all 0.2s",
                    borderLeft: "1px solid var(--b)",
                    borderRight: "1px solid var(--b)"
                  }}
                  onClick={() => setMode("diy")}
                >
                  🛠 DIY Guide
                </button>
                <button
                  style={{
                    padding: "9px 6px",
                    fontSize: 11,
                    fontWeight: 600,
                    border: "none",
                    background: mode === "help" ? "linear-gradient(135deg,#7730ed,#00dfff)" : "transparent",
                    color: mode === "help" ? "#fff" : "var(--t3)",
                    cursor: "pointer",
                    lineHeight: 1.3,
                    transition: "all 0.2s",
                    borderLeft: "1px solid var(--b)"
                  }}
                  onClick={() => setMode("help")}
                >
                  🤝 AuditIQ
                </button>
              </div>

              {/* Tab 1: AI Recommendation */}
              {mode === "ai" && (
                <IssueRecommendationPanel
                  projectId={activeProject?._id}
                  issueId={issueId}
                  issueSource={issue.rule_id ? "ai_visibility" : "on_page"}
                  selUrl={selUrl}
                  issue={issue}
                  onCreateTask={onCreateTask}
                  isCreatingTask={createTaskMutation.isPending}
                  task={selUrl ? taskMap[selUrl] : null}
                  mutationState={{
                    isIdle,
                    isPending,
                    isSuccess,
                    isError,
                    error,
                    recommendation,
                    meta,
                  }}
                  onGenerate={() => recommendationMutation.mutate()}
                  onReset={() => recommendationMutation.reset()}
                />
              )}

              {/* Tab 2: DIY Guide — Uses shared recommendation intelligence */}
              {mode === "diy" && recommendation && (
                <DIYRenderer
                  recommendation={recommendation}
                  issue={issue}
                  task={selUrl ? taskMap[selUrl] : null}
                  selUrl={selUrl}
                  onMarkImplemented={onMarkImplemented}
                  isMarkingImplemented={markImplementedMutation.isPending}
                />
              )}

              {/* Tab 2: DIY Guide — Fallback when no recommendation */}
              {mode === "diy" && !recommendation && (
                <div style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "var(--t2)",
                  fontSize: "11.5px",
                  lineHeight: 1.65
                }}>
                  Generate an AI recommendation first to access the DIY guide.
                </div>
              )}

              {/* Tab 3: AuditIQ Help */}
              {mode === "help" && (
                <div>
                  {/* Centered Header Section */}
                  <div style={{
                    textAlign: "center",
                    padding: "16px 0 18px"
                  }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "linear-gradient(135deg,#7730ed,#00dfff)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 24,
                      margin: "0 auto 12px"
                    }}>
                      🤝
                    </div>
                    <div style={{
                      fontFamily: "/dashboard",
                      fontSize: 17,
                      fontWeight: 800,
                      marginBottom: 6
                    }}>
                      Let AuditIQ Fix It
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "var(--t2)",
                      lineHeight: 1.6
                    }}>
                      Our technical team will resolve <strong style={{ color: "var(--t)" }}>{issue.title || issue.issue}</strong> across all {issue.pages || issue.pages_affected || 0} affected pages — with QA verification and a before/after report.
                    </div>
                  </div>

                  {/* Service Options */}
                  {[
                    {
                      icon: "⚡",
                      title: "Express Fix",
                      desc: "Fix all pages in 24 hours",
                      tag: "Most Popular",
                      tc: "var(--cy)",
                      bg: "var(--color-brand-cyan-surface)"
                    },
                    {
                      icon: "🔍",
                      title: "Technical Audit + Fix",
                      desc: "Full review then implement fixes with docs",
                      tag: "Comprehensive",
                      tc: "var(--vi)",
                      bg: "var(--color-brand-violet-surface)"
                    },
                    {
                      icon: "♾",
                      title: "Monthly Maintenance",
                      desc: "Ongoing fixes + monitoring + alerts",
                      tag: "Best Value",
                      tc: "var(--gr)",
                      bg: "var(--color-status-success-surface)"
                    }
                  ].map((option, i) => (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "13px 14px",
                      marginBottom: 9,
                      background: "var(--s)",
                      border: "1px solid var(--b)",
                      borderRadius: 11,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--border2)"
                        e.currentTarget.style.transform = "translateX(2px)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--b)"
                        e.currentTarget.style.transform = "translateX(0)"
                      }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 20,
                        background: option.bg,
                        flexShrink: 0
                      }}>{option.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: 13,
                          marginBottom: 2
                        }}>{option.title}</div>
                        <div style={{
                          fontSize: 11,
                          color: "var(--t3)"
                        }}>{option.desc}</div>
                      </div>
                      <span style={{
                        borderRadius: 20,
                        padding: "2px 9px",
                        fontSize: "9.5px",
                        fontWeight: 600,
                        color: option.tc,
                        background: `var(--color-brand-cyan-surface)`,
                        border: `1px solid var(--color-brand-cyan-border)`
                      }}>{option.tag}</span>
                    </div>
                  ))}

                  <button
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 9,
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      fontFamily: "/dashboard",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginBottom: 7,
                      background: "linear-gradient(135deg,#7730ed,#00dfff)",
                      color: "#fff",
                      boxShadow: "0 0 18px rgba(0,223,255,0.16)"
                    }}
                  >
                    🚀 Request Expert Fix
                  </button>
                  <button
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 9,
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      fontFamily: "/dashboard",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      marginBottom: 7,
                      background: "linear-gradient(135deg, var(--color-brand-violet-surface), rgba(157,78,221,0.2))",
                      color: "var(--vi)",
                      border: "1px solid var(--color-brand-violet-border)"
                    }}
                  >
                    📅 Book a Strategy Call
                  </button>
                  <button
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 9,
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      fontFamily: "/dashboard",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      background: "var(--s2)",
                      color: "var(--t2)",
                      border: "1px solid var(--b)"
                    }}
                    onClick={() => setMode("ai")}
                  >
                    ← Back to AI Fix
                  </button>

                  {/* Green Info Strip */}
                  <div style={{
                    background: "var(--color-status-success-surface)",
                    border: "1px solid var(--color-status-success-border)",
                    borderRadius: 9,
                    padding: "10px 12px",
                    marginTop: 12,
                    fontSize: 11,
                    color: "var(--gr)",
                    textAlign: "center"
                  }}>
                    ✓ Includes before/after screenshots + 30-day rank tracking
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && createPortal(
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />,
        document.body
      )}
    </div>
  )
}

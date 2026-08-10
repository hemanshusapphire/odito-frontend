"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { IssueRecommendationPanel } from "@/components/recommendations"
import DIYRenderer from "@/components/diy/DIYRenderer"
import CurrentStateRenderer from "@/components/issue-context/CurrentStateRenderer"
import { useIssueContext } from "@/hooks/useIssueContext"
import apiService from "@/lib/apiService"

/**
 * Renders the "DETECTED ISSUE / CURRENT STATE" section above the recommendation tabs.
 * Identical pattern to IssueDetailView.IssueCurrentStateSection.
 */
function IssueCurrentStateSection({ projectId, issueId, pageUrl }) {
  const { data: issueContext, isLoading, error } = useIssueContext(projectId, issueId, pageUrl)

  if (!pageUrl) return null

  return (
    <div style={{ marginBottom: 14 }}>
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

export default function FixPanel({ issue, url, projectId, onFixed, onClose }) {
  const [mode, setMode] = useState("ai")

  const issueId = issue.issue_code || issue.rule_id || issue.id

  // Fetch live issue context for this specific page — same hook used by IssueDetailView.
  // React Query deduplicates if the same key is already cached.
  const { data: issueContextData } = useIssueContext(projectId, issueId, url)

  // Mutation state lifted to parent (persists across tab switches)
  const recommendationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiService.request('/recommendations/generate', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          issueId,
          issueSource: issue.rule_id ? "ai_visibility" : "on_page",
          pageUrl: url || undefined,
          ruleMetadata: {
            title: issue.title || issue.issue || issue.issue_message,
            description: issue.description || issue.issue_message,
            category: issue.category,
            severity: issue.severity,
            difficulty: issue.difficulty,
          },
          // Pass resolved issue context so the recommendation engine uses real
          // detected values (title text, measurement, page context) — same as
          // IssueDetailView does.
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

  console.log(`[RECOMMENDATION_UI] FixPanel opened | issue=${issueId} | url=${url} | projectId=${projectId}`)

  return (
    <div 
      className="fix-overlay" 
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="fix-panel">
        {/* Header */}
        <div className="fp-hd">
          <div className="fp-hd-row">
            <div className={`fp-hd-icon ${issue.severity === "critical" || issue.severity === "high" ? "crit" : issue.severity === "warning" || issue.severity === "medium" ? "warn" : "low"}`}>
              {issue.category === "GEO" ? "🧩" : issue.category === "AEO" ? "⚡" : issue.category === "AISEO" ? "🤖" : "⚠"}
            </div>
            <div className="fp-hd-title">
              {issue.title || issue.issue_message || issue.issue}
            </div>
          </div>
          
          <div className="fp-chips">
            <span className={`fp-chip ${issue.severity === "critical" || issue.severity === "high" ? "crit" : issue.severity === "warning" || issue.severity === "medium" ? "warn" : "low"}`}>
              {issue.severity === "critical" || issue.severity === "high" ? "● Critical" : issue.severity === "warning" || issue.severity === "medium" ? "◆ Medium" : "○ Low"}
            </span>
            <span className="fp-chip impact">
              ▲ +{issue.impact || issue.impact_percentage || 0}% Impact
            </span>
            <span 
              className="fp-chip" 
              style={{ 
                background: "rgba(0,223,255,0.07)", 
                color: "var(--cy)", 
                borderColor: "rgba(0,223,255,0.18)" 
              }}
            >
              {issue.category || "GENERAL"}
            </span>
          </div>
          
          <div className="fp-close" onClick={onClose}>✕</div>
        </div>

        {/* Body */}
        <div className="fp-body">
          {/* Current State — DETECTED ISSUE section, shown before recommendation tabs */}
          <IssueCurrentStateSection
            projectId={projectId}
            issueId={issueId}
            pageUrl={url}
          />

          {/* Mode Tabs */}
          <div className="mode-tabs">
            <button 
              className={`mode-tab${mode === "ai" ? " on" : ""}`}
              onClick={() => setMode("ai")}
            >
              ✦ AI Fix
            </button>
            <button 
              className={`mode-tab${mode === "diy" ? " on" : ""}`}
              onClick={() => setMode("diy")}
            >
              🛠 DIY
            </button>
            <button 
              className={`mode-tab${mode === "help" ? " on" : ""}`}
              onClick={() => setMode("help")}
            >
              🤝 Expert Help
            </button>
          </div>

          {/* AI Fix Tab — Real Recommendation Engine */}
          {mode === "ai" && (
            <IssueRecommendationPanel
              projectId={projectId}
              issueId={issue.issue_code || issue.rule_id || issue.id}
              issueSource={issue.rule_id ? "ai_visibility" : "on_page"}
              selUrl={url}
              issue={issue}
              onMarkFixed={onFixed}
              // Pass mutation state as props (panel becomes pure render component)
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

          {/* DIY Tab — Uses shared recommendation intelligence */}
          {mode === "diy" && recommendation && (
            <DIYRenderer 
              recommendation={recommendation} 
              issue={issue} 
            />
          )}

          {/* DIY Tab — Fallback when no recommendation */}
          {mode === "diy" && !recommendation && (
            <div style={{ animation: "fadeIn 0.3s forwards", padding: "20px", textAlign: "center", color: "var(--t2)" }}>
              <div style={{ fontSize: 11.5, lineHeight: 1.65 }}>
                Generate an AI recommendation first to access the DIY guide.
              </div>
            </div>
          )}

          {/* Expert Help Tab */}
          {mode === "help" && (
            <div style={{ animation: "fadeIn 0.3s forwards" }}>
              <div style={{ textAlign: "center", padding: "12px 0 14px" }}>
                <div style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 12, 
                  background: "var(--g1)", 
                  display: "grid", 
                  placeItems: "center", 
                  fontSize: 21, 
                  margin: "0 auto 9px" 
                }}>
                  🤝
                </div>
                <div style={{ 
                  fontFamily: "var(--fd)", 
                  fontSize: 14, 
                  fontWeight: 800, 
                  marginBottom: 4 
                }}>
                  Let Our Experts Fix It
                </div>
                <div style={{ 
                  fontSize: 11.5, 
                  color: "var(--t2)", 
                  lineHeight: 1.6 
                }}>
                  Specialists fix <strong style={{ color: "var(--t)" }}>{issue.title || issue.issue_message}</strong> with before/after proof.
                </div>
              </div>
              
              {[
                { icon: "⚡", title: "Express Fix", desc: "Fixed in 24h", tag: "Popular", tc: "var(--cy)" },
                { icon: "🔍", title: "Full Audit + Fix", desc: "All issues on this page", tag: "Thorough", tc: "var(--pu)" },
                { icon: "♾", title: "Monthly Monitoring", desc: "Auto-fix on every scan", tag: "Best Value", tc: "var(--gr)" }
              ].map((tier, i) => (
                <div key={i} className="tier">
                  <div className="tier-icon" style={{ background: `${tier.tc}14` }}>
                    {tier.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                      {tier.title}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>
                      {tier.desc}
                    </div>
                  </div>
                  <span 
                    className="pill" 
                    style={{ 
                      color: tier.tc, 
                      borderColor: `${tier.tc}44`, 
                      background: `${tier.tc}11`, 
                      fontSize: 9 
                    }}
                  >
                    {tier.tag}
                  </span>
                </div>
              ))}
              
              <button className="act pr" style={{ marginTop: 6 }}>
                🚀 Request Expert Fix
              </button>
              <button className="act pu">
                📅 Book Strategy Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

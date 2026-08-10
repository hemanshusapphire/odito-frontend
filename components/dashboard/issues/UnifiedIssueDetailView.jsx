"use client"

import { useState } from "react"
import { Globe } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { useProject } from "@/contexts/ProjectContext"
import apiService from "@/lib/apiService"
import { IssueRecommendationPanel } from "@/components/recommendations"
import DIYRenderer from "@/components/diy/DIYRenderer"
import IssueDetailView from "@/components/dashboard/issues/IssueDetailView"

const DIFFICULTY_MAP = {
  critical: "Hard",
  high:     "Hard",
  medium:   "Medium",
  low:      "Easy",
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Infer the configuration file responsible for this domain-level issue.
 * Uses the issue evidence structure, which is more reliable than the title string.
 * robots.txt issues carry `blocked` or `explicit_allow` in evidence.
 * llms.txt issues carry `found` or `valid` in evidence.
 */
function deriveConfigSource(issue) {
  const ev = issue.evidence ?? {}
  if (ev.found !== undefined || ev.valid !== undefined || ev.broken_urls !== undefined) {
    return "llms.txt"
  }
  return "robots.txt"
}

/**
 * Derive a human-readable current status from the evidence object.
 */
function deriveCurrentStatus(evidence = {}) {
  if (evidence.blocked === true)          return "Blocked"
  if (evidence.found === false)           return "Missing"
  if (evidence.broken_urls?.length > 0)  return `${evidence.broken_urls.length} Broken Reference${evidence.broken_urls.length > 1 ? "s" : ""}`
  if (evidence.valid === false)           return "Invalid Format"
  if (evidence.explicit_allow === false)  return "Not Explicitly Allowed"
  return "Not Configured"
}

// ── Domain-level detail view ─────────────────────────────────────────────────

function DomainIssueDetailView({ issue, onBack, issueTypeName }) {
  const { activeProject } = useProject()
  const [mode, setMode]   = useState("ai")

  const issueId      = issue.rule_id
  const configSource = deriveConfigSource(issue)
  const currentStatus = deriveCurrentStatus(issue.evidence ?? {})
  const difficulty    = DIFFICULTY_MAP[issue.severity] ?? "Medium"

  // ── AI recommendation mutation ───────────────────────────────────────────
  const recommendationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiService.request("/recommendations/generate", {
        method: "POST",
        body: JSON.stringify({
          projectId:    activeProject?._id,
          issueId,
          issueSource:  "ai_visibility",
          ruleMetadata: {
            title:       issue.issue_title,
            description: issue.issue_description,
            category:    issue.card,
            severity:    issue.severity,
            difficulty,
          },
        }),
      })
      if (!response.success) throw new Error(response.message || "Generation failed")
      return response
    },
    retry: 1,
  })

  const { data, isIdle, isPending, isSuccess, isError, error } = recommendationMutation
  const recommendation = data?.data
  const meta           = data?.meta

  // Normalised issue shape expected by IssueRecommendationPanel / DIYRenderer
  const normalizedForPanel = {
    rule_id:     issueId,
    title:       issue.issue_title,
    description: issue.issue_description,
    severity:    issue.severity,
    difficulty,
    category:    issue.card ?? "AISO",
  }

  // Tab switcher shared style
  const tabBtn = (active) => ({
    padding: "9px 6px",
    fontSize: 11,
    fontWeight: 600,
    border: "none",
    background: active ? "linear-gradient(135deg,#7730ed,#00dfff)" : "transparent",
    color:      active ? "#fff" : "var(--t3)",
    cursor:     "pointer",
    lineHeight: 1.3,
    transition: "all 0.2s",
  })

  return (
    <div className="fi">

      {/* ── Breadcrumb ────────────────────────────────────────────────── */}
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
          {issue.issue_title}
        </span>
      </div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{
          width: 50, height: 50, borderRadius: 13,
          display: "grid", placeItems: "center", fontSize: 22,
          background: "rgba(59,130,246,0.12)",
          color: "#3b82f6", flexShrink: 0,
        }}>
          🌐
        </div>
        <h2 style={{ fontFamily: "/dashboard", fontSize: 28, fontWeight: 800, flex: 1, color: "var(--t)" }}>
          {issue.issue_title}
        </h2>
        <span style={{
          background: "rgba(59,130,246,0.1)",
          border:     "1px solid rgba(59,130,246,0.25)",
          color:      "#3b82f6",
          borderRadius: 20, padding: "4px 13px", fontSize: 11, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Globe size={12} /> Domain-Level
        </span>
      </div>

      {/* ── Stat tiles ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>

        {/* SCOPE */}
        <div style={{ background: "var(--s)", border: "1px solid rgba(59,130,246,0.22)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            SCOPE
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 20 }}>🌐</span>
            <span style={{ fontFamily: "/dashboard", fontWeight: 800, fontSize: 16, color: "#3b82f6" }}>
              Entire Website
            </span>
          </div>
        </div>

        {/* SEO IMPACT */}
        <div style={{ background: "var(--s)", border: "1px solid var(--b)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            SEO IMPACT
          </div>
          <div style={{ fontFamily: "/dashboard", fontWeight: 800, fontSize: 32, lineHeight: 1, color: "var(--cy)" }}>
            +{issue.impact_score ?? 5}%
          </div>
        </div>

        {/* CONFIG SOURCE */}
        <div style={{ background: "var(--s)", border: "1px solid var(--b)", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            CONFIG SOURCE
          </div>
          <div style={{ fontFamily: "/dashboard", fontWeight: 800, fontSize: 20, lineHeight: 1, color: "var(--vi)" }}>
            {configSource}
          </div>
        </div>
      </div>

      {/* ── Domain context card ───────────────────────────────────────── */}
      <div style={{
        marginBottom: 22,
        background:   "linear-gradient(135deg, rgba(59,130,246,0.07), rgba(124,58,237,0.07))",
        border:       "1px solid rgba(59,130,246,0.18)",
        borderRadius: 14,
        padding:      "18px 22px",
        position:     "relative",
        overflow:     "hidden",
      }}>
        <div style={{ position: "absolute", right: 14, top: 12, fontSize: 20, opacity: 0.08, color: "#3b82f6", pointerEvents: "none" }}>🌐</div>

        <div style={{ fontSize: 9, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          🌐 DOMAIN-LEVEL CONFIGURATION ISSUE
        </div>
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.65, marginBottom: 14 }}>
          {issue.issue_description}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ background: "var(--s)", border: "1px solid var(--b)", borderRadius: 9, padding: "8px 14px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", marginBottom: 3 }}>
              CONFIGURATION FILE
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t)" }}>{configSource}</div>
          </div>
          <div style={{ background: "var(--s)", border: "1px solid var(--b)", borderRadius: 9, padding: "8px 14px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", marginBottom: 3 }}>
              CURRENT STATUS
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--re)" }}>{currentStatus}</div>
          </div>
          <div style={{ background: "var(--s)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 9, padding: "8px 14px" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", marginBottom: 3 }}>
              AFFECTED SCOPE
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6", display: "flex", alignItems: "center", gap: 5 }}>
              🌐 Entire Website
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Fix panel (full-width, no URL list) ────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Panel header */}
        <div className="px-4 py-4 border-b border-border">
          <div className="font-dashboard text-sm font-bold text-foreground">
            Fix Assistant — Domain Configuration
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "var(--t3)" }}>
            This fix applies to your <strong style={{ color: "#3b82f6" }}>{configSource}</strong> file at the domain root — not to individual pages.
          </div>
        </div>

        {/* Panel body */}
        <div className="p-4">

          {/* 3-tab switcher */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            border: "1px solid var(--b)", borderRadius: 10, overflow: "hidden", marginBottom: 18,
          }}>
            <button style={{ ...tabBtn(mode === "ai"), borderRight: "1px solid var(--b)" }} onClick={() => setMode("ai")}>
              ✦ Fix with AI
            </button>
            <button style={{ ...tabBtn(mode === "diy"), borderLeft: "1px solid var(--b)", borderRight: "1px solid var(--b)" }} onClick={() => setMode("diy")}>
              🛠 DIY Guide
            </button>
            <button style={{ ...tabBtn(mode === "help"), borderLeft: "1px solid var(--b)" }} onClick={() => setMode("help")}>
              🤝 AuditIQ
            </button>
          </div>

          {/* Tab 1 — AI Recommendation */}
          {mode === "ai" && (
            <IssueRecommendationPanel
              projectId={activeProject?._id}
              issueId={issueId}
              issueSource="ai_visibility"
              selUrl={null}
              issue={normalizedForPanel}
              onCreateTask={() => {}}
              isCreatingTask={false}
              task={null}
              mutationState={{ isIdle, isPending, isSuccess, isError, error, recommendation, meta }}
              onGenerate={() => recommendationMutation.mutate()}
              onReset={() => recommendationMutation.reset()}
            />
          )}

          {/* Tab 2 — DIY Guide */}
          {mode === "diy" && recommendation && (
            <DIYRenderer
              recommendation={recommendation}
              issue={normalizedForPanel}
              task={null}
              selUrl={null}
              onMarkImplemented={() => {}}
              isMarkingImplemented={false}
            />
          )}
          {mode === "diy" && !recommendation && (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--t2)", fontSize: "11.5px", lineHeight: 1.65 }}>
              Generate an AI recommendation first to access the DIY guide.
            </div>
          )}

          {/* Tab 3 — AuditIQ Help */}
          {mode === "help" && (
            <div>
              <div style={{ textAlign: "center", padding: "16px 0 18px" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg,#7730ed,#00dfff)",
                  display: "grid", placeItems: "center", fontSize: 24, margin: "0 auto 12px",
                }}>🤝</div>
                <div style={{ fontFamily: "/dashboard", fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
                  Let AuditIQ Fix It
                </div>
                <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
                  Our technical team will configure{" "}
                  <strong style={{ color: "var(--t)" }}>{configSource}</strong> for your entire domain —
                  with QA verification and a before/after confirmation report.
                </div>
              </div>

              {[
                { icon: "⚡", title: "Express Fix", desc: `Update ${configSource} in 24 hours`, tag: "Most Popular", tc: "var(--cy)", bg: "var(--color-brand-cyan-surface)" },
                { icon: "🔍", title: "Technical Audit + Fix", desc: "Full crawlability review then apply all bot fixes", tag: "Comprehensive", tc: "var(--vi)", bg: "var(--color-brand-violet-surface)" },
                { icon: "♾",  title: "Monthly Maintenance",  desc: "Ongoing configuration monitoring + alerts", tag: "Best Value", tc: "var(--gr)", bg: "var(--color-status-success-surface)" },
              ].map((option, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 14px", marginBottom: 9,
                    background: "var(--s)", border: "1px solid var(--b)", borderRadius: 11,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateX(2px)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b)";      e.currentTarget.style.transform = "translateX(0)" }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 20, background: option.bg, flexShrink: 0 }}>
                    {option.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{option.title}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>{option.desc}</div>
                  </div>
                  <span style={{
                    borderRadius: 20, padding: "2px 9px", fontSize: "9.5px", fontWeight: 600,
                    color: option.tc, background: "var(--color-brand-cyan-surface)", border: "1px solid var(--color-brand-cyan-border)",
                  }}>{option.tag}</span>
                </div>
              ))}

              <button
                style={{
                  width: "100%", padding: 10, borderRadius: 9, fontSize: "12.5px", fontWeight: 600,
                  cursor: "pointer", border: "none", fontFamily: "/dashboard",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 7,
                  background: "linear-gradient(135deg,#7730ed,#00dfff)", color: "#fff",
                  boxShadow: "0 0 18px rgba(0,223,255,0.16)",
                }}
              >
                🚀 Request Expert Fix
              </button>
              <button
                style={{
                  width: "100%", padding: 10, borderRadius: 9, fontSize: "12.5px", fontWeight: 600,
                  cursor: "pointer", fontFamily: "/dashboard",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 7,
                  background: "linear-gradient(135deg, var(--color-brand-violet-surface), rgba(157,78,221,0.2))",
                  color: "var(--vi)", border: "1px solid var(--color-brand-violet-border)",
                }}
              >
                📅 Book a Strategy Call
              </button>
              <button
                style={{
                  width: "100%", padding: 10, borderRadius: 9, fontSize: "12.5px", fontWeight: 600,
                  cursor: "pointer", border: "none", fontFamily: "/dashboard",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: "var(--s2)", color: "var(--t2)", borderTop: "1px solid var(--b)",
                }}
                onClick={() => setMode("ai")}
              >
                ← Back to AI Fix
              </button>

              <div style={{
                background: "var(--color-status-success-surface)", border: "1px solid var(--color-status-success-border)",
                borderRadius: 9, padding: "10px 12px", marginTop: 12,
                fontSize: 11, color: "var(--gr)", textAlign: "center",
              }}>
                ✓ Includes before/after verification + 30-day monitoring
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Public export ────────────────────────────────────────────────────────────

/**
 * UnifiedIssueDetailView
 *
 * Wraps the correct detail layout based on issue scope:
 *   scope === "domain"  →  DomainIssueDetailView  (no URL list, domain config cards)
 *   scope === "page"    →  IssueDetailView         (existing per-page URL list + AI fix)
 *
 * Props:
 *   issue        — raw AISO issue object from getAISOHubIssueDetail API
 *   onBack       — back-navigation callback
 *   onOpenUrl    — open-page callback (used by page-level view only)
 *   issueTypeName — breadcrumb label
 */
export default function UnifiedIssueDetailView({
  issue,
  onBack,
  onOpenUrl = null,
  issueTypeName = "AISO Hub",
}) {
  if (!issue) return null

  // ── Domain-level: dedicated layout ──────────────────────────────────────
  if (issue.scope === "domain") {
    return (
      <DomainIssueDetailView
        issue={issue}
        onBack={onBack}
        issueTypeName={issueTypeName}
      />
    )
  }

  // ── Page-level: existing IssueDetailView via normalisation ───────────────
  const normalized = {
    rule_id:    issue.rule_id,
    issue_code: issue.rule_id,

    title:         issue.issue_title,
    issue_message: issue.issue_title,
    description:   issue.issue_description,

    severity: issue.severity,

    pages_affected: issue.pages_affected,
    pages:          issue.pages_affected,

    impact:            issue.impact_score ?? 5,
    impact_percentage: issue.impact_score ?? 5,

    difficulty: DIFFICULTY_MAP[issue.severity] ?? "Medium",

    affected_urls: Array.isArray(issue.affected_urls) ? issue.affected_urls : [],

    recommendation: issue.recommendation,

    category: issue.card ?? "AISO",
  }

  return (
    <IssueDetailView
      issue={normalized}
      onBack={onBack}
      onOpenUrl={onOpenUrl}
      issueTypeName={issueTypeName}
      initialMode="ai"
    />
  )
}

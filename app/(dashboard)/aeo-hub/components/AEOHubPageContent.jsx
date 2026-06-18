"use client"

import { useState } from "react"
import { useAEOHub, useAISearchAuditProject } from "@/hooks/useDashboardQueries"
import { AISearchSkeleton } from "@/components/skeletons/aisearch"
import MetricCard from "@/app/ai-search-audit/components/MetricCard"
import CategoryGrid from "@/app/ai-search-audit/components/CategoryGrid"
import IssueCard from "@/app/ai-search-audit/components/IssueCard"
import { getCategoryColor } from "@/app/ai-search-audit/data/issuesData"
import styles from "@/app/ai-search-audit/ai-search-audit.module.css"

// AEO Hub metric definitions — reads hub-native keys with legacy fallback
function buildAEOMetrics(metrics) {
  return [
    {
      id: "answer_readiness",
      label: "Answer Readiness",
      icon: "❓",
      val: Math.round(metrics?.answer_readiness ?? metrics?.faq_optimization ?? 0),
      color: "#06b6d4",
    },
    {
      id: "snippet_opportunities",
      label: "Snippet Opportunities",
      icon: "⚡",
      val: Math.round(metrics?.snippet_opportunities ?? metrics?.ai_snippet_probability ?? 0),
      color: "#10b981",
    },
    {
      id: "question_coverage",
      label: "Question Coverage",
      icon: "💬",
      val: Math.round(metrics?.question_coverage ?? metrics?.conversational_score ?? 0),
      color: "#8b5cf6",
    },
    {
      id: "structure_score",
      label: "Structure Score",
      icon: "📐",
      val: Math.round(metrics?.structure_score ?? metrics?.structured_data_depth ?? 0),
      color: "#ffb703",
    },
  ]
}

// AEO Hub score: average of the 4 AEO metrics
function computeAEOScore(metrics) {
  const m = buildAEOMetrics(metrics)
  const total = m.reduce((sum, x) => sum + x.val, 0)
  return Math.round(total / m.length)
}

const AEO_CATEGORIES = new Set(["aeo_score", "voice_intent"])

export default function AEOHubPageContent({ projectId }) {
  const [catFilter, setCatFilter] = useState("all")

  const { data: hubResponse, isLoading, error } = useAEOHub(projectId)
  // Project data gives us the raw category scores for CategoryGrid
  const { data: projectResponse } = useAISearchAuditProject(projectId)

  const hubData = hubResponse?.data
  const metrics = hubData?.metrics
  const rawIssues = hubData?.issues || []
  const totalPages = hubData?.total_pages ?? 0
  // ai_visibility.categories holds the 6 raw category scores
  const aiVisibility = projectResponse?.data?.ai_visibility

  const aeoScore = metrics ? computeAEOScore(metrics) : 0
  const aeoMetrics = metrics ? buildAEOMetrics(metrics) : []

  // Transform issues from backend shape to IssueCard shape
  const issues = rawIssues.map(issue => ({
    id: issue.issueId,
    title: issue.title,
    sev: issue.severity === "critical" ? "crit" : issue.severity === "warning" ? "warn" : "info",
    cat: issue.category,
    desc: `This issue affects ${issue.pagesAffected} pages. +${issue.impact_percentage ?? 0}% impact. Difficulty: ${issue.difficulty}.`,
    pages: issue.pagesAffected,
    impact: `+${issue.impact_percentage ?? 0}%`,
    diff: issue.difficulty,
    urls: issue.sampleUrls?.map((url, i) => ({ key: i, url, sub: "Affected by this issue" })) ?? [],
  }))

  const uniqueCats = [...new Set(issues.map(i => i.cat))]
  const cats = [
    { id: "all", label: "All Issues", count: issues.length },
    ...uniqueCats.map(cat => ({
      id: cat,
      label: cat,
      count: issues.filter(i => i.cat === cat).length,
    })),
  ]
  const shown = catFilter === "all" ? issues : issues.filter(i => i.cat === catFilter)

  if (isLoading) return <AISearchSkeleton />

  if (error) {
    return (
      <div className="glass-card">
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-3">Error Loading AEO Hub</h3>
          <p className="text-muted-foreground">{error.message || "Failed to load AEO Hub data"}</p>
        </div>
      </div>
    )
  }

  if (!hubData || totalPages === 0) {
    return (
      <div className="glass-card">
        <div className="p-8 text-center">
          <div className="text-yellow-500 mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-3">No AEO Data Available</h3>
          <p className="text-muted-foreground">
            AEO analysis hasn&apos;t been performed for this project yet. Run an AI audit to populate this hub.
          </p>
        </div>
      </div>
    )
  }

  const scoreColor = aeoScore < 40 ? "#ff3860" : aeoScore < 65 ? "#ffb703" : "#00f5a0"
  const ringR = 52
  const ringC = 2 * Math.PI * ringR

  return (
    <div>
      {/* Header */}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div className="section-title">AEO Hub</div>
        <span className="glow-pill violet">✦ ANSWER ENGINE OPTIMIZATION</span>
      </div>

      <div className={styles.page}>
        {/* Score Hero */}
        <div className={styles.scoreHero}>
          <div className={styles.scoreHeroRing}>
            <svg width="130" height="130" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={ringR} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="9" />
              <circle
                cx="60" cy="60" r={ringR} fill="none"
                stroke={scoreColor} strokeWidth="9" strokeLinecap="round"
                strokeDasharray={ringC}
                strokeDashoffset={ringC - (ringC * aeoScore / 100)}
                transform="rotate(-90 60 60)"
                style={{ filter: `drop-shadow(0 0 10px ${scoreColor}80)`, transition: "stroke-dashoffset 1.2s ease" }}
              />
              <text x="60" y="56" textAnchor="middle" fill={scoreColor} fontSize="26" fontWeight="700" fontFamily="var(--font-metric), sans-serif">
                {aeoScore}
              </text>
              <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="9" fontFamily="DM Sans, sans-serif">
                /100
              </text>
              <text x="60" y="83" textAnchor="middle" fill="rgba(255,255,255,.35)" fontSize="7.5" fontFamily="DM Sans, sans-serif">
                AEO SCORE
              </text>
            </svg>
          </div>

          <div className={styles.scoreHeroText}>
            <div className={styles.scoreHeroTitle} style={{ color: scoreColor }}>
              {aeoScore < 40 ? "Poor AEO Readiness" : aeoScore < 65 ? "Moderate AEO Readiness" : "Strong AEO Readiness"}
            </div>
            <div className={styles.scoreHeroDesc}>
              {aeoScore < 40
                ? "Your content is not structured for AI answer extraction. FAQ schema, conversational content, and structured markup are missing."
                : aeoScore < 65
                ? "Partial AEO coverage. Key gaps in FAQ schema and conversational content structure remain."
                : "Your content is well-optimised for AI answer inclusion. Monitor snippet opportunities and expand FAQ coverage."}
            </div>
            <div className={styles.scoreHeroPills}>
              <span className={`${styles.heroPill} ${styles.pillCyan}`}>
                ❓ {Math.round(metrics?.answer_readiness ?? metrics?.faq_optimization ?? 0)} Answer Readiness
              </span>
              <span className={`${styles.heroPill} ${styles.pillGreen}`}>
                ⚡ {Math.round(metrics?.snippet_opportunities ?? metrics?.ai_snippet_probability ?? 0)} Snippets
              </span>
              <span className={`${styles.heroPill} ${styles.pillPurple}`}>
                💬 {Math.round(metrics?.question_coverage ?? metrics?.conversational_score ?? 0)} Q-Coverage
              </span>
              <span className={`${styles.heroPill} ${styles.pillAmber}`}>
                📄 {totalPages} pages scored
              </span>
            </div>
          </div>
        </div>

        {/* AEO Category Grid — filtered to aeo_score + voice_intent */}
        {aiVisibility && (
          <CategoryGrid
            aiData={aiVisibility}
            categoryFilter={AEO_CATEGORIES}
            sectionLabel="AEO Categories"
          />
        )}

        {/* AEO Metric Cards */}
        <div className={styles.secDivider}>
          <div className={styles.secDividerLine} />
          <span className={styles.secDividerLbl}>AEO Metrics</span>
          <div className={styles.secDividerLine} />
        </div>
        <div className={styles.metricStrip}>
          {aeoMetrics.map((m, i) => (
            <MetricCard key={m.id} {...m} index={i} />
          ))}
        </div>

        {/* Issues Section */}
        <div className={styles.sec}>
          <div className={styles.secL}>
            <div className={styles.secTtl}>AEO Issues to Fix</div>
            <div className={styles.secCt}>{shown.length} FOUND</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.catFilter}>
          {cats.map(c => (
            <div
              key={c.id}
              className={`${styles.cf} ${catFilter === c.id ? styles.cfOn : ""}`}
              onClick={() => setCatFilter(c.id)}
            >
              {c.id !== "all" && (
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: getCategoryColor(c.id), display: "inline-block", flexShrink: 0 }} />
              )}
              {c.label}
              <span style={{ fontSize: 10, opacity: 0.6 }}>({c.count})</span>
            </div>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="text-green-500 mb-3">✓</div>
            <p className="text-muted-foreground text-sm">No AEO issues found for this filter.</p>
          </div>
        ) : (
          shown.map(issue => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  )
}

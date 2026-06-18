import React from "react";
import s from "../QuickAuditResult.module.css";

const CATEGORY_LABELS = {
  on_page: "On-Page SEO",
  technical: "Technical",
  ai: "AI Visibility",
  links: "Links",
  usability: "Usability",
  social: "Social",
  local_seo: "Local SEO",
  geo: "GEO",
  performance: "Performance",
};

function PriorityBadge({ priority }) {
  if (priority === 1) return <span className={s.badgeHigh}>High Priority</span>;
  if (priority === 2) return <span className={s.badgeMed}>Med Priority</span>;
  return <span className={s.badgeLow}>Low Priority</span>;
}

function SeverityBadge({ severity }) {
  if (severity === "critical") return <span className={s.sevCritical}>Critical</span>;
  if (severity === "medium") return <span className={s.sevMedium}>Medium</span>;
  return <span className={s.sevLow}>Low</span>;
}

export default function RecommendationsSection({ data }) {
  const topIssues = data?.top_issues || [];
  const rulesSummary = data?.rules_summary || {};
  const hiddenIssues = data?.hidden_issues ?? 0;

  const failedCount = rulesSummary.failed ?? 0;

  return (
    <div className={s.section}>
      <div className={s.sectionTitle}>Recommendations</div>

      {/* Summary row */}
      <div className={s.recSummary}>
        <div className={s.recSummaryItem}>
          <span className={s.recSummaryNum}>{failedCount}</span>
          <span className={s.recSummaryLabel}>Issues Found</span>
        </div>
        <div className={s.recSummaryItem}>
          <span className={s.recSummaryNum}>{hiddenIssues}</span>
          <span className={s.recSummaryLabel}>Hidden Issues</span>
        </div>
      </div>

      {/* Recommendations list */}
      {topIssues.length > 0 ? (
        topIssues.map((issue, i) => (
          <div className={s.recRow} key={i}>
            <div className={s.recPriority}>{issue.priority ?? i + 1}</div>
            <div className={s.recName}>{issue.message || "Unnamed issue"}</div>
            <div className={s.recCat}>{CATEGORY_LABELS[issue.category] || issue.category || ""}</div>
            <SeverityBadge severity={issue.severity} />
            <PriorityBadge priority={issue.priority} />
          </div>
        ))
      ) : (
        <div className={s.recEmpty}>No critical issues found. Your site is looking good!</div>
      )}
    </div>
  );
}

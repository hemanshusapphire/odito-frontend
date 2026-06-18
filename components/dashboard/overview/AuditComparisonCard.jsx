"use client";

import { memo } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useLatestComparison } from "@/hooks/useDashboardQueries";
import DeltaBadge from "./DeltaBadge";
import { AuditComparisonSkeleton } from "@/components/skeletons/dashboard/AuditComparisonSkeleton";

// ── Metric tile ───────────────────────────────────────────────────────────────

function MetricTile({ label, delta, suffix, isLowerBetter = false, noDataLabel = "—" }) {
  const hasData = delta?.previous != null && delta?.current != null;

  const currColor =
    delta?.direction === "improved"
      ? "var(--color-status-success)"
      : delta?.direction === "declined"
      ? "var(--color-status-error)"
      : "var(--color-text-primary)";

  return (
    <div className="comp-metric-tile">
      <div className="comp-metric-label">{label}</div>

      {hasData ? (
        <>
          <div className="comp-metric-transition">
            <span className="comp-val-prev">{delta.previous}</span>
            <span className="comp-arrow">→</span>
            <span className="comp-val-curr" style={{ color: currColor }}>
              {delta.current}
            </span>
          </div>
          <DeltaBadge delta={delta} suffix={suffix} isLowerBetter={isLowerBetter} />
        </>
      ) : (
        <div className="comp-metric-transition">
          <span className="comp-val-curr" style={{ color: "var(--color-text-tertiary)", fontSize: 14, fontWeight: 500 }}>
            {noDataLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

const EMPTY_MESSAGES = {
  no_audits: {
    icon: "📊",
    title: "No audits yet",
    body: "Complete your first audit to start tracking progress over time.",
  },
  only_one_audit: {
    icon: "🔄",
    title: "Run another audit to unlock comparison",
    body: "We'll compare results as soon as you've completed a second audit.",
  },
};

function EmptyState({ reason }) {
  const msg = EMPTY_MESSAGES[reason] ?? {
    icon: "📈",
    title: "Comparison unavailable",
    body: "Run another audit to see how your site has improved.",
  };

  return (
    <div className="comp-empty">
      <div style={{ fontSize: 28 }}>{msg.icon}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>
        {msg.title}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.55, maxWidth: 280 }}>
        {msg.body}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function AuditComparisonCard() {
  const { activeProject } = useProject();
  const { data, isLoading } = useLatestComparison(activeProject?._id);

  if (isLoading) return <AuditComparisonSkeleton />;

  const result = data?.data;

  if (!result?.available) {
    return (
      <div className="audit-comp-card">
        <div className="section-head">
          <div className="section-title">Progress Tracker</div>
        </div>
        <EmptyState reason={result?.reason} />
      </div>
    );
  }

  const { delta, current, previous } = result;

  // Issue suffix depends on direction so it reads naturally in the badge
  const issueSuffix =
    delta.totalIssues.direction === "improved"
      ? "fewer"
      : delta.totalIssues.direction === "declined"
      ? "more"
      : "";

  return (
    <div className="audit-comp-card">
      <div className="section-head">
        <div className="section-title">Progress Since Last Audit</div>
        {previous?.auditNumber != null && current?.auditNumber != null && (
          <div className="section-tag">
            #{previous.auditNumber} → #{current.auditNumber}
          </div>
        )}
      </div>

      <div className="comp-grid">
        <MetricTile
          label="Website Score"
          delta={delta.websiteScore}
          suffix="pts"
        />
        <MetricTile
          label="AI Visibility"
          delta={delta.aiVisibilityScore}
          suffix="pts"
          noDataLabel="Not scored"
        />
        <MetricTile
          label="Total Issues"
          delta={delta.totalIssues}
          suffix={issueSuffix}
          isLowerBetter
        />
        <MetricTile
          label="Pages Analyzed"
          delta={delta.pagesAnalyzed}
          suffix="pages"
        />
      </div>
    </div>
  );
}

export default memo(AuditComparisonCard);

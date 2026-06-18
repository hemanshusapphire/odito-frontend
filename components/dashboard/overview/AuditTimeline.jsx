"use client";

import { memo, useState } from "react";
import { ChevronDown, ChevronUp, History } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useAuditHistory } from "@/hooks/useDashboardQueries";
import DeltaBadge from "./DeltaBadge";
import { AuditTimelineSkeleton } from "@/components/skeletons/dashboard/AuditComparisonSkeleton";

// ── Date helper ───────────────────────────────────────────────────────────────

function formatAuditDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// ── Single timeline row ───────────────────────────────────────────────────────

function TimelineRun({ run, prevRun }) {
  const scoreDelta =
    prevRun?.websiteScore != null && run.websiteScore != null
      ? {
          current: run.websiteScore,
          previous: prevRun.websiteScore,
          change: run.websiteScore - prevRun.websiteScore,
          direction:
            run.websiteScore > prevRun.websiteScore
              ? "improved"
              : run.websiteScore < prevRun.websiteScore
              ? "declined"
              : "unchanged",
        }
      : null;

  const scoreColor =
    scoreDelta?.direction === "improved"
      ? "var(--color-status-success)"
      : scoreDelta?.direction === "declined"
      ? "var(--color-status-error)"
      : "var(--color-text-primary)";

  return (
    <div className="timeline-run">
      <div className="timeline-run-num">#{run.auditNumber}</div>

      <div className="timeline-run-date">
        Completed {formatAuditDate(run.completedAt)}
      </div>

      {run.websiteScore != null && (
        <div className="timeline-run-score" style={{ color: scoreColor }}>
          {run.websiteScore}
        </div>
      )}

      {scoreDelta ? (
        <DeltaBadge delta={scoreDelta} suffix="pts" />
      ) : (
        <span style={{ width: 52 }} />
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const INITIAL_VISIBLE = 5;

function AuditTimeline() {
  const { activeProject } = useProject();
  const projectId = activeProject?._id;

  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Query fires only when the section is expanded — satisfies lazy-load requirement
  const { data, isLoading } = useAuditHistory(projectId, { enabled: expanded });

  const runs = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const visibleRuns = showAll ? runs : runs.slice(0, INITIAL_VISIBLE);

  return (
    <div className="audit-timeline-wrap">
      {/* Toggle header */}
      <button
        className="timeline-toggle-btn"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <History size={15} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>
          Audit History
          {total > 0 && !expanded && (
            <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>
              {" "}— {total} audit{total !== 1 ? "s" : ""} recorded
            </span>
          )}
        </span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: 8 }}>
          {isLoading ? (
            <AuditTimelineSkeleton />
          ) : runs.length === 0 ? (
            <div
              style={{
                padding: "20px 0",
                textAlign: "center",
                fontSize: 13,
                color: "var(--color-text-tertiary)",
              }}
            >
              No audits recorded yet. Complete an audit to start tracking history.
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary)",
                  marginBottom: 8,
                  paddingLeft: 2,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                Score · Newest first
              </div>

              <div className="timeline-list">
                {visibleRuns.map((run, i) => (
                  <TimelineRun
                    key={run._id}
                    run={run}
                    // prevRun is the next item (older audit) for delta calculation
                    prevRun={visibleRuns[i + 1] ?? null}
                  />
                ))}
              </div>

              {runs.length > INITIAL_VISIBLE && !showAll && (
                <button
                  className="timeline-expand-btn"
                  onClick={() => setShowAll(true)}
                >
                  <ChevronDown size={13} />
                  Show {runs.length - INITIAL_VISIBLE} more audit
                  {runs.length - INITIAL_VISIBLE !== 1 ? "s" : ""}
                </button>
              )}

              {showAll && runs.length > INITIAL_VISIBLE && (
                <button
                  className="timeline-expand-btn"
                  onClick={() => setShowAll(false)}
                >
                  <ChevronUp size={13} />
                  Show less
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(AuditTimeline);

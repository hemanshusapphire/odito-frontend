"use client";

import { memo, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useProjectTrends } from "@/hooks/useDashboardQueries";
import TrendChart from "./TrendChart";
import DeltaBadge from "./DeltaBadge";
import TrendChartSkeleton from "@/components/skeletons/dashboard/TrendChartSkeleton";

// ── Chart configuration ───────────────────────────────────────────────────────

const CHART_CONFIG = {
  websiteScore: {
    colorHex:     "#a855f7",
    gradientId:   "grad-website-score",
    label:        "Website Score",
    unit:         "pts",
    isScore:      true,
    isLowerBetter: false,
  },
  aiVisibilityScore: {
    colorHex:     "#00e5ff",
    gradientId:   "grad-ai-visibility",
    label:        "AI Visibility",
    unit:         "pts",
    isScore:      true,
    isLowerBetter: false,
  },
  totalIssues: {
    colorHex:     "#ff3860",
    gradientId:   "grad-total-issues",
    label:        "Total Issues",
    unit:         "issues",
    isScore:      false,
    isLowerBetter: true,
  },
};

// ── Single chart tile ─────────────────────────────────────────────────────────

const TrendChartTile = memo(function TrendChartTile({ metricKey, trendData }) {
  const config = CHART_CONFIG[metricKey];
  const growth = trendData.growth?.[metricKey];

  // Transform flat arrays into Recharts-compatible objects; memoized per metricKey
  const chartData = useMemo(
    () =>
      (trendData.labels ?? []).map((_, i) => ({
        label: `A${trendData.auditNumbers?.[i] ?? i + 1}`,
        value: trendData[metricKey]?.[i] ?? null,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trendData.labels, trendData[metricKey], trendData.auditNumbers]
  );

  const hasChartData = chartData.some((d) => d.value != null);

  // Compute badge suffix based on direction (dynamic label reads naturally)
  const badgeSuffix = config.isLowerBetter
    ? growth?.direction === "improved" ? "fewer" : "more"
    : "pts";

  // Current value color
  const lastColor =
    growth?.direction === "improved"
      ? "var(--color-status-success)"
      : growth?.direction === "declined"
      ? "var(--color-status-error)"
      : "var(--color-text-primary)";

  return (
    <div className="trend-chart-tile">
      {/* Label + badge */}
      <div className="trend-tile-header">
        <div className="comp-metric-label">{config.label}</div>
        {growth && growth.direction !== "unchanged" && growth.change != null && (
          <DeltaBadge delta={growth} suffix={badgeSuffix} isLowerBetter={config.isLowerBetter} />
        )}
      </div>

      {/* First → Last transition */}
      {growth?.first != null && growth?.last != null ? (
        <div className="comp-metric-transition" style={{ marginBottom: 6 }}>
          <span className="comp-val-prev">{growth.first}</span>
          <span className="comp-arrow">→</span>
          <span className="comp-val-curr" style={{ color: lastColor }}>
            {growth.last}
          </span>
        </div>
      ) : (
        <div style={{ height: 28, marginBottom: 6 }} />
      )}

      {/* Chart */}
      {hasChartData ? (
        <TrendChart
          data={chartData}
          colorHex={config.colorHex}
          unit={config.unit}
          gradientId={config.gradientId}
          height={125}
          isScore={config.isScore}
        />
      ) : (
        <div style={{
          height: 125,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "var(--color-text-tertiary)",
        }}>
          No data yet
        </div>
      )}
    </div>
  );
});

// ── Insights row ──────────────────────────────────────────────────────────────

const InsightsRow = memo(function InsightsRow({ insights, growth }) {
  if (!insights?.length) return null;

  // Pick icon based on overall score direction
  const overallImproving = growth?.websiteScore?.direction === "improved";
  const Icon = overallImproving ? TrendingUp : TrendingDown;
  const iconColor = overallImproving
    ? "var(--color-status-success)"
    : "var(--color-status-error)";

  return (
    <div className="trend-insights-row">
      {insights.map((text, i) => (
        <div key={i} className="trend-insight-item">
          <Icon size={12} style={{ flexShrink: 0, color: iconColor, marginTop: 1 }} />
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
});

// ── Empty state ───────────────────────────────────────────────────────────────

const EMPTY_MESSAGES = {
  no_audits: {
    icon: "📈",
    title: "No audits yet",
    body: "Complete your first audit to start building your performance history.",
  },
  only_one_audit: {
    icon: "📊",
    title: "Run more audits to unlock trend analysis",
    body: "We need at least 2 completed audits to show meaningful performance trends.",
  },
};

function EmptyState({ reason }) {
  const msg = EMPTY_MESSAGES[reason] ?? EMPTY_MESSAGES.only_one_audit;
  return (
    <div className="comp-empty">
      <div style={{ fontSize: 28 }}>{msg.icon}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)" }}>
        {msg.title}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.55, maxWidth: 300 }}>
        {msg.body}
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

function TrendAnalyticsSection() {
  const { activeProject } = useProject();
  const { data, isLoading } = useProjectTrends(activeProject?._id);

  if (isLoading) return <TrendChartSkeleton />;

  const trendData = data?.data;

  if (!trendData?.available) {
    return (
      <div className="trend-analytics-card">
        <div className="section-head">
          <div className="section-title">Trend Analytics</div>
        </div>
        <EmptyState reason={trendData?.reason} />
      </div>
    );
  }

  return (
    <div className="trend-analytics-card">
      <div className="section-head">
        <div className="section-title">Trend Analytics</div>
        <div className="section-tag">
          {trendData.totalAudits} Audit{trendData.totalAudits !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="trend-charts-grid">
        <TrendChartTile metricKey="websiteScore"      trendData={trendData} />
        <TrendChartTile metricKey="aiVisibilityScore" trendData={trendData} />
        <TrendChartTile metricKey="totalIssues"       trendData={trendData} />
      </div>

      <InsightsRow insights={trendData.insights} growth={trendData.growth} />
    </div>
  );
}

export default memo(TrendAnalyticsSection);

"use client";

export default function TrendChartSkeleton() {
  return (
    <div className="trend-analytics-card" style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 150, height: 20 }} />
        <div className="skeleton-base skeleton-shimmer rounded-full" style={{ width: 56, height: 20 }} />
      </div>

      {/* 3-column chart grid */}
      <div className="trend-charts-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="trend-chart-tile" style={{ opacity: 1 - i * 0.1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 90, height: 10 }} />
              <div className="skeleton-base skeleton-shimmer rounded-full" style={{ width: 52, height: 18 }} />
            </div>
            <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 110, height: 22, marginBottom: 8 }} />
            <div className="skeleton-base skeleton-shimmer rounded" style={{ width: "100%", height: 120 }} />
          </div>
        ))}
      </div>

      {/* Insights skeleton */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--color-border-default)", display: "flex", flexDirection: "column", gap: 8 }}>
        {[100, 130, 110].map((w, i) => (
          <div key={i} className="skeleton-base skeleton-shimmer rounded" style={{ width: w, height: 12 }} />
        ))}
      </div>
    </div>
  );
}

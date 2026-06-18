"use client";

export function AuditComparisonSkeleton() {
  return (
    <div className="audit-comp-card" style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 180, height: 20 }} />
        <div className="skeleton-base skeleton-shimmer rounded-full" style={{ width: 80, height: 20 }} />
      </div>
      {/* 2×2 grid */}
      <div className="comp-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="comp-metric-tile">
            <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 80, height: 10 }} />
            <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 110, height: 24, marginTop: 2 }} />
            <div className="skeleton-base skeleton-shimmer rounded-full" style={{ width: 64, height: 18 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditTimelineSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="timeline-run" style={{ opacity: 1 - i * 0.15 }}>
          <div className="skeleton-base skeleton-shimmer rounded-full" style={{ width: 52, height: 20 }} />
          <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 80, height: 14, flex: 1 }} />
          <div className="skeleton-base skeleton-shimmer rounded" style={{ width: 32, height: 20 }} />
          <div className="skeleton-base skeleton-shimmer rounded-full" style={{ width: 52, height: 20 }} />
        </div>
      ))}
    </div>
  );
}

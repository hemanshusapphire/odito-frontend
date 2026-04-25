"use client";

export function StatsGridSkeleton({ count = 3 }) {
  return (
    <div className="stat-grid">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="stat-tile skeleton-shimmer-dark">
          <div className="w-20 h-2.5 skeleton-base rounded mb-3"></div>
          <div className="w-16 h-8 skeleton-base rounded"></div>
        </div>
      ))}
    </div>
  );
}

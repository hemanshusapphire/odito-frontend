"use client";

export function DashboardCardSkeleton() {
  return (
    <div className="score-card skeleton-shimmer-dark">
      <div className="w-24 h-3 skeleton-base rounded mb-4"></div>
      <div className="relative w-20 h-20 skeleton-base rounded-full"></div>
      <div className="w-12 h-2 skeleton-base rounded mt-2"></div>
    </div>
  );
}

export function ScoreGridSkeleton() {
  return (
    <div className="score-grid">
      {[...Array(4)].map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}

"use client";

export function AccessibilitySummarySkeleton() {
  return (
    <div className="skeleton-fade-in">
      {/* Score Card */}
      <div className="score-card skeleton-shimmer-dark mb-4">
        <div className="w-24 h-3 skeleton-base rounded mb-4"></div>
        <div className="relative w-20 h-20 skeleton-base rounded-full"></div>
        <div className="w-12 h-2 skeleton-base rounded mt-2"></div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="stat-tile skeleton-shimmer-dark">
            <div className="w-20 h-2.5 skeleton-base rounded mb-3"></div>
            <div className="w-16 h-8 skeleton-base rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

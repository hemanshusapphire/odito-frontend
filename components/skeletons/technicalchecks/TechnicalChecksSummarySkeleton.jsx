"use client";

export function TechnicalChecksSummarySkeleton() {
  return (
    <div className="skeleton-fade-in">
      {/* Summary Bar - 4 stat tiles */}
      <div className="summary-bar skeleton-shimmer-dark">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="sum-tile">
            <div className="w-16 h-8 skeleton-base rounded mx-auto mb-2"></div>
            <div className="w-20 h-2.5 skeleton-base rounded mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Health Row */}
      <div className="health-row mt-4">
        <div className="health-card skeleton-shimmer-dark">
          <div className="w-20 h-20 skeleton-base rounded-full"></div>
        </div>
        <div className="aria-card skeleton-shimmer-dark">
          <div className="w-32 h-3 skeleton-base rounded mb-2"></div>
          <div className="w-full h-2.5 skeleton-base rounded mb-1"></div>
          <div className="w-3/4 h-2.5 skeleton-base rounded"></div>
        </div>
      </div>
    </div>
  );
}

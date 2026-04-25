"use client";

export function KeywordsSkeleton() {
  return (
    <div className="skeleton-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-48 h-7 skeleton-base rounded"></div>
          <div className="flex gap-2">
            <div className="w-24 h-8 skeleton-base rounded-lg"></div>
            <div className="w-28 h-8 skeleton-base rounded-lg"></div>
          </div>
        </div>
        <div className="w-48 h-9 skeleton-base rounded-lg"></div>
      </div>

      {/* Summary Cards Row (5 cards) */}
      <div className="stat-grid mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="stat-tile skeleton-shimmer-dark">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 skeleton-base rounded"></div>
              <div className="w-20 h-2.5 skeleton-base rounded"></div>
            </div>
            <div className="w-16 h-8 skeleton-base rounded"></div>
          </div>
        ))}
      </div>

      {/* Volume Distribution Chart */}
      <div className="glass-card skeleton-shimmer-dark p-6 mb-6">
        <div className="w-32 h-4 skeleton-base rounded mb-4"></div>
        <div className="w-full h-48 skeleton-base rounded-xl"></div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex gap-2 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-20 h-8 skeleton-base rounded-lg"></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="glass-card skeleton-shimmer-dark">
        {/* Table Header */}
        <div className="flex gap-4 px-6 py-4 border-b border-border">
          <div className="w-32 h-3 skeleton-base rounded"></div>
          <div className="w-20 h-3 skeleton-base rounded"></div>
          <div className="w-16 h-3 skeleton-base rounded"></div>
          <div className="w-12 h-3 skeleton-base rounded"></div>
          <div className="w-12 h-3 skeleton-base rounded"></div>
          <div className="w-16 h-3 skeleton-base rounded"></div>
        </div>

        {/* Table Rows */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4 border-b border-border last:border-0">
            <div className="w-32 flex-shrink-0">
              <div className="w-full h-3 skeleton-base rounded mb-1"></div>
              <div className="w-3/4 h-2.5 skeleton-base rounded"></div>
            </div>
            <div className="w-20 flex-shrink-0">
              <div className="w-full h-2 skeleton-base rounded-full"></div>
            </div>
            <div className="w-16 h-6 skeleton-base rounded flex-shrink-0"></div>
            <div className="w-12 h-12 skeleton-base rounded-full flex-shrink-0"></div>
            <div className="w-12 h-3 skeleton-base rounded flex-shrink-0"></div>
            <div className="w-16 h-8 skeleton-base rounded flex-shrink-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

export function AISearchSkeleton() {
  return (
    <div className="skeleton-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-56 h-7 skeleton-base rounded"></div>
          <div className="w-28 h-6 skeleton-base rounded"></div>
        </div>
        <div className="w-20 h-9 skeleton-base rounded-lg"></div>
      </div>

      {/* Main Score Card */}
      <div className="glass-card skeleton-shimmer-dark p-8 mb-6">
        <div className="flex gap-8 items-center">
          <div className="relative w-40 h-40 skeleton-base rounded-full flex-shrink-0"></div>
          <div className="flex-1">
            <div className="w-40 h-6 skeleton-base rounded mb-4"></div>
            <div className="w-full h-3 skeleton-base rounded mb-2"></div>
            <div className="w-3/4 h-3 skeleton-base rounded mb-4"></div>
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-6 skeleton-base rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Visibility Categories */}
      <div className="mb-6">
        <div className="section-head mb-4">
          <div className="w-48 h-5 skeleton-base rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-tile skeleton-shimmer-dark">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 skeleton-base rounded"></div>
                <div className="w-24 h-3 skeleton-base rounded"></div>
              </div>
              <div className="w-12 h-8 skeleton-base rounded mb-3"></div>
              <div className="w-full h-2 skeleton-base rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Metrics Section */}
      <div>
        <div className="section-head mb-4">
          <div className="w-40 h-5 skeleton-base rounded"></div>
        </div>
        <div className="glass-card skeleton-shimmer-dark p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-4 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 skeleton-base rounded"></div>
                <div className="w-32 h-3 skeleton-base rounded"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-3 skeleton-base rounded"></div>
                <div className="w-5 h-5 skeleton-base rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

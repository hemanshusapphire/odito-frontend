"use client";

export function PageSpeedSkeleton() {
  return (
    <div className="skeleton-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-48 h-6 skeleton-base rounded"></div>
          <div className="w-24 h-6 skeleton-base rounded"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-9 skeleton-base rounded-lg"></div>
          <div className="flex gap-2">
            <div className="w-16 h-9 skeleton-base rounded-lg"></div>
            <div className="w-16 h-9 skeleton-base rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Top Section - 2 Column Grid */}
      <div className="two-col mb-6">
        {/* Left Card - Performance Score */}
        <div className="glass-card skeleton-shimmer-dark p-6 flex flex-col items-center">
          <div className="relative w-32 h-32 skeleton-base rounded-full mb-4"></div>
          <div className="w-20 h-3 skeleton-base rounded"></div>
        </div>

        {/* Right Card - Core Metrics List */}
        <div className="glass-card skeleton-shimmer-dark p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 skeleton-base rounded"></div>
                <div className="w-20 h-3 skeleton-base rounded"></div>
              </div>
              <div className="w-12 h-3 skeleton-base rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Impact Card */}
      <div className="glass-card skeleton-shimmer-dark p-6 mb-6">
        <div className="w-32 h-4 skeleton-base rounded mb-3"></div>
        <div className="w-full h-3 skeleton-base rounded mb-2"></div>
        <div className="w-3/4 h-3 skeleton-base rounded mb-2"></div>
        <div className="w-1/2 h-3 skeleton-base rounded"></div>
      </div>

      {/* Core Web Vitals Section */}
      <div>
        <div className="section-head mb-4">
          <div className="w-40 h-5 skeleton-base rounded"></div>
        </div>
        <div className="stat-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="stat-tile skeleton-shimmer-dark">
              <div className="w-24 h-3 skeleton-base rounded mb-4"></div>
              <div className="w-16 h-8 skeleton-base rounded mb-3"></div>
              <div className="w-full h-2 skeleton-base rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

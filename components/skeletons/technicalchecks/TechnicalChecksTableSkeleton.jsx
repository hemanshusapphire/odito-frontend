"use client";

export function TechnicalChecksTableSkeleton() {
  return (
    <div className="skeleton-fade-in">
      {/* Section Header */}
      <div className="section-head mb-4">
        <div className="w-32 h-4 skeleton-base rounded"></div>
        <div className="w-16 h-3 skeleton-base rounded"></div>
      </div>

      {/* Tab Strip */}
      <div className="tab-strip skeleton-shimmer-dark mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-24 h-8 skeleton-base rounded"></div>
        ))}
      </div>

      {/* Check Cards Grid */}
      <div className="check-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="check-card skeleton-shimmer-dark">
            <div className="w-10 h-10 skeleton-base rounded-xl flex-shrink-0"></div>
            <div className="flex-1">
              <div className="w-32 h-3 skeleton-base rounded mb-2"></div>
              <div className="w-full h-2.5 skeleton-base rounded mb-2"></div>
              <div className="w-3/4 h-2.5 skeleton-base rounded"></div>
            </div>
            <div className="w-16 h-8 skeleton-base rounded-lg flex-shrink-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

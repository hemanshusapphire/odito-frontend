"use client";

export function AIVideoSkeleton() {
  return (
    <div className="skeleton-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="w-48 h-7 skeleton-base rounded mb-2"></div>
          <div className="w-64 h-4 skeleton-base rounded mb-3"></div>
          <div className="flex gap-2">
            <div className="w-20 h-6 skeleton-base rounded-full"></div>
            <div className="w-24 h-6 skeleton-base rounded-full"></div>
          </div>
        </div>
        <div className="w-20 h-9 skeleton-base rounded-lg"></div>
      </div>

      {/* Generate Video Card */}
      <div className="glass-card skeleton-shimmer-dark p-6 mb-6">
        <div className="w-40 h-5 skeleton-base rounded mb-3"></div>
        <div className="w-full h-3 skeleton-base rounded mb-2"></div>
        <div className="w-3/4 h-3 skeleton-base rounded mb-4"></div>
        <div className="w-32 h-9 skeleton-base rounded-lg"></div>
      </div>

      {/* Video Status Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-24 h-7 skeleton-base rounded-lg"></div>
        <div className="w-40 h-4 skeleton-base rounded"></div>
      </div>

      {/* Video Player Placeholder */}
      <div className="glass-card skeleton-shimmer-dark p-4">
        <div className="w-full aspect-video skeleton-base rounded-xl"></div>
      </div>
    </div>
  );
}

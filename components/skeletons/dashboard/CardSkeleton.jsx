"use client";

export function CardSkeleton() {
  return (
    <div className="ai-card skeleton-shimmer-dark skeleton-fade-in">
      <div className="w-40 h-2.5 skeleton-base rounded mb-3"></div>
      <div className="flex gap-4 items-start">
        <div className="w-12 h-12 skeleton-base rounded-xl flex-shrink-0"></div>
        <div className="flex-1">
          <div className="space-y-2">
            <div className="w-full h-3 skeleton-base rounded"></div>
            <div className="w-5/6 h-3 skeleton-base rounded"></div>
            <div className="w-4/6 h-3 skeleton-base rounded"></div>
          </div>
          <div className="mt-3">
            <div className="w-32 h-8 skeleton-base rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

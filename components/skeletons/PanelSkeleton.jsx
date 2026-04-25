"use client";

import { StatsGridSkeleton } from "./StatsGridSkeleton";

export function PanelSkeleton({ showStats = true, showProgressBars = true }) {
  return (
    <div className="skeleton-fade-in">
      {/* Section Header */}
      <div className="section-head mb-4">
        <div className="w-32 h-4 skeleton-base rounded"></div>
        <div className="w-16 h-3 skeleton-base rounded"></div>
      </div>

      {/* Stats Grid */}
      {showStats && <StatsGridSkeleton count={3} />}

      {/* Progress Bars Section */}
      {showProgressBars && (
        <div className="glass-card p-4 mt-4 skeleton-shimmer-dark">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`mb-3 ${i === 2 ? 'mb-0' : ''}`}>
              <div className="flex justify-between mb-1.5">
                <div className="w-24 h-2 skeleton-base rounded"></div>
                <div className="w-8 h-2 skeleton-base rounded"></div>
              </div>
              <div className="h-1.5 skeleton-base rounded-full"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

export function OnPageTableSkeleton() {
  return (
    <div className="glass-card skeleton-fade-in">
      {/* Header Row */}
      <div className="flex gap-4 px-4 py-3 border-b border-border">
        <div className="w-48 h-3 skeleton-base rounded"></div>
        <div className="w-24 h-3 skeleton-base rounded"></div>
        <div className="w-20 h-3 skeleton-base rounded"></div>
        <div className="w-20 h-3 skeleton-base rounded"></div>
        <div className="w-16 h-3 skeleton-base rounded ml-auto"></div>
      </div>

      {/* Table Rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-4 border-b border-border last:border-0">
          <div className="w-48 h-3 skeleton-base rounded"></div>
          <div className="w-24 h-3 skeleton-base rounded"></div>
          <div className="w-20 h-3 skeleton-base rounded"></div>
          <div className="w-20 h-3 skeleton-base rounded"></div>
          <div className="w-16 h-8 skeleton-base rounded-lg ml-auto"></div>
        </div>
      ))}
    </div>
  );
}

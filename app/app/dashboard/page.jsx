import { Suspense } from "react"
import DashboardPageContent from "./page-content"

/**
 * Dashboard Overview — Server Component shell.
 * 
 * Renders immediately with Suspense fallback,
 * then streams in the client-side content.
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 space-y-6 skeleton-fade-in">
        {/* Score grid skeleton */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border p-6 space-y-3">
              <div className="w-20 h-3 skeleton-base skeleton-shimmer rounded" />
              <div className="w-16 h-10 skeleton-base skeleton-shimmer rounded" />
              <div className="w-24 h-3 skeleton-base skeleton-shimmer rounded" />
            </div>
          ))}
        </div>
        {/* AI Card skeleton */}
        <div className="rounded-xl border p-6 space-y-4">
          <div className="w-32 h-4 skeleton-base skeleton-shimmer rounded" />
          <div className="w-full h-20 skeleton-base skeleton-shimmer rounded" />
        </div>
        {/* Two column skeleton */}
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-xl border p-6 space-y-3">
            <div className="w-28 h-4 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-32 skeleton-base skeleton-shimmer rounded" />
          </div>
          <div className="rounded-xl border p-6 space-y-3">
            <div className="w-28 h-4 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-32 skeleton-base skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

/**
 * Dashboard-wide loading skeleton.
 * Shown by Next.js automatically when navigating between dashboard routes.
 */
export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-6 skeleton-fade-in">
      {/* Header skeleton */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded mb-2" />
            <div className="w-64 h-4 skeleton-base skeleton-shimmer rounded" />
          </div>
        </div>
      </div>

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

      {/* Content skeleton */}
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
  )
}

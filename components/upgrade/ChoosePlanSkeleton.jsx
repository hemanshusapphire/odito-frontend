/**
 * Loading state for the Choose Plan page. Mirrors the real layout's final
 * dimensions (summary strip + 4-card grid) so there is no layout shift when
 * real data replaces it — same convention as the sibling
 * settings/subscription page's skeleton-base/skeleton-shimmer classes.
 */
export default function ChoosePlanSkeleton() {
  return (
    <div className="space-y-6 skeleton-fade-in">
      <div className="rounded-2xl border border-border/50 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 skeleton-base skeleton-shimmer rounded" />
            <div className="h-6 w-40 skeleton-base skeleton-shimmer rounded" />
          </div>
          <div className="flex gap-6">
            <div className="h-10 w-24 skeleton-base skeleton-shimmer rounded" />
            <div className="h-10 w-24 skeleton-base skeleton-shimmer rounded" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex h-[420px] flex-col gap-4 rounded-2xl border border-border/50 p-6">
            <div className="h-5 w-24 skeleton-base skeleton-shimmer rounded" />
            <div className="h-4 w-full skeleton-base skeleton-shimmer rounded" />
            <div className="h-9 w-28 skeleton-base skeleton-shimmer rounded" />
            <div className="h-16 w-full skeleton-base skeleton-shimmer rounded" />
            <div className="flex-1 space-y-2">
              {[...Array(4)].map((__, j) => (
                <div key={j} className="h-4 w-full skeleton-base skeleton-shimmer rounded" />
              ))}
            </div>
            <div className="h-10 w-full skeleton-base skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

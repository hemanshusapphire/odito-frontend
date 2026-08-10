import { Suspense } from "react"
import CustomPlanRequestPageContent from "./page-content"

function CustomPlanFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 skeleton-fade-in">
      <div className="h-8 w-64 skeleton-base skeleton-shimmer rounded" />
      <div className="rounded-2xl border border-border/50 p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 skeleton-base skeleton-shimmer rounded" />
            <div className="h-9 w-full skeleton-base skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CustomPlanRequestPage() {
  return (
    <Suspense fallback={<CustomPlanFormSkeleton />}>
      <CustomPlanRequestPageContent />
    </Suspense>
  )
}

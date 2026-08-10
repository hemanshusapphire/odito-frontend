import { Suspense } from "react"
import DeletedProjectsPageContent from "./page-content"

export default function DeletedProjectsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 skeleton-fade-in">
        <div className="border-b pb-4">
          <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
          <div className="w-72 h-4 skeleton-base skeleton-shimmer rounded mt-2" />
        </div>
        <div className="rounded-xl border p-6 space-y-4">
          <div className="w-32 h-6 skeleton-base skeleton-shimmer rounded" />
          <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
          <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
        </div>
      </div>
    }>
      <DeletedProjectsPageContent />
    </Suspense>
  )
}

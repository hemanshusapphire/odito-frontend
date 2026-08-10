import { Suspense } from "react"
import PreAuditPageContent from "./page-content"

export default function PreAuditPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 skeleton-fade-in">
        <div className="border-b pb-4">
          <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
          <div className="w-72 h-4 skeleton-base skeleton-shimmer rounded mt-2" />
        </div>
        <div className="rounded-xl border p-6 space-y-4">
          <div className="w-32 h-6 skeleton-base skeleton-shimmer rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border p-5 space-y-3">
                <div className="w-16 h-8 skeleton-base skeleton-shimmer rounded" />
                <div className="w-24 h-3 skeleton-base skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <PreAuditPageContent />
    </Suspense>
  )
}

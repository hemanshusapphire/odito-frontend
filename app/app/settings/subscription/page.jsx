import { Suspense } from "react"
import SubscriptionPageContent from "./page-content"

export default function SubscriptionSettingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 skeleton-fade-in">
        <div className="border-b pb-4">
          <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
          <div className="w-72 h-4 skeleton-base skeleton-shimmer rounded mt-2" />
        </div>
        <div className="max-w-4xl space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-xl border p-6 space-y-3">
                <div className="w-40 h-5 skeleton-base skeleton-shimmer rounded" />
                <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
                <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-xl border p-6 space-y-3">
                <div className="w-40 h-5 skeleton-base skeleton-shimmer rounded" />
                <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-6 space-y-3">
            <div className="w-40 h-5 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    }>
      <SubscriptionPageContent />
    </Suspense>
  )
}

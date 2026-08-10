import { Suspense } from "react"
import ProfilePageContent from "./page-content"

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 skeleton-fade-in">
        <div className="border-b pb-4">
          <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
          <div className="w-72 h-4 skeleton-base skeleton-shimmer rounded mt-2" />
        </div>
        <div className="max-w-4xl space-y-6">
          <div className="rounded-xl border p-6 space-y-3">
            <div className="w-48 h-5 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
          </div>
          <div className="rounded-xl border p-6 space-y-3">
            <div className="w-48 h-5 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
          </div>
          <div className="rounded-xl border p-6 space-y-3">
            <div className="w-48 h-5 skeleton-base skeleton-shimmer rounded" />
            <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}

import { Suspense } from "react"
import SettingsPageContent from "./page-content"

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 skeleton-fade-in">
        <div className="border-b pb-4">
          <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
          <div className="w-72 h-4 skeleton-base skeleton-shimmer rounded mt-2" />
        </div>
        <div className="space-y-6 max-w-2xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-6 space-y-3">
              <div className="w-40 h-5 skeleton-base skeleton-shimmer rounded" />
              <div className="w-full h-4 skeleton-base skeleton-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  )
}

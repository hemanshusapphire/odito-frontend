import { Suspense } from "react"
import TechnicalPage from "@/components/dashboard/technical/TechnicalPage"

export default function TechnicalChecksPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 skeleton-fade-in">
        <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <div className="w-16 h-8 skeleton-base skeleton-shimmer rounded" />
              <div className="w-24 h-3 skeleton-base skeleton-shimmer rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-12 skeleton-base skeleton-shimmer rounded" />
          ))}
        </div>
      </div>
    }>
      <TechnicalPage />
    </Suspense>
  )
}

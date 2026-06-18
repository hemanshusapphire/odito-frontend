import { Suspense } from "react"
import KeywordPageContent from "@/components/dashboard/keywords/KeywordPageContent"

export default function KeywordsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 skeleton-fade-in">
        <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
        <div className="rounded-xl border p-6 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-10 skeleton-base skeleton-shimmer rounded" />
          ))}
        </div>
      </div>
    }>
      <KeywordPageContent />
    </Suspense>
  )
}

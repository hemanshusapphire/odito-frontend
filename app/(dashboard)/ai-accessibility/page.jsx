"use client"

import { Suspense } from "react"
import { useProject } from "@/contexts/ProjectContext"
import AIAccessibilityPageContent from "./components/AIAccessibilityPageContent"

function AIAccessibilityContent() {
  const { activeProject } = useProject()
  return <AIAccessibilityPageContent projectId={activeProject?._id} />
}

export default function AIAccessibilityPage() {
  return (
    <Suspense fallback={<AIAccessibilitySkeleton />}>
      <AIAccessibilityContent />
    </Suspense>
  )
}

function AIAccessibilitySkeleton() {
  return (
    <div className="space-y-4 skeleton-fade-in" style={{ padding: "24px 28px" }}>
      <div className="w-56 h-8 skeleton-base skeleton-shimmer rounded" />
      <div className="w-96 h-4 skeleton-base skeleton-shimmer rounded" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-base skeleton-shimmer rounded-xl" style={{ height: 120 }} />
        ))}
      </div>
    </div>
  )
}

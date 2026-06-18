"use client"

import { Suspense } from "react"
import AIAuditPageContent from "@/components/dashboard/ai-audit/AIAuditPageContent"
import { useProject } from "@/contexts/ProjectContext"

function AIAuditContent() {
  const { activeProject } = useProject()

  return <AIAuditPageContent projectId={activeProject?._id} />
}

export default function AIAuditPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 skeleton-fade-in">
        <div className="w-48 h-8 skeleton-base skeleton-shimmer rounded" />
        <div className="rounded-xl border p-6 space-y-4">
          <div className="w-full h-24 skeleton-base skeleton-shimmer rounded" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 skeleton-base skeleton-shimmer rounded" />
            ))}
          </div>
        </div>
      </div>
    }>
      <AIAuditContent />
    </Suspense>
  )
}
